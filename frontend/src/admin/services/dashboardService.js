// frontend/src/admin/services/dashboardService.js
import api from '../../services/api';

export const dashboardService = {
    // Fetch dashboard statistics with retry logic
    async getDashboardStats(retries = 3) {
        try {
            const response = await api.get('/api/admin/dashboard/stats', {
                timeout: 10000,
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                }
            });

            return {
                success: true,
                data: response.data,
                timestamp: new Date().toISOString()
            };

        } catch (error) {
            console.warn('[DashboardService] Fetch error:', error);

            // Always use fallback data for now (simplified)
            return {
                success: false,
                error: error.message,
                fallback: true,
                data: this.getFallbackStats()
            };
        }
    },

    // Fallback statistics for development/offline mode
    getFallbackStats() {
        const today = new Date();
        const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());

        return {
            summary: {
                totalUsers: 1284,
                totalResumes: 3256,
                activeUsers: 847,
                totalTemplates: 12
            },
            analytics: {
                userGrowth: 23.5,
                resumeGrowth: 45.2,
                conversionRate: 12.8,
                avgSessionTime: 8.4
            },
            recentActivity: {
                newUsers: 47,
                newResumes: 128,
                aiAnalyses: 89,
                exports: 56
            },
            performance: {
                uptime: 99.8,
                responseTime: 142,
                cpuUsage: 32.5,
                memoryUsage: 67.2
            },
            timeline: this.generateTimelineData(),
            topTemplates: this.generateTemplateData()
        };
    },

    generateTimelineData() {
        const days = 30;
        const data = [];
        const today = new Date();

        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);

            data.push({
                date: date.toISOString().split('T')[0],
                users: Math.floor(Math.random() * 50) + 20,
                resumes: Math.floor(Math.random() * 100) + 40,
                conversions: Math.floor(Math.random() * 30) + 10
            });
        }

        return data;
    },

    generateTemplateData() {
        const templates = [
            'Professional',
            'Modern',
            'Creative',
            'Minimalist',
            'Corporate',
            'Academic',
            'Executive',
            'Technical'
        ];

        return templates.map(template => ({
            name: template,
            usage: Math.floor(Math.random() * 500) + 100,
            rating: parseFloat((Math.random() * 2 + 3).toFixed(1))
        })).sort((a, b) => b.usage - a.usage);
    }
};