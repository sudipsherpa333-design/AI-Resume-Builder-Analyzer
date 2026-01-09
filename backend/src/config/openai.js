const { OpenAI } = require('openai');
const logger = require('../utils/logger');

class OpenAIClient {
    constructor() {
        this.client = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
            maxRetries: 3,
            timeout: 30000,
        });

        this.models = {
            ANALYSIS: process.env.OPENAI_ANALYSIS_MODEL || 'gpt-3.5-turbo',
            ENHANCEMENT: process.env.OPENAI_ENHANCEMENT_MODEL || 'gpt-4',
            SUMMARIZATION: process.env.OPENAI_SUMMARY_MODEL || 'gpt-3.5-turbo',
        };

        this.temperature = parseFloat(process.env.OPENAI_TEMPERATURE) || 0.7;
        this.maxTokens = parseInt(process.env.OPENAI_MAX_TOKENS) || 1000;
    }

    async analyzeResume(resumeData) {
        try {
            const prompt = this.createAnalysisPrompt(resumeData);

            const response = await this.client.chat.completions.create({
                model: this.models.ANALYSIS,
                messages: [
                    {
                        role: 'system',
                        content: 'You are a professional resume analyzer and career advisor. Provide constructive feedback and suggestions.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: this.temperature,
                max_tokens: this.maxTokens,
            });

            return {
                success: true,
                analysis: response.choices[0].message.content,
                usage: response.usage
            };
        } catch (error) {
            logger.error('OpenAI analysis error:', error);

            // Fallback to mock analysis if OpenAI fails
            if (process.env.NODE_ENV === 'development') {
                return {
                    success: false,
                    analysis: this.getMockAnalysis(),
                    error: error.message,
                    isMock: true
                };
            }

            throw new Error(`Resume analysis failed: ${error.message}`);
        }
    }

    async enhanceContent(content, context) {
        try {
            const prompt = `Enhance the following resume content for better impact:\n\n${content}\n\nContext: ${context}`;

            const response = await this.client.chat.completions.create({
                model: this.models.ENHANCEMENT,
                messages: [
                    {
                        role: 'system',
                        content: 'You are a professional resume writer. Enhance the content while maintaining original meaning.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.5,
                max_tokens: 500,
            });

            return response.choices[0].message.content;
        } catch (error) {
            logger.error('OpenAI enhancement error:', error);
            return content; // Return original content if enhancement fails
        }
    }

    createAnalysisPrompt(resumeData) {
        return `
    Analyze this resume and provide:
    1. Overall score (1-10)
    2. Strengths (bullet points)
    3. Weaknesses (bullet points)
    4. Key improvements needed (bullet points)
    5. ATS compatibility score (1-10)
    6. Industry-specific suggestions
    7. Keywords missing
    8. Formatting suggestions
    
    Resume Data:
    ${JSON.stringify(resumeData, null, 2)}
    
    Provide response in JSON format:
    {
      "score": number,
      "atsScore": number,
      "strengths": [string],
      "weaknesses": [string],
      "improvements": [string],
      "industrySuggestions": [string],
      "missingKeywords": [string],
      "formattingSuggestions": [string],
      "summary": string
    }
    `;
    }

    getMockAnalysis() {
        return JSON.stringify({
            score: 7,
            atsScore: 6,
            strengths: ["Good structure", "Relevant experience", "Clear contact information"],
            weaknesses: ["Lack of quantifiable achievements", "Too many buzzwords", "Weak summary"],
            improvements: ["Add metrics to achievements", "Use more action verbs", "Customize for target roles"],
            industrySuggestions: ["Highlight relevant technical skills", "Add certifications"],
            missingKeywords: ["project management", "agile", "data analysis"],
            formattingSuggestions: ["Use consistent bullet points", "Improve white space", "Better section ordering"],
            summary: "Good foundation, needs more specific achievements and customization."
        });
    }

    // Rate limiting helper
    static async withRateLimit(fn, userId) {
        // Implement rate limiting logic here
        // You can use Redis or in-memory store
        return fn();
    }
}

module.exports = new OpenAIClient();