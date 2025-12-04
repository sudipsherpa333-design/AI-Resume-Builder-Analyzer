import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FaArrowLeft,
    FaSave,
    FaEye,
    FaEyeSlash,
    FaDownload,
    FaRobot,
    FaTrash,
    FaStepForward,
    FaStepBackward,
    FaCheck,
    FaHome,
    FaGraduationCap,
    FaBriefcase,
    FaCogs,
    FaProjectDiagram,
    FaCertificate,
    FaUser,
    FaFileAlt,
    FaSpinner,
    FaCopy,
    FaMagic,
    FaLightbulb,
    FaChartLine,
    FaFileUpload,
    FaLink,
    FaExternalLinkAlt,
    FaBrain,
    FaSync,
    FaPalette,
    FaQrcode,
    FaShareAlt,
    FaRegClock,
    FaDatabase,
    FaCloud,
    FaAward,
    FaRocket,
    FaTimes,
    FaChevronRight,
    FaChevronLeft,
    FaExpand,
    FaCompress,
    FaStar,
    FaSearch,
    FaUpload,
    FaPencilAlt,
    FaHistory,
    FaRedo,
    FaUndo,
    FaCode,
    FaFilePdf,
    FaFileWord,
    FaFile,
    FaSyncAlt,
    FaCheckCircle,
    FaExclamationTriangle,
    FaPercent,
    FaExclamationCircle
} from 'react-icons/fa';
import { SiJson } from 'react-icons/si';
import toast from 'react-hot-toast';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

// AI Service - Mock implementation for demo purposes
class AIService {
    constructor() {
        // Mock AI service for demonstration
        this.baseUrl = 'http://localhost:3000/api'; // Simple hardcoded value
    }

    async generateJobSpecificSuggestions(resumeData, analysis) {
        // Mock implementation
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve([
                    {
                        id: 1,
                        type: 'keyword',
                        category: 'Summary',
                        priority: 'High',
                        text: 'Add more quantifiable achievements to your summary section.',
                        impact: 'High',
                        section: 'summary',
                        value: 'with 5+ years of experience in software development'
                    },
                    {
                        id: 2,
                        type: 'rewrite',
                        category: 'Experience',
                        priority: 'Medium',
                        text: 'Use action verbs like "developed", "managed", "implemented" to start your bullet points.',
                        impact: 'Medium'
                    },
                    {
                        id: 3,
                        type: 'keyword',
                        category: 'Skills',
                        priority: 'High',
                        text: 'Add specific technologies mentioned in the job description: React, Node.js, MongoDB.',
                        impact: 'High',
                        section: 'skills'
                    },
                    {
                        id: 4,
                        type: 'format',
                        category: 'Format',
                        priority: 'Low',
                        text: 'Ensure consistent date formatting throughout your resume.',
                        impact: 'Low'
                    },
                    {
                        id: 5,
                        type: 'content',
                        category: 'Projects',
                        priority: 'Medium',
                        text: 'Add more details about the impact of your projects.',
                        impact: 'Medium'
                    },
                    {
                        id: 6,
                        type: 'keyword',
                        category: 'Certifications',
                        priority: 'Low',
                        text: 'Consider adding relevant certifications if you have any.',
                        impact: 'Low'
                    }
                ]);
            }, 1000);
        });
    }

    async analyzeJobDescription(url) {
        // Mock implementation
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    jobTitle: 'Senior Software Engineer',
                    jobLevel: 'Senior',
                    salaryRange: '$120K - $180K',
                    matchScore: 85,
                    keywords: ['React', 'Node.js', 'TypeScript', 'AWS', 'MongoDB', 'Docker', 'CI/CD', 'Agile', 'REST API', 'Microservices', 'Git', 'JavaScript'],
                    requiredSkills: ['React', 'Node.js', 'TypeScript', 'AWS'],
                    niceToHave: ['Docker', 'Kubernetes', 'GraphQL']
                });
            }, 1500);
        });
    }

    async extractResumeData(text, method = 'ai') {
        // Mock implementation
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    personalInfo: {
                        firstName: 'John',
                        lastName: 'Doe',
                        email: 'john.doe@example.com',
                        phone: '(123) 456-7890',
                        linkedin: 'linkedin.com/in/johndoe',
                        title: 'Senior Software Engineer'
                    },
                    summary: 'Experienced software engineer with 5+ years of expertise in full-stack development. Proficient in React, Node.js, and cloud technologies. Strong background in building scalable web applications and leading development teams.',
                    experience: [
                        {
                            jobTitle: 'Senior Software Engineer',
                            company: 'Tech Corp',
                            startDate: '2020-01',
                            endDate: '2023-12',
                            current: false,
                            description: 'Led development of multiple web applications using React and Node.js.'
                        }
                    ],
                    education: [
                        {
                            degree: 'Bachelor of Science in Computer Science',
                            institution: 'University of Technology',
                            graduationDate: '2019-05',
                            gpa: '3.8'
                        }
                    ],
                    skills: ['JavaScript', 'React', 'Node.js', 'TypeScript', 'AWS', 'MongoDB'],
                    projects: [
                        {
                            name: 'E-commerce Platform',
                            description: 'Full-stack e-commerce solution with React frontend and Node.js backend.',
                            technologies: 'React, Node.js, MongoDB, Stripe'
                        }
                    ],
                    certifications: [
                        {
                            name: 'AWS Certified Developer',
                            issuer: 'Amazon Web Services',
                            date: '2022-03'
                        }
                    ]
                });
            }, 2000);
        });
    }

    async analyzeResume(resumeData) {
        // Mock implementation
        return this.generateJobSpecificSuggestions(resumeData, null);
    }

    async saveResume(resumeData, resumeId = null) {
        // Mock implementation
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    success: true,
                    message: 'Resume saved successfully',
                    id: resumeId || Date.now().toString()
                });
            }, 1000);
        });
    }
}

// Add missing FaPlus icon component
const FaPlus = () => (
    <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 448 512" height="1em" width="1em">
        <path d="M416 208H272V64c0-17.67-14.33-32-32-32h-32c-17.67 0-32 14.33-32 32v144H32c-17.67 0-32 14.33-32 32v32c0 17.67 14.33 32 32 32h144v144c0 17.67 14.33 32 32 32h32c17.67 0 32-14.33 32-32V304h144c17.67 0 32-14.33 32-32v-32c0-17.67-14.33-32-32-32z"></path>
    </svg>
);

// Mock Components for demonstration
const PersonalInfoPage = ({ resumeData, onInputChange, errors, setErrors }) => (
    <div className="personal-info-page">
        <h3 className="page-title">Personal Information</h3>
        <div className="form-grid">
            <div className="form-group">
                <label>First Name *</label>
                <input
                    type="text"
                    value={resumeData.personalInfo.firstName || ''}
                    onChange={(e) => onInputChange('personalInfo', { firstName: e.target.value })}
                    className={errors.firstName ? 'error' : ''}
                    placeholder="John"
                />
                {errors.firstName && <span className="error-message">{errors.firstName}</span>}
            </div>
            <div className="form-group">
                <label>Last Name</label>
                <input
                    type="text"
                    value={resumeData.personalInfo.lastName || ''}
                    onChange={(e) => onInputChange('personalInfo', { lastName: e.target.value })}
                    placeholder="Doe"
                />
            </div>
            <div className="form-group">
                <label>Email *</label>
                <input
                    type="email"
                    value={resumeData.personalInfo.email || ''}
                    onChange={(e) => onInputChange('personalInfo', { email: e.target.value })}
                    className={errors.email ? 'error' : ''}
                    placeholder="john.doe@example.com"
                />
                {errors.email && <span className="error-message">{errors.email}</span>}
            </div>
            <div className="form-group">
                <label>Phone</label>
                <input
                    type="tel"
                    value={resumeData.personalInfo.phone || ''}
                    onChange={(e) => onInputChange('personalInfo', { phone: e.target.value })}
                    placeholder="(123) 456-7890"
                />
            </div>
            <div className="form-group">
                <label>Professional Title</label>
                <input
                    type="text"
                    value={resumeData.personalInfo.title || ''}
                    onChange={(e) => onInputChange('personalInfo', { title: e.target.value })}
                    placeholder="Senior Software Engineer"
                />
            </div>
            <div className="form-group">
                <label>LinkedIn URL</label>
                <input
                    type="url"
                    value={resumeData.personalInfo.linkedin || ''}
                    onChange={(e) => onInputChange('personalInfo', { linkedin: e.target.value })}
                    placeholder="linkedin.com/in/username"
                />
            </div>
        </div>
    </div>
);

const SummaryPage = ({ resumeData, onInputChange, errors, setErrors }) => (
    <div className="summary-page">
        <h3 className="page-title">Professional Summary</h3>
        <div className="form-group">
            <label>Summary *</label>
            <textarea
                value={resumeData.summary || ''}
                onChange={(e) => onInputChange('summary', e.target.value)}
                className={errors.summary ? 'error' : ''}
                placeholder="Experienced software engineer with 5+ years of expertise in full-stack development..."
                rows={6}
            />
            {errors.summary && <span className="error-message">{errors.summary}</span>}
            <div className="char-count">
                {resumeData.summary?.length || 0} characters
            </div>
        </div>
    </div>
);

const ExperiencePage = ({ resumeData, onInputChange }) => {
    const [experiences, setExperiences] = useState(resumeData.experience || []);

    const addExperience = () => {
        const newExp = {
            jobTitle: '',
            company: '',
            startDate: '',
            endDate: '',
            current: false,
            description: ''
        };
        setExperiences([...experiences, newExp]);
        onInputChange('experience', [...experiences, newExp]);
    };

    const updateExperience = (index, field, value) => {
        const updated = [...experiences];
        updated[index] = { ...updated[index], [field]: value };
        setExperiences(updated);
        onInputChange('experience', updated);
    };

    const removeExperience = (index) => {
        const updated = experiences.filter((_, i) => i !== index);
        setExperiences(updated);
        onInputChange('experience', updated);
    };

    return (
        <div className="experience-page">
            <h3 className="page-title">Work Experience</h3>
            {experiences.map((exp, index) => (
                <div key={index} className="experience-item">
                    <div className="item-header">
                        <h4>Experience #{index + 1}</h4>
                        {index > 0 && (
                            <button onClick={() => removeExperience(index)} className="remove-btn">
                                <FaTimes /> Remove
                            </button>
                        )}
                    </div>
                    <div className="form-grid">
                        <div className="form-group">
                            <label>Job Title</label>
                            <input
                                type="text"
                                value={exp.jobTitle || ''}
                                onChange={(e) => updateExperience(index, 'jobTitle', e.target.value)}
                                placeholder="Senior Software Engineer"
                            />
                        </div>
                        <div className="form-group">
                            <label>Company</label>
                            <input
                                type="text"
                                value={exp.company || ''}
                                onChange={(e) => updateExperience(index, 'company', e.target.value)}
                                placeholder="Tech Corp"
                            />
                        </div>
                        <div className="form-group">
                            <label>Start Date</label>
                            <input
                                type="month"
                                value={exp.startDate || ''}
                                onChange={(e) => updateExperience(index, 'startDate', e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label>End Date</label>
                            <div className="date-group">
                                <input
                                    type="month"
                                    value={exp.current ? '' : exp.endDate || ''}
                                    onChange={(e) => updateExperience(index, 'endDate', e.target.value)}
                                    disabled={exp.current}
                                />
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={exp.current || false}
                                        onChange={(e) => updateExperience(index, 'current', e.target.checked)}
                                    />
                                    Currently working here
                                </label>
                            </div>
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Description</label>
                        <textarea
                            value={exp.description || ''}
                            onChange={(e) => updateExperience(index, 'description', e.target.value)}
                            placeholder="Describe your responsibilities and achievements..."
                            rows={3}
                        />
                    </div>
                </div>
            ))}
            <button onClick={addExperience} className="add-btn">
                <FaPlus /> Add Experience
            </button>
        </div>
    );
};

const EducationPage = ({ resumeData, onInputChange }) => {
    const [educations, setEducations] = useState(resumeData.education || []);

    const addEducation = () => {
        const newEdu = {
            degree: '',
            institution: '',
            graduationDate: '',
            gpa: ''
        };
        setEducations([...educations, newEdu]);
        onInputChange('education', [...educations, newEdu]);
    };

    const updateEducation = (index, field, value) => {
        const updated = [...educations];
        updated[index] = { ...updated[index], [field]: value };
        setEducations(updated);
        onInputChange('education', updated);
    };

    return (
        <div className="education-page">
            <h3 className="page-title">Education</h3>
            {educations.map((edu, index) => (
                <div key={index} className="education-item">
                    <div className="form-grid">
                        <div className="form-group">
                            <label>Degree</label>
                            <input
                                type="text"
                                value={edu.degree || ''}
                                onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                                placeholder="Bachelor of Science in Computer Science"
                            />
                        </div>
                        <div className="form-group">
                            <label>Institution</label>
                            <input
                                type="text"
                                value={edu.institution || ''}
                                onChange={(e) => updateEducation(index, 'institution', e.target.value)}
                                placeholder="University of Technology"
                            />
                        </div>
                        <div className="form-group">
                            <label>Graduation Date</label>
                            <input
                                type="month"
                                value={edu.graduationDate || ''}
                                onChange={(e) => updateEducation(index, 'graduationDate', e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label>GPA</label>
                            <input
                                type="text"
                                value={edu.gpa || ''}
                                onChange={(e) => updateEducation(index, 'gpa', e.target.value)}
                                placeholder="3.8"
                            />
                        </div>
                    </div>
                </div>
            ))}
            <button onClick={addEducation} className="add-btn">
                <FaPlus /> Add Education
            </button>
        </div>
    );
};

const SkillsPage = ({ resumeData, onInputChange }) => {
    const [skillInput, setSkillInput] = useState('');
    const [skills, setSkills] = useState(resumeData.skills || []);

    const addSkill = () => {
        if (skillInput.trim() && !skills.includes(skillInput.trim())) {
            const updated = [...skills, skillInput.trim()];
            setSkills(updated);
            onInputChange('skills', updated);
            setSkillInput('');
        }
    };

    const removeSkill = (index) => {
        const updated = skills.filter((_, i) => i !== index);
        setSkills(updated);
        onInputChange('skills', updated);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addSkill();
        }
    };

    return (
        <div className="skills-page">
            <h3 className="page-title">Skills</h3>
            <div className="skills-input-group">
                <div className="input-with-button">
                    <input
                        type="text"
                        value={skillInput}
                        onChange={(e) => setSkillInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Enter a skill (e.g., React, JavaScript, AWS)"
                    />
                    <button onClick={addSkill} className="add-skill-btn">
                        <FaPlus /> Add
                    </button>
                </div>
            </div>
            <div className="skills-list">
                {skills.map((skill, index) => (
                    <div key={index} className="skill-tag">
                        {skill}
                        <button onClick={() => removeSkill(index)} className="remove-skill">
                            <FaTimes />
                        </button>
                    </div>
                ))}
                {skills.length === 0 && (
                    <div className="empty-state">
                        <p>No skills added yet. Add your first skill above!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

const ProjectsPage = ({ resumeData, onInputChange }) => {
    const [projects, setProjects] = useState(resumeData.projects || []);

    const addProject = () => {
        const newProj = {
            name: '',
            description: '',
            technologies: ''
        };
        setProjects([...projects, newProj]);
        onInputChange('projects', [...projects, newProj]);
    };

    const updateProject = (index, field, value) => {
        const updated = [...projects];
        updated[index] = { ...updated[index], [field]: value };
        setProjects(updated);
        onInputChange('projects', updated);
    };

    return (
        <div className="projects-page">
            <h3 className="page-title">Projects</h3>
            {projects.map((project, index) => (
                <div key={index} className="project-item">
                    <div className="form-group">
                        <label>Project Name</label>
                        <input
                            type="text"
                            value={project.name || ''}
                            onChange={(e) => updateProject(index, 'name', e.target.value)}
                            placeholder="E-commerce Platform"
                        />
                    </div>
                    <div className="form-group">
                        <label>Description</label>
                        <textarea
                            value={project.description || ''}
                            onChange={(e) => updateProject(index, 'description', e.target.value)}
                            placeholder="Describe the project, your role, and key achievements..."
                            rows={3}
                        />
                    </div>
                    <div className="form-group">
                        <label>Technologies Used</label>
                        <input
                            type="text"
                            value={project.technologies || ''}
                            onChange={(e) => updateProject(index, 'technologies', e.target.value)}
                            placeholder="React, Node.js, MongoDB, AWS"
                        />
                    </div>
                </div>
            ))}
            <button onClick={addProject} className="add-btn">
                <FaPlus /> Add Project
            </button>
        </div>
    );
};

const CertificationsPage = ({ resumeData, onInputChange }) => {
    const [certs, setCerts] = useState(resumeData.certifications || []);

    const addCertification = () => {
        const newCert = {
            name: '',
            issuer: '',
            date: ''
        };
        setCerts([...certs, newCert]);
        onInputChange('certifications', [...certs, newCert]);
    };

    const updateCertification = (index, field, value) => {
        const updated = [...certs];
        updated[index] = { ...updated[index], [field]: value };
        setCerts(updated);
        onInputChange('certifications', updated);
    };

    return (
        <div className="certifications-page">
            <h3 className="page-title">Certifications</h3>
            {certs.map((cert, index) => (
                <div key={index} className="certification-item">
                    <div className="form-grid">
                        <div className="form-group">
                            <label>Certification Name</label>
                            <input
                                type="text"
                                value={cert.name || ''}
                                onChange={(e) => updateCertification(index, 'name', e.target.value)}
                                placeholder="AWS Certified Developer"
                            />
                        </div>
                        <div className="form-group">
                            <label>Issuing Organization</label>
                            <input
                                type="text"
                                value={cert.issuer || ''}
                                onChange={(e) => updateCertification(index, 'issuer', e.target.value)}
                                placeholder="Amazon Web Services"
                            />
                        </div>
                        <div className="form-group">
                            <label>Date Obtained</label>
                            <input
                                type="month"
                                value={cert.date || ''}
                                onChange={(e) => updateCertification(index, 'date', e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            ))}
            <button onClick={addCertification} className="add-btn">
                <FaPlus /> Add Certification
            </button>
        </div>
    );
};

const CompletionPage = ({ resumeData }) => (
    <div className="completion-page">
        <div className="completion-content">
            <FaCheckCircle className="completion-icon" />
            <h3 className="completion-title">Resume Complete!</h3>
            <p className="completion-message">
                Your resume has been created successfully. You can now preview, export, or continue editing.
            </p>
            <div className="completion-stats">
                <div className="stat">
                    <span className="stat-number">
                        {Object.values(resumeData.personalInfo).filter(Boolean).length}
                    </span>
                    <span className="stat-label">Personal Info Fields</span>
                </div>
                <div className="stat">
                    <span className="stat-number">{resumeData.experience.length}</span>
                    <span className="stat-label">Experiences</span>
                </div>
                <div className="stat">
                    <span className="stat-number">{resumeData.skills.length}</span>
                    <span className="stat-label">Skills</span>
                </div>
            </div>
        </div>
    </div>
);

// Enhanced Live Preview Component
const EnhancedLivePreview = ({ resumeData, previewSize }) => {
    const previewRef = useRef(null);
    const [isDownloading, setIsDownloading] = useState(false);

    const exportAsPDF = async () => {
        if (!previewRef.current) return;

        setIsDownloading(true);
        try {
            const canvas = await html2canvas(previewRef.current, {
                scale: 2,
                useCORS: true,
                backgroundColor: '#ffffff'
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const imgWidth = 190;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
            pdf.save(`${resumeData.personalInfo.firstName || 'resume'}_${resumeData.personalInfo.lastName || ''}.pdf`);

            toast.success('Resume exported as PDF!');
        } catch (error) {
            console.error('PDF export error:', error);
            toast.error('Failed to export PDF');
        } finally {
            setIsDownloading(false);
        }
    };

    const exportAsImage = async () => {
        if (!previewRef.current) return;

        setIsDownloading(true);
        try {
            const canvas = await html2canvas(previewRef.current, {
                scale: 2,
                useCORS: true,
                backgroundColor: '#ffffff'
            });

            const link = document.createElement('a');
            link.download = `${resumeData.personalInfo.firstName || 'resume'}_${resumeData.personalInfo.lastName || ''}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();

            toast.success('Resume exported as PNG!');
        } catch (error) {
            console.error('Image export error:', error);
            toast.error('Failed to export image');
        } finally {
            setIsDownloading(false);
        }
    };

    const getPreviewStyle = () => {
        switch (previewSize) {
            case 'small': return { transform: 'scale(0.7)', transformOrigin: 'top left' };
            case 'large': return { transform: 'scale(1.1)', transformOrigin: 'top left' };
            default: return { transform: 'scale(0.85)', transformOrigin: 'top left' };
        }
    };

    return (
        <div className="enhanced-live-preview">
            <div className="preview-toolbar">
                <div className="toolbar-left">
                    <h4>
                        <FaEye /> Live Preview
                        <span className="live-badge">
                            <span className="pulse"></span>
                            LIVE
                        </span>
                    </h4>
                </div>
                <div className="toolbar-right">
                    <button
                        onClick={exportAsImage}
                        disabled={isDownloading}
                        className="export-btn"
                        title="Export as Image"
                    >
                        <FaDownload /> PNG
                    </button>
                    <button
                        onClick={exportAsPDF}
                        disabled={isDownloading}
                        className="export-btn pdf"
                        title="Export as PDF"
                    >
                        <FaFilePdf /> PDF
                    </button>
                    {isDownloading && <FaSpinner className="spinner" />}
                </div>
            </div>

            <div className="preview-content-wrapper">
                <div
                    ref={previewRef}
                    className="preview-content"
                    style={getPreviewStyle()}
                >
                    {/* Resume Template */}
                    <div className="resume-template modern">
                        {/* Header */}
                        <div className="resume-header">
                            <div className="header-left">
                                <h1 className="name">
                                    {resumeData.personalInfo.firstName || 'First'} {resumeData.personalInfo.lastName || 'Last'}
                                </h1>
                                <p className="title">
                                    {resumeData.personalInfo.title || 'Professional Title'}
                                </p>
                            </div>
                            <div className="header-right">
                                <div className="contact-info">
                                    {resumeData.personalInfo.email && (
                                        <div className="contact-item">
                                            <span className="label">Email:</span>
                                            <span>{resumeData.personalInfo.email}</span>
                                        </div>
                                    )}
                                    {resumeData.personalInfo.phone && (
                                        <div className="contact-item">
                                            <span className="label">Phone:</span>
                                            <span>{resumeData.personalInfo.phone}</span>
                                        </div>
                                    )}
                                    {resumeData.personalInfo.linkedin && (
                                        <div className="contact-item">
                                            <span className="label">LinkedIn:</span>
                                            <span>{resumeData.personalInfo.linkedin}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Summary */}
                        {resumeData.summary && (
                            <div className="section">
                                <h2 className="section-title">Professional Summary</h2>
                                <div className="section-content">
                                    <p>{resumeData.summary}</p>
                                </div>
                            </div>
                        )}

                        {/* Experience */}
                        {resumeData.experience.length > 0 && (
                            <div className="section">
                                <h2 className="section-title">Work Experience</h2>
                                <div className="section-content">
                                    {resumeData.experience.map((exp, idx) => (
                                        <div key={idx} className="experience-item">
                                            <div className="experience-header">
                                                <h3>{exp.jobTitle || 'Job Title'}</h3>
                                                <span className="company">{exp.company || 'Company'}</span>
                                                <span className="date">
                                                    {exp.startDate || 'Start'} - {exp.current ? 'Present' : exp.endDate || 'End'}
                                                </span>
                                            </div>
                                            {exp.description && (
                                                <p className="experience-description">{exp.description}</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Education */}
                        {resumeData.education.length > 0 && (
                            <div className="section">
                                <h2 className="section-title">Education</h2>
                                <div className="section-content">
                                    {resumeData.education.map((edu, idx) => (
                                        <div key={idx} className="education-item">
                                            <div className="education-header">
                                                <h3>{edu.degree || 'Degree'}</h3>
                                                <span className="institution">{edu.institution || 'Institution'}</span>
                                                <span className="date">{edu.graduationDate || 'Graduation Date'}</span>
                                            </div>
                                            {edu.gpa && <span className="gpa">GPA: {edu.gpa}</span>}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Skills */}
                        {resumeData.skills.length > 0 && (
                            <div className="section">
                                <h2 className="section-title">Skills</h2>
                                <div className="section-content">
                                    <div className="skills-grid">
                                        {resumeData.skills.map((skill, idx) => (
                                            <span key={idx} className="skill-tag">{skill}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Projects */}
                        {resumeData.projects.length > 0 && (
                            <div className="section">
                                <h2 className="section-title">Projects</h2>
                                <div className="section-content">
                                    {resumeData.projects.map((project, idx) => (
                                        <div key={idx} className="project-item">
                                            <h3>{project.name || 'Project Name'}</h3>
                                            <p>{project.description || 'Project description'}</p>
                                            {project.technologies && (
                                                <div className="project-tech">
                                                    {project.technologies.split(',').map((tech, i) => (
                                                        <span key={i} className="tech-tag">{tech.trim()}</span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Certifications */}
                        {resumeData.certifications.length > 0 && (
                            <div className="section">
                                <h2 className="section-title">Certifications</h2>
                                <div className="section-content">
                                    {resumeData.certifications.map((cert, idx) => (
                                        <div key={idx} className="certification-item">
                                            <h3>{cert.name || 'Certification Name'}</h3>
                                            <span className="issuer">{cert.issuer || 'Issuing Organization'}</span>
                                            {cert.date && <span className="date">{cert.date}</span>}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="preview-footer">
                <div className="preview-info">
                    <span className="info-item">
                        <FaFileAlt /> {Object.keys(resumeData.personalInfo).length} fields filled
                    </span>
                    <span className="info-item">
                        <FaSyncAlt /> Auto-refresh
                    </span>
                </div>
            </div>
        </div>
    );
};

// Enhanced AI Panel
const EnhancedAIPanel = ({
    suggestions,
    jobAnalysis,
    isLoading,
    onApplySuggestion,
    onClose,
    activeSection
}) => {
    const [activeTab, setActiveTab] = useState('suggestions');
    const [selectedSuggestion, setSelectedSuggestion] = useState(null);

    if (isLoading) {
        return (
            <div className="enhanced-ai-panel loading">
                <div className="loading-content">
                    <div className="brain-animation">
                        <FaBrain className="brain-icon" />
                        <div className="brain-pulse"></div>
                    </div>
                    <p>AI is analyzing your resume...</p>
                    <div className="loading-details">
                        <span>Extracting insights</span>
                        <span>Generating suggestions</span>
                        <span>Optimizing content</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="enhanced-ai-panel">
            <div className="panel-header">
                <div className="header-left">
                    <div className="ai-status-indicator">
                        <div className="status-dot active"></div>
                    </div>
                    <div className="header-info">
                        <h3>AI Resume Assistant</h3>
                        <span className="ai-model">Powered by GPT-4</span>
                    </div>
                </div>
                <button onClick={onClose} className="close-btn" title="Close AI Panel">
                    <FaTimes />
                </button>
            </div>

            <div className="panel-tabs">
                <button
                    className={`tab ${activeTab === 'suggestions' ? 'active' : ''}`}
                    onClick={() => setActiveTab('suggestions')}
                >
                    <FaLightbulb /> Suggestions
                </button>
                <button
                    className={`tab ${activeTab === 'analysis' ? 'active' : ''}`}
                    onClick={() => setActiveTab('analysis')}
                >
                    <FaChartLine /> Analysis
                </button>
                {jobAnalysis && (
                    <button
                        className={`tab ${activeTab === 'jobmatch' ? 'active' : ''}`}
                        onClick={() => setActiveTab('jobmatch')}
                    >
                        <FaSearch /> Job Match
                    </button>
                )}
            </div>

            <div className="panel-content">
                {activeTab === 'suggestions' && (
                    <div className="suggestions-container">
                        <div className="section-header">
                            <h4>AI Suggestions</h4>
                            <span className="suggestion-count">
                                {suggestions.length} suggestions
                            </span>
                        </div>

                        <div className="suggestions-grid">
                            {suggestions.slice(0, 6).map((suggestion, idx) => (
                                <motion.div
                                    key={idx}
                                    className="suggestion-card"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    onClick={() => setSelectedSuggestion(suggestion)}
                                >
                                    <div className="suggestion-card-header">
                                        <div className="priority-indicator">
                                            <FaStar className={`priority-icon ${suggestion.priority?.toLowerCase()}`} />
                                            <span className="priority-text">
                                                {suggestion.priority || 'Medium'}
                                            </span>
                                        </div>
                                        <span className="category-badge">
                                            {suggestion.category}
                                        </span>
                                    </div>

                                    <div className="suggestion-card-body">
                                        <p className="suggestion-text">{suggestion.text}</p>

                                        {suggestion.impact && (
                                            <div className="impact-meter">
                                                <div className="impact-label">Impact</div>
                                                <div className="impact-bar">
                                                    <div
                                                        className="impact-fill"
                                                        style={{ width: `${suggestion.impact === 'High' ? '80%' : suggestion.impact === 'Medium' ? '60%' : '40%'}` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="suggestion-card-footer">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onApplySuggestion(suggestion);
                                            }}
                                            className="apply-suggestion-btn"
                                        >
                                            <FaCheckCircle /> Apply
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {selectedSuggestion && (
                            <div className="suggestion-detail-modal">
                                <div className="modal-content">
                                    <div className="modal-header">
                                        <h4>Apply Suggestion</h4>
                                        <button onClick={() => setSelectedSuggestion(null)}>
                                            <FaTimes />
                                        </button>
                                    </div>
                                    <div className="modal-body">
                                        <p><strong>Category:</strong> {selectedSuggestion.category}</p>
                                        <p><strong>Priority:</strong> {selectedSuggestion.priority}</p>
                                        <p><strong>Suggestion:</strong> {selectedSuggestion.text}</p>
                                        <p><strong>Impact:</strong> {selectedSuggestion.impact}</p>

                                        <div className="action-buttons">
                                            <button className="btn-primary">
                                                <FaMagic /> Apply & Rewrite
                                            </button>
                                            <button className="btn-secondary">
                                                <FaSyncAlt /> Preview Changes
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'analysis' && (
                    <div className="analysis-container">
                        <div className="analysis-card">
                            <h4>Resume Score</h4>
                            <div className="score-display">
                                <div className="score-circle">
                                    <span className="score-value">78</span>
                                    <span className="score-max">/100</span>
                                </div>
                                <div className="score-breakdown">
                                    <div className="score-item">
                                        <span className="score-label">Content</span>
                                        <div className="score-bar">
                                            <div className="bar-fill" style={{ width: '85%' }}></div>
                                        </div>
                                        <span className="score-percent">85%</span>
                                    </div>
                                    <div className="score-item">
                                        <span className="score-label">Format</span>
                                        <div className="score-bar">
                                            <div className="bar-fill" style={{ width: '90%' }}></div>
                                        </div>
                                        <span className="score-percent">90%</span>
                                    </div>
                                    <div className="score-item">
                                        <span className="score-label">Keywords</span>
                                        <div className="score-bar">
                                            <div className="bar-fill" style={{ width: '70%' }}></div>
                                        </div>
                                        <span className="score-percent">70%</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="improvement-areas">
                            <h4>Areas for Improvement</h4>
                            <ul className="improvement-list">
                                <li>
                                    <FaExclamationTriangle className="warning-icon" />
                                    Add more quantifiable achievements
                                </li>
                                <li>
                                    <FaExclamationTriangle className="warning-icon" />
                                    Include industry-specific keywords
                                </li>
                                <li>
                                    <FaExclamationTriangle className="warning-icon" />
                                    Expand technical skills section
                                </li>
                            </ul>
                        </div>
                    </div>
                )}

                {activeTab === 'jobmatch' && jobAnalysis && (
                    <div className="jobmatch-container">
                        <div className="match-header">
                            <h4>Job Match Analysis</h4>
                            <div className="match-score">
                                <div className="score-display-large">
                                    <span className="score-value">{jobAnalysis.matchScore || 85}</span>
                                    <span className="score-label">Match</span>
                                </div>
                            </div>
                        </div>

                        <div className="job-details">
                            <div className="detail-item">
                                <span className="detail-label">Job Title</span>
                                <span className="detail-value">{jobAnalysis.jobTitle || 'Software Engineer'}</span>
                            </div>
                            <div className="detail-item">
                                <span className="detail-label">Level</span>
                                <span className="detail-value">{jobAnalysis.jobLevel || 'Senior'}</span>
                            </div>
                            <div className="detail-item">
                                <span className="detail-label">Salary Range</span>
                                <span className="detail-value">{jobAnalysis.salaryRange || '$120K - $180K'}</span>
                            </div>
                        </div>

                        <div className="keyword-analysis">
                            <h5>Required Keywords</h5>
                            <div className="keyword-cloud">
                                {jobAnalysis.keywords?.slice(0, 12).map((keyword, idx) => (
                                    <span key={idx} className={`keyword-tag ${idx < 4 ? 'primary' : idx < 8 ? 'secondary' : 'tertiary'}`}>
                                        {keyword}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="match-breakdown">
                            <h5>Match Breakdown</h5>
                            <div className="breakdown-grid">
                                <div className="breakdown-item">
                                    <span className="breakdown-label">Skills</span>
                                    <div className="breakdown-bar">
                                        <div className="bar-fill" style={{ width: '75%' }}></div>
                                    </div>
                                    <span className="breakdown-percent">75%</span>
                                </div>
                                <div className="breakdown-item">
                                    <span className="breakdown-label">Experience</span>
                                    <div className="breakdown-bar">
                                        <div className="bar-fill" style={{ width: '85%' }}></div>
                                    </div>
                                    <span className="breakdown-percent">85%</span>
                                </div>
                                <div className="breakdown-item">
                                    <span className="breakdown-label">Education</span>
                                    <div className="breakdown-bar">
                                        <div className="bar-fill" style={{ width: '90%' }}></div>
                                    </div>
                                    <span className="breakdown-percent">90%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="panel-footer">
                <button className="refresh-suggestions">
                    <FaSync /> Refresh Suggestions
                </button>
            </div>
        </div>
    );
};

// Job URL Modal
const JobURLModal = ({ isOpen, onClose, onAnalyze }) => {
    const [jobUrl, setJobUrl] = useState('');
    const [urlType, setUrlType] = useState('linkedin');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async () => {
        if (!jobUrl.trim()) {
            toast.error('Please enter a job description URL');
            return;
        }

        setIsLoading(true);
        await onAnalyze(jobUrl, urlType);
        setIsLoading(false);
        onClose();
    };

    const handlePaste = async () => {
        try {
            const text = await navigator.clipboard.readText();
            setJobUrl(text);
            toast.success('URL pasted!');
        } catch (err) {
            toast.error('Unable to paste from clipboard');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <motion.div
                className="modal-content job-url-modal"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
            >
                <div className="modal-header">
                    <h3>
                        <FaLink /> Analyze Job Description
                    </h3>
                    <button onClick={onClose} className="close-btn">
                        <FaTimes />
                    </button>
                </div>

                <div className="modal-body">
                    <div className="url-type-selector">
                        <h4>Select Platform</h4>
                        <div className="platform-grid">
                            <button
                                className={`platform-card ${urlType === 'linkedin' ? 'active' : ''}`}
                                onClick={() => setUrlType('linkedin')}
                            >
                                <div className="platform-icon linkedin">
                                    <FaLink />
                                </div>
                                <span>LinkedIn</span>
                            </button>
                            <button
                                className={`platform-card ${urlType === 'indeed' ? 'active' : ''}`}
                                onClick={() => setUrlType('indeed')}
                            >
                                <div className="platform-icon indeed">
                                    <FaBriefcase />
                                </div>
                                <span>Indeed</span>
                            </button>
                            <button
                                className={`platform-card ${urlType === 'glassdoor' ? 'active' : ''}`}
                                onClick={() => setUrlType('glassdoor')}
                            >
                                <div className="platform-icon glassdoor">
                                    <FaSearch />
                                </div>
                                <span>Glassdoor</span>
                            </button>
                            <button
                                className={`platform-card ${urlType === 'custom' ? 'active' : ''}`}
                                onClick={() => setUrlType('custom')}
                            >
                                <div className="platform-icon custom">
                                    <FaExternalLinkAlt />
                                </div>
                                <span>Custom URL</span>
                            </button>
                        </div>
                    </div>

                    <div className="url-input-section">
                        <div className="input-group">
                            <div className="input-header">
                                <label>Job Description URL</label>
                                <button onClick={handlePaste} className="paste-btn">
                                    <FaCopy /> Paste URL
                                </button>
                            </div>
                            <div className="input-wrapper">
                                <FaExternalLinkAlt className="input-icon" />
                                <input
                                    type="url"
                                    value={jobUrl}
                                    onChange={(e) => setJobUrl(e.target.value)}
                                    placeholder="https://www.linkedin.com/jobs/view/..."
                                    className="url-input"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="analysis-preview">
                        <h4>AI Analysis Includes:</h4>
                        <div className="features-grid">
                            <div className="feature-card">
                                <FaSearch className="feature-icon" />
                                <span>Keyword Extraction</span>
                            </div>
                            <div className="feature-card">
                                <FaPercent className="feature-icon" />
                                <span>Match Score</span>
                            </div>
                            <div className="feature-card">
                                <FaChartLine className="feature-icon" />
                                <span>Salary Analysis</span>
                            </div>
                            <div className="feature-card">
                                <FaLightbulb className="feature-icon" />
                                <span>Optimization Tips</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="modal-footer">
                    <button onClick={onClose} className="btn-secondary">
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isLoading || !jobUrl.trim()}
                        className="btn-primary"
                    >
                        {isLoading ? (
                            <>
                                <FaSpinner className="spinner" /> Analyzing...
                            </>
                        ) : (
                            <>
                                <FaBrain /> Analyze Job Description
                            </>
                        )}
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

// Resume Upload Modal
const ResumeUploadModal = ({ isOpen, onClose, onUpload }) => {
    const [file, setFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [dragOver, setDragOver] = useState(false);
    const [extractionMethod, setExtractionMethod] = useState('ai');
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            validateAndSetFile(selectedFile);
        }
    };

    const validateAndSetFile = (selectedFile) => {
        const validTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'text/plain'
        ];

        const maxSize = 10 * 1024 * 1024; // 10MB

        if (!validTypes.includes(selectedFile.type)) {
            toast.error('Please upload PDF, Word, or text files only');
            return;
        }

        if (selectedFile.size > maxSize) {
            toast.error('File size should be less than 10MB');
            return;
        }

        setFile(selectedFile);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setDragOver(true);
    };

    const handleDragLeave = () => {
        setDragOver(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile) {
            validateAndSetFile(droppedFile);
        }
    };

    const handleUpload = async () => {
        if (!file) {
            toast.error('Please select a file to upload');
            return;
        }

        setIsUploading(true);
        try {
            await onUpload(file, extractionMethod);
            toast.success('Resume uploaded successfully!');
        } catch (error) {
            console.error('Upload error:', error);
            toast.error('Failed to upload resume');
        } finally {
            setIsUploading(false);
            onClose();
        }
    };

    const getFileIcon = () => {
        if (!file) return <FaUpload />;

        if (file.type.includes('pdf')) return <FaFilePdf />;
        if (file.type.includes('word') || file.type.includes('document')) return <FaFileWord />;
        return <FaFile />;
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <motion.div
                className="modal-content upload-modal"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
            >
                <div className="modal-header">
                    <h3>
                        <FaFileUpload /> Upload Resume
                    </h3>
                    <button onClick={onClose} className="close-btn">
                        <FaTimes />
                    </button>
                </div>

                <div className="modal-body">
                    <div className="upload-methods">
                        <h4>Extraction Method</h4>
                        <div className="method-options">
                            <button
                                className={`method-btn ${extractionMethod === 'ai' ? 'active' : ''}`}
                                onClick={() => setExtractionMethod('ai')}
                            >
                                <div className="method-icon">
                                    <FaRobot />
                                </div>
                                <div className="method-info">
                                    <h5 style={{ color: '#000' }}>AI-Powered</h5>
                                    <p style={{ color: '#666' }}>Advanced parsing with AI</p>
                                </div>
                            </button>
                            <button
                                className={`method-btn ${extractionMethod === 'basic' ? 'active' : ''}`}
                                onClick={() => setExtractionMethod('basic')}
                            >
                                <div className="method-icon">
                                    <FaFile />
                                </div>
                                <div className="method-info">
                                    <h5 style={{ color: '#000' }}>Basic Extraction</h5>
                                    <p style={{ color: '#666' }}>Simple text extraction</p>
                                </div>
                            </button>
                        </div>
                    </div>

                    <div
                        className={`upload-zone ${dragOver ? 'drag-over' : ''}`}
                        onClick={() => fileInputRef.current?.click()}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                    >
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept=".pdf,.doc,.docx,.txt"
                            className="hidden"
                        />

                        {file ? (
                            <div className="file-preview">
                                <div className="file-icon-large">
                                    {getFileIcon()}
                                </div>
                                <div className="file-details">
                                    <h4 style={{ color: '#000' }}>{file.name}</h4>
                                    <div className="file-meta">
                                        <span style={{ color: '#666' }}>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                                        <span style={{ color: '#666' }}>•</span>
                                        <span style={{ color: '#666' }}>{file.type.split('/')[1].toUpperCase()}</span>
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setFile(null);
                                        }}
                                        className="remove-file-btn"
                                    >
                                        Remove File
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="upload-placeholder">
                                    <FaUpload className="upload-icon-large" style={{ color: '#666' }} />
                                    <h4 style={{ color: '#000' }}>Drag & Drop Your Resume</h4>
                                    <p style={{ color: '#666' }}>or click to browse files</p>
                                    <div className="supported-formats">
                                        <span className="format-badge">PDF</span>
                                        <span className="format-badge">DOC</span>
                                        <span className="format-badge">DOCX</span>
                                        <span className="format-badge">TXT</span>
                                    </div>
                                    <p className="file-size-note" style={{ color: '#666' }}>Max file size: 10MB</p>
                                </div>
                            </>
                        )}
                    </div>

                    <div className="upload-features">
                        <h4 style={{ color: '#000' }}>What happens next?</h4>
                        <div className="feature-steps">
                            <div className="step">
                                <div className="step-number">1</div>
                                <div className="step-content">
                                    <h5 style={{ color: '#000' }}>File Upload</h5>
                                    <p style={{ color: '#666' }}>Your resume is securely uploaded</p>
                                </div>
                            </div>
                            <div className="step">
                                <div className="step-number">2</div>
                                <div className="step-content">
                                    <h5 style={{ color: '#000' }}>AI Analysis</h5>
                                    <p style={{ color: '#666' }}>AI extracts and structures your data</p>
                                </div>
                            </div>
                            <div className="step">
                                <div className="step-number">3</div>
                                <div className="step-content">
                                    <h5 style={{ color: '#000' }}>Auto-Fill</h5>
                                    <p style={{ color: '#666' }}>All fields are automatically populated</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="modal-footer">
                    <button onClick={onClose} className="btn-secondary">
                        Cancel
                    </button>
                    <button
                        onClick={handleUpload}
                        disabled={isUploading || !file}
                        className="btn-primary"
                        style={{ position: 'relative' }}
                    >
                        {isUploading ? (
                            <>
                                <FaSpinner className="spinner" style={{ animation: 'spin 1s linear infinite' }} />
                                <span style={{ marginLeft: '8px' }}>Processing...</span>
                            </>
                        ) : (
                            <>
                                <FaBrain />
                                <span style={{ marginLeft: '8px' }}>Extract & Auto-Fill</span>
                            </>
                        )}
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

// Main Builder Component
const Builder = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { resumeId } = useParams();

    const [currentStep, setCurrentStep] = useState(1);
    const [showPreview, setShowPreview] = useState(true);
    const [showAIPanel, setShowAIPanel] = useState(true);
    const [showJobModal, setShowJobModal] = useState(false);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [resumeData, setResumeData] = useState({
        personalInfo: {},
        summary: '',
        experience: [],
        education: [],
        skills: [],
        projects: [],
        certifications: []
    });
    const [lastSaved, setLastSaved] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [loading, setLoading] = useState(false);
    const [resumeTitle, setResumeTitle] = useState('My Resume');
    const [aiSuggestions, setAiSuggestions] = useState([]);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [jobAnalysis, setJobAnalysis] = useState(null);
    const [previewSize, setPreviewSize] = useState('medium');
    const [resumeVersions, setResumeVersions] = useState([]);
    const [activeSection, setActiveSection] = useState(null);
    const [isExporting, setIsExporting] = useState(false);
    const [errors, setErrors] = useState({});
    const [saveError, setSaveError] = useState(null);

    const aiService = useRef(new AIService());

    useEffect(() => {
        const loadResumeData = async () => {
            setLoading(true);
            try {
                if (location.state) {
                    const { resumeData: uploadedData, jobAnalysis: analysis } = location.state;
                    if (uploadedData) {
                        setResumeData(uploadedData);
                        toast.success('Resume data loaded successfully!');
                    }
                    if (analysis) {
                        setJobAnalysis(analysis);
                        await generateAISuggestions(analysis);
                    }
                }

                // Load from local storage
                const savedDraft = localStorage.getItem('resumeDraft');
                if (savedDraft) {
                    setResumeData(JSON.parse(savedDraft));
                    toast.success('Auto-saved draft restored');
                }
            } catch (error) {
                console.error('Error loading resume data:', error);
                toast.error('Failed to load resume data');
            } finally {
                setLoading(false);
            }
        };

        loadResumeData();
    }, [location.state]);

    useEffect(() => {
        const timeout = setTimeout(() => {
            try {
                localStorage.setItem('resumeDraft', JSON.stringify(resumeData));
                setLastSaved(new Date().toLocaleTimeString());
            } catch (error) {
                console.error('Auto-save error:', error);
            }
        }, 1000);
        return () => clearTimeout(timeout);
    }, [resumeData]);

    const validateStep = (step) => {
        const newErrors = {};

        switch (step) {
            case 1: // Personal Info
                if (!resumeData.personalInfo.firstName?.trim()) {
                    newErrors.firstName = 'First name is required';
                }
                if (!resumeData.personalInfo.email?.trim()) {
                    newErrors.email = 'Email is required';
                } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(resumeData.personalInfo.email)) {
                    newErrors.email = 'Invalid email format';
                }
                break;
            case 2: // Summary
                if (!resumeData.summary?.trim()) {
                    newErrors.summary = 'Professional summary is required';
                } else if (resumeData.summary.length < 50) {
                    newErrors.summary = 'Summary should be at least 50 characters';
                }
                break;
            // Add validation for other steps
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const generateAISuggestions = async (analysis) => {
        setIsAnalyzing(true);
        setErrors(prev => ({ ...prev, ai: null }));

        try {
            const suggestions = await aiService.current.generateJobSpecificSuggestions(resumeData, analysis);
            setAiSuggestions(suggestions);
            toast.success('AI suggestions generated successfully!');
        } catch (error) {
            console.error('AI error:', error);
            setErrors(prev => ({ ...prev, ai: error.message }));
            toast.error('Failed to generate AI suggestions');
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleInputChange = (section, updates, index = null) => {
        setResumeData(prev => {
            const newData = { ...prev };
            if (section === 'personalInfo') {
                newData.personalInfo = { ...newData.personalInfo, ...updates };
            } else if (section === 'summary') {
                newData.summary = updates;
            } else if (['experience', 'education', 'projects', 'certifications'].includes(section)) {
                if (index !== null) {
                    const newArray = [...newData[section]];
                    newArray[index] = { ...newArray[index], ...updates };
                    newData[section] = newArray;
                }
            } else if (section === 'skills') {
                newData.skills = updates;
            }
            return newData;
        });

        // Clear errors for this section
        if (section === 'personalInfo' && Object.keys(updates)[0]) {
            setErrors(prev => ({ ...prev, [Object.keys(updates)[0]]: undefined }));
        }
    };

    const analyzeJobDescription = async (url, type) => {
        setIsAnalyzing(true);
        setErrors(prev => ({ ...prev, jobAnalysis: null }));

        const toastId = toast.loading('Analyzing job description...');

        try {
            const analysis = await aiService.current.analyzeJobDescription(url);
            setJobAnalysis(analysis);

            const suggestions = await aiService.current.generateJobSpecificSuggestions(resumeData, analysis);
            setAiSuggestions(suggestions);

            toast.success('Job analysis complete! AI suggestions loaded', { id: toastId });
        } catch (error) {
            console.error('Job analysis error:', error);
            setErrors(prev => ({ ...prev, jobAnalysis: error.message }));
            toast.error(`Analysis failed: ${error.message}`, { id: toastId });
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleResumeUpload = async (file, method = 'ai') => {
        setIsAnalyzing(true);
        setErrors(prev => ({ ...prev, upload: null }));

        const toastId = toast.loading('Extracting resume content...');

        try {
            const text = await readFileAsText(file);
            const extractedData = await aiService.current.extractResumeData(text, method);

            // Save current version
            setResumeVersions(prev => [...prev, { data: resumeData, timestamp: new Date() }]);

            setResumeData(extractedData);

            // Generate suggestions for uploaded resume
            const suggestions = await aiService.current.analyzeResume(extractedData);
            setAiSuggestions(suggestions);

            toast.success('Resume uploaded and analyzed successfully!', { id: toastId });
        } catch (error) {
            console.error('Resume upload error:', error);
            setErrors(prev => ({ ...prev, upload: error.message }));
            toast.error(`Upload failed: ${error.message}`, { id: toastId });
        } finally {
            setIsAnalyzing(false);
        }
    };

    const readFileAsText = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(new Error('Failed to read file'));
            reader.readAsText(file);
        });
    };

    const applyAISuggestion = async (suggestion) => {
        try {
            // Save current version
            setResumeVersions(prev => [...prev, { data: resumeData, timestamp: new Date() }]);

            // Apply suggestion logic based on type
            switch (suggestion.type) {
                case 'keyword':
                    if (suggestion.section === 'summary') {
                        setResumeData(prev => ({
                            ...prev,
                            summary: prev.summary + ' ' + suggestion.value
                        }));
                    }
                    break;
                case 'rewrite':
                    // Rewrite logic
                    break;
                default:
                    // Generic application
                    break;
            }

            toast.success('Suggestion applied successfully!');
        } catch (error) {
            console.error('Failed to apply suggestion:', error);
            toast.error('Failed to apply suggestion');
            throw error;
        }
    };

    const saveResume = async () => {
        if (!validateStep(currentStep)) {
            toast.error('Please fix validation errors before saving');
            return;
        }

        setIsSaving(true);
        setSaveError(null);

        try {
            const response = await aiService.current.saveResume({
                title: resumeTitle,
                data: resumeData,
                aiSuggestions,
                jobAnalysis
            }, resumeId);

            if (response.success) {
                localStorage.removeItem('resumeDraft');
                toast.success('Resume saved successfully!');
            } else {
                throw new Error(response.message || 'Failed to save resume');
            }
        } catch (error) {
            console.error('Save error:', error);
            setSaveError(error.message);
            toast.error(`Save failed: ${error.message}`);
        } finally {
            setIsSaving(false);
        }
    };

    const exportResume = async (format = 'pdf') => {
        setIsExporting(true);

        try {
            if (format === 'json') {
                const dataStr = JSON.stringify(resumeData, null, 2);
                const dataBlob = new Blob([dataStr], { type: 'application/json' });
                const url = URL.createObjectURL(dataBlob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `${resumeTitle.replace(/\s+/g, '_')}.json`;
                link.click();
                URL.revokeObjectURL(url);
                toast.success('Resume exported as JSON!');
            } else {
                // PDF and DOC export would be handled by EnhancedLivePreview
                toast.error(`${format.toUpperCase()} export is handled by the preview export buttons`);
            }
        } catch (error) {
            console.error('Export error:', error);
            toast.error('Failed to export resume');
        } finally {
            setIsExporting(false);
        }
    };

    const handleNextStep = () => {
        if (validateStep(currentStep)) {
            setCurrentStep(prev => Math.min(8, prev + 1));
        }
    };

    const handlePrevStep = () => {
        setCurrentStep(prev => Math.max(1, prev - 1));
    };

    const steps = [
        { number: 1, title: 'Personal', icon: <FaUser />, color: '#3B82F6' },
        { number: 2, title: 'Summary', icon: <FaFileAlt />, color: '#8B5CF6' },
        { number: 3, title: 'Experience', icon: <FaBriefcase />, color: '#10B981' },
        { number: 4, title: 'Education', icon: <FaGraduationCap />, color: '#F59E0B' },
        { number: 5, title: 'Skills', icon: <FaCogs />, color: '#EC4899' },
        { number: 6, title: 'Projects', icon: <FaProjectDiagram />, color: '#6366F1' },
        { number: 7, title: 'Certifications', icon: <FaCertificate />, color: '#14B8A6' },
        { number: 8, title: 'Finish', icon: <FaCheck />, color: '#EF4444' }
    ];

    const renderCurrentStep = () => {
        const commonProps = {
            resumeData,
            onInputChange: handleInputChange,
            errors,
            setErrors
        };

        switch (currentStep) {
            case 1: return <PersonalInfoPage {...commonProps} />;
            case 2: return <SummaryPage {...commonProps} />;
            case 3: return <ExperiencePage {...commonProps} />;
            case 4: return <EducationPage {...commonProps} />;
            case 5: return <SkillsPage {...commonProps} />;
            case 6: return <ProjectsPage {...commonProps} />;
            case 7: return <CertificationsPage {...commonProps} />;
            case 8: return <CompletionPage {...commonProps} />;
            default: return <PersonalInfoPage {...commonProps} />;
        }
    };

    if (loading) {
        return (
            <div className="loading-screen">
                <FaRocket className="loader-icon" />
                <p className="loading-text">Loading Resume Builder...</p>
            </div>
        );
    }

    return (
        <div className="builder-container">
            {/* Top Navigation Bar */}
            <nav className="top-nav">
                <div className="nav-left">
                    <Link to="/dashboard" className="back-btn">
                        <FaArrowLeft />
                        <span>Dashboard</span>
                    </Link>
                    <div className="resume-title">
                        <input
                            type="text"
                            value={resumeTitle}
                            onChange={(e) => setResumeTitle(e.target.value)}
                            placeholder="Resume Title"
                            className="title-input"
                        />
                        {lastSaved && (
                            <span className="save-indicator">
                                <FaRegClock /> Saved {lastSaved}
                            </span>
                        )}
                    </div>
                </div>

                <div className="nav-center">
                    <div className="progress-steps">
                        {steps.map((step) => (
                            <button
                                key={step.number}
                                onClick={() => setCurrentStep(step.number)}
                                className={`step-dot ${currentStep === step.number ? 'active' : ''} 
                                         ${currentStep > step.number ? 'completed' : ''}`}
                                style={{ '--step-color': step.color }}
                                title={step.title}
                            >
                                {step.icon}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="nav-right">
                    {saveError && (
                        <span className="save-error">
                            <FaExclamationCircle /> {saveError}
                        </span>
                    )}
                    <button
                        onClick={saveResume}
                        className="save-btn"
                        disabled={isSaving}
                    >
                        {isSaving ? <FaSpinner className="spinner" /> : <FaSave />}
                        <span>Save</span>
                    </button>

                    <div className="export-dropdown">
                        <button className="export-btn" disabled={isExporting}>
                            <FaDownload />
                            <span>Export</span>
                            <FaChevronRight className="dropdown-arrow" />
                        </button>
                        <div className="export-options">
                            <button onClick={() => exportResume('json')}>
                                <SiJson /> JSON
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content Area */}
            <main className="main-content">
                <div className="content-grid">
                    {/* Left: Form Section */}
                    <div className="form-section">
                        <div className="form-header">
                            <h2 className="step-title">
                                {steps[currentStep - 1]?.title}
                                <span className="step-number">Step {currentStep} of {steps.length}</span>
                            </h2>
                            <div className="step-actions">
                                <button
                                    onClick={handlePrevStep}
                                    disabled={currentStep === 1}
                                    className="nav-btn prev-btn"
                                >
                                    <FaChevronLeft />
                                    Previous
                                </button>
                                <button
                                    onClick={handleNextStep}
                                    disabled={currentStep === steps.length}
                                    className="nav-btn next-btn"
                                >
                                    Next
                                    <FaChevronRight />
                                </button>
                            </div>
                        </div>
                        <div className="form-content">
                            {renderCurrentStep()}
                        </div>
                    </div>

                    {/* Middle: Live Preview */}
                    <AnimatePresence>
                        {showPreview && (
                            <motion.div
                                className={`preview-section ${previewSize}`}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                            >
                                <EnhancedLivePreview
                                    resumeData={resumeData}
                                    previewSize={previewSize}
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Right: AI Panel */}
                    <AnimatePresence>
                        {showAIPanel && (
                            <motion.div
                                className="ai-section"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                            >
                                <EnhancedAIPanel
                                    suggestions={aiSuggestions}
                                    jobAnalysis={jobAnalysis}
                                    isLoading={isAnalyzing}
                                    onApplySuggestion={applyAISuggestion}
                                    onClose={() => setShowAIPanel(false)}
                                    activeSection={activeSection}
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </main>

            {/* Bottom Control Bar */}
            <div className="control-bar">
                <div className="control-left">
                    <button
                        onClick={() => setShowAIPanel(!showAIPanel)}
                        className={`control-btn ${showAIPanel ? 'active' : ''}`}
                    >
                        <FaRobot />
                        <span>AI Assistant</span>
                    </button>
                    <button
                        onClick={() => setShowPreview(!showPreview)}
                        className={`control-btn ${showPreview ? 'active' : ''}`}
                    >
                        {showPreview ? <FaEyeSlash /> : <FaEye />}
                        <span>Preview</span>
                    </button>
                    <button
                        onClick={() => setShowJobModal(true)}
                        className="control-btn"
                    >
                        <FaSearch />
                        <span>Analyze Job</span>
                    </button>
                    <button
                        onClick={() => setShowUploadModal(true)}
                        className="control-btn"
                    >
                        <FaUpload />
                        <span>Upload Resume</span>
                    </button>
                </div>

                <div className="control-center">
                    <div className="preview-size-controls">
                        <span className="size-label">Preview Size:</span>
                        <button
                            onClick={() => setPreviewSize('small')}
                            className={`size-btn ${previewSize === 'small' ? 'active' : ''}`}
                        >
                            <FaCompress />
                        </button>
                        <button
                            onClick={() => setPreviewSize('medium')}
                            className={`size-btn ${previewSize === 'medium' ? 'active' : ''}`}
                        >
                            <FaExpand />
                        </button>
                        <button
                            onClick={() => setPreviewSize('large')}
                            className={`size-btn ${previewSize === 'large' ? 'active' : ''}`}
                        >
                            <FaExpand style={{ transform: 'scale(1.2)' }} />
                        </button>
                    </div>
                </div>

                <div className="control-right">
                    <button
                        onClick={saveResume}
                        disabled={isSaving}
                        className="control-btn primary"
                    >
                        {isSaving ? <FaSpinner className="spinner" /> : <FaSave />}
                        <span>Save Draft</span>
                    </button>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="control-btn secondary"
                    >
                        <FaHome />
                        <span>Exit</span>
                    </button>
                </div>
            </div>

            {/* Modals */}
            <JobURLModal
                isOpen={showJobModal}
                onClose={() => setShowJobModal(false)}
                onAnalyze={analyzeJobDescription}
            />

            <ResumeUploadModal
                isOpen={showUploadModal}
                onClose={() => setShowUploadModal(false)}
                onUpload={handleResumeUpload}
            />
        </div>
    );
};

// CSS Styles
const styles = `
.builder-container {
    display: flex;
    flex-direction: column;
    height: 100vh;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    overflow: hidden;
}

.top-nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 2rem;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
    z-index: 100;
}

.nav-left, .nav-right {
    display: flex;
    align-items: center;
    gap: 1.5rem;
}

.nav-center {
    flex: 1;
    display: flex;
    justify-content: center;
}

.back-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: #f8f9fa;
    border: 1px solid #e9ecef;
    border-radius: 8px;
    color: #495057;
    text-decoration: none;
    transition: all 0.3s ease;
}

.back-btn:hover {
    background: #e9ecef;
    transform: translateY(-1px);
}

.resume-title {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}

.title-input {
    font-size: 1.25rem;
    font-weight: 600;
    color: #212529;
    border: none;
    background: transparent;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    transition: all 0.3s ease;
    min-width: 200px;
}

.title-input:focus {
    outline: none;
    background: #f8f9fa;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

.save-indicator {
    font-size: 0.75rem;
    color: #6c757d;
    display: flex;
    align-items: center;
    gap: 0.25rem;
}

.progress-steps {
    display: flex;
    gap: 1rem;
    align-items: center;
}

.step-dot {
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 50%;
    border: 2px solid #e9ecef;
    background: white;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #adb5bd;
    transition: all 0.3s ease;
    cursor: pointer;
    position: relative;
}

.step-dot.active {
    background: var(--step-color);
    color: white;
    border-color: var(--step-color);
    transform: scale(1.1);
}

.step-dot.completed {
    background: #28a745;
    color: white;
    border-color: #28a745;
}

.step-dot:hover {
    transform: scale(1.1);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.save-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1.5rem;
    background: #28a745;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
}

.save-btn:hover:not(:disabled) {
    background: #218838;
    transform: translateY(-1px);
}

.save-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.export-dropdown {
    position: relative;
}

.export-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1.5rem;
    background: #6f42c1;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
}

.export-btn:hover {
    background: #5a32a3;
    transform: translateY(-1px);
}

.export-options {
    position: absolute;
    top: 100%;
    right: 0;
    margin-top: 0.5rem;
    background: white;
    border-radius: 8px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
    min-width: 150px;
    opacity: 0;
    visibility: hidden;
    transform: translateY(-10px);
    transition: all 0.3s ease;
}

.export-dropdown:hover .export-options {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
}

.export-options button {
    width: 100%;
    padding: 0.75rem 1rem;
    background: none;
    border: none;
    text-align: left;
    color: #495057;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: all 0.2s ease;
}

.export-options button:hover {
    background: #f8f9fa;
    color: #212529;
}

.save-error {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0.75rem;
    background: #f8d7da;
    color: #721c24;
    border: 1px solid #f5c6cb;
    border-radius: 6px;
    font-size: 0.875rem;
}

.main-content {
    flex: 1;
    padding: 2rem;
    overflow: hidden;
}

.content-grid {
    display: grid;
    grid-template-columns: 1fr 1fr 400px;
    gap: 2rem;
    height: 100%;
}

.form-section, .preview-section, .ai-section {
    background: white;
    border-radius: 16px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    display: flex;
    flex-direction: column;
}

.form-section {
    grid-column: 1;
}

.preview-section {
    grid-column: 2;
}

.ai-section {
    grid-column: 3;
}

.form-header {
    padding: 1.5rem;
    border-bottom: 1px solid #e9ecef;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.step-title {
    font-size: 1.5rem;
    color: #212529;
    margin: 0;
}

.step-number {
    display: block;
    font-size: 0.875rem;
    color: #6c757d;
    margin-top: 0.25rem;
}

.step-actions {
    display: flex;
    gap: 0.75rem;
}

.nav-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: #f8f9fa;
    border: 1px solid #e9ecef;
    border-radius: 8px;
    color: #495057;
    cursor: pointer;
    transition: all 0.3s ease;
}

.nav-btn:hover:not(:disabled) {
    background: #e9ecef;
    transform: translateY(-1px);
}

.nav-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.next-btn {
    background: #007bff;
    color: white;
    border-color: #007bff;
}

.next-btn:hover:not(:disabled) {
    background: #0056b3;
    border-color: #0056b3;
}

.form-content {
    flex: 1;
    padding: 1.5rem;
    overflow-y: auto;
}

.page-title {
    color: #212529;
    margin-bottom: 1.5rem;
    font-size: 1.25rem;
}

.form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    margin-bottom: 1rem;
}

.form-group {
    margin-bottom: 1rem;
}

.form-group label {
    display: block;
    margin-bottom: 0.5rem;
    color: #495057;
    font-weight: 500;
}

.form-group input,
.form-group textarea,
.form-group select {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #ced4da;
    border-radius: 8px;
    font-size: 0.875rem;
    transition: all 0.3s ease;
}

.form-group input:focus,
.form-group textarea:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
}

.form-group textarea {
    resize: vertical;
    min-height: 100px;
}

.error {
    border-color: #dc3545 !important;
}

.error-message {
    color: #dc3545;
    font-size: 0.75rem;
    margin-top: 0.25rem;
    display: block;
}

.char-count {
    text-align: right;
    font-size: 0.75rem;
    color: #6c757d;
    margin-top: 0.25rem;
}

.experience-item,
.education-item,
.project-item,
.certification-item {
    background: #f8f9fa;
    border-radius: 12px;
    padding: 1.5rem;
    margin-bottom: 1rem;
    border: 1px solid #e9ecef;
}

.item-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
}

.item-header h4 {
    margin: 0;
    color: #212529;
}

.remove-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.375rem 0.75rem;
    background: #dc3545;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.875rem;
    transition: all 0.3s ease;
}

.remove-btn:hover {
    background: #c82333;
    transform: translateY(-1px);
}

.date-group {
    display: flex;
    gap: 1rem;
    align-items: center;
}

.checkbox-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    font-size: 0.875rem;
    color: #495057;
}

.add-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.5rem;
    background: #007bff;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    margin-top: 1rem;
    transition: all 0.3s ease;
}

.add-btn:hover {
    background: #0056b3;
    transform: translateY(-1px);
}

.skills-input-group {
    margin-bottom: 1.5rem;
}

.input-with-button {
    display: flex;
    gap: 0.5rem;
}

.input-with-button input {
    flex: 1;
    padding: 0.75rem;
    border: 1px solid #ced4da;
    border-radius: 8px;
    font-size: 0.875rem;
}

.add-skill-btn {
    padding: 0.75rem 1.5rem;
    background: #28a745;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: all 0.3s ease;
}

.add-skill-btn:hover {
    background: #218838;
    transform: translateY(-1px);
}

.skills-list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    min-height: 100px;
    padding: 1rem;
    background: #f8f9fa;
    border-radius: 12px;
    border: 1px solid #e9ecef;
}

.skill-tag {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: white;
    border: 1px solid #007bff;
    border-radius: 50px;
    color: #007bff;
    font-size: 0.875rem;
    transition: all 0.3s ease;
}

.skill-tag:hover {
    background: #007bff;
    color: white;
    transform: translateY(-1px);
}

.remove-skill {
    background: none;
    border: none;
    color: inherit;
    cursor: pointer;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0.7;
    transition: opacity 0.2s ease;
}

.remove-skill:hover {
    opacity: 1;
}

.empty-state {
    text-align: center;
    color: #6c757d;
    width: 100%;
    padding: 2rem;
}

.completion-page {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    padding: 3rem;
}

.completion-content {
    text-align: center;
    max-width: 400px;
}

.completion-icon {
    font-size: 4rem;
    color: #28a745;
    margin-bottom: 1.5rem;
}

.completion-title {
    color: #212529;
    margin-bottom: 1rem;
    font-size: 1.75rem;
}

.completion-message {
    color: #6c757d;
    line-height: 1.6;
    margin-bottom: 2rem;
}

.completion-stats {
    display: flex;
    justify-content: space-around;
    gap: 1rem;
}

.stat {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.stat-number {
    font-size: 1.75rem;
    font-weight: 600;
    color: #007bff;
}

.stat-label {
    font-size: 0.75rem;
    color: #6c757d;
    margin-top: 0.25rem;
}

.enhanced-live-preview {
    display: flex;
    flex-direction: column;
    height: 100%;
}

.preview-toolbar {
    padding: 1rem 1.5rem;
    border-bottom: 1px solid #e9ecef;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.preview-toolbar h4 {
    margin: 0;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #212529;
}

.live-badge {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.25rem 0.5rem;
    background: #28a745;
    color: white;
    border-radius: 4px;
    font-size: 0.75rem;
    font-weight: 600;
}

.pulse {
    width: 6px;
    height: 6px;
    background: white;
    border-radius: 50%;
    animation: pulse 2s infinite;
}

@keyframes pulse {
    0% { opacity: 1; }
    50% { opacity: 0.5; }
    100% { opacity: 1; }
}

.export-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: #f8f9fa;
    border: 1px solid #e9ecef;
    border-radius: 6px;
    color: #495057;
    cursor: pointer;
    font-size: 0.875rem;
    transition: all 0.3s ease;
}

.export-btn:hover {
    background: #e9ecef;
    transform: translateY(-1px);
}

.export-btn.pdf {
    background: #dc3545;
    color: white;
    border-color: #dc3545;
}

.export-btn.pdf:hover {
    background: #c82333;
    border-color: #bd2130;
}

.spinner {
    animation: spin 1s linear infinite;
}

@keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
}

.preview-content-wrapper {
    flex: 1;
    padding: 2rem;
    overflow: auto;
    background: #f8f9fa;
}

.preview-content {
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    padding: 2rem;
    min-height: 1000px;
}

.resume-template.modern {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    color: #333;
}

.resume-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 2rem;
    padding-bottom: 1.5rem;
    border-bottom: 3px solid #007bff;
}

.header-left h1 {
    margin: 0;
    font-size: 2.5rem;
    color: #212529;
    font-weight: 700;
}

.header-left .title {
    margin: 0.5rem 0 0;
    color: #6c757d;
    font-size: 1.25rem;
    font-weight: 500;
}

.contact-info {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    text-align: right;
}

.contact-item {
    font-size: 0.875rem;
    color: #495057;
}

.contact-item .label {
    font-weight: 600;
    color: #212529;
    margin-right: 0.5rem;
}

.section {
    margin-bottom: 2rem;
}

.section-title {
    color: #007bff;
    font-size: 1.25rem;
    font-weight: 600;
    margin-bottom: 1rem;
    padding-bottom: 0.5rem;
    border-bottom: 2px solid #e9ecef;
}

.section-content {
    font-size: 0.875rem;
    line-height: 1.6;
    color: #495057;
}

.experience-header,
.education-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
}

.experience-header h3,
.education-header h3 {
    margin: 0;
    font-size: 1rem;
    color: #212529;
    font-weight: 600;
}

.company,
.institution,
.date {
    color: #6c757d;
    font-size: 0.875rem;
}

.experience-description {
    margin: 0;
    padding-left: 1rem;
    border-left: 2px solid #e9ecef;
}

.gpa {
    display: inline-block;
    background: #f8f9fa;
    padding: 0.25rem 0.75rem;
    border-radius: 4px;
    font-size: 0.75rem;
    color: #28a745;
    margin-top: 0.5rem;
}

.skills-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
}

.skill-tag {
    display: inline-block;
    padding: 0.375rem 0.75rem;
    background: #007bff;
    color: white;
    border-radius: 50px;
    font-size: 0.75rem;
    font-weight: 500;
}

.project-tech {
    display: flex;
    flex-wrap: wrap;
    gap: 0.375rem;
    margin-top: 0.75rem;
}

.tech-tag {
    display: inline-block;
    padding: 0.25rem 0.5rem;
    background: #f8f9fa;
    color: #495057;
    border-radius: 4px;
    font-size: 0.75rem;
    border: 1px solid #e9ecef;
}

.preview-footer {
    padding: 1rem 1.5rem;
    border-top: 1px solid #e9ecef;
    background: white;
}

.preview-info {
    display: flex;
    gap: 1.5rem;
    justify-content: center;
}

.info-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
    color: #6c757d;
}

.enhanced-ai-panel {
    display: flex;
    flex-direction: column;
    height: 100%;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
}

.enhanced-ai-panel.loading {
    display: flex;
    align-items: center;
    justify-content: center;
}

.brain-animation {
    position: relative;
    margin-bottom: 2rem;
}

.brain-icon {
    font-size: 4rem;
    color: white;
    animation: float 3s ease-in-out infinite;
}

.brain-pulse {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 100px;
    height: 100px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    animation: pulse-ring 2s linear infinite;
}

@keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
}

@keyframes pulse-ring {
    0% { transform: translate(-50%, -50%) scale(0.8); opacity: 0.8; }
    100% { transform: translate(-50%, -50%) scale(1.2); opacity: 0; }
}

.loading-details {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-top: 1.5rem;
    text-align: center;
}

.loading-details span {
    opacity: 0.8;
    animation: fadeInOut 1.5s ease-in-out infinite;
}

.loading-details span:nth-child(2) { animation-delay: 0.5s; }
.loading-details span:nth-child(3) { animation-delay: 1s; }

@keyframes fadeInOut {
    0%, 100% { opacity: 0.3; }
    50% { opacity: 1; }
}

.panel-header {
    padding: 1rem 1.5rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.header-left {
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.ai-status-indicator {
    position: relative;
}

.status-dot {
    width: 8px;
    height: 8px;
    background: #28a745;
    border-radius: 50%;
    position: relative;
}

.status-dot.active::after {
    content: '';
    position: absolute;
    top: -4px;
    left: -4px;
    right: -4px;
    bottom: -4px;
    border: 2px solid rgba(40, 167, 69, 0.3);
    border-radius: 50%;
    animation: pulse 2s infinite;
}

.header-info h3 {
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
}

.ai-model {
    font-size: 0.75rem;
    opacity: 0.8;
}

.close-btn {
    background: rgba(255, 255, 255, 0.1);
    border: none;
    color: white;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s ease;
}

.close-btn:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: rotate(90deg);
}

.panel-tabs {
    display: flex;
    padding: 0.5rem 1.5rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    gap: 0.5rem;
}

.tab {
    flex: 1;
    padding: 0.75rem;
    background: rgba(255, 255, 255, 0.1);
    border: none;
    border-radius: 8px;
    color: white;
    cursor: pointer;
    font-size: 0.875rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    transition: all 0.3s ease;
}

.tab:hover {
    background: rgba(255, 255, 255, 0.15);
}

.tab.active {
    background: white;
    color: #764ba2;
    font-weight: 600;
}

.panel-content {
    flex: 1;
    padding: 1.5rem;
    overflow-y: auto;
}

.suggestions-container,
.analysis-container,
.jobmatch-container {
    height: 100%;
}

.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
}

.section-header h4 {
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
}

.suggestion-count {
    background: rgba(255, 255, 255, 0.1);
    padding: 0.25rem 0.75rem;
    border-radius: 50px;
    font-size: 0.75rem;
}

.suggestions-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1rem;
    margin-bottom: 1.5rem;
}

.suggestion-card {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    padding: 1rem;
    cursor: pointer;
    transition: all 0.3s ease;
    border: 1px solid transparent;
}

.suggestion-card:hover {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.2);
    transform: translateY(-2px);
}

.suggestion-card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.75rem;
}

.priority-indicator {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.priority-icon {
    font-size: 0.75rem;
}

.priority-icon.high { color: #ff6b6b; }
.priority-icon.medium { color: #ffd93d; }
.priority-icon.low { color: #6bcf7f; }

.priority-text {
    font-size: 0.75rem;
    opacity: 0.9;
}

.category-badge {
    background: rgba(255, 255, 255, 0.15);
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-size: 0.75rem;
    font-weight: 500;
}

.suggestion-card-body {
    margin-bottom: 1rem;
}

.suggestion-text {
    margin: 0;
    font-size: 0.875rem;
    line-height: 1.5;
    opacity: 0.95;
}

.impact-meter {
    margin-top: 0.75rem;
}

.impact-label {
    font-size: 0.75rem;
    margin-bottom: 0.25rem;
    opacity: 0.8;
}

.impact-bar {
    height: 4px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 2px;
    overflow: hidden;
}

.impact-fill {
    height: 100%;
    background: linear-gradient(90deg, #ff6b6b, #ffd93d, #6bcf7f);
    border-radius: 2px;
}

.suggestion-card-footer {
    display: flex;
    justify-content: flex-end;
}

.apply-suggestion-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: rgba(255, 255, 255, 0.15);
    border: none;
    border-radius: 6px;
    color: white;
    font-size: 0.75rem;
    cursor: pointer;
    transition: all 0.3s ease;
}

.apply-suggestion-btn:hover {
    background: rgba(255, 255, 255, 0.25);
}

.suggestion-detail-modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.modal-content {
    background: white;
    border-radius: 16px;
    max-width: 500px;
    width: 90%;
    max-height: 80vh;
    overflow: hidden;
    color: #212529;
}

.modal-header {
    padding: 1.5rem;
    border-bottom: 1px solid #e9ecef;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.modal-header h4 {
    margin: 0;
    color: #212529;
}

.modal-header button {
    background: none;
    border: none;
    color: #6c757d;
    cursor: pointer;
    font-size: 1rem;
}

.modal-body {
    padding: 1.5rem;
}

.action-buttons {
    display: flex;
    gap: 1rem;
    margin-top: 1.5rem;
}

.btn-primary, .btn-secondary {
    flex: 1;
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
}

.btn-primary {
    background: #007bff;
    color: white;
}

.btn-primary:hover {
    background: #0056b3;
    transform: translateY(-1px);
}

.btn-secondary {
    background: #f8f9fa;
    color: #495057;
    border: 1px solid #e9ecef;
}

.btn-secondary:hover {
    background: #e9ecef;
}

.analysis-container {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.analysis-card {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    padding: 1.5rem;
}

.analysis-card h4 {
    margin: 0 0 1rem 0;
    font-size: 1rem;
    font-weight: 600;
}

.score-display {
    display: flex;
    align-items: center;
    gap: 2rem;
}

.score-circle {
    position: relative;
    width: 100px;
    height: 100px;
    border-radius: 50%;
    background: conic-gradient(#28a745 0% 78%, #e9ecef 78% 100%);
    display: flex;
    align-items: center;
    justify-content: center;
}

.score-circle::before {
    content: '';
    position: absolute;
    width: 80px;
    height: 80px;
    background: #667eea;
    border-radius: 50%;
}

.score-value,
.score-max {
    position: relative;
    z-index: 1;
    color: white;
    font-weight: 600;
}

.score-value {
    font-size: 2rem;
}

.score-max {
    font-size: 1rem;
    opacity: 0.8;
}

.score-breakdown {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.score-item {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.score-label {
    font-size: 0.875rem;
    min-width: 70px;
}

.score-bar {
    flex: 1;
    height: 8px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
    overflow: hidden;
}

.bar-fill {
    height: 100%;
    background: linear-gradient(90deg, #ff6b6b, #ffd93d, #6bcf7f);
    border-radius: 4px;
}

.score-percent {
    font-size: 0.875rem;
    min-width: 40px;
    text-align: right;
}

.improvement-areas {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    padding: 1.5rem;
}

.improvement-areas h4 {
    margin: 0 0 1rem 0;
    font-size: 1rem;
    font-weight: 600;
}

.improvement-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.improvement-list li {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-size: 0.875rem;
}

.warning-icon {
    color: #ffd93d;
    flex-shrink: 0;
}

.jobmatch-container {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.match-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.score-display-large {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
}

.score-value {
    font-size: 2.5rem;
    font-weight: 700;
    line-height: 1;
}

.score-label {
    font-size: 0.875rem;
    opacity: 0.8;
}

.job-details {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 1rem;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    padding: 1rem;
}

.detail-item {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}

.detail-label {
    font-size: 0.75rem;
    opacity: 0.7;
}

.detail-value {
    font-size: 0.875rem;
    font-weight: 600;
}

.keyword-analysis {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    padding: 1rem;
}

.keyword-analysis h5 {
    margin: 0 0 1rem 0;
    font-size: 0.875rem;
    font-weight: 600;
}

.keyword-cloud {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
}

.keyword-tag {
    padding: 0.375rem 0.75rem;
    background: rgba(255, 255, 255, 0.15);
    border-radius: 50px;
    font-size: 0.75rem;
    transition: all 0.3s ease;
}

.keyword-tag.primary {
    background: rgba(255, 107, 107, 0.3);
    color: #ff6b6b;
}

.keyword-tag.secondary {
    background: rgba(255, 217, 61, 0.3);
    color: #ffd93d;
}

.keyword-tag.tertiary {
    background: rgba(107, 207, 127, 0.3);
    color: #6bcf7f;
}

.keyword-tag:hover {
    transform: translateY(-1px);
}

.match-breakdown {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    padding: 1rem;
}

.match-breakdown h5 {
    margin: 0 0 1rem 0;
    font-size: 0.875rem;
    font-weight: 600;
}

.breakdown-grid {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.breakdown-item {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.breakdown-label {
    font-size: 0.875rem;
    min-width: 80px;
}

.breakdown-bar {
    flex: 1;
    height: 6px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
    overflow: hidden;
}

.breakdown-percent {
    font-size: 0.875rem;
    min-width: 40px;
    text-align: right;
}

.panel-footer {
    padding: 1rem 1.5rem;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    display: flex;
    justify-content: center;
}

.refresh-suggestions {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.5rem;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 8px;
    color: white;
    cursor: pointer;
    transition: all 0.3s ease;
}

.refresh-suggestions:hover {
    background: rgba(255, 255, 255, 0.15);
    transform: translateY(-1px);
}

.control-bar {
    padding: 1rem 2rem;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    border-top: 1px solid rgba(0, 0, 0, 0.1);
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 2rem;
}

.control-left,
.control-right {
    display: flex;
    gap: 0.75rem;
}

.control-center {
    flex: 1;
    display: flex;
    justify-content: center;
}

.control-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.5rem;
    background: #f8f9fa;
    border: 1px solid #e9ecef;
    border-radius: 8px;
    color: #495057;
    cursor: pointer;
    transition: all 0.3s ease;
    font-weight: 500;
}

.control-btn:hover {
    background: #e9ecef;
    transform: translateY(-1px);
}

.control-btn.active {
    background: #007bff;
    color: white;
    border-color: #007bff;
}

.control-btn.primary {
    background: #28a745;
    color: white;
    border-color: #28a745;
}

.control-btn.primary:hover {
    background: #218838;
    border-color: #1e7e34;
}

.control-btn.secondary {
    background: #6c757d;
    color: white;
    border-color: #6c757d;
}

.control-btn.secondary:hover {
    background: #5a6268;
    border-color: #545b62;
}

.preview-size-controls {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: #f8f9fa;
    padding: 0.5rem;
    border-radius: 8px;
}

.size-label {
    font-size: 0.875rem;
    color: #6c757d;
    margin-right: 0.5rem;
}

.size-btn {
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: white;
    border: 1px solid #e9ecef;
    border-radius: 6px;
    color: #495057;
    cursor: pointer;
    transition: all 0.3s ease;
}

.size-btn:hover {
    background: #e9ecef;
    transform: translateY(-1px);
}

.size-btn.active {
    background: #007bff;
    color: white;
    border-color: #007bff;
}

.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2000;
    backdrop-filter: blur(4px);
}

.job-url-modal,
.upload-modal {
    background: white;
    border-radius: 16px;
    max-width: 600px;
    width: 90%;
    max-height: 80vh;
    overflow: hidden;
    display: flex;
    flex-direction: column;
}

.modal-header {
    padding: 1.5rem;
    border-bottom: 1px solid #e9ecef;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.modal-header h3 {
    margin: 0;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #212529;
}

.modal-body {
    flex: 1;
    padding: 1.5rem;
    overflow-y: auto;
}

.url-type-selector {
    margin-bottom: 1.5rem;
}

.url-type-selector h4 {
    margin: 0 0 1rem 0;
    color: #212529;
}

.platform-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
}

.platform-card {
    padding: 1rem;
    background: #f8f9fa;
    border: 2px solid #e9ecef;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
}

.platform-card:hover {
    background: #e9ecef;
    transform: translateY(-1px);
}

.platform-card.active {
    background: #007bff;
    border-color: #007bff;
    color: white;
}

.platform-icon {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.25rem;
}

.platform-icon.linkedin {
    background: #0077b5;
    color: white;
}

.platform-icon.indeed {
    background: #2164f3;
    color: white;
}

.platform-icon.glassdoor {
    background: #0caa41;
    color: white;
}

.platform-icon.custom {
    background: #6c757d;
    color: white;
}

.input-group {
    margin-bottom: 1.5rem;
}

.input-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
}

.input-header label {
    font-weight: 600;
    color: #212529;
}

.paste-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.375rem 0.75rem;
    background: #f8f9fa;
    border: 1px solid #e9ecef;
    border-radius: 6px;
    color: #495057;
    cursor: pointer;
    font-size: 0.875rem;
    transition: all 0.3s ease;
}

.paste-btn:hover {
    background: #e9ecef;
}

.input-wrapper {
    position: relative;
}

.input-icon {
    position: absolute;
    left: 1rem;
    top: 50%;
    transform: translateY(-50%);
    color: #6c757d;
}

.url-input {
    width: 100%;
    padding: 0.75rem 1rem 0.75rem 3rem;
    border: 1px solid #ced4da;
    border-radius: 8px;
    font-size: 0.875rem;
    transition: all 0.3s ease;
}

.url-input:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
}

.analysis-preview {
    margin-top: 1.5rem;
}

.analysis-preview h4 {
    margin: 0 0 1rem 0;
    color: #212529;
}

.features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 0.75rem;
}

.feature-card {
    padding: 1rem;
    background: #f8f9fa;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    text-align: center;
}

.feature-icon {
    font-size: 1.25rem;
    color: #007bff;
}

.feature-card span {
    font-size: 0.75rem;
    color: #495057;
    font-weight: 500;
}

.modal-footer {
    padding: 1.5rem;
    border-top: 1px solid #e9ecef;
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
}

.btn-secondary {
    padding: 0.75rem 1.5rem;
    background: #6c757d;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.3s ease;
}

.btn-secondary:hover {
    background: #5a6268;
}

.btn-primary {
    padding: 0.75rem 1.5rem;
    background: #007bff;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.btn-primary:hover:not(:disabled) {
    background: #0056b3;
    transform: translateY(-1px);
}

.btn-primary:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.upload-methods {
    margin-bottom: 1.5rem;
}

.upload-methods h4 {
    margin: 0 0 1rem 0;
    color: #212529;
}

.method-options {
    display: flex;
    gap: 0.75rem;
}

.method-btn {
    flex: 1;
    padding: 1rem;
    background: #f8f9fa;
    border: 2px solid #e9ecef;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 1rem;
}

.method-btn:hover {
    background: #e9ecef;
    transform: translateY(-1px);
}

.method-btn.active {
    background: #007bff;
    border-color: #007bff;
    color: white;
}

.method-icon {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: #e9ecef;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.25rem;
    transition: all 0.3s ease;
}

.method-btn.active .method-icon {
    background: rgba(255, 255, 255, 0.2);
}

.method-info {
    text-align: left;
}

.method-info h5 {
    margin: 0 0 0.25rem 0;
    font-size: 0.875rem;
}

.method-info p {
    margin: 0;
    font-size: 0.75rem;
    opacity: 0.8;
}

.upload-zone {
    border: 2px dashed #ced4da;
    border-radius: 12px;
    padding: 3rem;
    text-align: center;
    cursor: pointer;
    transition: all 0.3s ease;
    margin-bottom: 1.5rem;
}

.upload-zone:hover,
.upload-zone.drag-over {
    border-color: #007bff;
    background: #f8f9fa;
}

.upload-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
}

.upload-icon-large {
    font-size: 3rem;
    color: #6c757d;
}

.supported-formats {
    display: flex;
    gap: 0.5rem;
    margin: 1rem 0;
}

.format-badge {
    padding: 0.25rem 0.75rem;
    background: #e9ecef;
    border-radius: 4px;
    font-size: 0.75rem;
    color: #495057;
}

.file-size-note {
    font-size: 0.75rem;
    margin-top: 0.5rem;
}

.file-preview {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background: #f8f9fa;
    border-radius: 8px;
}

.file-icon-large {
    font-size: 2rem;
    color: #007bff;
}

.file-details {
    flex: 1;
    text-align: left;
}

.file-details h4 {
    margin: 0 0 0.5rem 0;
    font-size: 1rem;
}

.file-meta {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
}

.remove-file-btn {
    margin-top: 0.5rem;
    padding: 0.375rem 0.75rem;
    background: #dc3545;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.875rem;
    transition: all 0.3s ease;
}

.remove-file-btn:hover {
    background: #c82333;
}

.upload-features {
    margin-top: 1.5rem;
}

.feature-steps {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-top: 1rem;
}

.step {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background: #f8f9fa;
    border-radius: 8px;
}

.step-number {
    width: 32px;
    height: 32px;
    background: #007bff;
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    font-size: 0.875rem;
}

.step-content h5 {
    margin: 0 0 0.25rem 0;
    font-size: 0.875rem;
}

.step-content p {
    margin: 0;
    font-size: 0.75rem;
    opacity: 0.8;
}

.hidden {
    display: none;
}

.loading-screen {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100vh;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
}

.loader-icon {
    font-size: 4rem;
    animation: float 3s ease-in-out infinite;
    margin-bottom: 2rem;
}

.loading-text {
    font-size: 1.25rem;
    opacity: 0.9;
}

/* Responsive adjustments */
@media (max-width: 1400px) {
    .content-grid {
        grid-template-columns: 1fr 1fr;
    }
    
    .ai-section {
        position: fixed;
        right: 0;
        top: 0;
        bottom: 0;
        width: 400px;
        z-index: 1000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
    }
    
    .ai-section.active {
        transform: translateX(0);
    }
}

@media (max-width: 1200px) {
    .content-grid {
        grid-template-columns: 1fr;
    }
    
    .preview-section {
        position: fixed;
        right: 0;
        top: 0;
        bottom: 0;
        width: 50%;
        z-index: 1000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
    }
    
    .preview-section.active {
        transform: translateX(0);
    }
}

@media (max-width: 768px) {
    .top-nav {
        flex-direction: column;
        gap: 1rem;
        padding: 1rem;
    }
    
    .nav-left, .nav-right {
        width: 100%;
        justify-content: space-between;
    }
    
    .progress-steps {
        overflow-x: auto;
        padding: 0.5rem 0;
    }
    
    .main-content {
        padding: 1rem;
    }
    
    .content-grid {
        gap: 1rem;
    }
    
    .control-bar {
        flex-direction: column;
        gap: 1rem;
        padding: 1rem;
    }
    
    .control-left, .control-right, .control-center {
        width: 100%;
        justify-content: center;
    }
    
    .preview-section {
        width: 100%;
    }
    
    .ai-section {
        width: 100%;
    }
}
`;

// Add styles to document
if (typeof document !== 'undefined') {
    const styleSheet = document.createElement("style");
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
}

export default Builder;