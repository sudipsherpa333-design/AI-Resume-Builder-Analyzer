const { validationResult } = require('express-validator');
const logger = require('../utils/logger');

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

// Common validation schemas
const validationSchemas = {
  email: {
    isEmail: {
      errorMessage: 'Please provide a valid email address'
    },
    normalizeEmail: true,
    isLength: {
      options: { max: 255 },
      errorMessage: 'Email must be less than 255 characters'
    }
  },

  password: {
    isLength: {
      options: { min: 6 },
      errorMessage: 'Password must be at least 6 characters long'
    },
    matches: {
      options: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      errorMessage: 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    }
  },

  name: {
    isLength: {
      options: { min: 2, max: 100 },
      errorMessage: 'Name must be between 2 and 100 characters'
    },
    trim: true
  },

  phone: {
    optional: true,
    matches: {
      options: /^[\+]?[1-9][\d]{0,15}$/,
      errorMessage: 'Please provide a valid phone number'
    }
  },

  objectId: {
    isMongoId: {
      errorMessage: 'Invalid ID format'
    }
  },

  url: {
    optional: true,
    isURL: {
      errorMessage: 'Please provide a valid URL'
    }
  },

  date: {
    optional: true,
    isISO8601: {
      errorMessage: 'Please provide a valid date in ISO format'
    }
  },

  boolean: {
    optional: true,
    isBoolean: {
      errorMessage: 'Value must be true or false'
    }
  }
};

module.exports = {
  validateRequest,
  validationSchemas
};