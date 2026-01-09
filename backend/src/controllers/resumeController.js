// backend/controllers/resumeController.js - Fixed version
import Resume from '../models/Resume.js';

// @desc    Create new resume
// @route   POST /api/resumes
// @access  Private
export const createResume = async (req, res) => {
    try {
        const { title, templateSettings, status } = req.body;

        // Create resume with user ID
        const resumeData = {
            user: req.user.id,
            title: title || `${req.user.name}'s Resume`,
            personalInfo: {
                firstName: req.user.name?.split(' ')[0] || '',
                lastName: req.user.name?.split(' ').slice(1).join(' ') || '',
                email: req.user.email || '',
                phone: '',
                address: '',
                linkedin: '',
                github: '',
                portfolio: ''
            },
            summary: '',
            experience: [],
            education: [],
            skills: [],
            projects: [],
            certifications: [],
            languages: [],
            templateSettings: templateSettings || {
                templateName: 'modern',
                colors: {
                    primary: '#3b82f6',
                    secondary: '#6b7280',
                    accent: '#10b981',
                    background: '#ffffff',
                    text: '#000000'
                },
                font: 'Roboto',
                fontSize: 'medium',
                spacing: 'normal',
                showPhoto: false
            },
            status: status || 'draft',
            analysis: {
                score: 0,
                atsScore: 0,
                completeness: 0,
                strengths: [],
                improvements: [],
                suggestions: [],
                keywords: [],
                readabilityScore: 0,
                wordCount: 0,
                lastAnalyzed: null
            }
        };

        const resume = await Resume.create(resumeData);

        res.status(201).json({
            success: true,
            message: 'Resume created successfully',
            data: resume
        });
    } catch (error) {
        console.error('Create resume error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create resume',
            message: error.message
        });
    }
};

// @desc    Get all resumes for user
// @route   GET /api/resumes
// @access  Private
export const getUserResumes = async (req, res) => {
    try {
        const resumes = await Resume.find({ user: req.user.id })
            .select('-analysis -templateSettings -__v') // Exclude heavy fields for list view
            .sort({ updatedAt: -1 })
            .lean();

        res.json({
            success: true,
            count: resumes.length,
            data: resumes
        });
    } catch (error) {
        console.error('Get resumes error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch resumes',
            message: error.message
        });
    }
};

// @desc    Get single resume
// @route   GET /api/resumes/:id
// @access  Private
export const getResumeById = async (req, res) => {
    try {
        const resume = await Resume.findById(req.params.id);

        if (!resume) {
            return res.status(404).json({
                success: false,
                error: 'Resume not found',
                message: 'Resume with this ID does not exist'
            });
        }

        // Check if user owns the resume
        if (resume.user.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                error: 'Access denied',
                message: 'You are not authorized to access this resume'
            });
        }

        res.json({
            success: true,
            data: resume
        });
    } catch (error) {
        console.error('Get resume error:', error);
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                error: 'Invalid resume ID',
                message: 'Please provide a valid resume ID'
            });
        }
        res.status(500).json({
            success: false,
            error: 'Failed to fetch resume',
            message: error.message
        });
    }
};

// @desc    Update resume (partial update for sections)
// @route   PUT /api/resumes/:id
// @access  Private
export const updateResume = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const resume = await Resume.findById(id);

        if (!resume) {
            return res.status(404).json({
                success: false,
                error: 'Resume not found',
                message: 'Resume with this ID does not exist'
            });
        }

        // Check if user owns the resume
        if (resume.user.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                error: 'Access denied',
                message: 'You are not authorized to update this resume'
            });
        }

        // Update only provided fields (partial update)
        const updateFields = [
            'title', 'summary', 'experience', 'education', 'skills',
            'projects', 'certifications', 'languages', 'status',
            'templateSettings', 'analysis', 'progress'
        ];

        updateFields.forEach(field => {
            if (updateData[field] !== undefined) {
                resume[field] = updateData[field];
            }
        });

        // Handle nested updates for personalInfo
        if (updateData.personalInfo) {
            resume.personalInfo = {
                ...resume.personalInfo,
                ...updateData.personalInfo
            };
        }

        // Handle nested updates for templateSettings
        if (updateData.templateSettings) {
            resume.templateSettings = {
                ...resume.templateSettings,
                ...updateData.templateSettings
            };
        }

        // Recalculate progress if relevant fields were updated
        if (updateData.experience || updateData.education || updateData.skills ||
            updateData.summary || updateData.personalInfo) {
            resume.progress = calculateProgress(resume);
        }

        resume.updatedAt = Date.now();

        const updatedResume = await resume.save();

        res.json({
            success: true,
            message: 'Resume updated successfully',
            data: updatedResume
        });
    } catch (error) {
        console.error('Update resume error:', error);
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                error: 'Invalid resume ID',
                message: 'Please provide a valid resume ID'
            });
        }
        res.status(500).json({
            success: false,
            error: 'Failed to update resume',
            message: error.message
        });
    }
};

// @desc    Delete resume
// @route   DELETE /api/resumes/:id
// @access  Private
export const deleteResume = async (req, res) => {
    try {
        const resume = await Resume.findById(req.params.id);

        if (!resume) {
            return res.status(404).json({
                success: false,
                error: 'Resume not found',
                message: 'Resume with this ID does not exist'
            });
        }

        // Check if user owns the resume
        if (resume.user.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                error: 'Access denied',
                message: 'You are not authorized to delete this resume'
            });
        }

        await resume.deleteOne();

        res.json({
            success: true,
            message: 'Resume deleted successfully',
            data: { id: req.params.id }
        });
    } catch (error) {
        console.error('Delete resume error:', error);
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                error: 'Invalid resume ID',
                message: 'Please provide a valid resume ID'
            });
        }
        res.status(500).json({
            success: false,
            error: 'Failed to delete resume',
            message: error.message
        });
    }
};

// @desc    Duplicate resume
// @route   POST /api/resumes/:id/duplicate
// @access  Private
export const duplicateResume = async (req, res) => {
    try {
        const resume = await Resume.findById(req.params.id);

        if (!resume) {
            return res.status(404).json({
                success: false,
                error: 'Resume not found',
                message: 'Resume with this ID does not exist'
            });
        }

        // Check if user owns the resume
        if (resume.user.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                error: 'Access denied',
                message: 'You are not authorized to duplicate this resume'
            });
        }

        // Create a duplicate with "Copy" in title
        const duplicateData = resume.toObject();
        delete duplicateData._id;
        delete duplicateData.createdAt;
        delete duplicateData.updatedAt;
        delete duplicateData.analyzedAt;

        duplicateData.title = `${resume.title} (Copy)`;
        duplicateData.status = 'draft';
        duplicateData.analysis = {
            score: 0,
            atsScore: 0,
            completeness: 0,
            strengths: [],
            improvements: [],
            suggestions: [],
            keywords: [],
            readabilityScore: 0,
            wordCount: 0,
            lastAnalyzed: null
        };

        const newResume = await Resume.create(duplicateData);

        res.status(201).json({
            success: true,
            message: 'Resume duplicated successfully',
            data: newResume
        });
    } catch (error) {
        console.error('Duplicate resume error:', error);
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                error: 'Invalid resume ID',
                message: 'Please provide a valid resume ID'
            });
        }
        res.status(500).json({
            success: false,
            error: 'Failed to duplicate resume',
            message: error.message
        });
    }
};

// @desc    Analyze resume
// @route   POST /api/resumes/:id/analyze
// @access  Private
export const analyzeResume = async (req, res) => {
    try {
        const resume = await Resume.findById(req.params.id);

        if (!resume) {
            return res.status(404).json({
                success: false,
                error: 'Resume not found',
                message: 'Resume with this ID does not exist'
            });
        }

        // Check if user owns the resume
        if (resume.user.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                error: 'Access denied',
                message: 'You are not authorized to analyze this resume'
            });
        }

        // Calculate ATS score using helper function
        const atsScore = calculateATSScore(resume);

        // Calculate progress
        const completeness = calculateProgress(resume);

        // Calculate word count
        const wordCount = calculateWordCount(resume);

        // Calculate readability score
        const readabilityScore = calculateReadabilityScore(resume);

        // Generate analysis
        const analysis = {
            score: Math.round((atsScore + readabilityScore) / 2),
            atsScore: atsScore,
            completeness: completeness,
            strengths: generateStrengths(resume),
            improvements: generateImprovements(resume),
            suggestions: generateSuggestions(resume),
            keywords: extractKeywords(resume),
            readabilityScore: readabilityScore,
            wordCount: wordCount,
            lastAnalyzed: new Date()
        };

        // Update resume with analysis
        resume.analysis = analysis;
        resume.analyzedAt = new Date();
        await resume.save();

        res.json({
            success: true,
            message: 'Resume analyzed successfully',
            data: {
                resume: resume,
                analysis: analysis
            }
        });
    } catch (error) {
        console.error('Analyze resume error:', error);
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                error: 'Invalid resume ID',
                message: 'Please provide a valid resume ID'
            });
        }
        res.status(500).json({
            success: false,
            error: 'Failed to analyze resume',
            message: error.message
        });
    }
};

// Helper Functions

// Calculate resume completion progress
const calculateProgress = (resume) => {
    let progress = 0;
    const weights = {
        personalInfo: 20,
        summary: 15,
        experience: 25,
        education: 15,
        skills: 15,
        other: 10
    };

    // Check personal info
    if (resume.personalInfo?.firstName && resume.personalInfo?.lastName && resume.personalInfo?.email) {
        progress += weights.personalInfo;
    }

    // Check summary
    if (resume.summary && resume.summary.trim().length > 50) {
        progress += weights.summary;
    }

    // Check experience
    if (resume.experience && resume.experience.length > 0) {
        progress += weights.experience;
    }

    // Check education
    if (resume.education && resume.education.length > 0) {
        progress += weights.education;
    }

    // Check skills
    if (resume.skills && resume.skills.length >= 3) {
        progress += weights.skills;
    }

    // Check other sections
    if ((resume.projects && resume.projects.length > 0) ||
        (resume.certifications && resume.certifications.length > 0) ||
        (resume.languages && resume.languages.length > 0)) {
        progress += weights.other;
    }

    return Math.min(progress, 100);
};

// Calculate ATS (Applicant Tracking System) score
const calculateATSScore = (resume) => {
    let score = 50; // Base score

    // Check for keywords
    const keywords = ['experience', 'skills', 'education', 'project', 'certification', 'achievement'];
    const content = JSON.stringify(resume).toLowerCase();

    keywords.forEach(keyword => {
        if (content.includes(keyword)) {
            score += 5;
        }
    });

    // Check structure
    if (resume.experience && resume.experience.length > 0) score += 10;
    if (resume.education && resume.education.length > 0) score += 10;
    if (resume.skills && resume.skills.length >= 5) score += 10;
    if (resume.summary && resume.summary.length > 100) score += 10;

    // Check contact info
    if (resume.personalInfo?.email) score += 5;
    if (resume.personalInfo?.phone) score += 5;

    return Math.min(score, 100);
};

// Calculate word count
const calculateWordCount = (resume) => {
    let wordCount = 0;

    if (resume.summary) {
        wordCount += resume.summary.split(/\s+/).length;
    }

    if (resume.experience) {
        resume.experience.forEach(exp => {
            if (exp.description) {
                wordCount += exp.description.split(/\s+/).length;
            }
        });
    }

    return wordCount;
};

// Calculate readability score
const calculateReadabilityScore = (resume) => {
    // Simple readability calculation
    let score = 70; // Base score

    // Check sentence length in summary
    if (resume.summary) {
        const sentences = resume.summary.split(/[.!?]+/).filter(s => s.trim().length > 0);
        const avgSentenceLength = resume.summary.split(/\s+/).length / Math.max(sentences.length, 1);

        if (avgSentenceLength > 25) score -= 10;
        if (avgSentenceLength < 15) score += 5;
    }

    // Check for action verbs
    const actionVerbs = ['achieved', 'managed', 'developed', 'created', 'improved', 'increased', 'reduced', 'led', 'implemented'];
    const content = JSON.stringify(resume).toLowerCase();

    let verbCount = 0;
    actionVerbs.forEach(verb => {
        if (content.includes(verb)) {
            verbCount++;
        }
    });

    if (verbCount >= 3) score += 15;
    if (verbCount >= 5) score += 10;

    return Math.min(Math.max(score, 0), 100);
};

// Generate strengths list
const generateStrengths = (resume) => {
    const strengths = [];

    if (resume.personalInfo?.firstName && resume.personalInfo?.lastName) {
        strengths.push("Complete personal information");
    }

    if (resume.summary && resume.summary.trim().length > 100) {
        strengths.push("Strong professional summary");
    }

    if (resume.experience && resume.experience.length > 1) {
        strengths.push("Multiple work experiences");
    }

    if (resume.education && resume.education.length > 0) {
        strengths.push("Complete education details");
    }

    if (resume.skills && resume.skills.length >= 5) {
        strengths.push("Comprehensive skills list");
    }

    if (resume.certifications && resume.certifications.length > 0) {
        strengths.push("Professional certifications included");
    }

    if (resume.languages && resume.languages.length > 0) {
        strengths.push("Language skills highlighted");
    }

    return strengths;
};

// Generate improvements list
const generateImprovements = (resume) => {
    const improvements = [];

    if (!resume.summary || resume.summary.trim().length < 100) {
        improvements.push("Add more detail to professional summary (aim for 100+ words)");
    }

    if (!resume.experience || resume.experience.length === 0) {
        improvements.push("Add work experience section");
    }

    if (!resume.education || resume.education.length === 0) {
        improvements.push("Add education details");
    }

    if (!resume.skills || resume.skills.length < 5) {
        improvements.push("Add more skills (aim for 5+ relevant skills)");
    }

    if (!resume.personalInfo?.phone) {
        improvements.push("Add phone number for better contact");
    }

    if (resume.experience) {
        resume.experience.forEach((exp, index) => {
            if (!exp.description || exp.description.trim().length < 50) {
                improvements.push(`Add more details to experience #${index + 1}`);
            }
        });
    }

    return improvements.slice(0, 5); // Limit to 5 improvements
};

// Generate suggestions
const generateSuggestions = (resume) => {
    const suggestions = [
        "Use action verbs to describe achievements (e.g., 'Managed', 'Developed', 'Increased')",
        "Quantify results with numbers and percentages (e.g., 'Increased sales by 30%')",
        "Include relevant keywords for your industry",
        "Keep summary concise but impactful (2-3 paragraphs)",
        "Proofread for spelling and grammar errors",
        "Use consistent formatting throughout",
        "Highlight most relevant experience first",
        "Include both hard and soft skills"
    ];

    // Customize suggestions based on resume content
    if (!resume.summary || resume.summary.length < 50) {
        suggestions.push("Start with a strong summary that highlights your key qualifications");
    }

    if (resume.experience && resume.experience.length > 3) {
        suggestions.push("Consider limiting experience to last 10-15 years for relevance");
    }

    return suggestions;
};

// Extract keywords from resume
const extractKeywords = (resume) => {
    const keywords = new Set();

    // Add section names
    keywords.add('experience');
    keywords.add('skills');
    keywords.add('education');
    keywords.add('summary');

    // Add from job titles and descriptions
    if (resume.experience) {
        resume.experience.forEach(exp => {
            if (exp.title) {
                exp.title.toLowerCase().split(/\s+/).forEach(word => {
                    if (word.length > 3) keywords.add(word);
                });
            }
            if (exp.description) {
                exp.description.toLowerCase().split(/\s+/).forEach(word => {
                    if (word.length > 4 && !['with', 'that', 'this', 'from'].includes(word)) {
                        keywords.add(word);
                    }
                });
            }
        });
    }

    // Add skills
    if (resume.skills) {
        resume.skills.forEach(skill => {
            if (typeof skill === 'string' && skill.length > 2) {
                keywords.add(skill.toLowerCase());
            }
        });
    }

    return Array.from(keywords).slice(0, 10); // Return top 10 keywords
};

// Export all helper functions for testing
export {
    calculateProgress,
    calculateATSScore,
    calculateWordCount,
    calculateReadabilityScore,
    generateStrengths,
    generateImprovements,
    generateSuggestions,
    extractKeywords
};