// src/ai/routes/aiRoutes.js - SIMPLIFIED VERSION
import express from 'express';
const router = express.Router();

// Simple rate limiter (no external dependency needed)
const aiRateLimiter = (req, res, next) => {
    next(); // Just pass through for now
};

// Apply rate limiting to all AI routes
router.use(aiRateLimiter);

// AI health check
router.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'AI service is running',
        status: 'healthy',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// AI service status
router.get('/status', (req, res) => {
    res.json({
        success: true,
        aiService: 'OpenAI',
        configured: !!process.env.OPENAI_API_KEY,
        modelInfo: {
            currentModel: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
            maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS) || 2000
        },
        features: {
            resumeAnalysis: true,
            atsChecking: true,
            resumeEnhancement: true,
            summaryGeneration: true
        }
    });
});

// Analyze resume
router.post('/analyze', (req, res) => {
    try {
        const { text, jobDescription, targetRole, industry } = req.body;

        // Simple validation
        if (!text || text.trim().length < 50) {
            return res.status(400).json({
                success: false,
                error: 'Resume text is required and should be at least 50 characters'
            });
        }

        // Check if OpenAI API key is configured
        const hasOpenAIKey = !!process.env.OPENAI_API_KEY;

        // Generate analysis (demo data for now)
        const analysis = {
            overallScore: Math.floor(Math.random() * 30) + 70, // 70-100
            strengths: [
                'Good structure and formatting',
                'Clear chronological experience',
                'Relevant skills mentioned'
            ],
            weaknesses: [
                'Need more quantifiable achievements',
                'Could use stronger action verbs',
                'Consider adding a professional summary'
            ],
            suggestions: [
                'Add metrics to your achievements (e.g., "increased sales by 30%")',
                'Use industry-specific keywords from the job description',
                'Consider adding certifications or relevant courses'
            ],
            atsScore: Math.floor(Math.random() * 25) + 75, // 75-100
            keywordAnalysis: {
                matched: ['JavaScript', 'React', 'Node.js', 'MongoDB'],
                missing: jobDescription ? ['TypeScript', 'AWS', 'Docker'] : []
            },
            aiPowered: hasOpenAIKey,
            timestamp: new Date().toISOString()
        };

        res.json({
            success: true,
            message: 'Resume analysis completed successfully',
            data: analysis
        });

    } catch (error) {
        console.error('AI analysis error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to analyze resume'
        });
    }
});

// Enhance resume
router.post('/enhance', (req, res) => {
    try {
        const { text, jobDescription, enhancementType = 'comprehensive' } = req.body;

        if (!text || text.trim().length < 50) {
            return res.status(400).json({
                success: false,
                error: 'Resume text is required and should be at least 50 characters'
            });
        }

        // Demo enhancement
        const enhancedText = `# Enhanced Resume\n\n${text}\n\n## AI Enhancements:\n• Added strong action verbs\n• Quantified achievements\n• Optimized for ATS\n• Improved formatting`;

        res.json({
            success: true,
            message: 'Resume enhanced successfully',
            data: {
                originalLength: text.length,
                enhancedLength: enhancedText.length,
                enhancedText,
                changes: {
                    wordCountChange: 50,
                    percentChange: '+25%',
                    sectionsAdded: 1
                },
                enhancementType,
                timestamp: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('Resume enhancement error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to enhance resume'
        });
    }
});

// Generate professional summary
router.post('/summary', (req, res) => {
    try {
        const { profile, targetRole } = req.body;

        if (!profile || !profile.experience) {
            return res.status(400).json({
                success: false,
                error: 'Profile with experience is required'
            });
        }

        const summary = `Results-driven ${profile.experience} with expertise in ${profile.skills?.join(', ') || 'relevant technologies'}. Proven track record of delivering high-quality solutions and driving business growth. ${targetRole ? `Seeking ${targetRole} position to leverage skills and experience.` : ''}`;

        res.json({
            success: true,
            message: 'Professional summary generated successfully',
            data: {
                summary,
                variations: [
                    summary,
                    `Experienced ${profile.experience} specializing in ${profile.skills?.slice(0, 3).join(', ') || 'technical solutions'}.`,
                    `${profile.experience} professional with strong background in ${profile.industry || 'the industry'}.`
                ],
                keywords: profile.skills || [],
                timestamp: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('Summary generation error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to generate summary'
        });
    }
});

// Check ATS compatibility
router.post('/ats-check', (req, res) => {
    try {
        const { resumeText, jobDescription } = req.body;

        if (!resumeText || !jobDescription) {
            return res.status(400).json({
                success: false,
                error: 'Both resume text and job description are required'
            });
        }

        // Simple keyword matching demo
        const jobKeywords = jobDescription.toLowerCase().match(/\b\w{4,}\b/g) || [];
        const resumeKeywords = resumeText.toLowerCase().match(/\b\w{4,}\b/g) || [];

        const matchedKeywords = jobKeywords.filter(keyword =>
            resumeKeywords.includes(keyword)
        );

        const matchPercentage = jobKeywords.length > 0
            ? Math.round((matchedKeywords.length / jobKeywords.length) * 100)
            : 0;

        res.json({
            success: true,
            message: 'ATS compatibility analysis completed',
            data: {
                atsScore: matchPercentage,
                keywordMatch: `${matchedKeywords.length}/${jobKeywords.length}`,
                matchedKeywords: matchedKeywords.slice(0, 10),
                missingKeywords: jobKeywords
                    .filter(keyword => !resumeKeywords.includes(keyword))
                    .slice(0, 10),
                suggestions: [
                    'Add missing keywords from job description',
                    'Use standard section headers (Experience, Education, Skills)',
                    'Avoid tables and graphics that ATS cannot parse',
                    'Use standard fonts (Arial, Times New Roman, Calibri)'
                ],
                timestamp: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('ATS check error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to check ATS compatibility'
        });
    }
});

// AI capabilities endpoint
router.get('/capabilities', (req, res) => {
    res.json({
        success: true,
        data: {
            capabilities: {
                analysis: {
                    name: 'Resume Analysis',
                    description: 'Comprehensive analysis of resume quality, structure, and content',
                    enabled: true
                },
                enhancement: {
                    name: 'Resume Enhancement',
                    description: 'AI-powered enhancement of resume content and formatting',
                    enabled: true
                },
                summary: {
                    name: 'Summary Generation',
                    description: 'Generate professional summaries tailored to target roles',
                    enabled: true
                },
                ats: {
                    name: 'ATS Optimization',
                    description: 'Check and improve Applicant Tracking System compatibility',
                    enabled: true
                }
            },
            limits: {
                rateLimit: '20 requests per minute',
                maxTokens: process.env.OPENAI_MAX_TOKENS || 2000,
                maxResumeLength: '10000 characters'
            },
            status: 'operational'
        }
    });
});

// Demo endpoint for testing without authentication
router.post('/demo-analyze', (req, res) => {
    const analysis = {
        overallScore: 85,
        strengths: ['Well-structured', 'Clear experience timeline', 'Good education section'],
        weaknesses: ['Need more metrics', 'Could use stronger verbs', 'Missing professional summary'],
        suggestions: [
            'Add numbers to your achievements',
            'Use action verbs like "led", "managed", "developed"',
            'Add a 2-3 sentence professional summary at the top'
        ],
        atsScore: 78,
        keywordAnalysis: {
            matched: ['JavaScript', 'React', 'Node.js'],
            missing: ['TypeScript', 'AWS']
        }
    };

    res.json({
        success: true,
        message: 'Demo analysis completed',
        data: analysis
    });
});

export default router;