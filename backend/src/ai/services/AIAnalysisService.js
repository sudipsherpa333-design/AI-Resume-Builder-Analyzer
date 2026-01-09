import openAIService from './OpenAIService.js';
import logger from '../../utils/logger.js';

/**
 * AI Analysis Service for resume analysis
 */
class AIAnalysisService {
    /**
     * Perform comprehensive resume analysis
     * @param {Object} resumeData - Resume data
     * @param {Object} options - Analysis options
     */
    async analyzeResume(resumeData, options = {}) {
        try {
            const {
                text,
                jobDescription,
                targetRole,
                industry
            } = resumeData;

            if (!text || text.trim().length < 50) {
                throw new Error('Resume text is too short or empty');
            }

            logger.info('🔍 Starting AI resume analysis', {
                textLength: text.length,
                hasJobDescription: !!jobDescription,
                targetRole,
                industry
            });

            // Perform multiple analyses in parallel
            const [basicAnalysis, atsAnalysis, enhancementSuggestions] = await Promise.all([
                this.performBasicAnalysis(text),
                jobDescription ? this.performATSAnalysis(text, jobDescription) : Promise.resolve(null),
                this.generateEnhancementSuggestions(text, jobDescription)
            ]);

            // Calculate overall score
            const overallScore = this.calculateOverallScore(basicAnalysis, atsAnalysis);

            return {
                success: true,
                overallScore,
                basicAnalysis,
                atsAnalysis,
                enhancementSuggestions,
                recommendations: this.generateRecommendations(basicAnalysis, atsAnalysis, enhancementSuggestions),
                timestamp: new Date().toISOString()
            };

        } catch (error) {
            logger.error('❌ Resume analysis failed:', error);
            throw error;
        }
    }

    /**
     * Perform basic resume analysis
     */
    async performBasicAnalysis(resumeText) {
        const prompt = `Analyze this resume for basic quality metrics:

RESUME:
${resumeText}

Provide analysis on:
1. Readability and clarity (score 1-10)
2. Structure and organization (score 1-10)
3. Content completeness (score 1-10)
4. Grammar and spelling issues
5. Formatting issues
6. Overall impression

Format as JSON with: readabilityScore, structureScore, contentScore, grammarIssues, formattingIssues, overallImpression`;

        const response = await openAIService.generateCompletion(prompt, {
            temperature: 0.3,
            max_tokens: 1500
        });

        const analysis = openAIService.parseJSONResponse(response.content);

        return {
            ...analysis,
            rawMetrics: {
                wordCount: this.countWords(resumeText),
                sectionCount: this.countSections(resumeText),
                bulletPointCount: this.countBulletPoints(resumeText)
            }
        };
    }

    /**
     * Perform ATS analysis
     */
    async performATSAnalysis(resumeText, jobDescription) {
        return await openAIService.checkATSCompatibility(resumeText, jobDescription);
    }

    /**
     * Generate enhancement suggestions
     */
    async generateEnhancementSuggestions(resumeText, jobDescription = '') {
        const prompt = `Provide specific enhancement suggestions for this resume:

RESUME:
${resumeText}

${jobDescription ? `TARGET JOB:\n${jobDescription}\n\n` : ''}
Suggest improvements for:
1. Action verbs to use
2. Quantifiable achievements to add
3. Keywords to include
4. Section improvements
5. Formatting enhancements

Format as JSON with: actionVerbs, achievementExamples, keywords, sectionImprovements, formattingTips`;

        const response = await openAIService.generateCompletion(prompt, {
            temperature: 0.5,
            max_tokens: 2000
        });

        return openAIService.parseJSONResponse(response.content);
    }

    /**
     * Calculate overall score from multiple analyses
     */
    calculateOverallScore(basicAnalysis, atsAnalysis) {
        let totalScore = 0;
        let weightCount = 0;

        // Basic analysis weights
        if (basicAnalysis.readabilityScore) {
            totalScore += basicAnalysis.readabilityScore * 0.2;
            weightCount += 0.2;
        }
        if (basicAnalysis.structureScore) {
            totalScore += basicAnalysis.structureScore * 0.2;
            weightCount += 0.2;
        }
        if (basicAnalysis.contentScore) {
            totalScore += basicAnalysis.contentScore * 0.2;
            weightCount += 0.2;
        }

        // ATS analysis weight
        if (atsAnalysis?.atsScore) {
            totalScore += atsAnalysis.atsScore * 0.4;
            weightCount += 0.4;
        }

        // Normalize score
        const normalizedScore = weightCount > 0 ? Math.round((totalScore / weightCount) * 10) / 10 : 70;

        return Math.min(Math.max(normalizedScore, 0), 100);
    }

    /**
     * Generate actionable recommendations
     */
    generateRecommendations(basicAnalysis, atsAnalysis, enhancementSuggestions) {
        const recommendations = [];

        // Grammar recommendations
        if (basicAnalysis.grammarIssues?.length > 0) {
            recommendations.push({
                priority: 'high',
                category: 'grammar',
                title: 'Fix Grammar Issues',
                description: `Found ${basicAnalysis.grammarIssues.length} grammar/spelling issues`,
                action: 'Review and correct grammatical errors'
            });
        }

        // ATS recommendations
        if (atsAnalysis?.missingKeywords?.length > 0) {
            recommendations.push({
                priority: 'high',
                category: 'ats',
                title: 'Add Missing Keywords',
                description: `Add ${atsAnalysis.missingKeywords.length} keywords for better ATS match`,
                action: `Incorporate: ${atsAnalysis.missingKeywords.slice(0, 5).join(', ')}`
            });
        }

        // Content recommendations
        if (basicAnalysis.contentScore < 7) {
            recommendations.push({
                priority: 'medium',
                category: 'content',
                title: 'Improve Content Quality',
                description: 'Resume content needs enhancement',
                action: 'Add more quantifiable achievements and specific details'
            });
        }

        // Enhancement suggestions
        if (enhancementSuggestions?.actionVerbs?.length > 0) {
            recommendations.push({
                priority: 'medium',
                category: 'enhancement',
                title: 'Use Stronger Action Verbs',
                description: 'Replace weak verbs with impactful ones',
                action: `Consider using: ${enhancementSuggestions.actionVerbs.slice(0, 5).join(', ')}`
            });
        }

        return recommendations.sort((a, b) => {
            const priorityOrder = { high: 0, medium: 1, low: 2 };
            return priorityOrder[a.priority] - priorityOrder[b.priority];
        });
    }

    /**
     * Helper: Count words in text
     */
    countWords(text) {
        return text.trim().split(/\s+/).length;
    }

    /**
     * Helper: Count sections in resume
     */
    countSections(text) {
        const sectionHeaders = ['experience', 'education', 'skills', 'projects', 'summary', 'objective'];
        const regex = new RegExp(`\\b(${sectionHeaders.join('|')})\\b`, 'gi');
        const matches = text.match(regex);
        return matches ? matches.length : 0;
    }

    /**
     * Helper: Count bullet points
     */
    countBulletPoints(text) {
        const bulletPattern = /(?:^|\n)[•\-*]\s+/g;
        const matches = text.match(bulletPattern);
        return matches ? matches.length : 0;
    }

    /**
     * Get analysis metrics and statistics
     */
    getAnalysisMetrics(analysisResult) {
        return {
            overallScore: analysisResult.overallScore,
            wordCount: analysisResult.basicAnalysis?.rawMetrics?.wordCount || 0,
            sectionCount: analysisResult.basicAnalysis?.rawMetrics?.sectionCount || 0,
            bulletCount: analysisResult.basicAnalysis?.rawMetrics?.bulletPointCount || 0,
            recommendationCount: analysisResult.recommendations?.length || 0,
            atsScore: analysisResult.atsAnalysis?.atsScore || 0,
            keywordMatch: analysisResult.atsAnalysis?.keywordMatch || 'N/A'
        };
    }
}

export default new AIAnalysisService();