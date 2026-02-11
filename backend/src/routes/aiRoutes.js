const express = require('express');
const router = express.Router();
const { protect } = require('../../middleware/authMiddleware.js');
const { validateRequest } = require('../../middleware/validateRequest.js'); // Fixed path

// Import controllers
const aiController = require('./ai.controller.js');

// Test route
router.get('/test', (req, res) => {
    res.json({
        success: true,
        message: 'AI routes are working!',
        timestamp: new Date().toISOString()
    });
});

// Protected AI routes
router.use(protect);

// Resume analysis
router.post('/analyze', aiController.analyzeResume);
router.post('/suggest', aiController.suggestImprovements);
router.post('/optimize', aiController.optimizeResume);

// AI generation
router.post('/generate', aiController.generateResume);
router.post('/enhance-text', aiController.enhanceText);

// AI feedback
router.get('/feedback/:resumeId', aiController.getFeedback);

module.exports = router;