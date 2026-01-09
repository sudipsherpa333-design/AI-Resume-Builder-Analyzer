// src/hooks/useResumeCompletion.js
import { useState, useEffect, useCallback, useMemo } from 'react';

export const useResumeCompletion = (resumeData, sections = []) => {
    const [completionStats, setCompletionStats] = useState({
        completedSections: {},
        overallScore: 0,
        completedCount: 0,
        totalRequired: 0,
        completeness: 0,
        sectionScores: {},
        qualityScore: 0,
        missingSections: [],
        suggestedImprovements: []
    });

    // Calculate completion for a specific section
    const calculateSectionCompletion = useCallback((sectionId, sectionData) => {
        if (!sectionData) return { isComplete: false, score: 0, missingFields: [] };

        let score = 0;
        let totalFields = 0;
        const missingFields = [];

        switch (sectionId) {
            case 'personalInfo':
                const requiredFields = ['firstName', 'lastName', 'email', 'jobTitle'];
                totalFields = requiredFields.length;

                requiredFields.forEach(field => {
                    if (sectionData[field] && sectionData[field].toString().trim().length > 0) {
                        score += 1;
                    } else {
                        missingFields.push(field);
                    }
                });
                break;

            case 'summary':
                if (typeof sectionData === 'string') {
                    const summary = sectionData.trim();
                    if (summary.length >= 50 && summary.length <= 500) {
                        score = 1;
                        totalFields = 1;
                    } else {
                        missingFields.push('summary');
                        totalFields = 1;
                    }
                } else {
                    missingFields.push('summary');
                    totalFields = 1;
                }
                break;

            case 'experience':
                if (Array.isArray(sectionData) && sectionData.length > 0) {
                    const validEntries = sectionData.filter(exp =>
                        exp.jobTitle && exp.company && exp.startDate
                    );
                    score = Math.min(validEntries.length, 3) / 3; // Cap at 3 entries
                    totalFields = 1;

                    if (validEntries.length === 0) {
                        missingFields.push('experience');
                    }
                } else {
                    missingFields.push('experience');
                    totalFields = 1;
                }
                break;

            case 'education':
                if (Array.isArray(sectionData) && sectionData.length > 0) {
                    const validEntries = sectionData.filter(edu =>
                        edu.degree && edu.institution
                    );
                    score = Math.min(validEntries.length, 2) / 2; // Cap at 2 entries
                    totalFields = 1;

                    if (validEntries.length === 0) {
                        missingFields.push('education');
                    }
                } else {
                    missingFields.push('education');
                    totalFields = 1;
                }
                break;

            case 'skills':
                if (Array.isArray(sectionData) && sectionData.length >= 5) {
                    score = Math.min(sectionData.length, 10) / 10; // Cap at 10 skills
                    totalFields = 1;
                } else {
                    missingFields.push('skills');
                    totalFields = 1;
                }
                break;

            default:
                // For optional sections, check if there's any data
                if (sectionData &&
                    ((Array.isArray(sectionData) && sectionData.length > 0) ||
                        (typeof sectionData === 'object' && Object.keys(sectionData).length > 0) ||
                        (typeof sectionData === 'string' && sectionData.trim().length > 0))) {
                    score = 1;
                    totalFields = 1;
                } else {
                    score = 0;
                    totalFields = 1;
                }
        }

        const isComplete = score > 0 && missingFields.length === 0;
        const normalizedScore = totalFields > 0 ? (score / totalFields) * 100 : 0;

        return {
            isComplete,
            score: Math.round(normalizedScore),
            missingFields,
            hasData: score > 0
        };
    }, []);

    // Calculate quality score based on content
    const calculateQualityScore = useCallback((resumeData) => {
        if (!resumeData) return 0;

        let qualityScore = 0;
        let maxScore = 0;

        // Check personal info completeness
        if (resumeData.personalInfo) {
            const personalInfoScore = calculateSectionCompletion('personalInfo', resumeData.personalInfo).score;
            qualityScore += personalInfoScore * 20; // 20% weight
            maxScore += 20;
        }

        // Check summary quality
        if (resumeData.summary && typeof resumeData.summary === 'string') {
            const summary = resumeData.summary.trim();
            let summaryScore = 0;

            if (summary.length >= 100 && summary.length <= 300) summaryScore += 25;
            if (summary.includes('experience') || summary.includes('skill')) summaryScore += 25;
            if (summary.split('.').length >= 2) summaryScore += 25; // Multiple sentences
            if (summary.length > 0) summaryScore += 25; // Has content

            qualityScore += summaryScore * 15; // 15% weight
            maxScore += 15;
        }

        // Check experience quality
        if (Array.isArray(resumeData.experience)) {
            let expScore = 0;
            const validEntries = resumeData.experience.filter(exp =>
                exp.jobTitle && exp.company && exp.startDate
            );

            if (validEntries.length >= 1) expScore += 25;
            if (validEntries.length >= 2) expScore += 25;
            if (validEntries.length >= 3) expScore += 25;

            // Check for descriptions
            const hasDescriptions = validEntries.some(exp =>
                exp.description && exp.description.trim().length > 0
            );
            if (hasDescriptions) expScore += 25;

            qualityScore += expScore * 30; // 30% weight
            maxScore += 30;
        }

        // Check skills
        if (Array.isArray(resumeData.skills)) {
            let skillsScore = 0;
            if (resumeData.skills.length >= 5) skillsScore += 50;
            if (resumeData.skills.length >= 10) skillsScore += 50;

            qualityScore += skillsScore * 20; // 20% weight
            maxScore += 20;
        }

        // Check education
        if (Array.isArray(resumeData.education)) {
            let eduScore = 0;
            const validEntries = resumeData.education.filter(edu =>
                edu.degree && edu.institution
            );

            if (validEntries.length >= 1) eduScore = 100;

            qualityScore += eduScore * 15; // 15% weight
            maxScore += 15;
        }

        const finalScore = maxScore > 0 ? Math.round((qualityScore / maxScore) * 100) : 0;
        console.log('📊 [useResumeCompletion] Quality score calculated:', finalScore);
        return finalScore;
    }, [calculateSectionCompletion]);

    // Calculate overall completion
    const calculateCompletion = useCallback(() => {
        if (!resumeData || !sections.length) {
            console.log('⚠️ [useResumeCompletion] No resume data or sections');
            return {
                completedSections: {},
                overallScore: 0,
                completedCount: 0,
                totalRequired: 0,
                completeness: 0,
                sectionScores: {},
                qualityScore: 0,
                missingSections: [],
                suggestedImprovements: []
            };
        }

        console.log('📊 [useResumeCompletion] Calculating completion for resume:', resumeData._id);

        const requiredSections = sections.filter(s => s.required);
        const completedSections = {};
        const sectionScores = {};
        let completedCount = 0;
        const missingSections = [];
        const suggestedImprovements = [];

        // Calculate each section
        sections.forEach(section => {
            const sectionData = resumeData[section.id];
            const completion = calculateSectionCompletion(section.id, sectionData);

            completedSections[section.id] = completion.isComplete;
            sectionScores[section.id] = completion.score;

            if (section.required) {
                if (completion.isComplete) {
                    completedCount++;
                } else {
                    missingSections.push({
                        id: section.id,
                        label: section.label,
                        missingFields: completion.missingFields
                    });
                }
            }

            // Generate suggestions for incomplete sections
            if (!completion.isComplete && completion.missingFields.length > 0) {
                const suggestion = {
                    section: section.id,
                    sectionLabel: section.label,
                    message: `Add ${completion.missingFields.join(', ')} to complete this section`,
                    priority: section.required ? 'high' : 'medium'
                };
                suggestedImprovements.push(suggestion);
            }
        });

        // Calculate overall scores
        const totalRequired = requiredSections.length;
        const completeness = totalRequired > 0 ? Math.round((completedCount / totalRequired) * 100) : 0;
        const qualityScore = calculateQualityScore(resumeData);

        // Overall score (weighted average of completion and quality)
        const overallScore = Math.round((completeness * 0.6) + (qualityScore * 0.4));

        console.log('✅ [useResumeCompletion] Completion calculated:', {
            completedCount,
            totalRequired,
            completeness,
            qualityScore,
            overallScore
        });

        return {
            completedSections,
            overallScore,
            completedCount,
            totalRequired,
            completeness,
            sectionScores,
            qualityScore,
            missingSections,
            suggestedImprovements
        };
    }, [resumeData, sections, calculateSectionCompletion, calculateQualityScore]);

    // Recalculate when resume data changes
    useEffect(() => {
        if (resumeData && sections.length) {
            const stats = calculateCompletion();
            setCompletionStats(stats);
        }
    }, [resumeData, sections, calculateCompletion]);

    // Check if specific section is complete
    const isSectionComplete = useCallback((sectionId) => {
        return completionStats.completedSections[sectionId] || false;
    }, [completionStats.completedSections]);

    // Get score for specific section
    const getSectionScore = useCallback((sectionId) => {
        return completionStats.sectionScores[sectionId] || 0;
    }, [completionStats.sectionScores]);

    // Get missing fields for section
    const getMissingFields = useCallback((sectionId) => {
        const missingSection = completionStats.missingSections.find(s => s.id === sectionId);
        return missingSection ? missingSection.missingFields : [];
    }, [completionStats.missingSections]);

    // Get next suggested action
    const getNextAction = useCallback(() => {
        if (completionStats.missingSections.length > 0) {
            return completionStats.missingSections[0];
        }
        if (completionStats.suggestedImprovements.length > 0) {
            return completionStats.suggestedImprovements[0];
        }
        return null;
    }, [completionStats.missingSections, completionStats.suggestedImprovements]);

    // Get completion progress for progress bar
    const getProgressData = useCallback(() => {
        return {
            percentage: completionStats.completeness,
            completed: completionStats.completedCount,
            total: completionStats.totalRequired,
            score: completionStats.overallScore,
            quality: completionStats.qualityScore
        };
    }, [completionStats]);

    // Check if resume is ready for submission
    const isResumeComplete = useCallback(() => {
        return completionStats.completedCount === completionStats.totalRequired;
    }, [completionStats.completedCount, completionStats.totalRequired]);

    // Calculate estimated completion time
    const getEstimatedTime = useCallback(() => {
        const missingCount = completionStats.totalRequired - completionStats.completedCount;
        return missingCount * 5; // 5 minutes per section
    }, [completionStats]);

    return {
        // Stats
        ...completionStats,

        // Helper functions
        isSectionComplete,
        getSectionScore,
        getMissingFields,
        getNextAction,
        getProgressData,
        isResumeComplete,
        getEstimatedTime,

        // Convenience properties
        progressPercentage: completionStats.completeness,
        isComplete: completionStats.completedCount === completionStats.totalRequired,
        needsAttention: completionStats.missingSections.length > 0,
        hasSuggestions: completionStats.suggestedImprovements.length > 0
    };
};

export default useResumeCompletion;