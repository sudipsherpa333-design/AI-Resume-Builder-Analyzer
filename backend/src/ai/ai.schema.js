import OpenAI from 'openai';
import logger from '../../utils/logger.js';

class AIClient {
    constructor() {
        this.openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
            timeout: 30000,
            maxRetries: 3
        });
        this.model = process.env.AI_MODEL || 'gpt-3.5-turbo';
        this.cache = new Map();
    }

    async call(prompt, options = {}) {
        const cacheKey = `${this.model}:${Buffer.from(prompt).toString('base64').substring(0, 50)}`;

        // Check cache
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        try {
            const completion = await this.openai.chat.completions.create({
                model: this.model,
                messages: [
                    {
                        role: "system",
                        content: "You are an expert resume consultant and ATS (Applicant Tracking System) specialist. Provide accurate, actionable advice for resume optimization."
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                temperature: options.temperature || 0.3,
                max_tokens: options.maxTokens || 1500,
                ...options
            });

            const response = completion.choices[0].message.content;

            // Cache successful response
            this.cache.set(cacheKey, response);
            setTimeout(() => this.cache.delete(cacheKey), 5 * 60 * 1000); // 5 minute cache

            return response;
        } catch (error) {
            logger.error('AI API Error:', error);

            // Return fallback response for common cases
            if (error.code === 'rate_limit_exceeded') {
                throw new Error('AI service rate limit exceeded. Please try again in a moment.');
            }

            if (error.code === 'insufficient_quota') {
                throw new Error('AI service quota exceeded. Please check your API key.');
            }

            throw new Error(`AI service error: ${error.message}`);
        }
    }

    async healthCheck() {
        try {
            await this.openai.models.list();
            return {
                status: 'healthy',
                model: this.model,
                cacheSize: this.cache.size
            };
        } catch (error) {
            return {
                status: 'unhealthy',
                error: error.message
            };
        }
    }

    // Helper methods for specific operations
    async analyzeWithTemplate(promptTemplate, data, options = {}) {
        const prompt = this.formatPrompt(promptTemplate, data);
        return this.call(prompt, options);
    }

    formatPrompt(template, data) {
        return Object.keys(data).reduce((str, key) => {
            return str.replace(new RegExp(`{${key}}`, 'g'), data[key]);
        }, template);
    }
}

// Export singleton instance
export const aiClient = new AIClient();
export default aiClient;