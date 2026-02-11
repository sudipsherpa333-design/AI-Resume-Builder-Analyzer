// backend/src/service/aiService.js - COMPLETE FIXED VERSION
import OpenAI from 'openai';
import { createWorker } from 'tesseract.js';
import PDFParser from 'pdf-parse';
import fetch from 'node-fetch';
import winston from 'winston';
import mongoose from 'mongoose';

// Logger setup
const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'logs/ai-service.log' })
    ]
});

// Initialize OpenAI client
let openai;
try {
    openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY || process.env.AI_API_KEY,
    });
    logger.info('✅ OpenAI client initialized');
} catch (error) {
    logger.error('❌ Failed to initialize OpenAI client:', error);
    openai = null;
}

// System Prompt (for all AI calls)
const SYSTEM_PROMPT = `You are an elite technical recruiter and professional resume writer with 15+ years experience optimizing resumes for ATS systems (like Taleo, Workday, iCIMS) and human hiring managers in tech, data, product, and marketing roles.

Core rules for ALL output:
- Start bullet points with powerful action verbs: Led, Managed, Engineered, Developed, Optimized, Increased, Reduced, Designed, Implemented, Architected, Launched, Achieved, Streamlined, Boosted, Automated, etc.
- ALWAYS quantify achievements with realistic metrics (%, $, team size, time saved, revenue impact) — invent plausible numbers only if no data provided, but keep them believable (e.g., 20-45%, $50K–$500K, 15-40% improvement).
- Weave in relevant keywords naturally — do NOT keyword stuff or list them at the end.
- Tone: confident, professional, results-oriented. NO first-person pronouns (I, my, me) in bullets or summaries.
- Keep bullets concise: 1 line ideal, max 140 characters.
- Output ONLY the requested content — no introductions, no explanations, no markdown unless asked.
- If input is weak/empty, generate strong, realistic content based on typical roles.`;

class AIService {
    // Extract text from PDF
    static async extractTextFromPDF(pdfBuffer) {
        try {
            logger.info('📄 Extracting text from PDF...');
            const data = await PDFParser(pdfBuffer);
            const text = data.text;

            logger.info(`✅ PDF text extracted, length: ${text.length} characters`);
            return text;
        } catch (error) {
            logger.error('❌ PDF extraction error:', error);
            throw new Error('Failed to extract text from PDF');
        }
    }

    // Extract resume from LinkedIn profile
    static async extractResumeFromLinkedIn(linkedinUrl) {
        try {
            logger.info(`🔗 Extracting resume from LinkedIn: ${linkedinUrl}`);

            // Enhanced LinkedIn extraction with AI
            const prompt = `Extract professional information from this LinkedIn profile for resume building:
LinkedIn URL: ${linkedinUrl}

Extract as structured JSON with:
1. personalInfo: {fullName, email, phone, location, linkedin, github, portfolio, summary}
2. experience: array of {company, position, duration, location, achievements[]}
3. education: array of {school, degree, field, duration, gpa, achievements[]}
4. skills: array of strings (technical + soft skills)
5. certifications: array of {name, issuer, date, url}
6. projects: array of {name, description, techStack[], duration, achievements[]}

Important: Return ONLY valid JSON, no additional text.`;

            const completion = await openai.chat.completions.create({
                model: process.env.OPENAI_MODEL || "gpt-4-turbo-preview",
                messages: [
                    { role: "system", content: "You are a professional data extractor for LinkedIn profiles. Extract structured resume data. Return ONLY valid JSON." },
                    { role: "user", content: prompt }
                ],
                temperature: 0.3,
                max_tokens: 2000,
                response_format: { type: "json_object" }
            });

            const response = completion.choices[0]?.message?.content;
            let linkedinData;

            try {
                linkedinData = JSON.parse(response);
                logger.info('✅ LinkedIn data extracted successfully');
            } catch (parseError) {
                logger.warn('Failed to parse LinkedIn data, using fallback:', parseError);
                linkedinData = this.getMockLinkedInData(linkedinUrl);
            }

            return linkedinData;

        } catch (error) {
            logger.error('❌ LinkedIn extraction error:', error);
            // Return mock data as fallback
            return this.getMockLinkedInData(linkedinUrl);
        }
    }

    // AI Enhancement with professional prompts
    static async aiEnhance(resumeData, specificSection = null, jobDescription = '') {
        try {
            logger.info('🤖 Starting AI enhancement...', {
                section: specificSection,
                hasJD: !!jobDescription
            });

            if (!openai) {
                throw new Error('OpenAI client not initialized');
            }

            // Validate resume data
            if (!resumeData || typeof resumeData !== 'object') {
                throw new Error('Invalid resume data provided');
            }

            // Extract keywords from job description
            const jdKeywords = jobDescription ? await this.extractKeywordsFromJD(jobDescription) : [];

            let enhancedData = JSON.parse(JSON.stringify(resumeData));

            if (specificSection) {
                // Enhance specific section
                switch (specificSection) {
                    case 'summary':
                        enhancedData.summary = await this.enhanceSummary(enhancedData.summary, enhancedData.targetRole, jdKeywords);
                        break;

                    case 'experience':
                        enhancedData.experience = await this.enhanceExperience(enhancedData.experience, jdKeywords);
                        break;

                    case 'skills':
                        enhancedData.skills = await this.enhanceSkills(enhancedData.skills, enhancedData.targetRole, jdKeywords);
                        break;

                    case 'bullets':
                        enhancedData = await this.enhanceAllBullets(enhancedData, jdKeywords);
                        break;

                    default:
                        // Enhance everything
                        enhancedData.summary = await this.enhanceSummary(enhancedData.summary, enhancedData.targetRole, jdKeywords);
                        enhancedData.experience = await this.enhanceExperience(enhancedData.experience, jdKeywords);
                        enhancedData.skills = await this.enhanceSkills(enhancedData.skills, enhancedData.targetRole, jdKeywords);
                }
            } else {
                // Enhance full resume
                enhancedData.summary = await this.enhanceSummary(enhancedData.summary, enhancedData.targetRole, jdKeywords);
                enhancedData.experience = await this.enhanceExperience(enhancedData.experience, jdKeywords);
                enhancedData.skills = await this.enhanceSkills(enhancedData.skills, enhancedData.targetRole, jdKeywords);
            }

            // Generate AI suggestions
            const suggestions = await this.generateATSSuggestions(enhancedData, jobDescription);

            // Calculate ATS score
            const atsScore = await this.calculateATSScore(enhancedData, jdKeywords);

            // Add AI metadata
            enhancedData.aiEnhancements = {
                applied: true,
                lastEnhanced: new Date().toISOString(),
                suggestions: suggestions.slice(0, 5),
                keywords: jdKeywords,
                atsScore: atsScore,
                version: '2026-pro'
            };

            logger.info('✅ AI enhancement completed successfully', {
                section: specificSection,
                atsScore: atsScore
            });

            return enhancedData;

        } catch (error) {
            logger.error('❌ AI enhancement error:', error);

            // Return original data with error flag
            return {
                ...resumeData,
                aiEnhancements: {
                    applied: false,
                    error: error.message,
                    lastEnhanced: new Date().toISOString()
                }
            };
        }
    }

    // Generate professional summary with professional prompt
    static async generateSummary(experience = [], targetRole = '', skills = [], jdKeywords = []) {
        try {
            logger.info('📝 Generating professional summary...');

            const prompt = `Rewrite and significantly improve this professional summary to make it compelling, ATS-friendly, and tailored to the target role.

Experience context: ${JSON.stringify(experience.slice(0, 2))}
Target role: ${targetRole || 'professional in relevant field'}
Key skills: ${skills.slice(0, 8).join(', ') || 'none provided'}
Key keywords to weave in naturally: ${jdKeywords.slice(0, 8).join(', ') || 'none provided'}

Requirements:
- Length: 90–160 words (3–5 strong sentences)
- Start with strong professional identity + years/expertise
- Highlight 2–4 key achievements with metrics
- End with value proposition or career goal
- Include top relevant skills and keywords naturally
- Confident, executive tone — no fluff
- Output ONLY the improved summary paragraph(s)

Example good output:
Senior Software Engineer with 8+ years of experience building scalable applications and leading technical teams. Expert in microservices architecture, cloud infrastructure (AWS, Azure), and modern frameworks (React, Node.js, Python). Led development of enterprise systems serving 500K+ users, improving performance by 45% and reducing costs by 30%. Proven track record in Agile environments, CI/CD implementation, and mentoring junior developers. Seeking to leverage technical leadership and innovation skills in a senior engineering role.`;

            const summary = await this.callAI(prompt);
            logger.info('✅ Summary generated successfully');
            return summary;

        } catch (error) {
            logger.error('❌ Summary generation error:', error);
            throw error;
        }
    }

    // Generate bullet points with professional prompt
    static async generateBulletPoints(experienceItem, targetRole = '', jdKeywords = []) {
        try {
            logger.info('📋 Generating bullet points for experience...');

            const prompt = `Generate 4 high-impact, ATS-optimized achievement bullet points for this experience.

Job Title: ${experienceItem.position || 'Relevant Position'}
Company: ${experienceItem.company || 'Company'}
Original description / responsibilities: ${experienceItem.description || `No description provided — generate realistic achievements for a typical ${targetRole || 'professional'} role`}

Target role / industry focus: ${targetRole || 'similar position'}
Key keywords/phrases to include naturally when relevant: ${jdKeywords.slice(0, 10).join(', ') || 'none provided'}

Follow these strict rules:
- Each bullet must start with a strong action verb
- Focus on impact/results, not just duties
- Quantify EVERYTHING possible (use realistic numbers: 20-60% improvements, $ figures, team sizes 5-15, etc.)
- Make achievements specific, believable, and impressive
- Incorporate 3-6 of the provided keywords naturally if they fit the context
- Output format: exactly 4 lines, each starting with • followed by space

Example good output:
• Engineered scalable microservices architecture using Node.js and Kubernetes, reducing deployment time by 45% and improving system reliability
• Led cross-functional team of 8 to launch new feature set, increasing user engagement by 32% within first quarter
• Optimized CI/CD pipelines with GitHub Actions and Terraform, cutting release cycles from 2 weeks to 3 days
• Automated data processing workflows with Python and Apache Spark, saving 120+ engineering hours per month`;

            const response = await this.callAI(prompt);

            // Parse bullets from response
            const bulletPoints = response
                .split('\n')
                .map(line => line.trim())
                .filter(line => line.startsWith('•'))
                .map(line => line.replace(/^•\s*/, ''))
                .filter(line => line.length > 0)
                .slice(0, 4);

            logger.info(`✅ ${bulletPoints.length} bullet points generated successfully`);
            return bulletPoints;

        } catch (error) {
            logger.error('❌ Bullet point generation error:', error);
            throw error;
        }
    }

    // Extract keywords from job description using AI
    static async extractKeywordsFromJD(jobDescription) {
        try {
            if (!jobDescription || jobDescription.trim().length < 50) {
                return [];
            }

            logger.info('🔑 Extracting keywords from job description...');

            const prompt = `From this job description, extract the 18–25 most important keywords, skills, tools, technologies, and phrases that candidates should include in their resume to pass ATS filters and impress recruiters.

Job Description:
${jobDescription.substring(0, 3000)}${jobDescription.length > 3000 ? '...' : ''}

Rules:
- Include both hard skills (e.g., React, Python, AWS Lambda) and multi-word phrases (e.g., Agile Methodology, CI/CD Pipelines, Stakeholder Management)
- Prioritize exact wording from the JD when possible
- Focus on requirements, responsibilities, and "nice-to-have" items
- Ignore generic words like "team player", "communication skills" unless heavily emphasized
- Output ONLY a comma-separated list — no explanations, no bullets, no numbering

Example output: React, TypeScript, Node.js, AWS, Docker, Kubernetes, CI/CD, Agile, RESTful APIs, GraphQL, Microservices, Git, Jira, Unit Testing, Performance Optimization`;

            const response = await this.callAI(prompt, false, 0.3);

            // Parse comma-separated list
            const keywords = response
                .split(',')
                .map(k => k.trim())
                .filter(k => k.length > 0 && k.length < 50)
                .slice(0, 25);

            logger.info(`✅ ${keywords.length} keywords extracted from job description`);
            return keywords;

        } catch (error) {
            logger.error('❌ Keyword extraction error:', error);
            return this.getDefaultKeywords();
        }
    }

    // Analyze ATS compatibility
    static async analyzeATS(resumeData, jobDescription = '') {
        try {
            logger.info('🔍 Analyzing ATS compatibility...');

            const jdKeywords = jobDescription ? await this.extractKeywordsFromJD(jobDescription) : [];
            const atsScore = await this.calculateATSScore(resumeData, jdKeywords);
            const suggestions = await this.generateATSSuggestions(resumeData, jobDescription);

            const analysis = {
                score: atsScore,
                suggestions: suggestions.slice(0, 6),
                keywords: jdKeywords,
                strengths: [],
                weaknesses: []
            };

            // Analyze strengths and weaknesses
            const { strengths, weaknesses } = this.analyzeResumeStrengths(resumeData, jdKeywords);
            analysis.strengths = strengths;
            analysis.weaknesses = weaknesses;

            logger.info(`✅ ATS analysis completed. Score: ${atsScore}`);
            return analysis;

        } catch (error) {
            logger.error('❌ ATS analysis error:', error);
            return this.getDefaultATSResult();
        }
    }

    // Suggest keywords based on target role and job description
    static async suggestKeywords(targetRole = '', jobDescription = '') {
        try {
            logger.info('🔑 Suggesting keywords...');

            const jdKeywords = jobDescription ? await this.extractKeywordsFromJD(jobDescription) : [];
            const roleKeywords = this.getRoleKeywords(targetRole);

            // Combine and deduplicate
            const allKeywords = [...new Set([...jdKeywords, ...roleKeywords])];

            logger.info(`✅ ${allKeywords.length} keywords suggested`);
            return allKeywords.slice(0, 20);

        } catch (error) {
            logger.error('❌ Keyword suggestion error:', error);
            return this.getRoleKeywords(targetRole).slice(0, 10);
        }
    }

    // ==================== ENHANCEMENT METHODS ====================

    static async enhanceSummary(currentSummary, targetRole, jdKeywords) {
        try {
            const prompt = `Rewrite and significantly improve this professional summary:
            
Current summary: ${currentSummary || 'No strong summary provided — create a fresh, high-quality one'}

Target role: ${targetRole || 'professional in relevant field'}
Key keywords to weave in naturally: ${jdKeywords.slice(0, 8).join(', ') || 'none provided'}

Requirements:
- Length: 90–160 words (3–5 strong sentences)
- Start with strong professional identity + years/expertise
- Highlight 2–4 key achievements with metrics
- End with value proposition or career goal
- Include top relevant skills and keywords naturally
- Confident, executive tone — no fluff
- Output ONLY the improved summary paragraph(s)`;

            return await this.callAI(prompt);
        } catch (error) {
            logger.error('Summary enhancement failed:', error);
            return currentSummary;
        }
    }

    static async enhanceExperience(experience, jdKeywords) {
        if (!Array.isArray(experience) || experience.length === 0) {
            return experience;
        }

        const enhancedExperience = [];

        for (const exp of experience) {
            try {
                const enhancedExp = { ...exp };

                if (!exp.achievements || exp.achievements.length === 0) {
                    enhancedExp.achievements = await this.generateBulletPoints(exp, '', jdKeywords);
                } else {
                    enhancedExp.achievements = await this.enhanceBullets(exp.achievements, jdKeywords, '');
                }

                enhancedExperience.push(enhancedExp);
            } catch (error) {
                logger.error('Failed to enhance experience item:', error);
                enhancedExperience.push(exp);
            }
        }

        return enhancedExperience;
    }

    static async enhanceSkills(skills, targetRole, jdKeywords) {
        let enhancedSkills = Array.isArray(skills) ? [...skills] : [];

        // Add role-specific keywords
        const roleKeywords = this.getRoleKeywords(targetRole);
        roleKeywords.forEach(keyword => {
            if (!enhancedSkills.includes(keyword)) {
                enhancedSkills.push(keyword);
            }
        });

        // Add job description keywords
        jdKeywords.forEach(keyword => {
            if (!enhancedSkills.includes(keyword) && keyword.length > 3) {
                enhancedSkills.push(keyword);
            }
        });

        // Remove duplicates and sort
        enhancedSkills = [...new Set(enhancedSkills)];
        enhancedSkills.sort();

        return enhancedSkills.slice(0, 20);
    }

    // ==================== HELPER METHODS ====================

    static async callAI(prompt, parseJSON = false, temperature = 0.7) {
        if (!openai) {
            throw new Error('AI service is not available');
        }

        try {
            const completion = await openai.chat.completions.create({
                model: process.env.OPENAI_MODEL || "gpt-4-turbo-preview",
                messages: [
                    { role: "system", content: SYSTEM_PROMPT },
                    { role: "user", content: prompt }
                ],
                temperature: temperature,
                max_tokens: 2000
            });

            const response = completion.choices[0]?.message?.content?.trim();

            if (!response) {
                throw new Error('No response from AI');
            }

            if (parseJSON) {
                try {
                    return JSON.parse(response);
                } catch (error) {
                    logger.warn('Failed to parse AI response as JSON:', error);
                    // Try to extract JSON from text
                    const jsonMatch = response.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
                    if (jsonMatch) {
                        return JSON.parse(jsonMatch[0]);
                    }
                    return response;
                }
            }

            return response;

        } catch (error) {
            logger.error('AI call failed:', error);

            // Check for rate limiting or quota issues
            if (error.status === 429) {
                throw new Error('AI service rate limited. Please try again in a moment.');
            } else if (error.status === 401) {
                throw new Error('AI service authentication failed. Please contact support.');
            } else if (error.status === 503) {
                throw new Error('AI service temporarily unavailable. Please try again later.');
            }

            throw error;
        }
    }

    static async enhanceAllBullets(resumeData, jdKeywords) {
        const enhanced = JSON.parse(JSON.stringify(resumeData));

        // Enhance experience bullets
        if (Array.isArray(enhanced.experience)) {
            for (let i = 0; i < enhanced.experience.length; i++) {
                const exp = enhanced.experience[i];
                if (exp.description || exp.achievements) {
                    const bullets = await this.enhanceBullets(
                        exp.achievements || [exp.description],
                        jdKeywords,
                        enhanced.targetRole
                    );
                    enhanced.experience[i].achievements = bullets;
                }
            }
        }

        // Enhance project bullets
        if (Array.isArray(enhanced.projects)) {
            for (let i = 0; i < enhanced.projects.length; i++) {
                const project = enhanced.projects[i];
                if (project.description || project.achievements) {
                    const bullets = await this.enhanceBullets(
                        project.achievements || [project.description],
                        jdKeywords,
                        enhanced.targetRole
                    );
                    enhanced.projects[i].achievements = bullets;
                }
            }
        }

        return enhanced;
    }

    static async enhanceBullets(bullets, jdKeywords, targetRole = '') {
        if (!Array.isArray(bullets) || bullets.length === 0) {
            return [];
        }

        const prompt = `Rewrite and strengthen these existing bullet points to be more powerful, quantifiable, and ATS-optimized.

Original bullets:
${bullets.join('\n') || 'No bullets provided — generate 3 strong ones based on typical responsibilities'}

Target role context: ${targetRole || 'professional role'}
Keywords to incorporate naturally: ${jdKeywords.slice(0, 8).join(', ') || 'none'}

Rules:
- Improve weak verbs → strong action verbs
- Add realistic metrics/impact where missing
- Make more results-focused
- Keep each under 140 characters
- Output ONLY the rewritten bullets, one per line starting with •`;

        const response = await this.callAI(prompt);

        return response
            .split('\n')
            .map(line => line.trim())
            .filter(line => line.startsWith('•'))
            .map(line => line.replace(/^•\s*/, ''))
            .filter(line => line.length > 0)
            .slice(0, bullets.length);
    }

    static async generateATSSuggestions(resumeData, jobDescription = '') {
        try {
            const jdKeywords = jobDescription ? await this.extractKeywordsFromJD(jobDescription) : [];
            const resumeText = JSON.stringify(resumeData).substring(0, 4000);

            const prompt = `Analyze this resume against the job description and provide 4–6 specific, actionable improvement suggestions to boost ATS score and recruiter appeal.

Resume content summary:
${resumeText}

Job Description keywords/phrases: ${jdKeywords.join(', ')}

Current issues to consider: weak verbs, missing metrics, low keyword match, etc.

Output format: numbered list of suggestions only, e.g.:
1. Replace "worked on" with stronger verbs like "Engineered" or "Optimized" in experience section
2. Add quantifiable metrics to at least 70% of bullets (e.g., "increased conversion by 35%")
3. Incorporate missing key skills: Kubernetes, Terraform, GraphQL`;

            const response = await this.callAI(prompt, false, 0.3);

            // Parse numbered list
            const suggestions = response
                .split('\n')
                .map(line => line.trim())
                .filter(line => /^\d+\./.test(line))
                .map(line => line.replace(/^\d+\.\s*/, ''))
                .filter(line => line.length > 0)
                .slice(0, 6);

            return suggestions.length > 0 ? suggestions : ['Review and strengthen action verbs in bullet points'];

        } catch (error) {
            logger.error('AI suggestion generation failed:', error);
            return ['Review and strengthen action verbs in bullet points'];
        }
    }

    static async calculateATSScore(resumeData, jdKeywords = []) {
        let score = 0;

        // 1. Check for metrics (20 points)
        if (this.checkForMetrics(resumeData)) score += 20;

        // 2. Check for strong action verbs (15 points)
        if (this.checkForStrongVerbs(resumeData)) score += 15;

        // 3. Keyword match (25 points)
        const keywordScore = this.calculateKeywordScore(resumeData, jdKeywords);
        score += keywordScore;

        // 4. Structure (20 points)
        if (resumeData.summary && resumeData.summary.length > 50) score += 5;
        if (resumeData.experience && resumeData.experience.length >= 2) score += 10;
        if (resumeData.skills && resumeData.skills.length >= 8) score += 5;

        // 5. Length (10 points)
        const wordCount = this.getResumeText(resumeData).split(/\s+/).length;
        if (wordCount >= 400 && wordCount <= 800) score += 10;
        else if (wordCount >= 300 && wordCount <= 1000) score += 5;

        // 6. Format consistency (10 points)
        if (this.checkFormatConsistency(resumeData)) score += 10;

        return Math.min(100, score);
    }

    static checkForMetrics(resumeData) {
        const text = this.getResumeText(resumeData);
        const metricPatterns = [/\d+%/g, /\$\d+[KMB]?/g, /\d+x/g, /\d+\+/g];
        return metricPatterns.some(pattern => pattern.test(text));
    }

    static checkForStrongVerbs(resumeData) {
        const text = this.getResumeText(resumeData);
        const strongVerbs = ['led', 'managed', 'engineered', 'developed', 'optimized', 'increased',
            'reduced', 'designed', 'implemented', 'achieved', 'launched'];
        return strongVerbs.some(verb => text.includes(verb));
    }

    static calculateKeywordScore(resumeData, jdKeywords) {
        if (jdKeywords.length === 0) return 15;

        const text = this.getResumeText(resumeData);
        let matches = 0;

        jdKeywords.forEach(keyword => {
            if (text.includes(keyword.toLowerCase())) {
                matches++;
            }
        });

        const matchRate = matches / jdKeywords.length;
        return Math.min(25, Math.round(matchRate * 25));
    }

    static getResumeText(resumeData) {
        const sections = [
            resumeData.summary || '',
            ...(resumeData.experience || []).map(exp =>
                `${exp.position || ''} ${exp.company || ''} ${exp.description || ''} ${(exp.achievements || []).join(' ')}`
            ),
            (resumeData.skills || []).join(' ')
        ];
        return sections.join(' ').toLowerCase();
    }

    static checkFormatConsistency(resumeData) {
        if (!resumeData.experience || resumeData.experience.length < 2) return true;

        const firstExp = resumeData.experience[0];
        return resumeData.experience.every(exp =>
            exp.position && exp.company && (exp.achievements || exp.description)
        );
    }

    static analyzeResumeStrengths(resumeData, jdKeywords) {
        const strengths = [];
        const weaknesses = [];

        if (this.checkForMetrics(resumeData)) {
            strengths.push('Includes quantifiable achievements');
        } else {
            weaknesses.push('Missing quantifiable metrics');
        }

        if (this.checkForStrongVerbs(resumeData)) {
            strengths.push('Uses strong action verbs');
        } else {
            weaknesses.push('Could use stronger action verbs');
        }

        if (resumeData.experience && resumeData.experience.length >= 2) {
            strengths.push('Multiple relevant experiences');
        }

        if (resumeData.skills && resumeData.skills.length >= 10) {
            strengths.push('Comprehensive skills section');
        }

        if (jdKeywords.length > 0) {
            const matchRate = this.calculateKeywordScore(resumeData, jdKeywords) / 25;
            if (matchRate < 0.5) {
                weaknesses.push('Low keyword match with job description');
            } else {
                strengths.push('Good keyword match with job description');
            }
        }

        return { strengths, weaknesses };
    }

    static getRoleKeywords(targetRole) {
        const roleLower = targetRole.toLowerCase();
        const roleKeywords = {
            'software': ['JavaScript', 'React', 'Node.js', 'Python', 'AWS', 'Docker', 'Kubernetes', 'Git', 'CI/CD', 'TypeScript'],
            'data': ['Python', 'SQL', 'Pandas', 'Tableau', 'Machine Learning', 'Data Analysis', 'Big Data', 'Apache Spark', 'Statistics'],
            'product': ['Product Strategy', 'User Research', 'Roadmapping', 'A/B Testing', 'Agile', 'Scrum', 'JIRA', 'Market Analysis'],
            'marketing': ['SEO', 'Content Marketing', 'Google Analytics', 'Social Media', 'CRM', 'PPC', 'Email Marketing', 'Conversion Rate'],
            'manager': ['Team Leadership', 'Project Management', 'Stakeholder Management', 'Budget Management', 'Strategic Planning']
        };

        for (const [key, keywords] of Object.entries(roleKeywords)) {
            if (roleLower.includes(key)) {
                return keywords;
            }
        }

        return ['Project Management', 'Communication', 'Problem Solving', 'Team Collaboration', 'Leadership'];
    }

    static extractFallbackKeywords(text) {
        if (!text) return [];

        const words = text
            .toLowerCase()
            .replace(/[^\w\s]/g, ' ')
            .split(/\s+/)
            .filter(word => word.length > 3);

        const freq = {};
        words.forEach(word => freq[word] = (freq[word] || 0) + 1);

        return Object.entries(freq)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 15)
            .map(([word]) => word.charAt(0).toUpperCase() + word.slice(1));
    }

    static getMockLinkedInData(linkedinUrl) {
        return {
            personalInfo: {
                fullName: "Alex Johnson",
                email: "alex.johnson@example.com",
                phone: "+1 (555) 123-4567",
                location: "New York, NY",
                linkedin: linkedinUrl,
                github: "https://github.com/alexjohnson",
                portfolio: "https://alexjohnson.dev",
                summary: "Senior Software Engineer with 7+ years of experience in full-stack development, cloud architecture, and team leadership. Passionate about building scalable applications and mentoring junior developers."
            },
            experience: [
                {
                    company: "Tech Innovations Inc",
                    position: "Senior Software Engineer",
                    duration: "2020 - Present",
                    location: "New York, NY",
                    achievements: [
                        "Led development of microservices architecture serving 1M+ users",
                        "Reduced API response time by 65% through optimization",
                        "Mentored 5 junior developers"
                    ]
                },
                {
                    company: "StartupXYZ",
                    position: "Full Stack Developer",
                    duration: "2018 - 2020",
                    location: "San Francisco, CA",
                    achievements: [
                        "Built customer-facing web application from scratch",
                        "Improved application performance by 40%",
                        "Implemented CI/CD pipeline reducing deployment time by 70%"
                    ]
                }
            ],
            education: [
                {
                    school: "MIT",
                    degree: "Master of Computer Science",
                    field: "Computer Science",
                    duration: "2016 - 2018",
                    gpa: "3.8/4.0"
                }
            ],
            skills: ["JavaScript", "React", "Node.js", "Python", "AWS", "Docker", "Kubernetes", "TypeScript", "Git", "CI/CD"],
            certifications: [
                {
                    name: "AWS Certified Solutions Architect",
                    issuer: "Amazon Web Services",
                    date: "2022",
                    url: "https://aws.amazon.com/certification"
                }
            ],
            projects: [
                {
                    name: "E-commerce Platform",
                    description: "Built scalable e-commerce platform with React and Node.js",
                    techStack: ["React", "Node.js", "MongoDB", "AWS"],
                    duration: "2021 - 2022",
                    achievements: ["Handled 10K+ daily active users", "Achieved 99.9% uptime"]
                }
            ]
        };
    }

    static getDefaultATSResult() {
        return {
            score: 65,
            suggestions: [
                "Add quantifiable metrics to 70% of bullet points",
                "Replace weak verbs with stronger action verbs",
                "Incorporate more industry-specific keywords",
                "Ensure consistent formatting across all sections"
            ],
            keywords: [],
            strengths: ['Professional summary present', 'Clear contact information'],
            weaknesses: ['Lacking quantifiable achievements', 'Could use more specific keywords']
        };
    }

    static getDefaultKeywords() {
        return ['JavaScript', 'React', 'Node.js', 'Python', 'AWS', 'Git', 'Agile', 'Problem Solving', 'Communication', 'Teamwork'];
    }

    // Check AI service health
    static async healthCheck() {
        try {
            if (!openai) {
                return {
                    status: 'unhealthy',
                    message: 'OpenAI client not initialized',
                    timestamp: new Date().toISOString()
                };
            }

            await openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [{ role: "user", content: "Say 'OK' if you're working." }],
                max_tokens: 5
            });

            return {
                status: 'healthy',
                message: 'AI service is operational',
                timestamp: new Date().toISOString(),
                model: process.env.OPENAI_MODEL || 'default',
                provider: 'OpenAI'
            };

        } catch (error) {
            logger.error('AI health check failed:', error);
            return {
                status: 'unhealthy',
                message: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }

    // Validate resume data before AI processing
    static validateResumeData(resumeData) {
        const errors = [];

        if (!resumeData || typeof resumeData !== 'object') {
            errors.push('Resume data must be an object');
            return errors;
        }

        if (!resumeData.personalInfo) {
            errors.push('Personal info is required');
        }

        if (!resumeData.experience && !resumeData.skills) {
            errors.push('At least experience or skills section is required');
        }

        return errors;
    }

    // Rate limiting for AI calls
    static async rateLimitedCall(apiCall, maxRetries = 3) {
        let retries = 0;

        while (retries < maxRetries) {
            try {
                return await apiCall();
            } catch (error) {
                if (error.status === 429 && retries < maxRetries - 1) {
                    // Rate limited, wait and retry
                    const waitTime = Math.pow(2, retries) * 1000; // Exponential backoff
                    logger.warn(`Rate limited, waiting ${waitTime}ms before retry ${retries + 1}`);
                    await new Promise(resolve => setTimeout(resolve, waitTime));
                    retries++;
                } else {
                    throw error;
                }
            }
        }

        throw new Error('Max retries exceeded');
    }
}

export default AIService;