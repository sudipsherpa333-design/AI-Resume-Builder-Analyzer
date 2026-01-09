import { body } from 'express-validator';

/**
 * Validation rules for AI endpoints
 */
export const validateAIRequest = {
    analyzeResume: [
        body('text')
            .notEmpty()
            .withMessage('Resume text is required')
            .isLength({ min: 50, max: 10000 })
            .withMessage('Resume text must be between 50 and 10000 characters')
            .trim(),

        body('jobDescription')
            .optional()
            .isLength({ max: 5000 })
            .withMessage('Job description cannot exceed 5000 characters'),

        body('targetRole')
            .optional()
            .isLength({ max: 100 })
            .withMessage('Target role cannot exceed 100 characters'),

        body('industry')
            .optional()
            .isLength({ max: 50 })
            .withMessage('Industry cannot exceed 50 characters')
    ],

    enhanceResume: [
        body('text')
            .notEmpty()
            .withMessage('Resume text is required')
            .isLength({ min: 50, max: 10000 })
            .withMessage('Resume text must be between 50 and 10000 characters')
            .trim(),

        body('jobDescription')
            .optional()
            .isLength({ max: 5000 })
            .withMessage('Job description cannot exceed 5000 characters'),

        body('enhancementType')
            .optional()
            .isIn(['comprehensive', 'bullet_points', 'summary', 'ats_optimization'])
            .withMessage('Invalid enhancement type')
    ],

    generateSummary: [
        body('profile')
            .notEmpty()
            .withMessage('Profile is required')
            .isObject()
            .withMessage('Profile must be an object'),

        body('profile.experience')
            .notEmpty()
            .withMessage('Experience is required in profile'),

        body('profile.skills')
            .optional()
            .isArray()
            .withMessage('Skills must be an array'),

        body('targetRole')
            .optional()
            .isLength({ max: 100 })
            .withMessage('Target role cannot exceed 100 characters')
    ],

    checkATS: [
        body('resumeText')
            .notEmpty()
            .withMessage('Resume text is required')
            .isLength({ min: 50, max: 10000 })
            .withMessage('Resume text must be between 50 and 10000 characters'),

        body('jobDescription')
            .notEmpty()
            .withMessage('Job description is required')
            .isLength({ min: 50, max: 5000 })
            .withMessage('Job description must be between 50 and 5000 characters')
    ],

    batchProcess: [
        body('resumes')
            .notEmpty()
            .withMessage('Resumes array is required')
            .isArray({ min: 1, max: 10 })
            .withMessage('Resumes must be an array with 1 to 10 items'),

        body('operation')
            .optional()
            .isIn(['analyze', 'enhance'])
            .withMessage('Operation must be either "analyze" or "enhance"')
    ]
};

/**
 * Sanitize AI input to prevent prompt injection
 */
export const sanitizeAIInput = (text) => {
    if (!text) return '';

    // Remove potentially harmful characters/patterns
    let sanitized = text
        .replace(/[<>]/g, '') // Remove HTML tags
        .replace(/javascript:/gi, '') // Remove javascript protocol
        .replace(/data:/gi, '') // Remove data protocol
        .replace(/on\w+=/gi, '') // Remove event handlers
        .trim();

    // Limit length
    const maxLength = 10000;
    if (sanitized.length > maxLength) {
        sanitized = sanitized.substring(0, maxLength);
    }

    return sanitized;
};

/**
 * Validate OpenAI API key format
 */
export const isValidOpenAIKey = (apiKey) => {
    if (!apiKey) return false;

    // OpenAI API keys start with 'sk-'
    const pattern = /^sk-[a-zA-Z0-9]{48,}$/;
    return pattern.test(apiKey);
};