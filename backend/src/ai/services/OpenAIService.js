import OpenAI from 'openai';
import logger from '../../utils/logger.js';

/**
 * OpenAI Service for AI-powered resume analysis and enhancement
 */
class OpenAIService {
    constructor() {
        this.openai = null;
        this.isConfigured = false;
        this.initialize();
    }

    /**
     * Initialize OpenAI client
     */
    initialize() {
        try {
            const apiKey = process.env.OPENAI_API_KEY;

            if (!apiKey) {
                logger.warn('⚠️ OpenAI API key not configured. AI features will be disabled.');
                this.isConfigured = false;
                return;
            }

            this.openai = new OpenAI({
                apiKey: apiKey,
                timeout: 60000, // 60 seconds timeout
                maxRetries: 3,
            });

            this.isConfigured = true;
            logger.info('✅ OpenAI service initialized successfully');

        } catch (error) {
            logger.error('❌ Failed to initialize OpenAI:', error.message);
            this.isConfigured = false;
        }
    }

    /**
     * Check if OpenAI is configured
     */
    isAvailable() {
        return this.isConfigured && this.openai !== null;
    }

    /**
     * Generate completion using OpenAI
     * @param {string} prompt - The prompt to send
     * @param {Object} options - Additional options
     * @returns {Promise<Object>} - OpenAI response
     */
    async generateCompletion(prompt, options = {}) {
        if (!this.isAvailable()) {
            throw new Error('OpenAI service is not configured');
        }

        try {
            const defaultOptions = {
                model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
                max_tokens: parseInt(process.env.OPENAI_MAX_TOKENS) || 2000,
                temperature: 0.7,
                top_p: 1,
                frequency_penalty: 0,
                presence_penalty: 0,
                ...options
            };

            const startTime = Date.now();

            const response = await this.openai.chat.completions.create({
                model: defaultOptions.model,
                messages: [
                    {
                        role: 'system',
                        content: 'You are an expert resume analyzer and career coach with 10+ years of experience in HR and recruitment.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                max_tokens: defaultOptions.max_tokens,
                temperature: defaultOptions.temperature,
                top_p: defaultOptions.top_p,
                frequency_penalty: defaultOptions.frequency_penalty,
                presence_penalty: defaultOptions.presence_penalty
            });

            const endTime = Date.now();
            const duration = endTime - startTime;

            logger.info(`🤖 AI Request completed in ${duration}ms`, {
                model: defaultOptions.model,
                promptLength: prompt.length,
                responseLength: response.choices[0]?.message?.content?.length || 0,
                tokens: response.usage?.total_tokens || 0
            });

            return {
                success: true,
                content: response.choices[0]?.message?.content || '',
                usage: response.usage || {},
                model: response.model,
                duration: duration
            };

        } catch (error) {
            logger.error('❌ OpenAI API error:', {
                error: error.message,
                code: error.code,
                type: error.type
            });

            throw new Error(`AI service error: ${error.message}`);
        }
    }

    /**
     * Analyze resume text
     * @param {string} resumeText - Resume content
     * @param {Object} options - Analysis options
     */
    async analyzeResume(resumeText, options = {}) {
        const prompt = `Analyze this resume and provide detailed feedback:

RESUME:
${resumeText}

Please analyze:
1. Overall structure and formatting
2. Content quality and impact
3. Keyword optimization
4. ATS (Applicant Tracking System) compatibility
5. Areas for improvement
6. Suggested improvements

Format the response as JSON with these keys: overallScore, strengths, weaknesses, suggestions, atsCompatibility, keywordAnalysis`;

        const response = await this.generateCompletion(prompt, {
            temperature: 0.3,
            max_tokens: 3000
        });

        try {
            // Parse JSON from response
            const content = response.content;
            const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) ||
                content.match(/{[\s\S]*}/);

            if (jsonMatch) {
                const jsonStr = jsonMatch[0].replace(/```json\n|```/g, '').trim();
                return JSON.parse(jsonStr);
            } else {
                // Fallback: extract JSON-like structure
                return {
                    overallScore: 75,
                    strengths: ['Good structure', 'Clear experience'],
                    weaknesses: ['Need more metrics', 'Improve action verbs'],
                    suggestions: response.content.split('\n').filter(line => line.trim()),
                    atsCompatibility: 'Medium',
                    keywordAnalysis: {}
                };
            }
        } catch (parseError) {
            logger.warn('Failed to parse AI response as JSON, returning raw content');
            return {
                rawAnalysis: response.content,
                overallScore: 70
            };
        }
    }

    /**
     * Enhance resume bullet points
     * @param {Array} bulletPoints - Array of bullet points
     * @param {string} jobDescription - Target job description
     */
    async enhanceBulletPoints(bulletPoints, jobDescription = '') {
        const prompt = `Enhance these resume bullet points to be more impactful and achievement-oriented:

ORIGINAL BULLET POINTS:
${bulletPoints.map((bp, i) => `${i + 1}. ${bp}`).join('\n')}

${jobDescription ? `TARGET JOB DESCRIPTION:\n${jobDescription}\n\n` : ''}
Please provide:
1. Enhanced version of each bullet point using the STAR method (Situation, Task, Action, Result)
2. Add quantifiable metrics where possible
3. Use strong action verbs
4. Align with industry best practices

Format as JSON with keys: enhancedPoints, improvements, beforeAfterComparison`;

        const response = await this.generateCompletion(prompt, {
            temperature: 0.5,
            max_tokens: 2500
        });

        return this.parseJSONResponse(response.content);
    }

    /**
     * Generate professional summary
     * @param {Object} profile - User profile
     * @param {string} targetRole - Target job role
     */
    async generateSummary(profile, targetRole = '') {
        const prompt = `Generate a professional summary for a resume based on this profile:

PROFILE:
- Experience: ${profile.experience || 'Not specified'}
- Skills: ${profile.skills?.join(', ') || 'Not specified'}
- Industry: ${profile.industry || 'Not specified'}
- Achievements: ${profile.achievements || 'Not specified'}
${targetRole ? `- Target Role: ${targetRole}\n` : ''}

Please generate:
1. A compelling professional summary (2-3 sentences)
2. 3 variations with different tones (achievement-focused, skill-focused, hybrid)
3. Keywords to include for ATS optimization

Format as JSON with keys: summary, variations, keywords, tone`;

        const response = await this.generateCompletion(prompt, {
            temperature: 0.6,
            max_tokens: 1500
        });

        return this.parseJSONResponse(response.content);
    }

    /**
     * Check ATS (Applicant Tracking System) compatibility
     * @param {string} resumeText - Resume content
     * @param {string} jobDescription - Job description
     */
    async checkATSCompatibility(resumeText, jobDescription = '') {
        const prompt = `Analyze ATS (Applicant Tracking System) compatibility:

RESUME:
${resumeText}

${jobDescription ? `JOB DESCRIPTION:\n${jobDescription}\n\n` : ''}
Please analyze:
1. Keyword match score (percentage)
2. Missing keywords from job description
3. Formatting issues that might affect ATS parsing
4. Suggested improvements for better ATS compatibility
5. Overall ATS score (1-100)

Format as JSON with keys: atsScore, keywordMatch, missingKeywords, formattingIssues, suggestions`;

        const response = await this.generateCompletion(prompt, {
            temperature: 0.2,
            max_tokens: 2000
        });

        return this.parseJSONResponse(response.content);
    }

    /**
     * Parse JSON response from AI
     * @param {string} content - AI response content
     */
    parseJSONResponse(content) {
        try {
            // Try to extract JSON from markdown code blocks
            const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) ||
                content.match(/```\n([\s\S]*?)\n```/) ||
                content.match(/{[\s\S]*}/);

            if (jsonMatch) {
                let jsonStr = jsonMatch[0];
                // Remove code block markers
                jsonStr = jsonStr.replace(/```json\n|```\n|```/g, '').trim();
                return JSON.parse(jsonStr);
            }

            // If no JSON found, create structured response
            return {
                content: content,
                parsed: false,
                error: 'Could not parse JSON response'
            };

        } catch (error) {
            logger.warn('Failed to parse AI JSON response:', error.message);
            return {
                rawContent: content,
                parsed: false,
                error: error.message
            };
        }
    }

    /**
     * Get available models and pricing
     */
    async getModelInfo() {
        if (!this.isAvailable()) {
            return {
                available: false,
                models: [],
                message: 'OpenAI not configured'
            };
        }

        return {
            available: true,
            models: [
                { id: 'gpt-4-turbo-preview', name: 'GPT-4 Turbo', maxTokens: 128000 },
                { id: 'gpt-4', name: 'GPT-4', maxTokens: 8192 },
                { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', maxTokens: 4096 }
            ],
            currentModel: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
            maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS) || 2000
        };
    }

    /**
     * Health check for AI service
     */
    async healthCheck() {
        if (!this.isAvailable()) {
            return {
                status: 'disabled',
                message: 'OpenAI API key not configured'
            };
        }

        try {
            // Make a small test request
            const testResponse = await this.openai.chat.completions.create({
                model: 'gpt-3.5-turbo',
                messages: [{ role: 'user', content: 'Say "OK" if you are working.' }],
                max_tokens: 5
            });

            return {
                status: 'healthy',
                model: testResponse.model,
                responseTime: 'ok',
                message: 'AI service is operational'
            };
        } catch (error) {
            return {
                status: 'unhealthy',
                error: error.message,
                message: 'AI service is not responding'
            };
        }
    }
}

// Export singleton instance
const openAIService = new OpenAIService();
export default openAIService;