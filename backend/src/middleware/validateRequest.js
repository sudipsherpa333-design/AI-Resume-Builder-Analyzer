const { validationResult } = require('express-validator');
const logger = require('../utils/logger');

/**
 * Request Validation Middleware using express-validator
 * @param {Array} validations - Array of express-validator validation chains
 */
const validateRequest = (validations) => {
  return async (req, res, next) => {
    // Run all validations
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);

    if (errors.isEmpty()) {
      return next();
    }

    // Log validation errors
    logger.warn('Validation failed', {
      path: req.path,
      method: req.method,
      errors: errors.array(),
      userId: req.user?._id,
      ip: req.ip
    });

    // Extract error messages
    const extractedErrors = [];
    errors.array().forEach(err => {
      extractedErrors.push({
        field: err.path || err.param,
        message: err.msg,
        value: err.value
      });
    });

    res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: extractedErrors
    });
  };
};

// Common validation rules
const validationRules = {
  email: (field = 'email') => ({
    in: ['body'],
    isEmail: {
      errorMessage: 'Please provide a valid email address'
    },
    normalizeEmail: true,
    isLength: {
      options: { max: 255 },
      errorMessage: 'Email must be less than 255 characters'
    }
  }),

  password: (field = 'password') => ({
    in: ['body'],
    isLength: {
      options: { min: 6 },
      errorMessage: 'Password must be at least 6 characters long'
    },
    matches: {
      options: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      errorMessage: 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    }
  }),

  name: (field = 'name') => ({
    in: ['body'],
    isLength: {
      options: { min: 2, max: 100 },
      errorMessage: 'Name must be between 2 and 100 characters'
    },
    trim: true
  }),

  phone: (field = 'phone') => ({
    in: ['body'],
    optional: true,
    matches: {
      options: /^[\+]?[1-9][\d]{0,15}$/,
      errorMessage: 'Please provide a valid phone number'
    }
  }),

  objectId: (field = 'id') => ({
    in: ['params'],
    isMongoId: {
      errorMessage: 'Invalid ID format'
    }
  }),

  url: (field = 'url') => ({
    in: ['body'],
    optional: true,
    isURL: {
      errorMessage: 'Please provide a valid URL'
    }
  }),

  date: (field = 'date') => ({
    in: ['body'],
    optional: true,
    isISO8601: {
      errorMessage: 'Please provide a valid date in ISO format'
    }
  }),

  boolean: (field = 'value') => ({
    in: ['body'],
    optional: true,
    isBoolean: {
      errorMessage: 'Value must be true or false'
    }
  }),

  // Resume specific validations
  resumeTitle: (field = 'title') => ({
    in: ['body'],
    notEmpty: {
      errorMessage: 'Resume title is required'
    },
    isLength: {
      options: { min: 1, max: 100 },
      errorMessage: 'Title must be between 1 and 100 characters'
    },
    trim: true
  }),

  resumeTemplate: (field = 'template') => ({
    in: ['body'],
    optional: true,
    isIn: {
      options: [['modern', 'classic', 'minimal', 'professional', 'creative']],
      errorMessage: 'Invalid template selection'
    }
  }),

  resumeStatus: (field = 'status') => ({
    in: ['body'],
    optional: true,
    isIn: {
      options: [['draft', 'published', 'archived']],
      errorMessage: 'Invalid status'
    }
  })
};

module.exports = {
  validateRequest,
  validationRules
};