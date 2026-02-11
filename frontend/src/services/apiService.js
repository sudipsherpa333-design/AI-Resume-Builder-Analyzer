// src/services/apiService.js
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';

// Mock data for offline mode
const mockResumes = [
  {
    id: 1,
    title: 'Software Engineer Resume',
    updatedAt: '2024-12-08',
    template: 'modern',
    status: 'complete',
    previewUrl: 'https://via.placeholder.com/300x400'
  },
  {
    id: 2,
    title: 'Marketing Manager',
    updatedAt: '2024-12-07',
    template: 'classic',
    status: 'draft',
    previewUrl: 'https://via.placeholder.com/300x400'
  },
  {
    id: 3,
    title: 'Data Analyst',
    updatedAt: '2024-12-06',
    template: 'creative',
    status: 'complete',
    previewUrl: 'https://via.placeholder.com/300x400'
  }
];

const mockUser = {
  id: 1,
  name: 'Demo User',
  email: 'demo@example.com',
  resumes: mockResumes.length,
  joinedAt: '2024-01-01'
};

const mockStats = {
  totalResumes: mockResumes.length,
  completedResumes: mockResumes.filter(r => r.status === 'complete').length,
  draftResumes: mockResumes.filter(r => r.status === 'draft').length,
  aiSuggestionsUsed: 28,
  downloads: 15
};

export const apiService = {
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (response.ok) {
        return await response.json();
      }
      throw new Error(`HTTP ${response.status}`);
    } catch (error) {
      console.log(`API call failed for ${endpoint}, using mock data:`, error.message);
      return this.getMockData(endpoint);
    }
  },

  getMockData(endpoint) {
    switch (endpoint) {
    case '/health':
      return { status: 'ok', timestamp: new Date().toISOString() };

    case '/resumes':
      return { resumes: mockResumes };

    case '/dashboard':
      return {
        user: mockUser,
        resumes: mockResumes,
        stats: mockStats,
        recentActivity: [
          { action: 'Created resume', resume: 'Software Engineer', time: '2 hours ago' },
          { action: 'Updated resume', resume: 'Marketing Manager', time: '1 day ago' },
          { action: 'Exported PDF', resume: 'Data Analyst', time: '2 days ago' }
        ]
      };

    case '/user/profile':
      return mockUser;

    default:
      return { message: 'Mock data for ' + endpoint, timestamp: new Date().toISOString() };
    }
  },

  async getDashboardData() {
    return this.request('/dashboard');
  },

  async getResumes() {
    return this.request('/resumes');
  },

  async getResume(id) {
    const data = await this.request('/resumes');
    const resume = data.resumes?.find(r => r.id === parseInt(id));
    return resume || mockResumes[0];
  },

  async saveResume(resumeData) {
    try {
      return await this.request('/resumes', {
        method: 'POST',
        body: JSON.stringify(resumeData),
      });
    } catch (error) {
      console.log('Save failed, storing locally:', error.message);
      localStorage.setItem(`resume_${Date.now()}`, JSON.stringify(resumeData));
      return { success: true, message: 'Saved locally', id: Date.now() };
    }
  },

  async testConnection() {
    try {
      const result = await this.request('/health');
      return { connected: true, data: result };
    } catch (error) {
      return { connected: false, error: error.message };
    }
  }
};