// backend/src/routes/resumeAnalyzer.routes.js
import express from 'express';
import { analyzeResume } from '../controllers/resumeAnalyzer.controller.js';
import { authMiddleware as authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

// Analyze existing resume (with optional job description)
router.post('/api/resumes/:id/analyze', analyzeResume);

export default router;