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

    // Alias for backward compatibility - some code uses aiEnhanceSection
    async aiEnhanceSection(section, content, targetRole = '') {
        return this.enhanceSection(section, content, targetRole);
    },

    // Generate ghost text suggestions (for inline AI)
    async generateGhostText(text, section) {
        try {
            if (USE_MOCK_AI) {
                const suggestions = {
                    summary: ' with expertise in building scalable applications and leading high-performing teams.',
                    experience: '\n• Delivered projects on time and under budget\n• Improved team productivity by 25%',
                    skills: ', Cloud Architecture, DevOps, CI/CD',
                };
                return suggestions[section] || '';
            }

            const response = await apiClient.post('/api/ai/generate-ghost-text', { text, section });
            return response.data.ghostText || '';
        } catch (error) {
            console.error('Ghost text generation failed:', error);
            return '';
        }
    },

    // Generate full resume from job description
    async generateFullResumeFromJD(jobDescription, targetRole = '', currentResume = {}) {
        try {
            if (USE_MOCK_AI) {
                return {
                    summary: `Dedicated ${targetRole || 'professional'} with proven expertise matching job requirements.`,
                    experience: [],
                    skills: ['JavaScript', 'React', 'Node.js', 'AWS', 'TypeScript', 'Docker'],
                    keywords: jobDescription.match(/\b[a-z]+\b/gi)?.slice(0, 10) || []
                };
            }

            const response = await apiClient.post('/api/ai/generate-full-resume-jd', {
                jobDescription,
                targetRole,
                currentResume
            });
            return response.data || {};
        } catch (error) {
            console.error('Full resume generation failed:', error);
            return {};
        }
    },

    // Enhance full resume
    async aiEnhanceFullResume(resumeData, context = {}) {
        try {
            if (USE_MOCK_AI) {
                return {
                    ...resumeData,
                    summary: resumeData.summary + ' (AI-enhanced)',
                    skills: resumeData.skills || []
                };
            }

            const response = await apiClient.post('/api/ai/enhance-full-resume', {
                resumeData,
                context
            });
            return response.data || resumeData;
        } catch (error) {
            console.error('Full resume enhancement failed:', error);
            return resumeData;
        }
    },

    // Get section suggestions
    async getSectionSuggestions(section, currentContent, targetRole = '', jobDescription = '') {
        try {
            if (USE_MOCK_AI) {
                const suggestions = {
                    summary: ['Add quantifiable achievements', 'Include years of experience', 'Mention key technical skills'],
                    experience: ['Use action verbs', 'Add metrics and results', 'Quantify impact'],
                    skills: ['Add technical proficiencies', 'Include soft skills', 'Prioritize by relevance'],
                };
                return suggestions[section] || [];
            }

            const response = await apiClient.post('/api/ai/section-suggestions', {
                section,
                currentContent,
                targetRole,
                jobDescription
            });
            return response.data.suggestions || [];
        } catch (error) {
            console.error('Section suggestions failed:', error);
            return [];
        }
    },

    // MAGIC RESUME - Generate complete resume from job description
    async magicResume(jobDescription, targetRole = '') {
        try {
            if (USE_MOCK_AI) {
                console.log('🔮 [MOCK] Generating magic resume from JD...');
                await new Promise(resolve => setTimeout(resolve, 2000));

                return {
                    success: true,
                    summary: `Results-driven ${targetRole || 'professional'} with extensive experience in software development, team leadership, and cutting-edge technologies. Proven track record of delivering scalable solutions that improve efficiency by 40%+ and drive revenue growth.`,
                    experience: [
                        {
                            company: 'Tech Solutions Inc',
                            position: 'Senior Software Engineer',
                            startDate: '01/2021',
                            endDate: 'Present',
                            current: true,
                            description: 'Led development of microservices architecture',
                            achievements: [
                                'Architected and implemented React/Node.js microservices reducing load times by 35%',
                                'Led team of 5 engineers, mentoring junior developers and establishing best practices',
                                'Deployed 50+ features to production with zero critical bugs using CI/CD pipelines',
                                'Optimized database queries, improving API response time from 500ms to 120ms'
                            ]
                        },
                        {
                            company: 'Digital Innovations',
                            position: 'Full Stack Developer',
                            startDate: '06/2018',
                            endDate: '12/2020',
                            current: false,
                            description: 'Developed full-stack web applications',
                            achievements: [
                                'Built 15+ production applications serving 100K+ users using React and Node.js',
                                'Reduced page load time by 45% through code splitting and lazy loading strategies',
                                'Implemented automated testing, achieving 85% code coverage'
                            ]
                        }
                    ],
                    skills: [
                        { name: 'JavaScript', level: 'Expert', category: 'Technical' },
                        { name: 'React', level: 'Expert', category: 'Technical' },
                        { name: 'Node.js', level: 'Expert', category: 'Technical' },
                        { name: 'TypeScript', level: 'Advanced', category: 'Technical' },
                        { name: 'AWS', level: 'Advanced', category: 'Tools' },
                        { name: 'Docker', level: 'Advanced', category: 'Tools' },
                        { name: 'MongoDB', level: 'Advanced', category: 'Technical' },
                        { name: 'Team Leadership', level: 'Advanced', category: 'Soft Skills' }
                    ],
                    atsScore: 92,
                    keywords: this.extractKeywords(jobDescription),
                    confidence: 0.92
                };
            }

            const response = await apiClient.post('/api/ai/magic-resume', {
                jobDescription,
                targetRole
            });

            return {
                success: true,
                ...response.data
            };
        } catch (error) {
            console.error('Magic resume generation failed:', error);
            // Return mock data on failure
            return {
                success: false,
                error: error.message,
                fallback: true
            };
        }
    },

    // Extract keywords from job description
    extractKeywords(text = '') {
        if (!text) return [];
        const keywords = [
            'JavaScript', 'React', 'Node.js', 'TypeScript', 'Python', 'Java', 'AWS', 'Docker',
            'MongoDB', 'PostgreSQL', 'REST API', 'GraphQL', 'Git', 'Agile', 'CI/CD'
        ];
        return keywords.filter(k => text.toLowerCase().includes(k.toLowerCase()));
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