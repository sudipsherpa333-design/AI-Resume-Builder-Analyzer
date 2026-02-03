// src/services/aiService.js
import axios from 'axios';

// Use Vite environment variables
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
const USE_MOCK_AI = import.meta.env.VITE_USE_MOCK_AI === 'true';

console.log('🔧 Environment Configuration:', {
    API_BASE_URL,
    USE_MOCK_AI,
    NODE_ENV: import.meta.env.MODE,
    VITE_API_URL: import.meta.env.VITE_API_URL
});

// Create axios instance
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor
apiClient.interceptors.request.use(
    (config) => {
        console.log(`➡️ API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
        return config;
    },
    (error) => {
        console.error('❌ Request error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor
apiClient.interceptors.response.use(
    (response) => {
        console.log(`✅ API Response: ${response.status} ${response.config.url}`);
        return response;
    },
    (error) => {
        console.error('❌ API Error:', {
            status: error.response?.status,
            url: error.config?.url,
            message: error.message,
            code: error.code
        });
        return Promise.reject(error);
    }
);

// Mock AI service (for development)
const mockAiService = {
    async analyzeATS(resumeData, jobDescription = '') {
        console.log('🔍 [MOCK] Analyzing ATS...');

        // Simulate delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        let score = 65;
        if (resumeData?.summary?.length > 100) score += 10;
        if (resumeData?.experience?.length > 0) score += 15;
        if (resumeData?.skills?.length > 5) score += 10;

        score = Math.min(95, Math.max(40, score + (Math.random() * 10 - 5)));

        return {
            score: Math.round(score),
            suggestions: [
                "Add quantifiable metrics to bullet points (e.g., 'increased revenue by 30%')",
                "Include more technical keywords relevant to your target role",
                "Strengthen action verbs in experience descriptions"
            ],
            keywords: ['JavaScript', 'React', 'Node.js', 'AWS', 'Git', 'Agile', 'TypeScript', 'Docker'],
            strengths: ['Professional formatting', 'Clear structure', 'Good contact information'],
            weaknesses: ['Missing quantifiable achievements', 'Could use more industry-specific keywords'],
            breakdown: {
                keywordMatch: Math.round(score * 0.3),
                formatting: 85,
                completeness: Math.round(score * 0.7),
                experienceRelevance: 75
            }
        };
    },

    async enhanceSection(section, content, targetRole = '') {
        console.log(`🤖 [MOCK] Enhancing ${section}...`);
        await new Promise(resolve => setTimeout(resolve, 800));

        const enhancements = {
            summary: `Results-driven ${targetRole || 'professional'} with expertise in modern technologies. ${content} Enhanced with AI to highlight key achievements and optimize for ATS systems.`,
            experience: `• Engineered scalable solutions ${content}\n• Optimized performance metrics by 40%\n• Led cross-functional teams to successful project delivery`,
            skills: `${content}, AI/ML, Cloud Computing, DevOps, Agile Methodology`
        };

        return enhancements[section] || `${content} (AI-enhanced)`;
    }
};

// Main AI Service
export const aiService = {
    async analyzeATS(resumeData, jobDescription = '') {
        try {
            // Check if we should use mock
            if (USE_MOCK_AI) {
                console.log('🔄 Using mock AI service (VITE_USE_MOCK_AI=true)');
                return await mockAiService.analyzeATS(resumeData, jobDescription);
            }

            console.log('🚀 Calling real backend API...');

            const response = await apiClient.post('/api/ai/analyze-ats', {
                resumeData,
                jobDescription
            });

            console.log('✅ Backend response received');
            return response.data;

        } catch (error) {
            console.error('❌ Backend API failed:', {
                error: error.message,
                code: error.code,
                url: `${API_BASE_URL}/api/ai/analyze-ats`
            });

            // Fallback to mock if backend is unavailable
            if (error.code === 'ERR_NETWORK' || error.response?.status >= 500) {
                console.warn('⚠️ Falling back to mock service');
                return await mockAiService.analyzeATS(resumeData, jobDescription);
            }

            throw error;
        }
    },

    async enhanceSection(section, content, targetRole = '') {
        try {
            if (USE_MOCK_AI) {
                return await mockAiService.enhanceSection(section, content, targetRole);
            }

            const response = await apiClient.post('/api/ai/enhance-section', {
                section,
                content,
                targetRole
            });

            return response.data.enhancedContent;

        } catch (error) {
            console.error(`Enhancement failed for ${section}:`, error);
            return content;
        }
    },

    // Check backend health
    async checkBackendHealth() {
        try {
            const response = await apiClient.get('/api/health', { timeout: 5000 });

            return {
                status: 'connected',
                message: 'Backend is running',
                url: API_BASE_URL,
                data: response.data
            };

        } catch (error) {
            console.error('❌ Backend health check failed:', {
                url: `${API_BASE_URL}/api/health`,
                error: error.message,
                code: error.code
            });

            return {
                status: 'disconnected',
                message: `Cannot connect to backend at ${API_BASE_URL}`,
                error: error.message,
                code: error.code,
                suggestion: 'Make sure backend server is running on port 5001'
            };
        }
    }
};

// Export for debugging
export { API_BASE_URL, USE_MOCK_AI };

// Backwards-compatible named exports / helper wrappers
// Provide named functions some components expect (aiEnhance, generateBulletPoints, generateSummary, optimizeSkills, suggestKeywords, analyzeATS)
export const analyzeATS = async (resumeData, jobDescription = '') => {
    return await aiService.analyzeATS(resumeData, jobDescription);
};

export const enhanceSection = async (section, content, targetRole = '') => {
    return await aiService.enhanceSection(section, content, targetRole);
};

export const aiEnhance = async (resumeData, section, jobDescription = '') => {
    // Wrapper that keeps previous signature used across the codebase
    const content = resumeData?.[section] || resumeData?.projects || '';
    try {
        if (USE_MOCK_AI) {
            const enhanced = await mockAiService.enhanceSection(section, content, resumeData?.targetRole || '');
            // Return object shape similar to older implementations
            return { [section]: enhanced };
        }

        const response = await apiClient.post('/api/ai/enhance-resume-section', {
            resumeData,
            section,
            jobDescription
        });

        return response.data;
    } catch (error) {
        console.error('aiEnhance wrapper failed:', error);
        // Fallback to enhanceSection
        const fallback = await aiService.enhanceSection(section, content, resumeData?.targetRole || '');
        return { [section]: fallback };
    }
};

export const generateBulletPoints = (text) => {
    if (!text) return [];
    // naive sentence split as fallback
    return text.split(/\.|\n|;|\u2022/).map(s => s.trim()).filter(Boolean).slice(0, 8).map(s => s.endsWith('.') ? s : s + '.');
};

export const generateSummary = async (text, targetRole = '') => {
    if (USE_MOCK_AI) {
        return `Experienced ${targetRole || 'professional'} with expertise. ${text}`.slice(0, 400);
    }
    try {
        const response = await apiClient.post('/api/ai/generate-summary', { text, targetRole });
        return response.data.summary || text.slice(0, 400);
    } catch (err) {
        console.error('generateSummary failed:', err);
        return text.slice(0, 400);
    }
};

export const optimizeSkills = (skills = [], targetRole = '') => {
    if (!Array.isArray(skills)) return skills;
    const core = ['JavaScript', 'React', 'Node.js', 'TypeScript', 'AWS', 'Docker'];
    const merged = [...new Set([...skills, ...core])];
    return merged.slice(0, 40);
};

export const suggestKeywords = async (text = '') => {
    if (!text) return [];
    if (USE_MOCK_AI) {
        return ['JavaScript', 'React', 'Node.js', 'AWS', 'TypeScript'].filter(k => text.toLowerCase().includes(k.toLowerCase()) || true).slice(0, 10);
    }
    try {
        const resp = await apiClient.post('/api/ai/suggest-keywords', { text });
        return resp.data.keywords || [];
    } catch (err) {
        console.error('suggestKeywords failed:', err);
        return [];
    }
};

// Also export aiService as default-like named export for compatibility
export default aiService;