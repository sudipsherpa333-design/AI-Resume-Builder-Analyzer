// src/hooks/useResumeSection.js
import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'react-hot-toast';

export const useResumeSection = (initialData = null, options = {}) => {
    const {
        sectionId = '',
        onUpdate = null,
        onSave = null,
        autoSave = true,
        autoSaveDelay = 2000,
        validationRules = {},
        requiredFields = [],
        showNotifications = true
    } = options;

    const [formData, setFormData] = useState(initialData || getDefaultData(sectionId));
    const [isDirty, setIsDirty] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [lastSaved, setLastSaved] = useState(null);

    const autoSaveTimeoutRef = useRef(null);
    const initialDataRef = useRef(initialData);

    // Get default data structure for section
    function getDefaultData(sectionId) {
        const defaults = {
            personalInfo: {
                firstName: '',
                lastName: '',
                email: '',
                phone: '',
                jobTitle: '',
                location: '',
                website: '',
                linkedin: '',
                github: '',
                portfolio: '',
                summary: '',
                yearsOfExperience: '',
                availability: 'Immediately',
                visaStatus: '',
                nationality: '',
                dateOfBirth: ''
            },
            summary: '',
            experience: [],
            education: [],
            skills: [],
            projects: [],
            certifications: [],
            languages: [],
            references: []
        };

        return defaults[sectionId] || {};
    }

    // Sync external data changes
    useEffect(() => {
        console.log('🔄 [useResumeSection] Syncing external data for:', sectionId);

        if (initialData && JSON.stringify(initialData) !== JSON.stringify(initialDataRef.current)) {
            initialDataRef.current = initialData;

            const mergedData = mergeWithDefaults(initialData, sectionId);
            setFormData(mergedData);
            setIsDirty(false);
            setErrors({});

            console.log('✅ [useResumeSection] Data synced successfully');
        }
    }, [initialData, sectionId]);

    // Merge external data with defaults
    function mergeWithDefaults(data, sectionId) {
        const defaults = getDefaultData(sectionId);

        if (Array.isArray(data)) {
            return data.map(item => ({
                ...getDefaultItem(sectionId),
                ...item
            }));
        }

        if (typeof data === 'string') {
            return data;
        }

        return {
            ...defaults,
            ...data
        };
    }

    // Get default item for array sections
    function getDefaultItem(sectionId) {
        const itemDefaults = {
            experience: {
                jobTitle: '',
                company: '',
                location: '',
                startDate: '',
                endDate: '',
                current: false,
                description: ''
            },
            education: {
                degree: '',
                institution: '',
                location: '',
                startDate: '',
                endDate: '',
                gpa: '',
                honors: ''
            },
            projects: {
                title: '',
                description: '',
                technologies: [],
                link: '',
                startDate: '',
                endDate: ''
            },
            certifications: {
                name: '',
                issuer: '',
                date: '',
                expiryDate: '',
                credentialId: '',
                link: ''
            },
            languages: {
                language: '',
                proficiency: 'Intermediate'
            },
            references: {
                name: '',
                title: '',
                company: '',
                email: '',
                phone: '',
                relationship: ''
            }
        };

        return itemDefaults[sectionId] || {};
    }

    // Handle field change
    const handleChange = useCallback((field, value) => {
        console.log('✏️ [useResumeSection] Field changed:', { sectionId, field, value });

        setFormData(prev => {
            if (typeof prev === 'string') {
                return value;
            }

            if (Array.isArray(prev)) {
                // Handle array updates
                return prev;
            }

            return { ...prev, [field]: value };
        });

        setIsDirty(true);
        setTouched(prev => ({ ...prev, [field]: true }));

        // Auto-save after delay
        if (autoSave) {
            if (autoSaveTimeoutRef.current) {
                clearTimeout(autoSaveTimeoutRef.current);
            }

            autoSaveTimeoutRef.current = setTimeout(() => {
                handleSave();
            }, autoSaveDelay);
        }
    }, [sectionId, autoSave, autoSaveDelay]);

    // Handle array item change
    const handleArrayChange = useCallback((index, field, value) => {
        if (!Array.isArray(formData)) return;

        console.log('✏️ [useResumeSection] Array item changed:', { sectionId, index, field, value });

        const newArray = [...formData];
        newArray[index] = { ...newArray[index], [field]: value };

        setFormData(newArray);
        setIsDirty(true);

        if (autoSave) {
            if (autoSaveTimeoutRef.current) {
                clearTimeout(autoSaveTimeoutRef.current);
            }

            autoSaveTimeoutRef.current = setTimeout(() => {
                handleSave();
            }, autoSaveDelay);
        }
    }, [formData, sectionId, autoSave, autoSaveDelay]);

    // Add item to array
    const addItem = useCallback((item = null) => {
        if (!Array.isArray(formData)) return;

        console.log('➕ [useResumeSection] Adding item to:', sectionId);

        const defaultItem = getDefaultItem(sectionId);
        const newItem = item || defaultItem;
        const newArray = [...formData, newItem];

        setFormData(newArray);
        setIsDirty(true);

        if (autoSave) {
            handleSave();
        }

        return newArray.length - 1; // Return index of new item
    }, [formData, sectionId, autoSave]);

    // Remove item from array
    const removeItem = useCallback((index) => {
        if (!Array.isArray(formData) || index < 0 || index >= formData.length) return;

        console.log('➖ [useResumeSection] Removing item:', { sectionId, index });

        const newArray = formData.filter((_, i) => i !== index);
        setFormData(newArray);
        setIsDirty(true);

        if (autoSave) {
            handleSave();
        }
    }, [formData, sectionId, autoSave]);

    // Move item in array
    const moveItem = useCallback((fromIndex, toIndex) => {
        if (!Array.isArray(formData)) return;

        console.log('🔄 [useResumeSection] Moving item:', { sectionId, fromIndex, toIndex });

        const newArray = [...formData];
        const [removed] = newArray.splice(fromIndex, 1);
        newArray.splice(toIndex, 0, removed);

        setFormData(newArray);
        setIsDirty(true);

        if (autoSave) {
            handleSave();
        }
    }, [formData, sectionId, autoSave]);

    // Validate form data
    const validate = useCallback(() => {
        console.log('🔍 [useResumeSection] Validating:', sectionId);

        const newErrors = {};

        if (requiredFields.length > 0 && typeof formData === 'object' && !Array.isArray(formData)) {
            requiredFields.forEach(field => {
                if (!formData[field] || formData[field].toString().trim() === '') {
                    newErrors[field] = `${field} is required`;
                }
            });
        }

        // Apply custom validation rules
        Object.keys(validationRules).forEach(field => {
            const rule = validationRules[field];
            const value = formData[field];

            if (rule.required && (!value || value.toString().trim() === '')) {
                newErrors[field] = rule.message || `${field} is required`;
            }

            if (rule.minLength && value && value.length < rule.minLength) {
                newErrors[field] = rule.message || `Minimum ${rule.minLength} characters required`;
            }

            if (rule.pattern && value && !new RegExp(rule.pattern).test(value)) {
                newErrors[field] = rule.message || 'Invalid format';
            }

            if (rule.validate && typeof rule.validate === 'function') {
                const customError = rule.validate(value, formData);
                if (customError) {
                    newErrors[field] = customError;
                }
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [formData, sectionId, requiredFields, validationRules]);

    // Save data
    const handleSave = useCallback(async () => {
        if (!isDirty) {
            console.log('⏸️ [useResumeSection] No changes to save');
            return false;
        }

        // Validate before saving
        const isValid = validate();
        if (!isValid) {
            if (showNotifications) {
                toast.error('Please fix validation errors before saving');
            }
            return false;
        }

        setIsSaving(true);
        console.log('💾 [useResumeSection] Saving:', sectionId);

        try {
            // Call update callback
            if (onUpdate) {
                await onUpdate(formData);
            }

            // Call save callback
            if (onSave) {
                await onSave();
            }

            setIsDirty(false);
            setLastSaved(new Date());

            if (showNotifications) {
                toast.success(`${sectionId} saved successfully`);
            }

            console.log('✅ [useResumeSection] Save successful');
            return true;
        } catch (error) {
            console.error('❌ [useResumeSection] Save failed:', error);

            if (showNotifications) {
                toast.error('Failed to save changes');
            }

            return false;
        } finally {
            setIsSaving(false);
        }
    }, [isDirty, formData, sectionId, onUpdate, onSave, validate, showNotifications]);

    // Reset form
    const resetForm = useCallback(() => {
        console.log('🔄 [useResumeSection] Resetting form:', sectionId);

        setFormData(initialData || getDefaultData(sectionId));
        setIsDirty(false);
        setErrors({});
        setTouched({});

        if (autoSaveTimeoutRef.current) {
            clearTimeout(autoSaveSaveTimeoutRef.current);
        }
    }, [initialData, sectionId]);

    // Mark field as touched
    const markAsTouched = useCallback((field) => {
        setTouched(prev => ({ ...prev, [field]: true }));
    }, []);

    // Get field error
    const getFieldError = useCallback((field) => {
        return touched[field] ? errors[field] : null;
    }, [errors, touched]);

    // Check if field is valid
    const isFieldValid = useCallback((field) => {
        return !errors[field];
    }, [errors]);

    // Check completion status
    const getCompletionStatus = useCallback(() => {
        if (typeof formData === 'string') {
            return {
                isComplete: formData.trim().length > 0,
                percentage: formData.trim().length > 0 ? 100 : 0,
                missingFields: formData.trim().length === 0 ? ['content'] : []
            };
        }

        if (Array.isArray(formData)) {
            const hasItems = formData.length > 0;
            return {
                isComplete: hasItems,
                percentage: hasItems ? 100 : 0,
                missingFields: hasItems ? [] : ['items']
            };
        }

        const completedFields = requiredFields.filter(field =>
            formData[field] && formData[field].toString().trim().length > 0
        );

        const percentage = requiredFields.length > 0
            ? Math.round((completedFields.length / requiredFields.length) * 100)
            : Object.keys(formData).length > 0 ? 100 : 0;

        return {
            isComplete: percentage === 100,
            percentage,
            missingFields: requiredFields.filter(field =>
                !formData[field] || formData[field].toString().trim().length === 0
            )
        };
    }, [formData, requiredFields]);

    // Cleanup
    useEffect(() => {
        return () => {
            if (autoSaveTimeoutRef.current) {
                clearTimeout(autoSaveTimeoutRef.current);
            }
        };
    }, []);

    return {
        // State
        formData,
        isDirty,
        isSaving,
        errors,
        touched,
        lastSaved,

        // Actions
        handleChange,
        handleArrayChange,
        addItem,
        removeItem,
        moveItem,
        handleSave,
        resetForm,
        validate,

        // Helper functions
        getFieldError,
        isFieldValid,
        markAsTouched,
        getCompletionStatus,

        // Utility
        isArray: Array.isArray(formData),
        isString: typeof formData === 'string',
        isObject: typeof formData === 'object' && !Array.isArray(formData) && formData !== null,
        completion: getCompletionStatus()
    };
};

// Predefined validation rules for common sections
export const sectionValidationRules = {
    personalInfo: {
        firstName: { required: true, minLength: 2, message: 'First name is required' },
        lastName: { required: true, minLength: 2, message: 'Last name is required' },
        email: { required: true, pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$', message: 'Valid email is required' },
        jobTitle: { required: true, minLength: 2, message: 'Job title is required' }
    },
    experience: {
        jobTitle: { required: true, message: 'Job title is required' },
        company: { required: true, message: 'Company name is required' },
        startDate: { required: true, message: 'Start date is required' }
    },
    education: {
        degree: { required: true, message: 'Degree is required' },
        institution: { required: true, message: 'Institution is required' }
    }
};

// Predefined required fields for common sections
export const sectionRequiredFields = {
    personalInfo: ['firstName', 'lastName', 'email', 'jobTitle'],
    summary: [],
    experience: ['jobTitle', 'company', 'startDate'],
    education: ['degree', 'institution'],
    skills: [],
    projects: [],
    certifications: [],
    languages: [],
    references: []
};

export default useResumeSection;