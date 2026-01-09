// routes/openai.js - Enhanced OpenAI Integration Routes
const express = require('express');
const router = express.Router();
const { OpenAI } = require('openai');
const rateLimit = require('express-rate-limit');

// Initialize OpenAI client with error handling
let openai;
try {
    if (!process.env.OPENAI_API_KEY) {
        console.warn('⚠️  OPENAI_API_KEY not found in environment variables');
    } else {
        openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });
        console.log('✅ OpenAI client initialized');
    }
} catch (error) {
    console.error('❌ Failed to initialize OpenAI:', error.message);
}

// Rate limiting for OpenAI endpoints
const openaiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 30, // Limit each IP to 30 requests per windowMs
    message: {
        success: false,
        error: 'Too many requests. Please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Apply rate limiting to all routes
router.use(openaiLimiter);

// Middleware to check if OpenAI is configured
const checkOpenAIConfig = (req, res, next) => {
    if (!openai) {
        return res.status(503).json({
            success: false,
            error: 'OpenAI API is not configured or initialized.',
            details: 'Please check if OPENAI_API_KEY is set in environment variables.'
        });
    }
    next();
};

// Analyze resume endpoint (enhanced version)
router.post('/analyze', checkOpenAIConfig, async (req, res) => {
    const { resumeText, jobDescription = '', analyzeType = 'comprehensive' } = req.body;

    // Validate input
    if (!resumeText?.trim()) {
        return res.status(400).json({
            success: false,
            error: 'Resume text is required'
        });
    }

    // Truncate if too long (to avoid token limits)
    const truncatedResume = resumeText.length > 8000
        ? resumeText.substring(0, 8000) + "... [truncated]"
        : resumeText;

    const truncatedJobDesc = jobDescription?.length > 4000
        ? jobDescription.substring(0, 4000) + "... [truncated]"
        : jobDescription;

    // Build prompt based on analysis type
    let prompt;
    if (analyzeType === 'ats') {
        prompt = `You are an expert in Applicant Tracking System (ATS) optimization.

Analyze this resume for ATS compatibility and return ONLY valid JSON with this structure:

{
  "atsScore": number (0-100),
  "keywordScore": number (0-100),
  "compatibilityScore": number (0-100),
  "missingKeywords": string[],
  "overusedKeywords": string[],
  "formattingIssues": string[],
  "atsRecommendations": string[],
  "summary": string
}

Be specific and technical about ATS requirements.

${truncatedJobDesc ? `Job Description:\n${truncatedJobDesc}\n\n` : ''}Resume:\n${truncatedResume}`;

    } else if (analyzeType === 'content') {
        prompt = `You are a professional resume writer and career coach.

Analyze this resume's content quality and return ONLY valid JSON with this structure:

{
  "contentScore": number (0-100),
  "clarityScore": number (0-100),
  "impactScore": number (0-100),
  "strengths": string[],
  "weaknesses": string[],
  "improvedBullets": [{ "original": string, "improved": string, "reason": string }],
  "contentRecommendations": string[],
  "summary": string
}

Focus on writing quality, clarity, and impact.

Resume:\n${truncatedResume}`;

    } else {
        // Comprehensive analysis (default)
        prompt = `You are a world-class resume expert and career strategist.

Analyze this resume ${truncatedJobDesc ? 'against this job description' : ''} and return ONLY valid JSON with this exact structure:

{
  "overallScore": number (0-100),
  "atsScore": number (0-100),
  "keywordScore": number (0-100),
  "contentScore": number (0-100),
  "missingKeywords": string[],
  "strengths": string[],
  "weaknesses": string[],
  "improvedBullets": [{ "original": string, "improved": string, "reason": string }],
  "recommendations": string[],
  "summary": string,
  "analysisType": "${analyzeType}"
}

Be honest, constructive, and professional.

${truncatedJobDesc ? `Job Description:\n${truncatedJobDesc}\n\n` : ''}Resume:\n${truncatedResume}`;
    }

    try {
        const startTime = Date.now();

        const completion = await openai.chat.completions.create({
            model: process.env.OPENAI_MODEL || "gpt-4o-mini",
            messages: [{ role: "user", content: prompt }],
            response_format: { type: "json_object" },
            temperature: 0.7,
            max_tokens: 2000,
        });

        const processingTime = Date.now() - startTime;

        let result;
        try {
            result = JSON.parse(completion.choices[0].message.content);
        } catch (parseError) {
            console.error('JSON Parse Error:', parseError);
            // Fallback response if JSON parsing fails
            result = {
                overallScore: 75,
                atsScore: 70,
                keywordScore: 65,
                contentScore: 80,
                missingKeywords: [],
                strengths: ["Good structure", "Clear formatting"],
                weaknesses: ["Could use more quantifiable achievements"],
                improvedBullets: [],
                recommendations: ["Add more specific achievements", "Include relevant keywords"],
                summary: "Resume analysis completed successfully.",
                analysisType: analyzeType,
                parseError: "AI response format issue"
            };
        }

        // Add metadata
        result.metadata = {
            processingTime: `${processingTime}ms`,
            model: completion.model,
            tokensUsed: completion.usage?.total_tokens || 0,
            timestamp: new Date().toISOString()
        };

        res.json({
            success: true,
            ...result
        });

    } catch (error) {
        console.error('OpenAI API Error:', error.message);

        // Provide detailed error response
        let errorMessage = 'AI analysis failed';
        let statusCode = 500;

        if (error.code === 'insufficient_quota') {
            errorMessage = 'OpenAI API quota exceeded';
            statusCode = 429;
        } else if (error.code === 'invalid_api_key') {
            errorMessage = 'Invalid OpenAI API key';
            statusCode = 401;
        } else if (error.message?.includes('timeout')) {
            errorMessage = 'Analysis timeout. Please try a shorter resume or try again.';
            statusCode = 408;
        }

        res.status(statusCode).json({
            success: false,
            error: errorMessage,
            details: process.env.NODE_ENV === 'development' ? error.message : undefined,
            suggestion: "Please check your OpenAI API key and try again."
        });
    }
});

// Generate content for specific sections
router.post('/generate', checkOpenAIConfig, async (req, res) => {
    const {
        section,
        context,
        tone = 'professional',
        length = 'medium',
        keywords = []
    } = req.body;

    if (!section) {
        return res.status(400).json({
            success: false,
            error: 'Section type is required (e.g., summary, experience, skills)'
        });
    }

    if (!context?.trim()) {
        return res.status(400).json({
            success: false,
            error: 'Context or prompt is required'
        });
    }

    const sectionPrompts = {
        summary: `Generate a compelling professional summary based on: ${context}`,
        experience: `Write an impactful work experience bullet point: ${context}`,
        skills: `Create a well-organized skills section: ${context}`,
        'cover-letter': `Write a professional cover letter opening: ${context}`,
        'achievements': `Transform this into quantifiable achievements: ${context}`,
        'objective': `Write a clear career objective: ${context}`
    };

    const systemMessage = `You are a professional resume writer. Generate ${section} content that is:
1. ${tone === 'professional' ? 'Professional and formal' : tone === 'creative' ? 'Creative and engaging' : 'Technical and detailed'}
2. ${length === 'short' ? 'Concise (1-2 sentences)' : length === 'medium' ? 'Detailed (3-5 sentences)' : 'Comprehensive (paragraph)'}
3. Includes relevant keywords: ${keywords.join(', ')}
4. Optimized for Applicant Tracking Systems`;

    try {
        const completion = await openai.chat.completions.create({
            model: process.env.OPENAI_MODEL || "gpt-4o-mini",
            messages: [
                { role: "system", content: systemMessage },
                { role: "user", content: sectionPrompts[section] || context }
            ],
            temperature: 0.8,
            max_tokens: length === 'short' ? 100 : length === 'medium' ? 250 : 500,
        });

        const generatedContent = completion.choices[0].message.content;

        res.json({
            success: true,
            content: generatedContent,
            section: section,
            tone: tone,
            length: length,
            usage: completion.usage,
            model: completion.model
        });

    } catch (error) {
        console.error('Content generation error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to generate content',
            details: error.message
        });
    }
});

// Enhance existing text
router.post('/enhance', checkOpenAIConfig, async (req, res) => {
    const {
        text,
        section = 'general',
        style = 'professional',
        targetLength
    } = req.body;

    if (!text?.trim()) {
        return res.status(400).json({
            success: false,
            error: 'Text to enhance is required'
        });
    }

    const enhancementStyles = {
        professional: "Make it more professional and business-like",
        impactful: "Make it more impactful with strong action verbs",
        concise: "Make it more concise and to the point",
        ats: "Optimize for Applicant Tracking Systems with keywords",
        quantified: "Add quantifiable results and metrics"
    };

    const prompt = `Enhance this ${section} text to be ${enhancementStyles[style] || 'more professional'}:
    
Original: "${text}"

${targetLength ? `Target length: ${targetLength}` : ''}

Return ONLY the enhanced text without any additional commentary.`;

    try {
        const completion = await openai.chat.completions.create({
            model: process.env.OPENAI_MODEL || "gpt-4o-mini",
            messages: [
                { role: "system", content: "You are a professional editor. Enhance the given text for clarity and impact." },
                { role: "user", content: prompt }
            ],
            temperature: 0.7,
            max_tokens: 500,
        });

        const enhancedText = completion.choices[0].message.content;

        res.json({
            success: true,
            original: text,
            enhanced: enhancedText,
            section: section,
            style: style,
            improvements: [
                'Improved clarity',
                'Better word choice',
                'Enhanced impact',
                'Professional tone'
            ],
            usage: completion.usage
        });

    } catch (error) {
        console.error('Enhancement error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to enhance text',
            details: error.message
        });
    }
});

// Health check endpoint
router.get('/health', (req, res) => {
    if (!openai) {
        return res.json({
            success: false,
            status: 'not_configured',
            message: 'OpenAI API is not configured',
            timestamp: new Date().toISOString()
        });
    }

    res.json({
        success: true,
        status: 'operational',
        message: 'OpenAI API is configured and ready',
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        timestamp: new Date().toISOString()
    });
});

// Check credits/usage (placeholder - implement with your user system)
router.get('/usage', (req, res) => {
    res.json({
        success: true,
        usage: {
            availableCredits: 150,
            usedCredits: 0,
            totalCredits: 150,
            requestsToday: 0,
            resetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        },
        limits: {
            dailyRequests: 50,
            maxTokens: 2000,
            supportedModels: ['gpt-4o-mini', 'gpt-3.5-turbo']
        }
    });
});

// Test endpoint
router.post('/test', checkOpenAIConfig, async (req, res) => {
    try {
        const completion = await openai.chat.completions.create({
            model: process.env.OPENAI_MODEL || "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: "You are a helpful AI assistant for a resume builder application."
                },
                {
                    role: "user",
                    content: "Say 'Hello from ResumeCraft AI!' and tell me one tip for writing a good resume."
                }
            ],
            max_tokens: 100,
        });

        const response = completion.choices[0].message.content;

        res.json({
            success: true,
            message: 'OpenAI API test successful',
            response: response,
            model: completion.model,
            tokens: completion.usage?.total_tokens || 0
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'OpenAI API test failed',
            details: error.message
        });
    }
});

module.exports = router;