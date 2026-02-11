const express = require('express');
const { body, param } = require('express-validator');
const router = express.Router();

const {
    createResume,
    getUserResumes,
    getResume,
    updateResume,
    deleteResume,
    testRoute
} = require('../controllers/resumeController.js');

const { protect } = require('../../middleware/authMiddleware.js');
const { validateRequest, validationRules } = require('../../middleware/validateRequest.js');

// ============ PUBLIC ROUTES ============
// Test route - no authentication required
router.get('/test', testRoute);

// ============ PROTECTED ROUTES ============
// All routes below require authentication
router.use(protect);

// Get all resumes for user
router.get('/', getUserResumes);

// Create new resume
router.post('/',
    validateRequest([
        body('title')
            .notEmpty().withMessage('Resume title is required')
            .isLength({ min: 1, max: 100 }).withMessage('Title must be between 1 and 100 characters')
            .trim(),
        body('template')
            .optional()
            .isIn(['modern', 'classic', 'minimal', 'professional', 'creative'])
            .withMessage('Invalid template selection'),
        body('status')
            .optional()
            .isIn(['draft', 'published', 'archived'])
            .withMessage('Invalid status')
    ]),
    createResume
);

// Get single resume
router.get('/:id',
    validateRequest([
        param('id').isMongoId().withMessage('Invalid resume ID format')
    ]),
    getResume
);

// Update resume
router.put('/:id',
    validateRequest([
        param('id').isMongoId().withMessage('Invalid resume ID format')
    ]),
    updateResume
);

// Delete resume
router.delete('/:id',
    validateRequest([
        param('id').isMongoId().withMessage('Invalid resume ID format')
    ]),
    deleteResume
);

module.exports = router;