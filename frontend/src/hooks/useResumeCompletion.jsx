// src/hooks/useResumeCompletion.js - FIXED VERSION
import { useMemo, useCallback } from 'react';

// Constants for weights and scoring
const SECTION_WEIGHTS = {
    personalInfo: 25,
    summary: 10,
    experience: 30,
    education: 15,
    skills: 20,
    projects: 5,
    certifications: 5,
    languages: 5,
    references: 5
};

const MINIMUM_REQUIREMENTS = {
    personalInfo: {
        required: ['fullName', 'email'],
        recommended: ['phone', 'location', 'jobTitle'],
        optional: ['linkedin', 'github', 'website']
    },
    experience: 1,
    education: 1,
    skills: 3,
    summary: 50,
    projects: 0,
    certifications: 0,
    languages: 0,
    references: 0
};

// Field validators for each section
const FIELD_VALIDATORS = {
    personalInfo: {
        fullName: (value) => typeof value === 'string' && value.trim().length >= 2,
        email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value?.trim() || ''),
        phone: (value) => typeof value === 'string' && value.trim().replace(/[\s\-\(\)]/g, '').length >= 7,
        jobTitle: (value) => typeof value === 'string' && value.trim().length >= 2,
        location: (value) => typeof value === 'string' && value.trim().length >= 2
    },
    experience: {
        company: (value) => typeof value === 'string' && value.trim().length >= 2,
        position: (value) => typeof value === 'string' && value.trim().length >= 2,
        startDate: (value) => value && !isNaN(Date.parse(value)),
        description: (value) => typeof value === 'string' && value.trim().length >= 20
    },
    education: {
        institution: (value) => typeof value === 'string' && value.trim().length >= 2,
        degree: (value) => typeof value === 'string' && value.trim().length >= 2,
        field: (value) => typeof value === 'string' && value.trim().length >= 2,
        startDate: (value) => value && !isNaN(Date.parse(value))
    },
    skills: {
        name: (value) => typeof value === 'string' && value.trim().length >= 2,
        level: (value) => typeof value === 'string' && ['beginner', 'intermediate', 'advanced', 'expert'].includes(value?.toLowerCase())
    }
};

// Field validation helper
const validateField = (value, validator) => {
    if (validator) {
        return validator(value);
    }

    if (value === undefined || value === null) return false;
    if (typeof value === 'string') return value.trim().length > 0;
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === 'object') return Object.keys(value).length > 0;
    return !!value;
};

// Calculate personal info completion
const calculatePersonalInfoCompletion = (personalInfo) => {
    const info = personalInfo || {};
    const required = MINIMUM_REQUIREMENTS.personalInfo.required || [];
    const recommended = MINIMUM_REQUIREMENTS.personalInfo.recommended || [];
    const optional = MINIMUM_REQUIREMENTS.personalInfo.optional || [];

    let requiredFilled = 0;
    let recommendedFilled = 0;
    let optionalFilled = 0;
    const missing = [];

    // Check required fields
    required.forEach(field => {
        const validator = FIELD_VALIDATORS.personalInfo[field];
        const isValid = validateField(info[field], validator);
        if (isValid) {
            requiredFilled++;
        } else {
            missing.push(`${field} is required`);
        }
    });

    // Check recommended fields
    recommended.forEach(field => {
        const validator = FIELD_VALIDATORS.personalInfo[field];
        if (validateField(info[field], validator)) {
            recommendedFilled++;
        }
    });

    // Check optional fields
    optional.forEach(field => {
        if (validateField(info[field])) {
            optionalFilled++;
        }
    });

    const requiredScore = required.length > 0 ? (requiredFilled / required.length) * 50 : 0;
    const recommendedScore = recommended.length > 0 ? (recommendedFilled / recommended.length) * 30 : 0;
    const optionalScore = optional.length > 0 ? (optionalFilled / optional.length) * 20 : 0;

    return {
        percentage: Math.min(Math.round(requiredScore + recommendedScore + optionalScore), 100),
        count: requiredFilled + recommendedFilled + optionalFilled,
        total: required.length + recommended.length + optional.length,
        weight: SECTION_WEIGHTS.personalInfo,
        missing,
        filled: {
            required: requiredFilled,
            recommended: recommendedFilled,
            optional: optionalFilled
        }
    };
};

// Calculate array-based section completion
const calculateArraySectionCompletion = (sectionName, items, minRequired, fieldChecks) => {
    if (!Array.isArray(items)) {
        return {
            percentage: 0,
            count: 0,
            total: minRequired,
            weight: SECTION_WEIGHTS[sectionName] || 5,
            missing: ['Invalid data format'],
            items: []
        };
    }

    let validItems = 0;
    let totalScore = 0;
    const missing = [];

    items.forEach((item, index) => {
        if (!item || typeof item !== 'object') return;

        let itemScore = 0;
        let maxScore = 0;
        const itemMissing = [];

        // Check each field
        Object.entries(fieldChecks || {}).forEach(([field, importance]) => {
            maxScore += importance === 'required' ? 2 : 1;

            const validator = FIELD_VALIDATORS[sectionName]?.[field];
            const value = item[field];
            const isValid = validateField(value, validator);

            if (importance === 'required') {
                if (isValid) {
                    itemScore += 2;
                } else {
                    itemMissing.push(`Item ${index + 1}: ${field} is required`);
                }
            } else if (isValid) {
                itemScore += 1;
            }
        });

        // If no field checks defined, check if item has any data
        if (Object.keys(fieldChecks || {}).length === 0) {
            const hasData = Object.values(item).some(val => validateField(val));
            if (hasData) {
                validItems++;
                itemScore = 1;
                maxScore = 1;
            }
        } else if (itemScore > 0) {
            validItems++;
            totalScore += (itemScore / maxScore) * 100;
        }

        if (itemMissing.length > 0) {
            missing.push(...itemMissing);
        }
    });

    // Calculate percentage
    const basePercentage = minRequired > 0
        ? Math.min((validItems / minRequired) * 100, 100)
        : (validItems > 0 ? 100 : 0);

    const completenessBonus = validItems > 0
        ? Math.min((totalScore / validItems) * 30, 30)
        : 0;

    return {
        percentage: Math.min(Math.round(basePercentage + completenessBonus), 100),
        count: validItems,
        total: minRequired,
        weight: SECTION_WEIGHTS[sectionName] || 5,
        missing,
        items: items.filter(item => item && typeof item === 'object'),
        averageCompleteness: validItems > 0 ? Math.round(totalScore / validItems) : 0
    };
};

// Calculate summary completion
const calculateSummaryCompletion = (summary) => {
    if (!summary || typeof summary !== 'string') {
        return {
            percentage: 0,
            count: 0,
            total: 1,
            weight: SECTION_WEIGHTS.summary,
            missing: ['Add a professional summary']
        };
    }

    const trimmed = summary.trim();
    const length = trimmed.length;
    let percentage = 0;

    if (length >= 200) percentage = 100;
    else if (length >= 150) percentage = 85;
    else if (length >= 100) percentage = 70;
    else if (length >= 50) percentage = 50;
    else if (length > 0) percentage = 25;

    // Bonus for containing keywords
    const keywords = ['experience', 'skills', 'professional', 'expertise', 'results', 'achieve'];
    const keywordCount = keywords.filter(keyword =>
        trimmed.toLowerCase().includes(keyword)
    ).length;

    percentage = Math.min(percentage + (keywordCount * 5), 100);

    return {
        percentage: Math.round(percentage),
        count: length > 0 ? 1 : 0,
        total: 1,
        weight: SECTION_WEIGHTS.summary,
        missing: length < 50 ? ['Summary should be at least 50 characters'] : [],
        wordCount: trimmed.split(/\s+/).length
    };
};

// Calculate ATS score
const calculateATSscore = (sections) => {
    let score = 0;
    const maxScore = 100;

    // 1. Contact Info (15 points)
    const contactScore = sections.personalInfo?.percentage >= 90 ? 15 :
        sections.personalInfo?.percentage >= 70 ? 10 :
            sections.personalInfo?.percentage >= 50 ? 5 : 0;
    score += contactScore;

    // 2. Experience (25 points)
    const expScore = sections.experience?.percentage >= 90 ? 25 :
        sections.experience?.percentage >= 70 ? 20 :
            sections.experience?.percentage >= 50 ? 15 :
                sections.experience?.percentage >= 30 ? 10 : 5;
    score += expScore;

    // 3. Skills (20 points)
    const skillsCount = sections.skills?.count || 0;
    const skillsScore = skillsCount >= 10 ? 20 :
        skillsCount >= 7 ? 15 :
            skillsCount >= 5 ? 12 :
                skillsCount >= 3 ? 8 : 5;
    score += skillsScore;

    // 4. Education (15 points)
    const eduScore = sections.education?.percentage >= 90 ? 15 :
        sections.education?.percentage >= 70 ? 12 :
            sections.education?.percentage >= 50 ? 8 :
                sections.education?.percentage >= 30 ? 5 : 2;
    score += eduScore;

    // 5. Summary (10 points)
    const summaryScore = sections.summary?.percentage >= 90 ? 10 :
        sections.summary?.percentage >= 70 ? 8 :
            sections.summary?.percentage >= 50 ? 6 :
                sections.summary?.percentage >= 30 ? 4 : 2;
    score += summaryScore;

    // 6. Keywords & Formatting (15 points)
    const formattingScore = score >= 70 ? 15 :
        score >= 50 ? 10 :
            score >= 30 ? 5 : 2;
    score += formattingScore;

    return Math.min(Math.round((score / maxScore) * 100), 100);
};

// Generate contextual suggestions
const generateSuggestions = (sections) => {
    const suggestions = [];

    // Priority 1: Critical missing sections
    if (sections.personalInfo?.percentage < 70) {
        suggestions.push('Complete your personal information (name, email, job title)');
    }

    if (sections.experience?.percentage < 80) {
        const needed = MINIMUM_REQUIREMENTS.experience - (sections.experience?.count || 0);
        if (needed > 0) {
            suggestions.push(`Add ${needed} work experience${needed > 1 ? 's' : ''}`);
        } else {
            suggestions.push('Enhance your work experience with more details');
        }
    }

    if (sections.skills?.percentage < 80) {
        const needed = MINIMUM_REQUIREMENTS.skills - (sections.skills?.count || 0);
        if (needed > 0) {
            suggestions.push(`Add ${needed} more skill${needed > 1 ? 's' : ''}`);
        } else {
            suggestions.push('Add proficiency levels to your skills');
        }
    }

    if (sections.summary?.percentage < 60) {
        suggestions.push('Write a compelling professional summary (50+ characters)');
    }

    // Priority 2: Enhancement suggestions
    if (sections.personalInfo?.percentage >= 70 && sections.personalInfo?.percentage < 90) {
        suggestions.push('Add your LinkedIn profile and location for better networking');
    }

    if (sections.experience?.percentage >= 80 && sections.experience?.averageCompleteness < 80) {
        suggestions.push('Add metrics and achievements to your work experience');
    }

    if (sections.skills?.count >= 3 && sections.skills?.percentage < 90) {
        suggestions.push('Categorize your skills (technical, soft, tools)');
    }

    // Priority 3: Optional improvements
    if (sections.education?.percentage < 50) {
        suggestions.push('Complete your education details');
    }

    return suggestions.slice(0, 5);
};

// Progress utilities
const getProgressColor = (percentage) => {
    if (percentage >= 90) return '#10b981';
    if (percentage >= 75) return '#22c55e';
    if (percentage >= 50) return '#f59e0b';
    if (percentage >= 25) return '#f97316';
    return '#ef4444';
};

const getProgressCSS = (percentage) => {
    if (percentage >= 90) return 'bg-emerald-500 text-white';
    if (percentage >= 75) return 'bg-green-500 text-white';
    if (percentage >= 50) return 'bg-yellow-500 text-yellow-900';
    if (percentage >= 25) return 'bg-orange-500 text-orange-900';
    return 'bg-red-500 text-white';
};

const getProgressGradient = (percentage) => {
    if (percentage >= 90) return 'from-emerald-500 to-green-500';
    if (percentage >= 75) return 'from-green-500 to-yellow-500';
    if (percentage >= 50) return 'from-yellow-500 to-orange-500';
    if (percentage >= 25) return 'from-orange-500 to-red-500';
    return 'from-red-500 to-rose-500';
};

const getProgressLabel = (percentage) => {
    if (percentage >= 90) return 'Excellent';
    if (percentage >= 75) return 'Good';
    if (percentage >= 50) return 'Fair';
    if (percentage >= 25) return 'Needs Work';
    return 'Incomplete';
};

// Main hook function
const useResumeCompletion = (resumeData) => {
    // Create safe data
    const safeResumeData = useMemo(() => {
        if (!resumeData || typeof resumeData !== 'object') {
            return {
                personalInfo: {},
                experience: [],
                education: [],
                skills: [],
                projects: [],
                certifications: [],
                languages: [],
                references: [],
                customSections: [],
                summary: ''
            };
        }

        const merged = {
            personalInfo: {},
            experience: [],
            education: [],
            skills: [],
            projects: [],
            certifications: [],
            languages: [],
            references: [],
            customSections: [],
            summary: ''
        };

        // Merge with validation
        Object.keys(merged).forEach(key => {
            if (key === 'personalInfo') {
                merged[key] = {
                    ...merged[key],
                    ...(resumeData[key] || {})
                };
            } else if (Array.isArray(resumeData[key])) {
                merged[key] = resumeData[key];
            } else if (typeof resumeData[key] === 'string') {
                merged[key] = resumeData[key];
            } else if (resumeData[key] && typeof resumeData[key] === 'object' && !Array.isArray(resumeData[key])) {
                merged[key] = resumeData[key];
            }
        });

        return merged;
    }, [resumeData]);

    // Calculate completion
    const completion = useMemo(() => {
        const sections = {};

        // Calculate each section
        sections.personalInfo = calculatePersonalInfoCompletion(safeResumeData.personalInfo);

        sections.experience = calculateArraySectionCompletion(
            'experience',
            safeResumeData.experience,
            MINIMUM_REQUIREMENTS.experience,
            {
                company: 'required',
                position: 'required',
                startDate: 'required',
                description: 'recommended'
            }
        );

        sections.education = calculateArraySectionCompletion(
            'education',
            safeResumeData.education,
            MINIMUM_REQUIREMENTS.education,
            {
                institution: 'required',
                degree: 'required',
                field: 'recommended',
                startDate: 'recommended'
            }
        );

        sections.skills = calculateArraySectionCompletion(
            'skills',
            safeResumeData.skills,
            MINIMUM_REQUIREMENTS.skills,
            {
                name: 'required',
                level: 'recommended',
                category: 'optional'
            }
        );

        sections.summary = calculateSummaryCompletion(safeResumeData.summary);

        // Calculate weighted overall score
        let weightedSum = 0;
        let totalWeight = 0;

        Object.values(sections).forEach(section => {
            weightedSum += (section.percentage / 100) * section.weight;
            totalWeight += section.weight;
        });

        const overallPercentage = totalWeight > 0
            ? Math.round((weightedSum / totalWeight) * 100)
            : 0;

        // Generate suggestions
        const suggestions = generateSuggestions(sections);

        // Get missing fields
        const missingFields = [];
        Object.values(sections).forEach(section => {
            if (section.missing && section.missing.length > 0) {
                missingFields.push(...section.missing);
            }
        });

        // Calculate ATS score
        const atsScore = calculateATSscore(sections);

        // Determine progress level
        const getProgressLevel = (percentage) => {
            if (percentage >= 90) return 'excellent';
            if (percentage >= 75) return 'good';
            if (percentage >= 50) return 'fair';
            if (percentage >= 25) return 'needs-work';
            return 'empty';
        };

        const progressLevel = getProgressLevel(overallPercentage);

        return {
            overall: overallPercentage,
            percentage: overallPercentage,
            sections,
            missingFields: [...new Set(missingFields)],
            suggestions,
            isComplete: overallPercentage >= 75,
            progressLevel,
            estimatedATS: atsScore,
            totalScore: Math.round(weightedSum),
            maxPossible: Math.round(totalWeight * 100),
            calculatedAt: new Date().toISOString()
        };
    }, [safeResumeData]);

    // Helper function to check if field is filled
    const isFieldFilled = useCallback((section, fieldName) => {
        if (section === 'personalInfo') {
            const validator = FIELD_VALIDATORS.personalInfo[fieldName];
            return validateField(safeResumeData.personalInfo?.[fieldName], validator);
        }

        const sectionData = safeResumeData[section];
        if (Array.isArray(sectionData)) {
            return sectionData.some(item => {
                const validator = FIELD_VALIDATORS[section]?.[fieldName];
                return validateField(item?.[fieldName], validator);
            });
        }

        return false;
    }, [safeResumeData]);

    // Get section completion
    const getSectionCompletion = useCallback((sectionName) => {
        return completion.sections[sectionName] || {
            percentage: 0,
            count: 0,
            total: 0,
            weight: SECTION_WEIGHTS[sectionName] || 5,
            missing: [],
            items: []
        };
    }, [completion]);

    // Get next action
    const getNextAction = useCallback(() => {
        if (completion.suggestions.length > 0) {
            return completion.suggestions[0];
        }
        if (completion.percentage >= 90) {
            return 'Your resume is ready! Consider adding certifications or languages.';
        }
        return 'Start by completing your personal information.';
    }, [completion]);

    // Get section breakdown
    const getSectionBreakdown = useCallback(() => {
        return Object.entries(completion.sections).map(([name, data]) => ({
            name,
            label: name.charAt(0).toUpperCase() + name.slice(1),
            percentage: data?.percentage || 0,
            count: data?.count || 0,
            total: data?.total || 0,
            weight: data?.weight || 0,
            score: ((data?.percentage || 0) / 100) * (data?.weight || 0),
            color: getProgressColor(data?.percentage || 0),
            status: getProgressLabel(data?.percentage || 0),
            cssClass: getProgressCSS(data?.percentage || 0),
            gradient: getProgressGradient(data?.percentage || 0)
        }));
    }, [completion]);

    // Get completion analytics
    const getAnalytics = useCallback(() => {
        const sections = completion.sections || {};
        const filledSections = Object.values(sections).filter(s => s?.percentage >= 70).length;
        const totalSections = Object.keys(sections).length;

        const scores = Object.values(sections).map(s => s?.percentage || 0);
        const avgSectionScore = scores.length > 0
            ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
            : 0;

        return {
            filledSections,
            totalSections,
            sectionCompletionRate: totalSections > 0 ? Math.round((filledSections / totalSections) * 100) : 0,
            averageSectionScore: avgSectionScore,
            missingFieldsCount: completion.missingFields?.length || 0,
            suggestionCount: completion.suggestions?.length || 0,
            atsCompatibility: completion.estimatedATS || 0,
            overallScore: completion.percentage || 0
        };
    }, [completion]);

    // Quick checks
    const isPersonalInfoComplete = useMemo(() =>
        completion.sections?.personalInfo?.percentage >= 70,
        [completion]
    );

    const isExperienceComplete = useMemo(() =>
        completion.sections?.experience?.percentage >= 80,
        [completion]
    );

    const isEducationComplete = useMemo(() =>
        completion.sections?.education?.percentage >= 70,
        [completion]
    );

    const isSkillsComplete = useMemo(() =>
        completion.sections?.skills?.percentage >= 80,
        [completion]
    );

    const hasSummary = useMemo(() =>
        completion.sections?.summary?.percentage >= 50,
        [completion]
    );

    // Completed sections count
    const completedSections = useMemo(() => {
        const sections = completion.sections || {};
        return Object.values(sections).filter(s => s?.percentage >= 70).length;
    }, [completion]);

    const totalSections = useMemo(() => {
        return Object.keys(completion.sections || {}).length;
    }, [completion]);

    return {
        // Main completion object
        ...completion,

        // Helper methods
        getSectionCompletion,
        isFieldFilled,
        getProgressColor: useCallback(getProgressColor, []),
        getProgressCSS: useCallback(getProgressCSS, []),
        getProgressGradient: useCallback(getProgressGradient, []),
        getProgressLabel: useCallback(getProgressLabel, []),
        getNextAction,
        getSectionBreakdown,
        getAnalytics,

        // Quick checks
        isPersonalInfoComplete,
        isExperienceComplete,
        isEducationComplete,
        isSkillsComplete,
        hasSummary,

        // Section-specific completion
        personalInfo: completion.sections?.personalInfo || {},
        experience: completion.sections?.experience || {},
        education: completion.sections?.education || {},
        skills: completion.sections?.skills || {},
        summary: completion.sections?.summary || {},

        // For UI display
        completedSections,
        totalSections
    };
};

export default useResumeCompletion;