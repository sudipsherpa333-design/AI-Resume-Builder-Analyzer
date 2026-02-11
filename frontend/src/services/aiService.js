// src/services/aiService.js
import axios from 'axios';

// Use Vite environment variables
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
const USE_MOCK_AI = import.meta.env.VITE_USE_MOCK_AI === 'true';
const IS_DEVELOPMENT = import.meta.env.MODE === 'development';

console.log('🔧 Environment Configuration:', {
  API_BASE_URL,
  USE_MOCK_AI,
  IS_DEVELOPMENT,
  NODE_ENV: import.meta.env.MODE,
  VITE_API_URL: import.meta.env.VITE_API_URL
});

// Create axios instance with shorter timeout for development
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: IS_DEVELOPMENT ? 3000 : 30000, // Shorter timeout in development
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    console.log(`➡️ API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);

    // Add auth token if available
    const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

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

    // Handle specific errors
    if (error.response?.status === 401) {
      // Unauthorized - clear auth tokens
      localStorage.removeItem('auth_token');
      sessionStorage.removeItem('auth_token');
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

// Mock AI service (for development)
const mockAiService = {
  async analyzeATS(resumeData, jobDescription = '') {
    console.log('🔍 [MOCK] Analyzing ATS...');

    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    let score = 65;
    if (resumeData?.summary?.length > 100) {
      score += 10;
    }
    if (resumeData?.experience?.length > 0) {
      score += 15;
    }
    if (resumeData?.skills?.length > 5) {
      score += 10;
    }

    // Add job description matching factor
    if (jobDescription) {
      const resumeText = JSON.stringify(resumeData).toLowerCase();
      const jdText = jobDescription.toLowerCase();
      const commonWords = resumeText.split(/\W+/).filter(word =>
        jdText.includes(word) && word.length > 3
      );
      const matchPercentage = Math.min((commonWords.length / 20) * 100, 20);
      score += matchPercentage;
    }

    score = Math.min(95, Math.max(40, score));

    return {
      success: true,
      data: {
        score: Math.round(score),
        suggestions: [
          'Add quantifiable metrics to bullet points (e.g., \'increased revenue by 30%\')',
          'Include more technical keywords relevant to your target role',
          'Strengthen action verbs in experience descriptions',
          'Ensure proper formatting and consistent spacing throughout',
          'Highlight achievements with numbers and percentages where possible'
        ],
        keywords: ['JavaScript', 'React', 'Node.js', 'AWS', 'Git', 'Agile', 'TypeScript', 'Docker', 'REST API', 'MongoDB'],
        strengths: ['Professional formatting', 'Clear structure', 'Good contact information', 'Relevant experience'],
        weaknesses: ['Missing quantifiable achievements', 'Could use more industry-specific keywords', 'Limited project details'],
        breakdown: {
          keywordMatch: Math.round(score * 0.3),
          formatting: 85,
          completeness: Math.round(score * 0.7),
          experienceRelevance: 75,
          skillMatch: Math.round(score * 0.4),
          jobDescriptionMatch: jobDescription ? Math.round(score * 0.6) : 0
        },
        jobDescriptionMatch: jobDescription ? Math.round(score * 0.8) : null
      }
    };
  },

  async analyzeResume(resumeData, jobDescription = '', options = {}) {
    console.log('🔍 [MOCK] Comprehensive resume analysis...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    const atsResult = await this.analyzeATS(resumeData, jobDescription);

    return {
      success: true,
      data: {
        ...atsResult.data,
        sectionAnalysis: {
          summary: {
            score: 75,
            feedback: 'Good overview but could be more concise',
            suggestions: ['Add quantifiable achievements', 'Include target role explicitly']
          },
          experience: {
            score: 70,
            feedback: 'Solid experience but needs more metrics',
            suggestions: ['Add numbers to quantify impact', 'Use action verbs more consistently']
          },
          skills: {
            score: 85,
            feedback: 'Good technical skills listing',
            suggestions: ['Add proficiency levels', 'Group by category']
          }
        },
        recommendations: [
          'Add 2-3 more quantifiable achievements',
          'Include more keywords from the job description',
          'Consider adding a projects section',
          'Review formatting for ATS compatibility'
        ],
        estimatedInterviewProbability: Math.round(atsResult.data.score * 0.8),
        generatedQuestions: [
          'Tell me about a time you solved a complex technical problem.',
          'How do you stay updated with new technologies?',
          'Describe your experience working in agile teams.'
        ]
      }
    };
  },

  async enhanceSection(section, content, targetRole = '') {
    console.log(`🤖 [MOCK] Enhancing ${section}...`);
    await new Promise(resolve => setTimeout(resolve, 800));

    const enhancements = {
      summary: `Results-driven ${targetRole || 'professional'} with expertise in modern technologies. ${content} Enhanced with AI to highlight key achievements and optimize for ATS systems. Proven track record of delivering impactful solutions and driving business growth.`,
      experience: `• Engineered scalable solutions ${content}\n• Optimized performance metrics by 40%\n• Led cross-functional teams to successful project delivery\n• Implemented best practices for code quality and maintainability`,
      skills: `${content}, AI/ML, Cloud Computing, DevOps, Agile Methodology, CI/CD`,
      projects: `• Developed and deployed ${content} with 99.9% uptime\n• Reduced costs by 30% through optimization\n• Improved user experience and performance metrics`
    };

    return {
      success: true,
      data: {
        enhancedContent: enhancements[section] || `${content} (AI-enhanced)`,
        suggestions: ['Use more action verbs', 'Add quantifiable results', 'Highlight specific technologies']
      }
    };
  },

  async generateGhostText(text, section) {
    await new Promise(resolve => setTimeout(resolve, 500));

    const suggestions = {
      summary: ' with expertise in building scalable applications and leading high-performing teams.',
      experience: '\n• Delivered projects on time and under budget\n• Improved team productivity by 25%\n• Reduced system latency by 40%',
      skills: ', Cloud Architecture, DevOps, CI/CD, Microservices',
      projects: '\n• Implemented using modern frameworks and best practices\n• Achieved significant performance improvements\n• Received positive feedback from stakeholders',
    };

    return {
      success: true,
      data: {
        ghostText: suggestions[section] || '',
        confidence: 0.85
      }
    };
  }
};

// Main AI Service
export const aiService = {
  // Check if backend is available
  isBackendAvailable() {
    // In development with mock AI enabled, don't even try backend
    if (IS_DEVELOPMENT && USE_MOCK_AI) {
      return false;
    }

    // Check localStorage for backend status
    const backendStatus = localStorage.getItem('backend_status');
    return backendStatus === 'connected';
  },

  // Analyze ATS compatibility
  async analyzeATS(resumeData, jobDescription = '') {
    try {
      // Check if we should use mock
      if (USE_MOCK_AI || !this.isBackendAvailable()) {
        console.log('🔄 Using mock AI service');
        return await mockAiService.analyzeATS(resumeData, jobDescription);
      }

      console.log('🚀 Calling real backend API for ATS analysis...');

      const response = await apiClient.post('/api/ai/analyze-ats', {
        resumeData,
        jobDescription
      });

      console.log('✅ Backend response received');
      return response.data;

    } catch (error) {
      console.warn('⚠️ Backend API failed, using mock service:', {
        error: error.message,
        code: error.code
      });

      // Mark backend as unavailable
      localStorage.setItem('backend_status', 'disconnected');

      // Always fallback to mock
      return await mockAiService.analyzeATS(resumeData, jobDescription);
    }
  },

  // Comprehensive resume analysis
  async analyzeResume(resumeData, jobDescription = '', options = {}) {
    try {
      if (USE_MOCK_AI || !this.isBackendAvailable()) {
        return await mockAiService.analyzeResume(resumeData, jobDescription, options);
      }

      const response = await apiClient.post('/api/ai/analyze-resume', {
        resumeData,
        jobDescription,
        options
      });

      return response.data;

    } catch (error) {
      console.warn('Comprehensive analysis failed, using mock:', error);

      localStorage.setItem('backend_status', 'disconnected');
      return await mockAiService.analyzeResume(resumeData, jobDescription, options);
    }
  },

  // Enhance section
  async enhanceSection(section, content, targetRole = '') {
    try {
      if (USE_MOCK_AI || !this.isBackendAvailable()) {
        return await mockAiService.enhanceSection(section, content, targetRole);
      }

      const response = await apiClient.post('/api/ai/enhance-section', {
        section,
        content,
        targetRole
      });

      return response.data;

    } catch (error) {
      console.warn(`Enhancement failed for ${section}, using mock:`, error);

      localStorage.setItem('backend_status', 'disconnected');
      return await mockAiService.enhanceSection(section, content, targetRole);
    }
  },

  // Alias for backward compatibility
  async aiEnhanceSection(section, content, targetRole = '') {
    return this.enhanceSection(section, content, targetRole);
  },

  // Generate ghost text suggestions
  async generateGhostText(text, section) {
    try {
      if (USE_MOCK_AI || !this.isBackendAvailable()) {
        return await mockAiService.generateGhostText(text, section);
      }

      const response = await apiClient.post('/api/ai/generate-ghost-text', { text, section });
      return response.data;

    } catch (error) {
      console.warn('Ghost text generation failed, using mock:', error);

      localStorage.setItem('backend_status', 'disconnected');
      return await mockAiService.generateGhostText(text, section);
    }
  },

  // Generate full resume from job description
  async generateFullResumeFromJD(jobDescription, targetRole = '', currentResume = {}) {
    try {
      if (USE_MOCK_AI || !this.isBackendAvailable()) {
        await new Promise(resolve => setTimeout(resolve, 2000));

        return {
          success: true,
          data: {
            summary: `Dedicated ${targetRole || 'professional'} with proven expertise matching job requirements. Passionate about building scalable solutions and driving innovation.`,
            experience: [
              {
                company: 'Tech Solutions Inc',
                position: targetRole || 'Software Engineer',
                startDate: '01/2021',
                endDate: 'Present',
                current: true,
                description: 'Developed and maintained high-performance applications',
                achievements: [
                  'Led development of critical features improving user engagement by 35%',
                  'Optimized database queries reducing response time by 60%',
                  'Mentored 3 junior developers improving team productivity'
                ]
              }
            ],
            skills: ['JavaScript', 'React', 'Node.js', 'AWS', 'TypeScript', 'Docker', 'Git', 'Agile'],
            keywords: this.extractKeywords(jobDescription),
            confidence: 0.88
          }
        };
      }

      const response = await apiClient.post('/api/ai/generate-resume-from-jd', {
        jobDescription,
        targetRole,
        currentResume
      });

      return response.data;

    } catch (error) {
      console.warn('Full resume generation failed, using mock:', error);

      localStorage.setItem('backend_status', 'disconnected');

      // Return mock structure
      return {
        success: true,
        data: {
          summary: `Dedicated ${targetRole || 'professional'} with proven expertise matching job requirements.`,
          experience: [],
          skills: ['JavaScript', 'React', 'Node.js', 'AWS'],
          keywords: this.extractKeywords(jobDescription),
          confidence: 0.75
        }
      };
    }
  },

  // MAGIC RESUME - Generate complete resume from job description
  async magicResume(jobDescription, targetRole = '', userData = {}) {
    try {
      if (USE_MOCK_AI || !this.isBackendAvailable()) {
        console.log('🔮 [MOCK] Generating magic resume from JD...');
        await new Promise(resolve => setTimeout(resolve, 2500));

        return {
          success: true,
          data: {
            summary: `Results-driven ${targetRole || 'professional'} with extensive experience in software development, team leadership, and cutting-edge technologies. Proven track record of delivering scalable solutions that improve efficiency by 40%+ and drive revenue growth.`,
            experience: [
              {
                company: 'Tech Solutions Inc',
                position: targetRole || 'Senior Software Engineer',
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
            projects: [
              {
                name: 'E-commerce Platform',
                description: 'Full-stack e-commerce solution',
                technologies: ['React', 'Node.js', 'MongoDB', 'AWS'],
                achievements: ['Increased conversion rate by 25%', 'Reduced page load time by 50%']
              }
            ],
            atsScore: 92,
            keywords: this.extractKeywords(jobDescription),
            confidence: 0.92,
            suggestions: [
              'Add more quantifiable achievements',
              'Include specific project metrics',
              'Highlight leadership experience'
            ]
          }
        };
      }

      const response = await apiClient.post('/api/ai/magic-resume', {
        jobDescription,
        targetRole,
        userData
      });

      return response.data;

    } catch (error) {
      console.warn('Magic resume generation failed, using mock:', error);

      localStorage.setItem('backend_status', 'disconnected');

      return {
        success: true,
        data: {
          summary: `Experienced ${targetRole || 'professional'} with relevant skills and experience.`,
          experience: [],
          skills: this.extractKeywords(jobDescription).map(k => ({ name: k, level: 'Intermediate', category: 'Technical' })),
          atsScore: 75,
          keywords: this.extractKeywords(jobDescription),
          confidence: 0.7
        }
      };
    }
  },

  // Extract keywords from job description
  extractKeywords(text = '') {
    if (!text) {
      return [];
    }

    const commonKeywords = [
      'JavaScript', 'React', 'Node.js', 'TypeScript', 'Python', 'Java', 'C#', 'C++',
      'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Jenkins', 'Git', 'GitHub', 'GitLab',
      'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'REST', 'GraphQL', 'API', 'Microservices',
      'Agile', 'Scrum', 'Kanban', 'CI/CD', 'DevOps', 'TDD', 'Testing', 'Automation',
      'Machine Learning', 'AI', 'Data Science', 'Analytics', 'Security', 'Networking'
    ];

    const foundKeywords = commonKeywords.filter(k =>
      text.toLowerCase().includes(k.toLowerCase())
    );

    // Also extract unique capitalized words
    const words = text.match(/\b[A-Z][a-z]+\b/g) || [];
    const uniqueWords = [...new Set(words.map(w => w.trim()))]
      .filter(w => w.length > 3 && !foundKeywords.includes(w))
      .slice(0, 10);

    return [...foundKeywords, ...uniqueWords];
  },

  // Check backend health - UPDATED WITH BETTER HANDLING
  async checkBackendHealth() {
    try {
      // Skip health check if in development with mock AI
      if (IS_DEVELOPMENT && USE_MOCK_AI) {
        console.log('🔄 Development mode: Using mock AI service (skip backend check)');
        localStorage.setItem('backend_status', 'mock_mode');
        return {
          success: true,
          status: 'mock_mode',
          message: 'Using mock AI service in development',
          url: API_BASE_URL,
          mock: true
        };
      }

      const response = await apiClient.get('/api/health', { timeout: 3000 });

      localStorage.setItem('backend_status', 'connected');

      return {
        success: true,
        status: 'connected',
        message: 'Backend is running',
        url: API_BASE_URL,
        data: response.data
      };

    } catch (error) {
      console.warn('⚠️ Backend health check failed (using mock mode):', {
        url: `${API_BASE_URL}/api/health`,
        error: error.message,
        code: error.code
      });

      localStorage.setItem('backend_status', 'disconnected');

      // Return mock mode instead of error
      return {
        success: true, // Still successful because we can use mock
        status: 'mock_fallback',
        message: `Backend not available at ${API_BASE_URL}, using mock AI service`,
        error: error.message,
        code: error.code,
        mock: true,
        url: API_BASE_URL
      };
    }
  },

  // Save analysis results
  async saveAnalysisResults(results, resumeId = null) {
    try {
      if (USE_MOCK_AI || !this.isBackendAvailable()) {
        const savedAnalyses = JSON.parse(localStorage.getItem('saved_analyses') || '[]');
        const newAnalysis = {
          id: `analysis_${Date.now()}`,
          ...results,
          resumeId,
          createdAt: new Date().toISOString()
        };
        savedAnalyses.push(newAnalysis);
        localStorage.setItem('saved_analyses', JSON.stringify(savedAnalyses));

        return {
          success: true,
          data: { id: newAnalysis.id }
        };
      }

      const response = await apiClient.post('/api/ai/save-analysis', {
        results,
        resumeId,
        timestamp: new Date().toISOString()
      });

      return response.data;

    } catch (error) {
      console.warn('Save analysis failed, saving locally:', error);

      // Save locally as fallback
      const savedAnalyses = JSON.parse(localStorage.getItem('saved_analyses') || '[]');
      const newAnalysis = {
        id: `analysis_${Date.now()}`,
        ...results,
        resumeId,
        createdAt: new Date().toISOString()
      };
      savedAnalyses.push(newAnalysis);
      localStorage.setItem('saved_analyses', JSON.stringify(savedAnalyses));

      return {
        success: true,
        data: { id: newAnalysis.id }
      };
    }
  },

  // Get saved analyses
  async getSavedAnalyses() {
    try {
      if (USE_MOCK_AI || !this.isBackendAvailable()) {
        const saved = JSON.parse(localStorage.getItem('saved_analyses') || '[]');
        return {
          success: true,
          data: saved
        };
      }

      const response = await apiClient.get('/api/ai/saved-analyses');
      return response.data;

    } catch (error) {
      console.warn('Get saved analyses failed, using local:', error);

      const saved = JSON.parse(localStorage.getItem('saved_analyses') || '[]');
      return {
        success: true,
        data: saved
      };
    }
  },

  // Test backend connection
  async testConnection() {
    try {
      const response = await apiClient.get('/api/health', { timeout: 3000 });
      localStorage.setItem('backend_status', 'connected');
      return {
        connected: true,
        data: response.data
      };
    } catch (error) {
      localStorage.setItem('backend_status', 'disconnected');
      return {
        connected: false,
        error: error.message
      };
    }
  }
};

// Backwards-compatible named exports
export const analyzeATS = async (resumeData, jobDescription = '') => {
  const result = await aiService.analyzeATS(resumeData, jobDescription);
  return result.data || result;
};

export const enhanceSection = async (section, content, targetRole = '') => {
  const result = await aiService.enhanceSection(section, content, targetRole);
  return result.data?.enhancedContent || result.enhancedContent || content;
};

export const aiEnhance = async (resumeData, section, jobDescription = '') => {
  const content = resumeData?.[section] || resumeData?.projects || '';
  try {
    const result = await aiService.enhanceSection(section, content, resumeData?.targetRole || '');
    return {
      [section]: result.data?.enhancedContent || result.enhancedContent || content
    };
  } catch (error) {
    console.error('aiEnhance wrapper failed:', error);
    return { [section]: content };
  }
};

export const generateBulletPoints = (text) => {
  if (!text) {
    return [];
  }
  return text.split(/\.|\n|;|\u2022/).map(s => s.trim()).filter(Boolean).slice(0, 8).map(s => s.endsWith('.') ? s : s + '.');
};

export const generateSummary = async (text, targetRole = '') => {
  try {
    const result = await aiService.enhanceSection('summary', text, targetRole);
    const enhanced = result.data?.enhancedContent || result.enhancedContent || text;
    return enhanced.slice(0, 400);
  } catch (err) {
    console.error('generateSummary failed:', err);
    return text.slice(0, 400);
  }
};

export const optimizeSkills = (skills = [], targetRole = '') => {
  if (!Array.isArray(skills)) {
    return skills;
  }
  const core = ['JavaScript', 'React', 'Node.js', 'TypeScript', 'AWS', 'Docker', 'Git'];
  const merged = [...new Set([...skills, ...core])];
  return merged.slice(0, 40);
};

export const suggestKeywords = async (text = '') => {
  if (!text) {
    return [];
  }
  return aiService.extractKeywords(text).slice(0, 15);
};

// Export for debugging
export { API_BASE_URL, USE_MOCK_AI, IS_DEVELOPMENT };

// Default export
export default aiService;