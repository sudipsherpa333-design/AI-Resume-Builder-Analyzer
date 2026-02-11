import { runAnalyzer } from "./services/analyzer.service.js";
import { calculateATSScore } from "./services/atsScore.service.js";
import { analyzeKeywordMatch } from "./services/keywordMatch.service.js";
import { extractKeywords as extractKeywordsService } from "./services/jdExtractor.service.js";
import { optimizeBulletPoint } from "./services/bulletQuality.service.js";
import { suggestImprovements } from "./services/suggestion.service.js";
import { analyzeSection } from "./services/sectionCheck.service.js";
import { aiClient } from "./services/aiClient.js";
import { metricsTracker } from "./services/metrics.service.js";
import * as P from "./prompts/index.js";
import { requireFields, validateResume, validateJobDescription } from "./ai.schema.js";
import logger from "../../utils/logger.js";
import { cache } from "./cache/jd.cache.js";

// Response helper
const sendResponse = (res, data, status = 200) => {
    res.status(status).json({
        success: true,
        timestamp: new Date().toISOString(),
        ...data
    });
};

const sendError = (res, error, status = 500) => {
    logger.error('AI Controller Error:', error);
    res.status(status).json({
        success: false,
        error: error.message || 'Internal server error',
        timestamp: new Date().toISOString()
    });
};

// Main analysis endpoint
export const analyzeResume = async (req, res) => {
    try {
        requireFields(["resume", "jobDescription"], req.body);

        const { resume, jobDescription, options = {} } = req.body;

        // Validate inputs
        validateResume(resume);
        validateJobDescription(jobDescription);

        // Check cache first
        const cacheKey = `analyze:${Buffer.from(resume + jobDescription).toString('base64').substring(0, 50)}`;
        const cachedResult = await cache.get(cacheKey);

        if (cachedResult && !options.forceRefresh) {
            metricsTracker.increment('cache_hits');
            return sendResponse(res, {
                ...cachedResult,
                cached: true
            });
        }

        metricsTracker.increment('analysis_requests');
        const startTime = Date.now();

        // Run comprehensive analysis
        const analysisResult = await runAnalyzer({
            resume,
            jobDescription,
            options
        });

        const processingTime = Date.now() - startTime;

        // Enhance with additional insights
        const enhancedResult = {
            ...analysisResult,
            processingTime,
            confidence: calculateConfidenceScore(analysisResult),
            recommendations: generateRecommendations(analysisResult),
            quickWins: identifyQuickWins(analysisResult)
        };

        // Cache the result
        await cache.set(cacheKey, enhancedResult, 3600); // Cache for 1 hour

        metricsTracker.recordProcessingTime('analyze', processingTime);

        sendResponse(res, enhancedResult);

    } catch (error) {
        sendError(res, error, error.statusCode || 400);
    }
};

// ATS Score calculation
export const calculateATSScore = async (req, res) => {
    try {
        requireFields(["resume", "jobDescription"], req.body);

        const { resume, jobDescription, weights } = req.body;

        const scoreResult = await calculateATSScore(resume, jobDescription, weights);

        sendResponse(res, {
            score: scoreResult.score,
            breakdown: scoreResult.breakdown,
            interpretation: interpretATSScore(scoreResult.score),
            improvementTips: scoreResult.improvementTips
        });

    } catch (error) {
        sendError(res, error);
    }
};

// Keyword match analysis
export const analyzeKeywordMatch = async (req, res) => {
    try {
        requireFields(["resume", "jobDescription"], req.body);

        const { resume, jobDescription, categories = ['technical', 'soft', 'tools'] } = req.body;

        const matchResult = await analyzeKeywordMatch(resume, jobDescription, categories);

        sendResponse(res, {
            matchPercentage: matchResult.matchPercentage,
            matchedKeywords: matchResult.matchedKeywords,
            missingKeywords: matchResult.missingKeywords,
            byCategory: matchResult.byCategory,
            keywordDensity: matchResult.keywordDensity,
            recommendations: matchResult.recommendations
        });

    } catch (error) {
        sendError(res, error);
    }
};

// Extract keywords from text
export const extractKeywords = async (req, res) => {
    try {
        requireFields(["text"], req.body);

        const { text, maxKeywords = 50, categorize = true } = req.body;

        const keywordsResult = await extractKeywordsService(text, { maxKeywords, categorize });

        sendResponse(res, {
            totalKeywords: keywordsResult.total,
            keywords: keywordsResult.keywords,
            categories: keywordsResult.categories,
            frequencies: keywordsResult.frequencies,
            weightedScores: keywordsResult.weightedScores
        });

    } catch (error) {
        sendError(res, error);
    }
};

// Suggest improvements
export const suggestImprovements = async (req, res) => {
    try {
        requireFields(["resume", "jobDescription"], req.body);

        const { resume, jobDescription, focusAreas = [] } = req.body;

        const improvements = await suggestImprovements(resume, jobDescription, focusAreas);

        sendResponse(res, {
            improvements,
            priority: improvements.priority || 'medium',
            estimatedTime: improvements.estimatedTime || '30 minutes',
            impactScore: improvements.impactScore || 75
        });

    } catch (error) {
        sendError(res, error);
    }
};

// Rewrite bullet point
export const rewriteBullet = async (req, res) => {
    try {
        requireFields(["bullet"], req.body);

        const { bullet, keywords = [], tone = 'professional', maxLength = 200 } = req.body;

        const startTime = Date.now();
        const optimizedBullet = await optimizeBulletPoint(bullet, keywords, { tone, maxLength });
        const processingTime = Date.now() - startTime;

        sendResponse(res, {
            original: bullet,
            optimized: optimizedBullet.text,
            improvements: optimizedBullet.improvements,
            impactScore: optimizedBullet.impactScore,
            processingTime
        });

    } catch (error) {
        sendError(res, error);
    }
};

// Optimize summary
export const optimizeSummary = async (req, res) => {
    try {
        requireFields(["summary", "jd"], req.body);

        const { summary, jd, targetLength = 150 } = req.body;

        const startTime = Date.now();
        const text = await aiClient(P.optimizeSummary(summary, jd, targetLength));
        const processingTime = Date.now() - startTime;

        sendResponse(res, {
            original: summary,
            optimized: text,
            lengthDifference: text.length - summary.length,
            processingTime
        });

    } catch (error) {
        sendError(res, error);
    }
};

// Optimize section (experience, education, etc.)
export const optimizeSection = async (req, res) => {
    try {
        requireFields(["section", "sectionType"], req.body);

        const { section, sectionType, jd, options = {} } = req.body;

        const optimizedSection = await analyzeSection(section, sectionType, jd, options);

        sendResponse(res, {
            sectionType,
            original: section,
            optimized: optimizedSection.content,
            score: optimizedSection.score,
            suggestions: optimizedSection.suggestions,
            beforeAfterComparison: optimizedSection.comparison
        });

    } catch (error) {
        sendError(res, error);
    }
};

// Generate bullet point from achievements
export const generateBulletPoint = async (req, res) => {
    try {
        requireFields(["achievement"], req.body);

        const { achievement, metrics = [], keywords = [], style = 'achievement' } = req.body;

        const bulletPoint = await aiClient(P.generateBulletPoint(achievement, metrics, keywords, style));

        sendResponse(res, {
            achievement,
            generatedBullet: bulletPoint,
            style,
            includesMetrics: metrics.length > 0,
            keywordCount: keywords.length
        });

    } catch (error) {
        sendError(res, error);
    }
};

// Suggest skills
export const suggestSkills = async (req, res) => {
    try {
        requireFields(["skills", "jd"], req.body);

        const { skills, jd, limit = 10, includeCertifications = true } = req.body;

        const text = await aiClient(P.skillsSuggest(skills, jd, limit, includeCertifications));
        const suggestedSkills = parseSkillsResponse(text);

        sendResponse(res, {
            currentSkills: skills,
            suggestedSkills: suggestedSkills.list,
            missingSkills: suggestedSkills.missing,
            trendingSkills: suggestedSkills.trending,
            priorityOrder: suggestedSkills.priority
        });

    } catch (error) {
        sendError(res, error);
    }
};

// Gap analysis
export const performGapAnalysis = async (req, res) => {
    try {
        requireFields(["resume", "targetRole"], req.body);

        const { resume, targetRole, experienceLevel = 'mid' } = req.body;

        const analysis = await aiClient(P.gapAnalysis(resume, targetRole, experienceLevel));
        const parsedAnalysis = parseGapAnalysis(analysis);

        sendResponse(res, {
            targetRole,
            experienceLevel,
            gaps: parsedAnalysis.gaps,
            timeline: parsedAnalysis.timeline,
            resources: parsedAnalysis.resources,
            confidence: parsedAnalysis.confidence
        });

    } catch (error) {
        sendError(res, error);
    }
};

// Full review
export const fullReview = async (req, res) => {
    try {
        requireFields(["resume"], req.body);

        const { resume, comprehensive = true } = req.body;

        const startTime = Date.now();
        const review = await aiClient(P.fullReview(resume, comprehensive));
        const processingTime = Date.now() - startTime;

        const parsedReview = parseFullReview(review);

        sendResponse(res, {
            ...parsedReview,
            processingTime,
            sectionsReviewed: parsedReview.sections?.length || 0
        });

    } catch (error) {
        sendError(res, error);
    }
};

// Generate resume from scratch
export const generateResumeFromScratch = async (req, res) => {
    try {
        requireFields(["profile", "targetRole"], req.body);

        const { profile, targetRole, template = 'modern', experienceLevel } = req.body;

        const resume = await aiClient(P.generateResume(profile, targetRole, template, experienceLevel));

        sendResponse(res, {
            resume,
            template,
            targetRole,
            sections: extractSections(resume),
            wordCount: resume.split(' ').length,
            estimatedATS: estimateATSFromGenerated(resume)
        });

    } catch (error) {
        sendError(res, error);
    }
};

// Suggest career path
export const suggestCareerPath = async (req, res) => {
    try {
        requireFields(["currentRole", "experience"], req.body);

        const { currentRole, experience, interests = [], industry } = req.body;

        const careerPath = await aiClient(P.careerPath(currentRole, experience, interests, industry));

        sendResponse(res, {
            currentRole,
            suggestedPaths: parseCareerPaths(careerPath),
            timeline: generateTimeline(currentRole, experience),
            skillsToDevelop: extractSkillsFromPaths(careerPath)
        });

    } catch (error) {
        sendError(res, error);
    }
};

// Estimate salary
export const estimateSalary = async (req, res) => {
    try {
        requireFields(["role", "location", "experience"], req.body);

        const { role, location, experience, skills = [], industry } = req.body;

        const salaryData = await aiClient(P.salaryEstimate(role, location, experience, skills, industry));

        sendResponse(res, {
            role,
            location,
            experience,
            salaryRange: parseSalaryRange(salaryData),
            factors: extractSalaryFactors(salaryData),
            confidence: calculateSalaryConfidence(role, location),
            negotiationTips: generateNegotiationTips(salaryData)
        });

    } catch (error) {
        sendError(res, error);
    }
};

// Batch analyze multiple resumes
export const batchAnalyze = async (req, res) => {
    try {
        requireFields(["resumes", "jobDescription"], req.body);

        const { resumes, jobDescription, parallel = true } = req.body;

        if (!Array.isArray(resumes) || resumes.length > 10) {
            throw new Error('Maximum 10 resumes allowed for batch analysis');
        }

        const results = await Promise.all(
            resumes.map(resume =>
                runAnalyzer({ resume, jobDescription })
                    .catch(error => ({ error: error.message, resume: 'Error in analysis' }))
            )
        );

        const summary = generateBatchSummary(results);

        sendResponse(res, {
            totalAnalyzed: resumes.length,
            successful: results.filter(r => !r.error).length,
            failed: results.filter(r => r.error).length,
            results,
            summary,
            recommendations: generateBatchRecommendations(summary)
        });

    } catch (error) {
        sendError(res, error);
    }
};

// Compare multiple resumes
export const compareResumes = async (req, res) => {
    try {
        requireFields(["resumes"], req.body);

        const { resumes, criteria = ['ats', 'content', 'structure'] } = req.body;

        if (!Array.isArray(resumes) || resumes.length < 2) {
            throw new Error('At least 2 resumes required for comparison');
        }

        const comparison = await generateComparisonMatrix(resumes, criteria);

        sendResponse(res, {
            compared: resumes.length,
            criteria,
            matrix: comparison.matrix,
            rankings: comparison.rankings,
            strengthsByResume: comparison.strengths,
            weaknessesByResume: comparison.weaknesses,
            bestFit: comparison.bestFit
        });

    } catch (error) {
        sendError(res, error);
    }
};

// Health check
export const healthCheck = async (req, res) => {
    const aiStatus = await aiClient.healthCheck();
    const cacheStatus = await cache.getStatus();
    const metrics = metricsTracker.getMetrics();

    sendResponse(res, {
        status: 'operational',
        aiService: aiStatus,
        cache: cacheStatus,
        metrics: {
            totalRequests: metrics.totalRequests,
            averageResponseTime: metrics.avgResponseTime,
            cacheHitRate: metrics.cacheHitRate
        },
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    });
};

// Service status
export const getServiceStatus = async (req, res) => {
    const status = {
        service: 'AI Resume Analyzer',
        version: '2.0.0',
        features: [
            'ATS Compatibility Scoring',
            'Keyword Optimization',
            'Content Improvement Suggestions',
            'Real-time Resume Analysis',
            'Career Path Recommendations',
            'Salary Estimation'
        ],
        limits: {
            maxResumeSize: '10000 characters',
            maxBatchSize: 10,
            rateLimit: '100 requests/hour'
        },
        uptime: process.uptime(),
        lastUpdated: new Date().toISOString()
    };

    sendResponse(res, status);
};

// Service capabilities
export const getCapabilities = (req, res) => {
    const capabilities = {
        analysis: {
            atsScoring: true,
            keywordMatching: true,
            contentQuality: true,
            structureAnalysis: true,
            gapAnalysis: true
        },
        optimization: {
            bulletRewriting: true,
            summaryOptimization: true,
            sectionOptimization: true,
            toneAdjustment: true,
            lengthOptimization: true
        },
        generation: {
            bulletPoints: true,
            summaries: true,
            skillSuggestions: true,
            careerPaths: true,
            completeResumes: true
        },
        comparison: {
            multipleResumes: true,
            beforeAfter: true,
            competitiveAnalysis: true
        },
        insights: {
            industryTrends: true,
            salaryData: true,
            skillDemand: true,
            competitorAnalysis: true
        }
    };

    sendResponse(res, capabilities);
};

// Industry trends
export const getIndustryTrends = async (req, res) => {
    try {
        const { industry, location, timeFrame = '6months' } = req.body;

        const trends = await aiClient(P.industryTrends(industry, location, timeFrame));

        sendResponse(res, {
            industry,
            location,
            timeFrame,
            trends: parseTrends(trends),
            topSkills: extractTopSkills(trends),
            salaryTrends: extractSalaryTrends(trends),
            recommendations: generateTrendRecommendations(trends)
        });

    } catch (error) {
        sendError(res, error);
    }
};

// Competitor analysis
export const analyzeCompetitors = async (req, res) => {
    try {
        const { role, industry, location } = req.body;

        const analysis = await aiClient(P.competitorAnalysis(role, industry, location));

        sendResponse(res, {
            role,
            industry,
            location,
            commonSkills: analysis.commonSkills,
            differentiators: analysis.differentiators,
            marketGaps: analysis.marketGaps,
            competitiveAdvice: analysis.advice
        });

    } catch (error) {
        sendError(res, error);
    }
};

// Helper functions
function calculateConfidenceScore(analysis) {
    const factors = [
        analysis.atsScore ? 0.4 : 0,
        analysis.keywordMatch ? 0.3 : 0,
        analysis.suggestions?.length > 0 ? 0.2 : 0,
        analysis.reviewScore ? 0.1 : 0
    ];

    return factors.reduce((a, b) => a + b, 0) * 100;
}

function generateRecommendations(analysis) {
    const recommendations = [];

    if (analysis.atsScore < 70) {
        recommendations.push({
            type: 'ats',
            priority: 'high',
            action: 'Improve keyword density and ATS formatting'
        });
    }

    if (analysis.keywordMatch?.matchPercentage < 60) {
        recommendations.push({
            type: 'keywords',
            priority: 'high',
            action: 'Add missing keywords from job description'
        });
    }

    if (analysis.suggestions?.length > 0) {
        recommendations.push({
            type: 'content',
            priority: 'medium',
            action: 'Implement suggested content improvements'
        });
    }

    return recommendations;
}

function identifyQuickWins(analysis) {
    return analysis.suggestions
        ?.filter(s => s.estimatedTime === 'quick' && s.impact === 'high')
        .slice(0, 3) || [];
}

function interpretATSScore(score) {
    if (score >= 90) return 'Excellent - High chance of passing ATS';
    if (score >= 75) return 'Good - Likely to pass most ATS systems';
    if (score >= 60) return 'Fair - Needs some improvements';
    if (score >= 40) return 'Poor - Significant improvements needed';
    return 'Very Poor - Major overhaul required';
}

// Add these parsing helper functions at the end of the file
function parseSkillsResponse(text) {
    try {
        // Try to parse as JSON first
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }

        // Fallback to parsing as list
        const lines = text.split('\n').filter(line => line.trim().length > 0);
        return {
            list: lines,
            missing: [],
            trending: [],
            priority: lines.slice(0, 5)
        };
    } catch (error) {
        return {
            list: [],
            missing: [],
            trending: [],
            priority: []
        };
    }
}

function parseGapAnalysis(text) {
    try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }

        return {
            gaps: [],
            timeline: {},
            resources: [],
            confidence: 0.7
        };
    } catch (error) {
        return {
            gaps: [],
            timeline: {},
            resources: [],
            confidence: 0.5
        };
    }
}

function parseFullReview(text) {
    try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }

        return {
            overallScore: 70,
            strengths: [],
            weaknesses: [],
            suggestions: [],
            sections: []
        };
    } catch (error) {
        return {
            overallScore: 50,
            strengths: ['Unable to parse detailed review'],
            weaknesses: ['Review format issue'],
            suggestions: ['Try the analysis again'],
            sections: []
        };
    }
}