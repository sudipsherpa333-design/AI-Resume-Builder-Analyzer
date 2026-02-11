// src/hooks/useFormValidation.js
import { useState, useCallback, useEffect } from 'react';

export const useFormValidation = (initialData = {}, validationSchema = {}, options = {}) => {
  const {
    validateOnChange = true,
    validateOnBlur = true,
    validateOnSubmit = true,
    showAllErrorsOnSubmit = true
  } = options;

  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isValid, setIsValid] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validate entire form
  const validateForm = useCallback(() => {
    console.log('🔍 [useFormValidation] Validating form');
    const newErrors = {};
    let formIsValid = true;

    Object.keys(validationSchema).forEach(field => {
      const rules = validationSchema[field];
      const value = formData[field];
      const fieldError = validateField(field, value, rules);

      if (fieldError) {
        newErrors[field] = fieldError;
        formIsValid = false;
      }
    });

    setErrors(newErrors);
    setIsValid(formIsValid);
    return { isValid: formIsValid, errors: newErrors };
  }, [formData, validationSchema]);

  // Validate single field
  const validateField = useCallback((field, value, rules) => {
    if (!rules) {
      return null;
    }

    let error = null;

    // Required validation
    if (rules.required && (!value || value.toString().trim() === '')) {
      error = rules.requiredMessage || `${field} is required`;
      return error;
    }

    // Email validation
    if (rules.email && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        error = rules.emailMessage || 'Invalid email format';
        return error;
      }
    }

    // Min length validation
    if (rules.minLength && value && value.length < rules.minLength) {
      error = rules.minLengthMessage || `Minimum ${rules.minLength} characters required`;
      return error;
    }

    // Max length validation
    if (rules.maxLength && value && value.length > rules.maxLength) {
      error = rules.maxLengthMessage || `Maximum ${rules.maxLength} characters allowed`;
      return error;
    }

    // Pattern validation
    if (rules.pattern && value) {
      const regex = new RegExp(rules.pattern);
      if (!regex.test(value)) {
        error = rules.patternMessage || 'Invalid format';
        return error;
      }
    }

    // Custom validation function
    if (rules.validate && typeof rules.validate === 'function') {
      const customError = rules.validate(value, formData);
      if (customError) {
        error = customError;
        return error;
      }
    }

    return null;
  }, [formData]);

  // Update form field
  const handleChange = useCallback((field, value) => {
    console.log('✏️ [useFormValidation] Field changed:', { field, value });

    setFormData(prev => ({ ...prev, [field]: value }));

    if (validateOnChange) {
      const fieldRules = validationSchema[field];
      if (fieldRules) {
        const fieldError = validateField(field, value, fieldRules);
        setErrors(prev => ({ ...prev, [field]: fieldError || null }));
      }
    }
  }, [validateOnChange, validationSchema, validateField]);

  // Handle field blur
  const handleBlur = useCallback((field) => {
    console.log('👁️ [useFormValidation] Field blurred:', field);

    setTouched(prev => ({ ...prev, [field]: true }));

    if (validateOnBlur) {
      const value = formData[field];
      const fieldRules = validationSchema[field];
      if (fieldRules) {
        const fieldError = validateField(field, value, fieldRules);
        setErrors(prev => ({ ...prev, [field]: fieldError || null }));
      }
    }
  }, [validateOnBlur, formData, validationSchema, validateField]);

  // Handle form submission
  const handleSubmit = useCallback(async (onSubmit) => {
    console.log('🚀 [useFormValidation] Form submission started');

    if (validateOnSubmit) {
      const validationResult = validateForm();

      if (showAllErrorsOnSubmit) {
        // Mark all fields as touched to show errors
        const allTouched = {};
        Object.keys(validationSchema).forEach(field => {
          allTouched[field] = true;
        });
        setTouched(allTouched);
      }

      if (!validationResult.isValid) {
        console.log('❌ [useFormValidation] Form validation failed');
        return { success: false, errors: validationResult.errors };
      }
    }

    setIsSubmitting(true);

    try {
      const result = await onSubmit(formData);
      console.log('✅ [useFormValidation] Form submission successful');
      return { success: true, data: result };
    } catch (error) {
      console.error('❌ [useFormValidation] Form submission failed:', error);
      return { success: false, error: error.message };
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, validateForm, validateOnSubmit, showAllErrorsOnSubmit, validationSchema]);

  // Reset form
  const resetForm = useCallback((newData = null) => {
    console.log('🔄 [useFormValidation] Resetting form');
    setFormData(newData || initialData);
    setErrors({});
    setTouched({});
    setIsValid(false);
    setIsSubmitting(false);
  }, [initialData]);

  // Set form data externally
  const setFormDataExternal = useCallback((data) => {
    console.log('📥 [useFormValidation] Setting external form data');
    setFormData(data);
    // Re-validate after external update
    if (validateOnChange) {
      setTimeout(() => validateForm(), 0);
    }
  }, [validateOnChange, validateForm]);

  // Auto-validate when form data changes
  useEffect(() => {
    if (validateOnChange) {
      const timer = setTimeout(() => {
        validateForm();
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [formData, validateOnChange, validateForm]);

  // Check if field has error and is touched
  const getFieldError = useCallback((field) => {
    return touched[field] ? errors[field] : null;
  }, [errors, touched]);

  // Check if field is valid
  const isFieldValid = useCallback((field) => {
    return !errors[field];
  }, [errors]);

  // Mark field as touched
  const markAsTouched = useCallback((field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  }, []);

  // Mark all fields as touched
  const markAllAsTouched = useCallback(() => {
    const allTouched = {};
    Object.keys(validationSchema).forEach(field => {
      allTouched[field] = true;
    });
    setTouched(allTouched);
  }, [validationSchema]);

  return {
    // State
    formData,
    errors,
    touched,
    isValid,
    isSubmitting,

    // Actions
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
    setFormData: setFormDataExternal,
    validateForm,

    // Field-specific utilities
    getFieldError,
    isFieldValid,
    markAsTouched,
    markAllAsTouched,

    // Helper flags
    hasErrors: Object.keys(errors).length > 0,
    isTouched: Object.keys(touched).length > 0,
    isPristine: Object.keys(touched).length === 0
  };
};

// Predefined validation schemas for common use cases
export const validationSchemas = {
  personalInfo: {
    firstName: {
      required: true,
      minLength: 2,
      maxLength: 50,
      requiredMessage: 'First name is required',
      minLengthMessage: 'First name must be at least 2 characters'
    },
    lastName: {
      required: true,
      minLength: 2,
      maxLength: 50,
      requiredMessage: 'Last name is required'
    },
    email: {
      required: true,
      email: true,
      requiredMessage: 'Email is required',
      emailMessage: 'Please enter a valid email address'
    },
    phone: {
      pattern: '^[+]?[(]?[0-9]{1,4}[)]?[-\\s./0-9]*$',
      patternMessage: 'Please enter a valid phone number'
    },
    jobTitle: {
      required: true,
      minLength: 2,
      maxLength: 100,
      requiredMessage: 'Job title is required'
    }
  },

  experience: {
    jobTitle: {
      required: true,
      minLength: 2,
      maxLength: 100
    },
    company: {
      required: true,
      minLength: 2,
      maxLength: 100
    },
    startDate: {
      required: true
    }
  },

  education: {
    degree: {
      required: true,
      minLength: 2,
      maxLength: 100
    },
    institution: {
      required: true,
      minLength: 2,
      maxLength: 100
    }
  }
};

export default useFormValidation;