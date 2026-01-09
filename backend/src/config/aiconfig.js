// src/config/aiConfig.js
export const aiConfig = {
    // Enable/disable real AI analysis
    useRealAI: window.REACT_APP_USE_REAL_AI === 'true' || false,

    // API endpoints
    apiEndpoints: {
        openai: 'https://api.openai.com/v1/chat/completions',
        gemini: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
        claude: 'https://api.anthropic.com/v1/messages',
        local: window.REACT_APP_API_URL ? `${window.REACT_APP_API_URL}/analyze/ai` : 'http://localhost:5000/api/analyze/ai'
    },

    // API keys (should be loaded from environment)
    apiKeys: {
        openai: window.REACT_APP_OPENAI_API_KEY,
        gemini: window.REACT_APP_GEMINI_API_KEY,
        claude: window.REACT_APP_CLAUDE_API_KEY
    },

    // Model configurations
    models: {
        openai: {
            name: 'GPT-4',
            version: 'gpt-4-turbo-preview',
            maxTokens: 2000,
            temperature: 0.7
        },
        gemini: {
            name: 'Gemini Pro',
            version: 'gemini-pro',
            maxTokens: 2000,
            temperature: 0.7
        },
        claude: {
            name: 'Claude 3',
            version: 'claude-3-opus-20240229',
            maxTokens: 2000,
            temperature: 0.7
        }
    },

    // Analysis prompts
    prompts: {
        resumeAnalysis: `You are an expert resume reviewer and career coach. Analyze the following resume and provide detailed, actionable feedback.

RESUME CONTENT:
{content}

{JOB_DESCRIPTION_SECTION}

Please provide a comprehensive analysis including:
1. Overall score (0-100)
2. ATS compatibility score (0-100)
3. Strengths and weaknesses
4. Specific improvement suggestions with priority levels
5. Keyword analysis (found and missing keywords)
6. Section-by-section analysis
7. Industry comparison
8. Estimated improvement potential

Format your response as a valid JSON object with the structure specified in the system prompt.`,

        jobDescriptionSection: `TARGET JOB DESCRIPTION:
{jobDescription}

Please tailor your analysis specifically for this job role, focusing on:
1. Keyword match with job description
2. Relevance of experience and skills
3. Suggested modifications for this specific role`
    }
};

// Check if API keys are configured
export const checkAIConfiguration = () => {
    const missingKeys = [];

    if (!aiConfig.apiKeys.openai) missingKeys.push('OpenAI');
    if (!aiConfig.apiKeys.gemini) missingKeys.push('Gemini');
    if (!aiConfig.apiKeys.claude) missingKeys.push('Claude');

    return {
        isConfigured: missingKeys.length === 0,
        missingKeys,
        hasAnyKey: aiConfig.apiKeys.openai || aiConfig.apiKeys.gemini || aiConfig.apiKeys.claude
    };
};