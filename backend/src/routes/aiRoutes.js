// backend/src/routes/aiRoutes.js - ULTIMATE 2026 RESUME AI ROUTES
import express from 'express';

// First check what folder structure exists
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let AIService;

try {
    // Try to import from services folder
    AIService = (await import('../services/aiService.js')).default;
    console.log('✅ Loaded AI service from services/aiService.js');
} catch (error) {
    console.error('❌ Could not load AI service:', error.message);

    // Create a mock service for development
    AIService = {
        aiEnhance: async (resumeData, specificSection = null, jobDescription = '') => {
            console.log('Mock AI service: aiEnhance called');
            const enhanced = JSON.parse(JSON.stringify(resumeData));
            enhanced.aiEnhancements = {
                applied: true,
                lastEnhanced: new Date().toISOString(),
                suggestions: ['Configure OpenAI API key for real AI enhancements'],
                keywords: [],
                atsScore: 75,
                version: 'mock'
            };
            return enhanced;
        },

        generateSummary: async (experience = [], targetRole = '', skills = [], jdKeywords = []) => {
            console.log('Mock AI service: generateSummary called');
            return `Results-driven ${targetRole || 'professional'} with extensive experience in relevant technologies. Skilled in ${skills.slice(0, 3).join(', ') || 'multiple domains'}. Proven ability to deliver results and drive innovation.`;
        },

        generateBulletPoints: async (experienceItem, targetRole = '', jdKeywords = []) => {
            console.log('Mock AI service: generateBulletPoints called');
            return [
                `Achieved significant improvements in key performance metrics`,
                `Managed cross-functional teams to deliver project objectives`,
                `Implemented processes resulting in measurable efficiency gains`
            ];
        },

        extractKeywordsFromJD: async (jobDescription) => {
            console.log('Mock AI service: extractKeywordsFromJD called');
            return jobDescription ? ['JavaScript', 'React', 'Node.js', 'AWS', 'Communication', 'Teamwork'] : [];
        },

        suggestKeywords: async (targetRole = '', jobDescription = '') => {
            console.log('Mock AI service: suggestKeywords called');
            const keywords = ['JavaScript', 'React', 'Node.js', 'Python', 'AWS'];
            if (targetRole.toLowerCase().includes('data')) {
                keywords.push('Data Analysis', 'Machine Learning', 'SQL');
            }
            return keywords;
        },

        analyzeATS: async (resumeData, jobDescription = '') => {
            console.log('Mock AI service: analyzeATS called');
            return {
                score: 75,
                suggestions: [
                    'Add quantifiable metrics to bullet points',
                    'Use stronger action verbs',
                    'Incorporate more industry keywords'
                ],
                keywords: [],
                strengths: ['Clear structure', 'Good formatting'],
                weaknesses: ['Needs more metrics', 'Could use more keywords']
            };
        },

        healthCheck: async () => {
            return {
                status: 'mock',
                message: 'Using mock AI service - configure OpenAI API key',
                timestamp: new Date().toISOString()
            };
        }
    };
}

const router = express.Router();

// POST /api/ai/enhance
router.post('/enhance', async (req, res) => {
    try {
        const { resumeData, jobDescription, specificSection } = req.body;

        if (!resumeData) {
            return res.status(400).json({
                success: false,
                error: 'resumeData is required'
            });
        }

        console.log('🤖 AI enhancement request received', {
            hasJD: !!jobDescription,
            section: specificSection || 'full resume'
        });

        const enhancedResume = await AIService.aiEnhance(resumeData, specificSection, jobDescription);

        res.json({
            success: true,
            message: 'Resume enhanced successfully',
            data: enhancedResume,
            timestamp: new Date().toISOString()
        });
    } catch (err) {
        console.error('❌ AI enhancement endpoint error:', err);
        res.status(500).json({
            success: false,
            error: 'AI enhancement failed',
            message: err.message,
            timestamp: new Date().toISOString()
        });
    }
});

// POST /api/ai/generate-summary
router.post('/generate-summary', async (req, res) => {
    try {
        const { personalInfo, experience, targetRole, skills } = req.body;

        if (!experience) {
            return res.status(400).json({
                success: false,
                error: 'experience is required'
            });
        }

        console.log('📝 Summary generation request received');

        const summary = await AIService.generateSummary(personalInfo, experience, targetRole, skills);

        res.json({
            success: true,
            message: 'Summary generated successfully',
            data: { summary },
            timestamp: new Date().toISOString()
        });
    } catch (err) {
        console.error('❌ Summary generation error:', err);
        res.status(500).json({
            success: false,
            error: 'Summary generation failed',
            message: err.message,
            timestamp: new Date().toISOString()
        });
    }
});

// POST /api/ai/generate-bullets
router.post('/generate-bullets', async (req, res) => {
    try {
        const { experienceItem, targetRole, jdKeywords } = req.body;

        if (!experienceItem) {
            return res.status(400).json({
                success: false,
                error: 'experienceItem is required'
            });
        }

        console.log('📋 Bullet points generation request received');

        const bulletPoints = await AIService.generateBulletPoints(experienceItem, targetRole, jdKeywords);

        res.json({
            success: true,
            message: 'Bullet points generated successfully',
            data: bulletPoints,
            timestamp: new Date().toISOString()
        });
    } catch (err) {
        console.error('❌ Bullet points generation error:', err);
        res.status(500).json({
            success: false,
            error: 'Bullet points generation failed',
            message: err.message,
            timestamp: new Date().toISOString()
        });
    }
});

// POST /api/ai/extract-keywords
router.post('/extract-keywords', async (req, res) => {
    try {
        const { jobDescription } = req.body;

        if (!jobDescription || jobDescription.trim().length < 50) {
            return res.status(400).json({
                success: false,
                error: 'Valid job description is required (min 50 characters)'
            });
        }

        console.log('🔑 Keywords extraction request received');

        const keywords = await AIService.extractKeywordsFromJD(jobDescription);

        res.json({
            success: true,
            message: 'Keywords extracted successfully',
            data: keywords,
            timestamp: new Date().toISOString()
        });
    } catch (err) {
        console.error('❌ Keywords extraction error:', err);
        res.status(500).json({
            success: false,
            error: 'Keywords extraction failed',
            message: err.message,
            timestamp: new Date().toISOString()
        });
    }
});

// POST /api/ai/suggest-keywords
router.post('/suggest-keywords', async (req, res) => {
    try {
        const { targetRole, jobDescription } = req.body;

        console.log('🔑 Keywords suggestion request received');

        const keywords = await AIService.suggestKeywords(targetRole, jobDescription);

        res.json({
            success: true,
            message: 'Keywords suggested successfully',
            data: keywords,
            timestamp: new Date().toISOString()
        });
    } catch (err) {
        console.error('❌ Keywords suggestion error:', err);
        res.status(500).json({
            success: false,
            error: 'Keywords suggestion failed',
            message: err.message,
            timestamp: new Date().toISOString()
        });
    }
});

// POST /api/ai/analyze-ats
router.post('/analyze-ats', async (req, res) => {
    try {
        const { resumeData, jobDescription } = req.body;

        if (!resumeData) {
            return res.status(400).json({
                success: false,
                error: 'resumeData is required'
            });
        }

        console.log('🔍 ATS analysis request received');

        const analysis = await AIService.analyzeATS(resumeData, jobDescription);

        res.json({
            success: true,
            message: 'ATS analysis completed',
            data: analysis,
            timestamp: new Date().toISOString()
        });
    } catch (err) {
        console.error('❌ ATS analysis error:', err);
        res.status(500).json({
            success: false,
            error: 'ATS analysis failed',
            message: err.message,
            timestamp: new Date().toISOString()
        });
    }
});

// POST /api/ai/extract-pdf
router.post('/extract-pdf', async (req, res) => {
    try {
        const { pdfBuffer } = req.body;

        if (!pdfBuffer) {
            return res.status(400).json({
                success: false,
                error: 'pdfBuffer is required'
            });
        }

        console.log('📄 PDF extraction request received');

        // Convert base64 to buffer if needed
        let buffer;
        if (typeof pdfBuffer === 'string' && pdfBuffer.startsWith('data:')) {
            buffer = Buffer.from(pdfBuffer.split(',')[1], 'base64');
        } else {
            buffer = Buffer.from(pdfBuffer);
        }

        const extractedText = await AIService.extractTextFromPDF(buffer);

        res.json({
            success: true,
            message: 'PDF extracted successfully',
            data: { extractedText },
            timestamp: new Date().toISOString()
        });
    } catch (err) {
        console.error('❌ PDF extraction error:', err);
        res.status(500).json({
            success: false,
            error: 'PDF extraction failed',
            message: err.message,
            timestamp: new Date().toISOString()
        });
    }
});

// GET /api/ai/health
router.get('/health', async (req, res) => {
    try {
        const health = await AIService.healthCheck();

        res.json({
            success: true,
            message: 'AI service health check',
            data: health,
            timestamp: new Date().toISOString()
        });
    } catch (err) {
        console.error('❌ Health check error:', err);
        res.status(500).json({
            success: false,
            error: 'Health check failed',
            message: err.message,
            timestamp: new Date().toISOString()
        });
    }
});

// GET /api/ai/test
router.get('/test', async (req, res) => {
    try {
        const testResume = {
            summary: "Software engineer with experience in web development.",
            experience: [{
                company: "Tech Corp",
                position: "Software Engineer",
                duration: "2020-2023",
                description: "Worked on web applications using React and Node.js"
            }],
            skills: ["JavaScript", "React", "Node.js"],
            targetRole: "Senior Software Engineer"
        };

        const enhanced = await AIService.aiEnhance(testResume);
        const summary = await AIService.generateSummary([], "Software Engineer", []);
        const analysis = await AIService.analyzeATS(testResume);

        res.json({
            success: true,
            message: 'AI service test completed',
            data: {
                aiService: AIService.constructor.name === 'AIService' ? 'Real' : 'Mock',
                enhancement: !!enhanced.aiEnhancements,
                summaryGenerated: !!summary,
                analysis: analysis.score,
                timestamp: new Date().toISOString()
            }
        });
    } catch (err) {
        console.error('❌ Test error:', err);
        res.status(500).json({
            success: false,
            error: 'Test failed',
            message: err.message,
            timestamp: new Date().toISOString()
        });
    }
});

export default router;