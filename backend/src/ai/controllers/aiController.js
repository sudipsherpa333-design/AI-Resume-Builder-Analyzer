import aiAnalysisService from '../services/AIAnalysisService.js';
import aiEnhanceService from '../services/AIEnhanceService.js';
import openAIService from '../services/OpenAIService.js';
import logger from '../../utils/logger.js';

/**
 * AI Controller for handling AI-related requests
 */
class AIController {
    /**
     * Analyze resume endpoint
     */
    async analyzeResume(req, res, next) {
        try {
            const { text, jobDescription, targetRole, industry } = req.body;
            const userId = req.user?.id || 'anonymous';

            // Validate input
            if (!text || text.trim().length < 50) {
                return res.status(400).json({
                    success: false,
                    error: 'Resume text is required and should be at least 50 characters'
                });
            }

            logger.info('📊 Starting AI analysis request', { userId });

            // Check if AI is available
            if (!openAIService.isAvailable()) {
                return res.status(503).json({
                    success: false,
                    error: 'AI service is currently unavailable',
                    code: 'AI_SERVICE_UNAVAILABLE'
                });
            }

            // Perform analysis
            const analysisResult = await aiAnalysisService.analyzeResume({
                text,
                jobDescription,
                targetRole,
                industry
            });

            // Log the analysis
            logger.info('✅ AI analysis completed', {
                userId,
                score: analysisResult.overallScore,
                recommendations: analysisResult.recommendations?.length || 0
            });

            res.status(200).json({
                success: true,
                message: 'Resume analysis completed successfully',
                ...analysisResult,
                userId,
                aiService: 'OpenAI',
                model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview'
            });

        } catch (error) {
            logger.error('❌ AI analysis controller error:', error);
            next(error);
        }
    }

    /**
     * Enhance resume endpoint
     */
    async enhanceResume(req, res, next) {
        try {
            const { text, jobDescription, enhancementType = 'comprehensive' } = req.body;
            const userId = req.user?.id || 'anonymous';

            // Validate input
            if (!text || text.trim().length < 50) {
                return res.status(400).json({
                    success: false,
                    error: 'Resume text is required and should be at least 50 characters'
                });
            }

            logger.info('✨ Starting resume enhancement request', { userId, enhancementType });

            // Check if AI is available
            if (!openAIService.isAvailable()) {
                return res.status(503).json({
                    success: false,
                    error: 'AI service is currently unavailable',
                    code: 'AI_SERVICE_UNAVAILABLE'
                });
            }

            // Perform enhancement
            const enhancementResult = await aiEnhanceService.enhanceResume({
                text,
                jobDescription,
                enhancementType
            });

            logger.info('✅ Resume enhancement completed', {
                userId,
                originalLength: enhancementResult.originalLength,
                enhancedLength: enhancementResult.enhancedLength
            });

            res.status(200).json({
                success: true,
                message: 'Resume enhanced successfully',
                ...enhancementResult,
                userId,
                enhancementType,
                aiService: 'OpenAI',
                model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview'
            });

        } catch (error) {
            logger.error('❌ Resume enhancement controller error:', error);
            next(error);
        }
    }

    /**
     * Generate summary endpoint
     */
    async generateSummary(req, res, next) {
        try {
            const { profile, targetRole } = req.body;
            const userId = req.user?.id || 'anonymous';

            // Validate input
            if (!profile || !profile.experience) {
                return res.status(400).json({
                    success: false,
                    error: 'Profile with experience is required'
                });
            }

            logger.info('📝 Starting summary generation request', { userId });

            // Check if AI is available
            if (!openAIService.isAvailable()) {
                return res.status(503).json({
                    success: false,
                    error: 'AI service is currently unavailable',
                    code: 'AI_SERVICE_UNAVAILABLE'
                });
            }

            // Generate summary
            const summaryResult = await openAIService.generateSummary(profile, targetRole);

            logger.info('✅ Summary generation completed', { userId });

            res.status(200).json({
                success: true,
                message: 'Professional summary generated successfully',
                summary: summaryResult,
                userId,
                aiService: 'OpenAI',
                model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview'
            });

        } catch (error) {
            logger.error('❌ Summary generation controller error:', error);
            next(error);
        }
    }

    /**
     * Check ATS compatibility endpoint
     */
    async checkATSCompatibility(req, res, next) {
        try {
            const { resumeText, jobDescription } = req.body;
            const userId = req.user?.id || 'anonymous';

            // Validate input
            if (!resumeText || !jobDescription) {
                return res.status(400).json({
                    success: false,
                    error: 'Both resume text and job description are required'
                });
            }

            logger.info('🎯 Starting ATS compatibility check', { userId });

            // Check if AI is available
            if (!openAIService.isAvailable()) {
                return res.status(503).json({
                    success: false,
                    error: 'AI service is currently unavailable',
                    code: 'AI_SERVICE_UNAVAILABLE'
                });
            }

            // Perform ATS analysis
            const atsResult = await openAIService.checkATSCompatibility(resumeText, jobDescription);

            logger.info('✅ ATS compatibility check completed', {
                userId,
                score: atsResult.atsScore || 0
            });

            res.status(200).json({
                success: true,
                message: 'ATS compatibility analysis completed',
                ...atsResult,
                userId,
                aiService: 'OpenAI',
                model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview'
            });

        } catch (error) {
            logger.error('❌ ATS compatibility controller error:', error);
            next(error);
        }
    }

    /**
     * AI service health check endpoint
     */
    async healthCheck(req, res, next) {
        try {
            const healthStatus = await openAIService.healthCheck();

            res.status(200).json({
                success: true,
                message: 'AI service health check completed',
                ...healthStatus,
                timestamp: new Date().toISOString(),
                environment: process.env.NODE_ENV,
                modelInfo: await openAIService.getModelInfo()
            });

        } catch (error) {
            logger.error('❌ AI health check error:', error);
            res.status(503).json({
                success: false,
                error: 'AI service is not healthy',
                message: error.message
            });
        }
    }

    /**
     * Get AI service status endpoint
     */
    async getStatus(req, res, next) {
        try {
            const modelInfo = await openAIService.getModelInfo();

            res.status(200).json({
                success: true,
                aiService: 'OpenAI',
                configured: openAIService.isAvailable(),
                modelInfo,
                limits: {
                    maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS) || 2000,
                    maxRequestsPerMinute: parseInt(process.env.AI_RATE_LIMIT) || 20,
                    supportedFeatures: [
                        'resume_analysis',
                        'resume_enhancement',
                        'summary_generation',
                        'ats_analysis',
                        'bullet_point_enhancement'
                    ]
                },
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            logger.error('❌ AI status check error:', error);
            next(error);
        }
    }

    /**
     * Process batch of resumes
     */
    async batchProcess(req, res, next) {
        try {
            const { resumes, operation = 'analyze' } = req.body;
            const userId = req.user?.id || 'anonymous';

            if (!Array.isArray(resumes) || resumes.length === 0) {
                return res.status(400).json({
                    success: false,
                    error: 'Resumes array is required and should not be empty'
                });
            }

            if (resumes.length > 10) {
                return res.status(400).json({
                    success: false,
                    error: 'Maximum 10 resumes allowed in batch processing'
                });
            }

            logger.info('🔄 Starting batch processing', {
                userId,
                count: resumes.length,
                operation
            });

            // Check if AI is available
            if (!openAIService.isAvailable()) {
                return res.status(503).json({
                    success: false,
                    error: 'AI service is currently unavailable'
                });
            }

            // Process each resume
            const results = [];
            for (const [index, resume] of resumes.entries()) {
                try {
                    let result;
                    if (operation === 'analyze') {
                        result = await aiAnalysisService.analyzeResume(resume);
                    } else if (operation === 'enhance') {
                        result = await aiEnhanceService.enhanceResume(resume);
                    } else {
                        throw new Error(`Unsupported operation: ${operation}`);
                    }

                    results.push({
                        index,
                        success: true,
                        ...result
                    });
                } catch (error) {
                    results.push({
                        index,
                        success: false,
                        error: error.message
                    });
                }
            }

            const successCount = results.filter(r => r.success).length;

            logger.info('✅ Batch processing completed', {
                userId,
                total: resumes.length,
                success: successCount,
                failed: resumes.length - successCount
            });

            res.status(200).json({
                success: true,
                message: `Batch processing completed. ${successCount}/${resumes.length} successful`,
                operation,
                total: resumes.length,
                successful: successCount,
                failed: resumes.length - successCount,
                results,
                userId,
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            logger.error('❌ Batch processing controller error:', error);
            next(error);
        }
    }
}

export default new AIController();