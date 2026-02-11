import express from "express";
import * as ctrl from "./ai.controller.js";
import { validateRequest, rateLimiter } from "../../middleware/validateRequest.js";
import { requireApiKey } from "../../middleware/authMiddleware.js";

const router = express.Router();

// Public routes (rate limited)
router.post("/analyze", rateLimiter, validateRequest, ctrl.analyzeResume);
router.post("/ats-score", rateLimiter, validateRequest, ctrl.calculateATSScore);
router.post("/keyword-match", rateLimiter, validateRequest, ctrl.analyzeKeywordMatch);
router.post("/extract-keywords", rateLimiter, validateRequest, ctrl.extractKeywords);
router.post("/suggest-improvements", rateLimiter, validateRequest, ctrl.suggestImprovements);

// Content optimization routes
router.post("/rewrite-bullet", rateLimiter, validateRequest, ctrl.rewriteBullet);
router.post("/optimize-summary", rateLimiter, validateRequest, ctrl.optimizeSummary);
router.post("/optimize-section", rateLimiter, validateRequest, ctrl.optimizeSection);
router.post("/generate-bullet", rateLimiter, validateRequest, ctrl.generateBulletPoint);

// Skills & Analysis routes
router.post("/suggest-skills", rateLimiter, validateRequest, ctrl.suggestSkills);
router.post("/gap-analysis", rateLimiter, validateRequest, ctrl.performGapAnalysis);
router.post("/full-review", rateLimiter, validateRequest, ctrl.fullReview);

// Advanced AI routes (may require API key)
router.post("/generate-resume", requireApiKey, rateLimiter, ctrl.generateResumeFromScratch);
router.post("/career-path", requireApiKey, rateLimiter, ctrl.suggestCareerPath);
router.post("/salary-estimate", requireApiKey, rateLimiter, ctrl.estimateSalary);

// Batch processing
router.post("/batch-analyze", requireApiKey, rateLimiter, ctrl.batchAnalyze);
router.post("/compare-resumes", requireApiKey, rateLimiter, ctrl.compareResumes);

// Health and status
router.get("/health", ctrl.healthCheck);
router.get("/status", ctrl.getServiceStatus);
router.get("/capabilities", ctrl.getCapabilities);

// Analytics and insights
router.post("/trends", rateLimiter, ctrl.getIndustryTrends);
router.post("/competitor-analysis", requireApiKey, rateLimiter, ctrl.analyzeCompetitors);

export default router;