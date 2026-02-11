// backend/src/controllers/resumeAnalyzer.controller.js
import Resume from '../models/Resume.js';
import { authenticate } from '../middleware/auth.js';

// Helper: Extract meaningful keywords (better than simple regex)
function extractKeywords(text) {
    if (!text) return [];

    const words = text.toLowerCase()
        .replace(/[^\w\s]/g, ' ')           // remove punctuation
        .split(/\s+/)
        .filter(w => w.length > 3)
        .filter(w => !['this', 'that', 'with', 'from', 'your', 'will', 'have', 'they', 'what', 'when', 'and', 'the', 'for'].includes(w));

    return [...new Set(words)];
}

// Basic internal resume quality analysis (when no job description)
function generateBasicAnalysis(resume) {
    const completeness = calculateResumeProgress(resume);

    let score = 45; // base
    if (resume.summary?.length > 120) score += 18;
    if (resume.experience?.length >= 2) score += 22;
    if (resume.skills?.length >= 6) score += 15;
    if (resume.education?.length >= 1) score += 10;

    // Bonus for quantifiable achievements
    let quantifiable = 0;
    if (resume.experience) {
        resume.experience.forEach(exp => {
            if (exp.description?.match(/\d+%|\d+[\s-](percent|times|million|billion)/i)) quantifiable++;
            if (exp.achievements?.some(a => a.match(/\d+/))) quantifiable++;
        });
    }
    score += Math.min(quantifiable * 3, 15);

    return {
        score: Math.min(100, Math.max(0, score)),
        atsScore: Math.min(95, score - 5), // ATS usually stricter
        completeness,
        strengths: getStrengths(resume),
        improvements: getImprovements(resume),
        suggestions: getGeneralSuggestions(),
        keywords: [],
        matchedKeywords: [],
        missingKeywords: [],
        readabilityScore: estimateReadability(resume),
        wordCount: calculateWordCount(resume),
        sectionCompleteness: getSectionCompleteness(resume),
        lastAnalyzed: new Date().toISOString()
    };
}

// Full analysis with job description
function generateJobMatchAnalysis(resume, jobDescription) {
    const basic = generateBasicAnalysis(resume);

    const jobText = jobDescription.toLowerCase();
    const resumeText = JSON.stringify(resume).toLowerCase();

    const jobKeywords = extractKeywords(jobText);
    const resumeKeywords = extractKeywords(resumeText);

    const matched = jobKeywords.filter(kw => resumeKeywords.includes(kw));
    const missing = jobKeywords.filter(kw => !resumeKeywords.includes(kw));

    const keywordMatchRate = jobKeywords.length > 0
        ? (matched.length / jobKeywords.length)
        : 0;

    let atsScore = basic.atsScore;
    atsScore += Math.round(keywordMatchRate * 40); // up to +40 from keywords
    if (resume.skills?.length >= 8) atsScore += 10;
    atsScore = Math.min(100, Math.max(0, atsScore));

    const overallScore = Math.round((atsScore * 0.65) + (basic.score * 0.35));

    const suggestions = [
        ...basic.suggestions,
        ...(missing.length > 0 ? [`Missing key terms from job: ${missing.slice(0, 6).join(', ')}${missing.length > 6 ? '...' : ''}`] : []),
        ...(matched.length < 8 ? ['Add more job-specific keywords in experience & skills'] : [])
    ];

    return {
        score: overallScore,
        atsScore,
        matchPercentage: Math.round(keywordMatchRate * 100),
        matchedKeywords: matched.slice(0, 12),
        missingKeywords: missing.slice(0, 12),
        completeness: basic.completeness,
        strengths: basic.strengths,
        improvements: basic.improvements,
        suggestions: [...new Set(suggestions)], // dedupe
        readabilityScore: basic.readabilityScore,
        wordCount: basic.wordCount,
        sectionCompleteness: basic.sectionCompleteness,
        lastAnalyzed: new Date().toISOString()
    };
}

// Controller action
export const analyzeResume = async (req, res) => {
    try {
        const { id } = req.params;
        const { jobDescription } = req.body;

        ServerLogger.ai(`Analyzing resume ${id} for user ${req.user.id}`, {
            hasJobDescription: !!jobDescription?.trim()
        });

        const resume = await Resume.findOne({
            _id: id,
            user: req.user.id
        });

        if (!resume) {
            return res.status(404).json({
                success: false,
                message: 'Resume not found or access denied'
            });
        }

        let analysis;

        if (!jobDescription || jobDescription.trim().length < 30) {
            ServerLogger.ai('Running basic internal analysis (no job description)');
            analysis = generateBasicAnalysis(resume);
        } else {
            ServerLogger.ai('Running full job-match analysis');
            analysis = generateJobMatchAnalysis(resume, jobDescription);
        }

        // Save to document
        resume.analysis = analysis;
        resume.updatedAt = new Date();
        await resume.save();

        ServerLogger.success(`Resume ${id} analyzed`, {
            atsScore: analysis.atsScore,
            overallScore: analysis.score,
            matchPercentage: analysis.matchPercentage || 0
        });

        res.json({
            success: true,
            message: 'Resume analyzed successfully',
            data: {
                resume,
                analysis
            }
        });

    } catch (error) {
        ServerLogger.error('Resume analysis failed', {
            error: error.message,
            resumeId: req.params?.id,
            userId: req.user?.id
        });

        res.status(500).json({
            success: false,
            message: 'Failed to analyze resume',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// Reuse your existing helpers (copy-pasted for completeness)
function calculateResumeProgress(resume) {
    let progress = 0;
    const weights = { personalInfo: 20, summary: 15, experience: 25, education: 15, skills: 15, additional: 10 };

    if (resume.personalInfo?.firstName && resume.personalInfo?.lastName && resume.personalInfo?.email) {
        progress += weights.personalInfo;
    }
    if (resume.summary?.trim().length >= 50) progress += weights.summary;
    if (resume.experience?.length > 0) progress += weights.experience;
    if (resume.education?.length > 0) progress += weights.education;
    if (resume.skills?.length >= 3) progress += weights.skills;

    const additional = ['projects', 'certifications', 'languages', 'awards', 'publications'];
    if (additional.some(s => resume[s]?.length > 0)) progress += weights.additional;

    return Math.min(100, Math.max(0, progress));
}

function calculateWordCount(resume) {
    let count = 0;
    if (resume.summary) count += resume.summary.split(/\s+/).length;
    if (resume.experience) {
        resume.experience.forEach(exp => {
            if (exp.description) count += exp.description.split(/\s+/).length;
            if (exp.bulletPoints) count += exp.bulletPoints.join(' ').split(/\s+/).length;
        });
    }
    return count;
}

function getSectionCompleteness(resume) {
    return {
        personalInfo: resume.personalInfo ? 80 : 0,
        summary: resume.summary?.length > 50 ? 100 : 0,
        experience: resume.experience?.length > 0 ? 100 : 0,
        education: resume.education?.length > 0 ? 100 : 0,
        skills: resume.skills?.length >= 3 ? 100 : 0
    };
}

function getStrengths(resume) {
    const strengths = [];
    if (resume.summary?.length > 150) strengths.push('Strong professional summary');
    if (resume.experience?.length >= 3) strengths.push('Solid work experience section');
    if (resume.skills?.length >= 8) strengths.push('Broad and deep skill set');
    if (resume.education?.length >= 1) strengths.push('Formal education included');
    return strengths;
}

function getImprovements(resume) {
    const improvements = [];
    if (!resume.summary || resume.summary.length < 80) improvements.push('Add or expand professional summary');
    if (!resume.experience?.length) improvements.push('Add work experience entries');
    if (resume.skills?.length < 5) improvements.push('Add more relevant skills');
    return improvements;
}

function getGeneralSuggestions() {
    return [
        'Use strong action verbs (Led, Developed, Increased...)',
        'Quantify achievements (e.g., "Increased sales by 40%")',
        'Tailor resume to each job description',
        'Keep formatting clean and ATS-friendly (no tables/images in core sections)',
        'Proofread for typos and consistency'
    ];
}

function estimateReadability(resume) {
    const text = (resume.summary || '') + ' ' + (resume.experience?.map(e => e.description || '').join(' ') || '');
    const words = text.split(/\s+/).length;
    const sentences = text.split(/[.!?]+/).length || 1;
    return Math.round(100 - (words / sentences) * 5); // rough estimate
}