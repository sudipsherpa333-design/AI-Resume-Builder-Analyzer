import openAIService from './OpenAIService.js';
import logger from '../../utils/logger.js';

/**
 * AI Enhance Service for resume enhancement
 */
class AIEnhanceService {
    /**
     * Enhance entire resume
     */
    async enhanceResume(resumeData, options = {}) {
        try {
            const { text, jobDescription, enhancementType = 'comprehensive' } = resumeData;

            logger.info('✨ Starting resume enhancement', {
                enhancementType,
                textLength: text.length,
                hasJobDescription: !!jobDescription
            });

            let enhancedResume;

            switch (enhancementType) {
                case 'bullet_points':
                    enhancedResume = await this.enhanceBulletPointsOnly(text, jobDescription);
                    break;
                case 'summary':
                    enhancedResume = await this.enhanceSummaryOnly(text, jobDescription);
                    break;
                case 'ats_optimization':
                    enhancedResume = await this.optimizeForATS(text, jobDescription);
                    break;
                case 'comprehensive':
                default:
                    enhancedResume = await this.comprehensiveEnhancement(text, jobDescription);
            }

            return {
                success: true,
                enhancedResume,
                originalLength: text.length,
                enhancedLength: enhancedResume.length,
                changes: this.calculateChanges(text, enhancedResume),
                timestamp: new Date().toISOString()
            };

        } catch (error) {
            logger.error('❌ Resume enhancement failed:', error);
            throw error;
        }
    }

    /**
     * Comprehensive resume enhancement
     */
    async comprehensiveEnhancement(originalText, jobDescription = '') {
        // Split enhancement tasks
        const tasks = [
            this.rewriteSummary(originalText, jobDescription),
            this.enhanceExperienceSection(originalText, jobDescription),
            this.optimizeSkillsSection(originalText, jobDescription),
            this.improveActionVerbs(originalText)
        ];

        const [summary, experience, skills, verbs] = await Promise.all(tasks);

        // Reconstruct enhanced resume
        let enhancedText = originalText;

        if (summary) {
            enhancedText = this.replaceSection(enhancedText, 'summary', summary);
        }

        if (experience) {
            enhancedText = this.replaceSection(enhancedText, 'experience', experience);
        }

        if (skills) {
            enhancedText = this.replaceSection(enhancedText, 'skills', skills);
        }

        if (verbs) {
            enhancedText = this.applyVerbEnhancements(enhancedText, verbs);
        }

        return enhancedText;
    }

    /**
     * Rewrite professional summary
     */
    async rewriteSummary(resumeText, jobDescription = '') {
        const prompt = `Rewrite the professional summary/objective section of this resume to be more impactful:

ORIGINAL RESUME:
${resumeText}

${jobDescription ? `TARGET JOB DESCRIPTION:\n${jobDescription}\n\n` : ''}
Requirements:
1. Make it achievement-focused
2. Include relevant keywords
3. Keep it concise (2-3 sentences)
4. Tailor to target role if provided

Return ONLY the rewritten summary section, nothing else.`;

        const response = await openAIService.generateCompletion(prompt, {
            temperature: 0.6,
            max_tokens: 500
        });

        return response.content.trim();
    }

    /**
     * Enhance experience section
     */
    async enhanceExperienceSection(resumeText, jobDescription = '') {
        const prompt = `Enhance the experience section of this resume using the STAR method:

ORIGINAL RESUME:
${resumeText}

${jobDescription ? `TARGET JOB:\n${jobDescription}\n\n` : ''}
Enhancement requirements:
1. Convert responsibilities to achievements
2. Add quantifiable metrics
3. Use strong action verbs
4. Align with target job requirements
5. Maintain chronological order

Return ONLY the enhanced experience section.`;

        const response = await openAIService.generateCompletion(prompt, {
            temperature: 0.5,
            max_tokens: 2000
        });

        return response.content.trim();
    }

    /**
     * Optimize skills section
     */
    async optimizeSkillsSection(resumeText, jobDescription = '') {
        const prompt = `Optimize the skills section of this resume:

ORIGINAL RESUME:
${resumeText}

${jobDescription ? `TARGET JOB:\n${jobDescription}\n\n` : ''}
Requirements:
1. Categorize skills (Technical, Soft, Tools, etc.)
2. Add missing skills from job description
3. Prioritize relevant skills
4. Remove outdated or irrelevant skills
5. Format clearly

Return ONLY the optimized skills section.`;

        const response = await openAIService.generateCompletion(prompt, {
            temperature: 0.4,
            max_tokens: 1000
        });

        return response.content.trim();
    }

    /**
     * Improve action verbs
     */
    async improveActionVerbs(resumeText) {
        const prompt = `Identify and suggest better action verbs for this resume:

RESUME:
${resumeText}

Provide a mapping of weak verbs to strong verbs found in the resume.
Format as JSON: { "weakVerbs": ["managed", "responsible for"], "strongVerbs": ["led", "oversaw", "directed"] }`;

        const response = await openAIService.generateCompletion(prompt, {
            temperature: 0.3,
            max_tokens: 500
        });

        return openAIService.parseJSONResponse(response.content);
    }

    /**
     * Enhance only bullet points
     */
    async enhanceBulletPointsOnly(resumeText, jobDescription = '') {
        const prompt = `Extract and enhance all bullet points from this resume:

RESUME:
${resumeText}

${jobDescription ? `TARGET JOB:\n${jobDescription}\n\n` : ''}
Enhance each bullet point by:
1. Starting with strong action verbs
2. Adding quantifiable results
3. Using the STAR method
4. Making them achievement-oriented

Return the enhanced bullet points in the same order, one per line.`;

        const response = await openAIService.generateCompletion(prompt, {
            temperature: 0.5,
            max_tokens: 2500
        });

        return response.content;
    }

    /**
     * Optimize for ATS
     */
    async optimizeForATS(resumeText, jobDescription) {
        if (!jobDescription) {
            throw new Error('Job description is required for ATS optimization');
        }

        const prompt = `Optimize this resume specifically for ATS (Applicant Tracking System) compatibility:

RESUME:
${resumeText}

JOB DESCRIPTION:
${jobDescription}

Optimization requirements:
1. Increase keyword density from job description
2. Improve formatting for ATS parsing
3. Add missing required skills/terms
4. Maintain readability for humans
5. Ensure proper section headers

Return the fully optimized resume.`;

        const response = await openAIService.generateCompletion(prompt, {
            temperature: 0.3,
            max_tokens: 3000
        });

        return response.content;
    }

    /**
     * Replace a section in resume
     */
    replaceSection(resumeText, sectionType, newContent) {
        const sectionPatterns = {
            summary: /(?:professional summary|summary|objective)[\s\S]*?(?=\n\s*\n|$)/i,
            experience: /(?:experience|work experience|employment)[\s\S]*?(?=\n\s*\n|$)/i,
            skills: /(?:skills|technical skills|competencies)[\s\S]*?(?=\n\s*\n|$)/i
        };

        const pattern = sectionPatterns[sectionType];
        if (!pattern) return resumeText;

        const match = resumeText.match(pattern);
        if (match) {
            return resumeText.replace(match[0], newContent);
        } else {
            // If section doesn't exist, add it before education or at the end
            const educationIndex = resumeText.search(/(?:education|academic background)/i);
            if (educationIndex !== -1) {
                return resumeText.slice(0, educationIndex) +
                    `\n\n${newContent}\n\n` +
                    resumeText.slice(educationIndex);
            } else {
                return resumeText + `\n\n${newContent}`;
            }
        }
    }

    /**
     * Apply verb enhancements
     */
    applyVerbEnhancements(resumeText, verbMapping) {
        let enhancedText = resumeText;

        if (verbMapping?.weakVerbs && verbMapping?.strongVerbs) {
            for (let i = 0; i < verbMapping.weakVerbs.length; i++) {
                const weakVerb = verbMapping.weakVerbs[i];
                const strongVerb = verbMapping.strongVerbs[i] || verbMapping.strongVerbs[0];

                if (weakVerb && strongVerb) {
                    const regex = new RegExp(`\\b${weakVerb}\\b`, 'gi');
                    enhancedText = enhancedText.replace(regex, strongVerb);
                }
            }
        }

        return enhancedText;
    }

    /**
     * Calculate changes between original and enhanced
     */
    calculateChanges(original, enhanced) {
        const originalWords = original.split(/\s+/);
        const enhancedWords = enhanced.split(/\s+/);

        return {
            wordCountChange: enhancedWords.length - originalWords.length,
            percentChange: ((enhancedWords.length - originalWords.length) / originalWords.length * 100).toFixed(1),
            sectionsAdded: this.countNewSections(original, enhanced),
            bulletPointsAdded: this.countNewBulletPoints(original, enhanced)
        };
    }

    countNewSections(original, enhanced) {
        const originalSections = this.extractSections(original);
        const enhancedSections = this.extractSections(enhanced);

        return enhancedSections.filter(section =>
            !originalSections.includes(section)
        ).length;
    }

    countNewBulletPoints(original, enhanced) {
        const countBullets = (text) => (text.match(/[•\-*]\s+/g) || []).length;
        return countBullets(enhanced) - countBullets(original);
    }

    extractSections(text) {
        const sectionHeaders = [
            'summary', 'experience', 'education', 'skills',
            'projects', 'certifications', 'languages', 'awards'
        ];

        return sectionHeaders.filter(header =>
            text.toLowerCase().includes(header)
        );
    }
}

export default new AIEnhanceService();