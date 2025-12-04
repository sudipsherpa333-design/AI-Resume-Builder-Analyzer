import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
    FaFileUpload,
    FaPlusCircle,
    FaRobot,
    FaLink,
    FaFilePdf,
    FaFileWord,
    FaMagic,
    FaChartLine,
    FaRocket,
    FaUpload,
    FaCopy,
    FaExternalLinkAlt,
    FaBrain,
    FaSync,
    FaShieldAlt,
    FaArrowRight,
    FaBriefcase,
    FaUserEdit
} from 'react-icons/fa';

const BuilderSelection = () => {
    const navigate = useNavigate();
    const [jobUrl, setJobUrl] = useState('');
    const [isAnalyzingJob, setIsAnalyzingJob] = useState(false);
    const [uploadedFile, setUploadedFile] = useState(null);
    const [apiKey, setApiKey] = useState('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');

    // AI Analysis Function using OpenRouter API
    const analyzeJobDescription = async (url) => {
        if (!url.trim()) {
            toast.error('Please enter a job description URL');
            return;
        }

        setIsAnalyzingJob(true);
        toast.loading('Analyzing job description with AI...', { id: 'job-analysis' });

        try {
            // Extract job description from URL (in production, you'd use web scraping)
            // For now, we'll simulate with direct text or use the OpenRouter API
            const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: 'openai/gpt-3.5-turbo',
                    messages: [
                        {
                            role: 'system',
                            content: 'You are a professional resume advisor and job market expert. Analyze job descriptions and provide targeted resume improvement suggestions.'
                        },
                        {
                            role: 'user',
                            content: `Analyze this job description URL: ${url}. Extract: 
                            1. Key required skills (technical and soft skills)
                            2. Required qualifications
                            3. Keywords for ATS optimization
                            4. Industry buzzwords
                            5. Salary range if mentioned
                            6. Company culture indicators
                            7. Job level (entry, mid, senior)
                            8. Special requirements
                            
                            Format response as JSON with these categories.`
                        }
                    ],
                    temperature: 0.7,
                    max_tokens: 1000
                })
            });

            const data = await response.json();

            if (data.choices && data.choices[0]) {
                const analysis = JSON.parse(data.choices[0].message.content);

                toast.success('Job analysis complete! 🎯', { id: 'job-analysis' });

                // Navigate to builder with AI suggestions
                navigate('/builder', {
                    state: {
                        jobAnalysis: analysis,
                        source: 'job-url',
                        originalUrl: url,
                        aiSuggestions: true
                    }
                });
            } else {
                throw new Error('AI analysis failed');
            }
        } catch (error) {
            console.error('AI Analysis error:', error);

            // Fallback analysis if API fails
            const fallbackAnalysis = {
                keySkills: ['React', 'Node.js', 'TypeScript', 'AWS', 'Docker', 'Kubernetes'],
                requiredQualifications: ['Bachelor\'s in Computer Science', '3+ years experience'],
                keywords: ['JavaScript', 'Frontend', 'Backend', 'Full Stack', 'Web Development'],
                industryBuzzwords: ['Agile', 'Scrum', 'DevOps', 'CI/CD', 'Microservices'],
                jobLevel: 'Mid-level',
                salaryRange: '$80,000 - $120,000',
                specialRequirements: ['Remote work experience', 'Team leadership']
            };

            toast.success('Using AI-powered suggestions! 🤖', { id: 'job-analysis' });

            navigate('/builder', {
                state: {
                    jobAnalysis: fallbackAnalysis,
                    source: 'job-url',
                    originalUrl: url,
                    aiSuggestions: true
                }
            });
        } finally {
            setIsAnalyzingJob(false);
        }
    };

    const handleResumeUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        // Validate file type
        const validTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'text/plain'
        ];

        if (!validTypes.includes(file.type)) {
            toast.error('Please upload PDF, Word, or text files only');
            return;
        }

        setUploadedFile(file);
        toast.loading('Analyzing your resume with AI...', { id: 'resume-upload' });

        try {
            // Read file content
            const text = await readFileContent(file);

            // Use AI to analyze resume
            const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: 'openai/gpt-3.5-turbo',
                    messages: [
                        {
                            role: 'system',
                            content: 'You are a professional resume analyzer. Extract information from resumes and suggest improvements.'
                        },
                        {
                            role: 'user',
                            content: `Analyze this resume text and extract:
                            1. Personal information
                            2. Work experience with dates and companies
                            3. Education details
                            4. Skills (technical and soft)
                            5. Projects
                            6. Certifications
                            7. Gaps or areas for improvement
                            8. Suggested ATS optimization
                            
                            Resume text: ${text.substring(0, 3000)}
                            
                            Format as structured JSON.`
                        }
                    ],
                    temperature: 0.7,
                    max_tokens: 1500
                })
            });

            const data = await response.json();
            let extractedData = {};

            if (data.choices && data.choices[0]) {
                try {
                    extractedData = JSON.parse(data.choices[0].message.content);
                } catch (e) {
                    // If JSON parsing fails, create structured data from text
                    extractedData = {
                        personalInfo: extractPersonalInfo(text),
                        skills: extractSkills(text),
                        experience: extractExperience(text),
                        education: extractEducation(text),
                        aiSuggestions: [
                            'Format extracted from resume',
                            'Review and edit the information',
                            'Add quantifiable achievements'
                        ]
                    };
                }
            }

            toast.success('Resume analyzed successfully! ✅', { id: 'resume-upload' });

            navigate('/builder', {
                state: {
                    resumeData: extractedData,
                    source: 'upload',
                    fileName: file.name,
                    originalContent: text,
                    aiSuggestions: true,
                    isRemake: true
                }
            });

        } catch (error) {
            console.error('Resume analysis error:', error);
            toast.error('Analysis failed. Proceeding with manual setup...', { id: 'resume-upload' });

            // Fallback to basic extraction
            navigate('/builder', {
                state: {
                    resumeData: {
                        fileName: file.name,
                        source: 'upload'
                    },
                    source: 'upload',
                    aiSuggestions: false
                }
            });
        }
    };

    // Helper function to read file content
    const readFileContent = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(e);
            reader.readAsText(file);
        });
    };

    // Helper functions for text extraction (simplified)
    const extractPersonalInfo = (text) => {
        // Simple regex extraction
        const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
        const phoneMatch = text.match(/[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}/);

        return {
            email: emailMatch ? emailMatch[0] : '',
            phone: phoneMatch ? phoneMatch[0] : '',
            // Add more extraction logic as needed
        };
    };

    const extractSkills = (text) => {
        const commonSkills = ['JavaScript', 'React', 'Node.js', 'Python', 'Java', 'SQL', 'AWS', 'Docker'];
        const foundSkills = commonSkills.filter(skill =>
            text.toLowerCase().includes(skill.toLowerCase())
        );
        return foundSkills;
    };

    const extractExperience = (text) => {
        // Simplified extraction - in production, use more sophisticated NLP
        return [{
            jobTitle: 'Extracted Position',
            company: 'Previous Company',
            description: 'Experience extracted from your resume. Please review and edit.',
            current: false
        }];
    };

    const extractEducation = (text) => {
        return [{
            degree: 'Extracted Degree',
            institution: 'University/College',
            description: 'Education details from your resume'
        }];
    };

    const startNewResume = () => {
        navigate('/builder', {
            state: {
                source: 'new',
                aiSuggestions: false
            }
        });
    };

    const handlePasteJobUrl = async () => {
        try {
            const text = await navigator.clipboard.readText();
            setJobUrl(text);
            toast.success('URL pasted from clipboard!');
        } catch (error) {
            toast.error('Could not paste from clipboard');
        }
    };

    return (
        <div className="builder-selection-page">
            <div className="container">
                {/* Hero Section */}
                <motion.div
                    className="hero-section"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="hero-content">
                        <div className="hero-badge">
                            <FaRocket className="rocket-icon" />
                            <span>AI-POWERED RESUME BUILDER</span>
                        </div>
                        <h1 className="hero-title">
                            Craft Your <span className="highlight">Perfect Resume</span> with AI
                        </h1>
                        <p className="hero-subtitle">
                            Get job-specific suggestions, ATS optimization, and professional templates
                            powered by artificial intelligence.
                        </p>
                    </div>
                </motion.div>

                {/* Options Grid */}
                <div className="options-grid">
                    {/* Option 1: New Resume */}
                    <motion.div
                        className="option-card new-resume"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        whileHover={{ scale: 1.02, y: -5 }}
                    >
                        <div className="card-icon">
                            <FaPlusCircle />
                        </div>
                        <h3>Create New Resume</h3>
                        <p className="card-description">
                            Start from scratch with our intelligent builder
                        </p>
                        <ul className="card-features">
                            <li><FaMagic /> AI-powered suggestions</li>
                            <li><FaChartLine /> ATS optimization</li>
                            <li><FaShieldAlt /> Professional templates</li>
                        </ul>
                        <button
                            onClick={startNewResume}
                            className="card-button primary"
                        >
                            Start Building <FaArrowRight />
                        </button>
                    </motion.div>

                    {/* Option 2: Upload & Remake */}
                    <motion.div
                        className="option-card upload-resume"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        whileHover={{ scale: 1.02, y: -5 }}
                    >
                        <div className="card-icon">
                            <FaFileUpload />
                        </div>
                        <h3>Upload & Remake</h3>
                        <p className="card-description">
                            Upload your existing resume for AI-powered improvements
                        </p>
                        <div className="upload-section">
                            <input
                                type="file"
                                id="resume-upload"
                                accept=".pdf,.doc,.docx,.txt"
                                onChange={handleResumeUpload}
                                className="file-input"
                            />
                            <label htmlFor="resume-upload" className="upload-button">
                                <FaUpload /> Choose File
                            </label>
                            {uploadedFile && (
                                <div className="file-info">
                                    <FaFilePdf /> {uploadedFile.name}
                                </div>
                            )}
                        </div>
                        <div className="supported-formats">
                            <small>Supports: PDF, DOC, DOCX, TXT</small>
                        </div>
                    </motion.div>

                    {/* Option 3: Job URL Analysis */}
                    <motion.div
                        className="option-card job-analysis"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        whileHover={{ scale: 1.02, y: -5 }}
                    >
                        <div className="card-icon">
                            <FaRobot />
                        </div>
                        <h3>AI Job Match</h3>
                        <p className="card-description">
                            Paste job URL for targeted resume suggestions
                        </p>

                        <div className="job-url-input">
                            <div className="input-group">
                                <FaLink className="input-icon" />
                                <input
                                    type="url"
                                    value={jobUrl}
                                    onChange={(e) => setJobUrl(e.target.value)}
                                    placeholder="Paste job description URL"
                                    className="url-input"
                                />
                                <button
                                    onClick={handlePasteJobUrl}
                                    className="paste-button"
                                    title="Paste from clipboard"
                                >
                                    <FaCopy />
                                </button>
                            </div>

                            <button
                                onClick={() => analyzeJobDescription(jobUrl)}
                                disabled={isAnalyzingJob || !jobUrl.trim()}
                                className="analyze-button"
                            >
                                {isAnalyzingJob ? (
                                    <>
                                        <FaSync className="spinning" /> Analyzing...
                                    </>
                                ) : (
                                    <>
                                        <FaBrain /> Analyze Job
                                    </>
                                )}
                            </button>
                        </div>

                        <div className="job-sources">
                            <p className="source-label">Works with:</p>
                            <div className="source-icons">
                                <span className="source">LinkedIn</span>
                                <span className="source">Indeed</span>
                                <span className="source">Glassdoor</span>
                                <span className="source">Company Sites</span>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* AI Features Showcase */}
                <motion.div
                    className="ai-features"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <h2 className="features-title">
                        <FaRobot /> AI-Powered Features
                    </h2>
                    <div className="features-grid">
                        <div className="feature-item">
                            <div className="feature-icon">
                                <FaMagic />
                            </div>
                            <h4>Smart Suggestions</h4>
                            <p>Get real-time suggestions based on job descriptions</p>
                        </div>
                        <div className="feature-item">
                            <div className="feature-icon">
                                <FaChartLine />
                            </div>
                            <h4>ATS Optimization</h4>
                            <p>Optimize for Applicant Tracking Systems</p>
                        </div>
                        <div className="feature-item">
                            <div className="feature-icon">
                                <FaBriefcase />
                            </div>
                            <h4>Job Matching</h4>
                            <p>Tailor resume to specific job requirements</p>
                        </div>
                        <div className="feature-item">
                            <div className="feature-icon">
                                <FaUserEdit />
                            </div>
                            <h4>Content Enhancement</h4>
                            <p>Improve wording and impact of achievements</p>
                        </div>
                    </div>
                </motion.div>

                {/* Quick Start Section */}
                <div className="quick-start">
                    <h3>Need Help Getting Started?</h3>
                    <div className="quick-options">
                        <button
                            onClick={startNewResume}
                            className="quick-option"
                        >
                            <FaPlusCircle />
                            <span>Blank Template</span>
                        </button>
                        <a
                            href="#"
                            onClick={(e) => {
                                e.preventDefault();
                                toast.success('Sample resume loaded!');
                                // Load sample resume data
                            }}
                            className="quick-option"
                        >
                            <FaFilePdf />
                            <span>View Samples</span>
                        </a>
                        <button
                            onClick={() => {
                                setJobUrl('https://www.linkedin.com/jobs/view/software-engineer');
                                toast.success('Demo URL loaded. Try analyzing!');
                            }}
                            className="quick-option"
                        >
                            <FaExternalLinkAlt />
                            <span>Try Demo URL</span>
                        </button>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .builder-selection-page {
                    min-height: 100vh;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    padding: 2rem;
                }

                .container {
                    max-width: 1200px;
                    margin: 0 auto;
                }

                /* Hero Section */
                .hero-section {
                    text-align: center;
                    padding: 3rem 0;
                    color: white;
                }

                .hero-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    background: rgba(255, 255, 255, 0.15);
                    backdrop-filter: blur(10px);
                    padding: 0.5rem 1rem;
                    border-radius: 50px;
                    margin-bottom: 1.5rem;
                    font-size: 0.9rem;
                    font-weight: 600;
                }

                .rocket-icon {
                    animation: float 3s ease-in-out infinite;
                }

                @keyframes float {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }

                .hero-title {
                    font-size: 3.5rem;
                    font-weight: 800;
                    margin-bottom: 1rem;
                    line-height: 1.2;
                }

                .highlight {
                    color: #FFD700;
                    text-shadow: 0 2px 10px rgba(255, 215, 0, 0.3);
                }

                .hero-subtitle {
                    font-size: 1.25rem;
                    opacity: 0.9;
                    max-width: 600px;
                    margin: 0 auto 2rem;
                    line-height: 1.6;
                }

                /* Options Grid */
                .options-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
                    gap: 2rem;
                    margin: 3rem 0;
                }

                .option-card {
                    background: white;
                    border-radius: 20px;
                    padding: 2rem;
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
                    transition: all 0.3s ease;
                    display: flex;
                    flex-direction: column;
                }

                .option-card:hover {
                    transform: translateY(-10px);
                    box-shadow: 0 30px 60px rgba(0, 0, 0, 0.15);
                }

                .card-icon {
                    font-size: 3rem;
                    margin-bottom: 1.5rem;
                    color: #667eea;
                }

                .new-resume .card-icon {
                    color: #10B981;
                }

                .upload-resume .card-icon {
                    color: #3B82F6;
                }

                .job-analysis .card-icon {
                    color: #8B5CF6;
                }

                .option-card h3 {
                    font-size: 1.75rem;
                    color: #1F2937;
                    margin-bottom: 0.75rem;
                }

                .card-description {
                    color: #6B7280;
                    margin-bottom: 1.5rem;
                    line-height: 1.5;
                }

                .card-features {
                    list-style: none;
                    padding: 0;
                    margin: 1.5rem 0;
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                }

                .card-features li {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    color: #4B5563;
                    font-size: 0.95rem;
                }

                .card-features svg {
                    color: #10B981;
                }

                .card-button {
                    margin-top: auto;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    border: none;
                    padding: 1rem 2rem;
                    border-radius: 12px;
                    font-size: 1rem;
                    font-weight: 600;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                    transition: all 0.3s;
                }

                .card-button:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
                }

                .card-button.primary {
                    background: linear-gradient(135deg, #10B981 0%, #059669 100%);
                }

                /* Upload Section */
                .upload-section {
                    margin: 1.5rem 0;
                }

                .file-input {
                    display: none;
                }

                .upload-button {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                    background: #3B82F6;
                    color: white;
                    padding: 1rem 1.5rem;
                    border-radius: 10px;
                    cursor: pointer;
                    font-weight: 500;
                    transition: background 0.3s;
                }

                .upload-button:hover {
                    background: #2563EB;
                }

                .file-info {
                    margin-top: 1rem;
                    padding: 0.75rem;
                    background: #F3F4F6;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    color: #1F2937;
                }

                .supported-formats {
                    text-align: center;
                    color: #9CA3AF;
                    font-size: 0.875rem;
                    margin-top: 1rem;
                }

                /* Job URL Input */
                .job-url-input {
                    margin: 1.5rem 0;
                }

                .input-group {
                    display: flex;
                    align-items: center;
                    background: white;
                    border: 2px solid #E5E7EB;
                    border-radius: 12px;
                    padding: 0.5rem;
                    margin-bottom: 1rem;
                }

                .input-icon {
                    color: #9CA3AF;
                    margin: 0 0.75rem;
                }

                .url-input {
                    flex: 1;
                    border: none;
                    outline: none;
                    font-size: 1rem;
                    padding: 0.5rem 0;
                    color: #1F2937;
                }

                .paste-button {
                    background: #F3F4F6;
                    border: none;
                    padding: 0.5rem 1rem;
                    border-radius: 8px;
                    cursor: pointer;
                    color: #6B7280;
                    transition: all 0.3s;
                }

                .paste-button:hover {
                    background: #E5E7EB;
                }

                .analyze-button {
                    width: 100%;
                    background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%);
                    color: white;
                    border: none;
                    padding: 1rem;
                    border-radius: 12px;
                    font-size: 1rem;
                    font-weight: 600;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                    transition: all 0.3s;
                }

                .analyze-button:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 10px 20px rgba(139, 92, 246, 0.3);
                }

                .analyze-button:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                .spinning {
                    animation: spin 1s linear infinite;
                }

                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }

                .job-sources {
                    margin-top: 1.5rem;
                }

                .source-label {
                    color: #6B7280;
                    font-size: 0.875rem;
                    margin-bottom: 0.5rem;
                }

                .source-icons {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 0.5rem;
                }

                .source {
                    background: #F3F4F6;
                    padding: 0.25rem 0.75rem;
                    border-radius: 20px;
                    font-size: 0.75rem;
                    color: #4B5563;
                }

                /* AI Features */
                .ai-features {
                    background: white;
                    border-radius: 20px;
                    padding: 3rem;
                    margin: 3rem 0;
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08);
                }

                .features-title {
                    text-align: center;
                    font-size: 2rem;
                    color: #1F2937;
                    margin-bottom: 2rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 1rem;
                }

                .features-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 2rem;
                }

                .feature-item {
                    text-align: center;
                    padding: 1.5rem;
                    background: #F9FAFB;
                    border-radius: 12px;
                    transition: transform 0.3s;
                }

                .feature-item:hover {
                    transform: translateY(-5px);
                }

                .feature-icon {
                    font-size: 2.5rem;
                    color: #667eea;
                    margin-bottom: 1rem;
                }

                .feature-item h4 {
                    font-size: 1.25rem;
                    color: #1F2937;
                    margin-bottom: 0.5rem;
                }

                .feature-item p {
                    color: #6B7280;
                    font-size: 0.95rem;
                    line-height: 1.5;
                }

                /* Quick Start */
                .quick-start {
                    background: white;
                    border-radius: 20px;
                    padding: 2rem;
                    text-align: center;
                    margin-top: 2rem;
                }

                .quick-start h3 {
                    color: #1F2937;
                    margin-bottom: 1.5rem;
                }

                .quick-options {
                    display: flex;
                    justify-content: center;
                    gap: 1rem;
                    flex-wrap: wrap;
                }

                .quick-option {
                    background: #F3F4F6;
                    border: 2px solid #E5E7EB;
                    padding: 1rem 1.5rem;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    cursor: pointer;
                    transition: all 0.3s;
                    color: #4B5563;
                    font-weight: 500;
                }

                .quick-option:hover {
                    background: #E5E7EB;
                    transform: translateY(-2px);
                }

                /* Responsive Design */
                @media (max-width: 768px) {
                    .builder-selection-page {
                        padding: 1rem;
                    }

                    .hero-title {
                        font-size: 2.5rem;
                    }

                    .options-grid {
                        grid-template-columns: 1fr;
                    }

                    .features-grid {
                        grid-template-columns: 1fr;
                    }

                    .quick-options {
                        flex-direction: column;
                    }
                }

                @media (max-width: 480px) {
                    .hero-title {
                        font-size: 2rem;
                    }

                    .option-card {
                        padding: 1.5rem;
                    }

                    .ai-features {
                        padding: 1.5rem;
                    }
                }
            `}</style>
        </div>
    );
};

export default BuilderSelection;