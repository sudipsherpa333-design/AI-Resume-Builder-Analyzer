// src/utils/openai.js - CENTRALIZED & SECURE AI UTILS (Analyzer + AI Assistant)
// All calls go through your backend proxy — NO API KEY IN FRONTEND

const API_BASE = 'http://localhost:5001/api/openai'; // Change in production if needed

/**
 * Generic AI request wrapper
 */
const aiRequest = async (endpoint, body = {}) => {
    try {
        const response = await fetch(`${API_BASE}${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include', // if using sessions/auth
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.error || `HTTP ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error(`AI Request Error (${endpoint}):`, error);
        throw error instanceof Error ? error : new Error('Network error');
    }
};

/**
 * ANALYZER: Full resume analysis vs job description
 */
export const analyzeResumeWithGPT = async (resumeText, jobDescription = '') => {
    if (!resumeText?.trim()) throw new Error('Resume text is required');

    const result = await aiRequest('/analyze', {
        resumeText: resumeText.trim(),
        jobDescription: jobDescription.trim(),
    });

    // Expected fields from backend
    return {
        overallScore: result.overallScore || 0,
        atsScore: result.atsScore || 0,
        keywordScore: result.keywordScore || 0,
        missingKeywords: result.missingKeywords || [],
        strengths: result.strengths || [],
        weaknesses: result.weaknesses || [],
        improvements: result.improvements || [],
        recommendations: result.recommendations || [],
        summary: result.summary || 'Analysis complete.',
    };
};

/**
 * AI ASSISTANT: Enhance any section (summary, experience, etc.)
 */
export const enhanceSection = async (sectionName, content, targetRole = '') => {
    if (!content?.trim()) throw new Error(`${sectionName} content is required`);

    const result = await aiRequest('/enhance', {
        section: sectionName,
        content: content.trim(),
        targetRole: targetRole.trim(),
    });

    return result.enhancedText || result.text || 'Enhanced content ready.';
};

/**
 * AI ASSISTANT: Generate skills or keywords
 */
export const generateKeywords = async (industry = 'technology', experienceLevel = 'mid-level', count = 20) => {
    const result = await aiRequest('/keywords', {
        industry,
        experienceLevel,
        count,
    });

    return result.keywords || [];
};

/**
 * AI ASSISTANT: General chat / custom prompt
 */
export const askAI = async (prompt, context = {}) => {
    if (!prompt?.trim()) throw new Error('Prompt is required');

    const result = await aiRequest('/chat', {
        prompt: prompt.trim(),
        context,
    });

    return result.response || result.text || 'I received your message.';
};

/**
 * AI ASSISTANT: Critique entire resume
 */
export const critiqueResume = async (resumeData) => {
    const result = await aiRequest('/critique', {
        resume: resumeData,
    });

    return {
        feedback: result.feedback || '',
        score: result.score || 0,
        suggestions: result.suggestions || [],
    };
};

/**
 * AI ASSISTANT: Grammar & clarity check
 */
export const checkGrammar = async (text) => {
    const result = await aiRequest('/grammar', {
        text,
    });

    return {
        corrected: result.corrected || text,
        issues: result.issues || [],
        score: result.score || 100,
    };
};