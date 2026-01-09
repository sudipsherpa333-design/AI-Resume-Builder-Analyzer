// server/routes/aiRoutes.js
import express from 'express';
import {
    generateContent,
    analyzeResume,
    chatWithAI,
    applyAISuggestion,
    getAICredits,
    purchaseAICredits
} from '../controllers/aiController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// AI Content Generation
router.post('/generate', generateContent);

// Resume Analysis
router.post('/analyze', analyzeResume);

// AI Chat
router.post('/chat', chatWithAI);

// Apply AI Suggestions
router.post('/apply-suggestion', applyAISuggestion);

// Credits Management
router.get('/credits', getAICredits);
router.post('/purchase-credits', purchaseAICredits);

export default router;