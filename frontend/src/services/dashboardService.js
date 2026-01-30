// src/services/dashboardService.js - ENHANCED VERSION
import api from './api';

// Mock data for development
const MOCK_RESUMES = [
    {
        _id: '1',
        title: 'Software Engineer Resume',
        template: 'modern',
        status: 'completed',
        isPrimary: true,
        starred: true,
        analysis: {
            atsScore: 85,
            completeness: 95,
            suggestions: ['Add more keywords', 'Improve formatting']
        },
        personalInfo: {
            fullName: 'John Doe',
            email: 'john@example.com',
            phone: '+1234567890',
            location: 'San Francisco, CA'
        },
        summary: 'Experienced software engineer with 5+ years in full-stack development...',
        updatedAt: new Date(Date.now() - 86400000).toISOString(),
        createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
        tags: ['React', 'Node.js', 'TypeScript']
    },
    {
        _id: '2',
        title: 'Frontend Developer',
        template: 'classic',
        status: 'draft',
        isPrimary: false,
        starred: false,
        analysis: {
            atsScore: 65,
            completeness: 70,
            suggestions: ['Complete work experience', 'Add education section']
        },
        personalInfo: {
            fullName: 'John Doe',
            email: 'john@example.com'
        },
        summary: 'Frontend developer specializing in React and modern JavaScript...',
        updatedAt: new Date(Date.now() - 172800000).toISOString(),
        createdAt: new Date(Date.now() - 86400000 * 14).toISOString(),
        tags: ['React', 'JavaScript', 'CSS']
    },
    {
        _id: '3',
        title: 'Senior Developer',
        template: 'modern',
        status: 'completed',
        isPrimary: false,
        starred: true,
        analysis: {
            atsScore: 92,
            completeness: 98,
            suggestions: ['Excellent ATS score']
        },
        personalInfo: {
            fullName: 'John Doe',
            email: 'john@example.com',
            phone: '+1234567890'
        },
        summary: 'Senior developer with expertise in scalable applications...',
        updatedAt: new Date(Date.now() - 259200000).toISOString(),
        createdAt: new Date(Date.now() - 86400000 * 21).toISOString(),
        tags: ['Node.js', 'AWS', 'Docker']
    },
    {
        _id: '4',
        title: 'Product Manager',
        template: 'executive',
        status: 'in_progress',
        isPrimary: false,
        starred: false,
        analysis: {
            atsScore: 75,
            completeness: 85,
            suggestions: ['Add product metrics', 'Include case studies']
        },
        personalInfo: {
            fullName: 'John Doe',
            email: 'john@example.com'
        },
        summary: 'Product manager with experience in agile development...',
        updatedAt: new Date(Date.now() - 345600000).toISOString(),
        createdAt: new Date(Date.now() - 86400000 * 28).toISOString(),
        tags: ['Product', 'Agile', 'Strategy']
    }
];

const MOCK_DASHBOARD_STATS = {
    totalResumes: 8,
    completedResumes: 5,
    inProgressResumes: 3,
    averageAtsScore: 76,
    onlineUsers: 42,
    activeSessions: 18,
    storageUsed: '65.2 MB',
    storageLimit: '500 MB',
    lastSynced: new Date().toISOString(),
    recentActivity: [
        {
            type: 'create',
            description: 'Created "Software Engineer" resume',
            timestamp: new Date(Date.now() - 3600000).toISOString()
        },
        {
            type: 'edit',
            description: 'Updated "Frontend Developer" resume',
            timestamp: new Date(Date.now() - 7200000).toISOString()
        },
        {
            type: 'export',
            description: 'Exported "Senior Developer" as PDF',
            timestamp: new Date(Date.now() - 10800000).toISOString()
        },
        {
            type: 'analyze',
            description: 'AI analysis completed for 3 resumes',
            timestamp: new Date(Date.now() - 14400000).toISOString()
        }
    ],
    templates: [
        { name: 'modern', count: 4 },
        { name: 'classic', count: 2 },
        { name: 'executive', count: 2 }
    ],
    atsDistribution: {
        excellent: 2,
        good: 3,
        average: 2,
        poor: 1
    }
};

// Check if we're in development mode
const IS_DEVELOPMENT = process.env.NODE_ENV === 'development';

export const dashboardService = {
    // Get all resumes for user
    async getResumes(userId, params = {}) {
        if (IS_DEVELOPMENT) {
            console.log('[MOCK] Getting resumes for user:', userId, params);
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 300));

            // Filter by status if provided
            let filteredResumes = MOCK_RESUMES;
            if (params.status && params.status !== 'all') {
                filteredResumes = MOCK_RESUMES.filter(resume => {
                    if (params.status === 'completed') return resume.status === 'completed';
                    if (params.status === 'draft') return resume.status === 'draft';
                    if (params.status === 'in_progress') return resume.status === 'in_progress';
                    return true;
                });
            }

            // Filter by template if provided
            if (params.template && params.template !== 'all') {
                filteredResumes = filteredResumes.filter(resume => resume.template === params.template);
            }

            // Sort if provided
            if (params.sortBy) {
                filteredResumes.sort((a, b) => {
                    if (params.sortBy === 'updatedAt') {
                        return new Date(b.updatedAt) - new Date(a.updatedAt);
                    }
                    if (params.sortBy === 'title') {
                        return a.title.localeCompare(b.title);
                    }
                    if (params.sortBy === 'atsScore') {
                        return (b.analysis?.atsScore || 0) - (a.analysis?.atsScore || 0);
                    }
                    return 0;
                });
            }

            return filteredResumes;
        }

        try {
            const response = await api.get(`/users/${userId}/resumes`, { params });
            return response.data;
        } catch (error) {
            console.error('Error fetching resumes:', error);
            throw error;
        }
    },

    // Get dashboard statistics
    async getDashboardStats(userId) {
        if (IS_DEVELOPMENT) {
            console.log('[MOCK] Getting dashboard stats for user:', userId);
            await new Promise(resolve => setTimeout(resolve, 200));
            return MOCK_DASHBOARD_STATS;
        }

        try {
            const response = await api.get(`/users/${userId}/dashboard/stats`);
            return response.data;
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
            throw error;
        }
    },

    // Create new resume
    async createResume(userId, resumeData) {
        if (IS_DEVELOPMENT) {
            console.log('[MOCK] Creating resume for user:', userId, resumeData);
            await new Promise(resolve => setTimeout(resolve, 500));

            const newResume = {
                _id: `resume-${Date.now()}`,
                ...resumeData,
                userId,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                status: 'draft',
                analysis: null,
                isPrimary: false,
                starred: false
            };

            // Add to mock data
            MOCK_RESUMES.unshift(newResume);
            MOCK_DASHBOARD_STATS.totalResumes += 1;
            MOCK_DASHBOARD_STATS.inProgressResumes += 1;

            // Add to recent activity
            MOCK_DASHBOARD_STATS.recentActivity.unshift({
                type: 'create',
                description: `Created "${resumeData.title}" resume`,
                timestamp: new Date().toISOString()
            });

            return newResume;
        }

        try {
            const response = await api.post(`/users/${userId}/resumes`, resumeData);
            return response.data;
        } catch (error) {
            console.error('Error creating resume:', error);
            throw error;
        }
    },

    // Get single resume
    async getResume(userId, resumeId) {
        if (IS_DEVELOPMENT) {
            console.log('[MOCK] Getting resume:', { userId, resumeId });
            await new Promise(resolve => setTimeout(resolve, 200));
            return MOCK_RESUMES.find(r => r._id === resumeId) || null;
        }

        try {
            const response = await api.get(`/users/${userId}/resumes/${resumeId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching resume:', error);
            throw error;
        }
    },

    // Update resume
    async updateResume(userId, resumeId, updates) {
        if (IS_DEVELOPMENT) {
            console.log('[MOCK] Updating resume:', { userId, resumeId, updates });
            await new Promise(resolve => setTimeout(resolve, 300));

            const index = MOCK_RESUMES.findIndex(r => r._id === resumeId);
            if (index !== -1) {
                MOCK_RESUMES[index] = { ...MOCK_RESUMES[index], ...updates, updatedAt: new Date().toISOString() };

                // Add to recent activity
                MOCK_DASHBOARD_STATS.recentActivity.unshift({
                    type: 'edit',
                    description: `Updated "${MOCK_RESUMES[index].title}" resume`,
                    timestamp: new Date().toISOString()
                });

                return MOCK_RESUMES[index];
            }
            throw new Error('Resume not found');
        }

        try {
            const response = await api.put(`/users/${userId}/resumes/${resumeId}`, updates);
            return response.data;
        } catch (error) {
            console.error('Error updating resume:', error);
            throw error;
        }
    },

    // Delete resume
    async deleteResume(userId, resumeId) {
        if (IS_DEVELOPMENT) {
            console.log('[MOCK] Deleting resume:', { userId, resumeId });
            await new Promise(resolve => setTimeout(resolve, 400));

            const index = MOCK_RESUMES.findIndex(r => r._id === resumeId);
            if (index !== -1) {
                const deletedResume = MOCK_RESUMES[index];
                MOCK_RESUMES.splice(index, 1);

                // Update stats
                MOCK_DASHBOARD_STATS.totalResumes -= 1;
                if (deletedResume.status === 'completed') {
                    MOCK_DASHBOARD_STATS.completedResumes -= 1;
                } else {
                    MOCK_DASHBOARD_STATS.inProgressResumes -= 1;
                }

                // Add to recent activity
                MOCK_DASHBOARD_STATS.recentActivity.unshift({
                    type: 'delete',
                    description: `Deleted "${deletedResume.title}" resume`,
                    timestamp: new Date().toISOString()
                });

                return { success: true, message: 'Resume deleted successfully' };
            }
            throw new Error('Resume not found');
        }

        try {
            await api.delete(`/users/${userId}/resumes/${resumeId}`);
            return { success: true, message: 'Resume deleted successfully' };
        } catch (error) {
            console.error('Error deleting resume:', error);
            throw error;
        }
    },

    // Duplicate resume
    async duplicateResume(userId, resumeId) {
        if (IS_DEVELOPMENT) {
            console.log('[MOCK] Duplicating resume:', { userId, resumeId });
            await new Promise(resolve => setTimeout(resolve, 500));

            const originalResume = MOCK_RESUMES.find(r => r._id === resumeId);
            if (!originalResume) throw new Error('Resume not found');

            const duplicatedResume = {
                ...originalResume,
                _id: `resume-${Date.now()}`,
                title: `${originalResume.title} (Copy)`,
                isPrimary: false,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            MOCK_RESUMES.unshift(duplicatedResume);
            MOCK_DASHBOARD_STATS.totalResumes += 1;

            if (originalResume.status === 'completed') {
                MOCK_DASHBOARD_STATS.completedResumes += 1;
            } else {
                MOCK_DASHBOARD_STATS.inProgressResumes += 1;
            }

            return duplicatedResume;
        }

        try {
            const response = await api.post(`/users/${userId}/resumes/${resumeId}/duplicate`);
            return response.data;
        } catch (error) {
            console.error('Error duplicating resume:', error);
            throw error;
        }
    },

    // Export resume
    async exportResume(userId, resumeId, format = 'pdf') {
        if (IS_DEVELOPMENT) {
            console.log('[MOCK] Exporting resume:', { userId, resumeId, format });
            await new Promise(resolve => setTimeout(resolve, 800));

            // Add to recent activity
            MOCK_DASHBOARD_STATS.recentActivity.unshift({
                type: 'export',
                description: `Exported resume as ${format.toUpperCase()}`,
                timestamp: new Date().toISOString()
            });

            return {
                success: true,
                message: `Exported as ${format.toUpperCase()}`,
                url: `data:application/${format};base64,mock-export-data-${resumeId}`,
                filename: `resume_${resumeId}_${new Date().getTime()}.${format}`
            };
        }

        try {
            const response = await api.get(`/users/${userId}/resumes/${resumeId}/export`, {
                params: { format },
                responseType: 'blob'
            });
            return response.data;
        } catch (error) {
            console.error('Error exporting resume:', error);
            throw error;
        }
    },

    // Set resume as primary
    async setAsPrimary(userId, resumeId) {
        if (IS_DEVELOPMENT) {
            console.log('[MOCK] Setting resume as primary:', { userId, resumeId });
            await new Promise(resolve => setTimeout(resolve, 300));

            // Remove primary from all resumes
            MOCK_RESUMES.forEach(resume => {
                if (resume._id !== resumeId) {
                    resume.isPrimary = false;
                }
            });

            // Set the selected resume as primary
            const resume = MOCK_RESUMES.find(r => r._id === resumeId);
            if (resume) {
                resume.isPrimary = true;
                resume.updatedAt = new Date().toISOString();
            }

            return { success: true, message: 'Resume set as primary' };
        }

        try {
            const response = await api.patch(`/users/${userId}/resumes/${resumeId}/primary`);
            return response.data;
        } catch (error) {
            console.error('Error setting resume as primary:', error);
            throw error;
        }
    },

    // Get ATS insights
    async getATSInsights(userId) {
        if (IS_DEVELOPMENT) {
            console.log('[MOCK] Getting ATS insights for user:', userId);
            await new Promise(resolve => setTimeout(resolve, 400));

            const atsScores = MOCK_RESUMES.map(r => r.analysis?.atsScore || 0).filter(score => score > 0);
            const averageScore = atsScores.length > 0
                ? Math.round(atsScores.reduce((a, b) => a + b, 0) / atsScores.length)
                : 0;

            return {
                averageScore,
                distribution: {
                    excellent: MOCK_RESUMES.filter(r => (r.analysis?.atsScore || 0) >= 80).length,
                    good: MOCK_RESUMES.filter(r => (r.analysis?.atsScore || 0) >= 60 && (r.analysis?.atsScore || 0) < 80).length,
                    average: MOCK_RESUMES.filter(r => (r.analysis?.atsScore || 0) >= 40 && (r.analysis?.atsScore || 0) < 60).length,
                    poor: MOCK_RESUMES.filter(r => (r.analysis?.atsScore || 0) < 40).length
                },
                suggestions: [
                    'Add more action verbs to your experience section',
                    'Include metrics and numbers to quantify achievements',
                    'Tailor your resume to specific job descriptions',
                    'Use standard section headers for better ATS parsing'
                ]
            };
        }

        try {
            const response = await api.get(`/users/${userId}/dashboard/ats-insights`);
            return response.data;
        } catch (error) {
            console.error('Error fetching ATS insights:', error);
            throw error;
        }
    },

    // Sync with cloud
    async syncWithCloud(userId) {
        if (IS_DEVELOPMENT) {
            console.log('[MOCK] Syncing with cloud for user:', userId);
            await new Promise(resolve => setTimeout(resolve, 1000));

            MOCK_DASHBOARD_STATS.lastSynced = new Date().toISOString();

            return {
                success: true,
                message: 'Synced successfully',
                timestamp: new Date().toISOString(),
                syncedCount: MOCK_RESUMES.length
            };
        }

        try {
            const response = await api.post(`/users/${userId}/sync`);
            return response.data;
        } catch (error) {
            console.error('Error syncing with cloud:', error);
            throw error;
        }
    },

    // Get notifications
    async getNotifications(userId) {
        if (IS_DEVELOPMENT) {
            console.log('[MOCK] Getting notifications for user:', userId);
            await new Promise(resolve => setTimeout(resolve, 300));

            return [
                {
                    id: '1',
                    type: 'info',
                    title: 'Resume Analyzed',
                    message: 'Your "Software Engineer" resume scored 85 on ATS',
                    timestamp: new Date(Date.now() - 3600000).toISOString(),
                    read: false,
                    action: { type: 'view', resumeId: '1' }
                },
                {
                    id: '2',
                    type: 'success',
                    title: 'Export Complete',
                    message: 'Your resume has been exported as PDF',
                    timestamp: new Date(Date.now() - 7200000).toISOString(),
                    read: true,
                    action: { type: 'download', resumeId: '3' }
                },
                {
                    id: '3',
                    type: 'warning',
                    title: 'Storage Warning',
                    message: 'You have used 65% of your storage',
                    timestamp: new Date(Date.now() - 86400000).toISOString(),
                    read: false,
                    action: { type: 'upgrade' }
                }
            ];
        }

        try {
            const response = await api.get(`/users/${userId}/notifications`);
            return response.data;
        } catch (error) {
            console.error('Error fetching notifications:', error);
            throw error;
        }
    },

    // Mark notification as read
    async markNotificationAsRead(userId, notificationId) {
        if (IS_DEVELOPMENT) {
            console.log('[MOCK] Marking notification as read:', { userId, notificationId });
            await new Promise(resolve => setTimeout(resolve, 200));
            return { success: true, message: 'Notification marked as read' };
        }

        try {
            const response = await api.patch(`/users/${userId}/notifications/${notificationId}/read`);
            return response.data;
        } catch (error) {
            console.error('Error marking notification as read:', error);
            throw error;
        }
    },

    // Clear all notifications
    async clearNotifications(userId) {
        if (IS_DEVELOPMENT) {
            console.log('[MOCK] Clearing notifications for user:', userId);
            await new Promise(resolve => setTimeout(resolve, 300));
            return { success: true, message: 'All notifications cleared', count: 3 };
        }

        try {
            const response = await api.delete(`/users/${userId}/notifications`);
            return response.data;
        } catch (error) {
            console.error('Error clearing notifications:', error);
            throw error;
        }
    },

    // Get storage usage
    async getStorageUsage(userId) {
        if (IS_DEVELOPMENT) {
            console.log('[MOCK] Getting storage usage for user:', userId);
            await new Promise(resolve => setTimeout(resolve, 200));
            return {
                used: '65.2 MB',
                limit: '500 MB',
                percentage: 13.04,
                files: MOCK_RESUMES.length,
                lastUpdated: new Date().toISOString()
            };
        }

        try {
            const response = await api.get(`/users/${userId}/storage`);
            return response.data;
        } catch (error) {
            console.error('Error fetching storage usage:', error);
            throw error;
        }
    },

    // Bulk export resumes
    async bulkExportResumes(userId, resumeIds, format = 'pdf') {
        if (IS_DEVELOPMENT) {
            console.log('[MOCK] Bulk exporting resumes:', { userId, resumeIds, format });
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Add to recent activity
            MOCK_DASHBOARD_STATS.recentActivity.unshift({
                type: 'export',
                description: `Bulk exported ${resumeIds.length} resumes`,
                timestamp: new Date().toISOString()
            });

            return {
                success: true,
                message: `Exported ${resumeIds.length} resumes as ZIP`,
                url: `data:application/zip;base64,mock-bulk-export-data`,
                filename: `resumes_${new Date().getTime()}.zip`,
                format: 'zip',
                count: resumeIds.length,
                size: `${(resumeIds.length * 0.8).toFixed(1)} MB`
            };
        }

        try {
            const response = await api.post(`/users/${userId}/resumes/bulk-export`, {
                resumeIds,
                format
            }, {
                responseType: 'blob'
            });
            return response.data;
        } catch (error) {
            console.error('Error bulk exporting resumes:', error);
            throw error;
        }
    },

    // Analyze resume with AI
    async analyzeResume(userId, resumeId) {
        if (IS_DEVELOPMENT) {
            console.log('[MOCK] Analyzing resume with AI:', { userId, resumeId });
            await new Promise(resolve => setTimeout(resolve, 1200));

            const resume = MOCK_RESUMES.find(r => r._id === resumeId);
            if (!resume) throw new Error('Resume not found');

            const analysis = {
                atsScore: Math.floor(Math.random() * 30) + 70, // 70-100
                completeness: Math.floor(Math.random() * 20) + 80, // 80-100
                suggestions: [
                    'Consider adding more metrics to quantify achievements',
                    'Use industry-standard keywords for better ATS compatibility',
                    'Ensure consistent formatting throughout the document',
                    'Highlight specific technical skills relevant to the position'
                ],
                strengths: [
                    'Clear and concise work experience descriptions',
                    'Good use of action verbs',
                    'Proper contact information formatting'
                ],
                areasForImprovement: [
                    'Could benefit from more quantifiable achievements',
                    'Consider adding a skills proficiency section',
                    'Summary section could be more targeted'
                ],
                timestamp: new Date().toISOString()
            };

            // Update resume analysis
            resume.analysis = analysis;
            resume.updatedAt = new Date().toISOString();

            // Update dashboard stats
            const allScores = MOCK_RESUMES
                .map(r => r.analysis?.atsScore || 0)
                .filter(score => score > 0);
            MOCK_DASHBOARD_STATS.averageAtsScore = allScores.length > 0
                ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length)
                : 0;

            // Add to recent activity
            MOCK_DASHBOARD_STATS.recentActivity.unshift({
                type: 'analyze',
                description: `AI analysis completed for "${resume.title}"`,
                timestamp: new Date().toISOString()
            });

            return analysis;
        }

        try {
            const response = await api.post(`/users/${userId}/resumes/${resumeId}/analyze`);
            return response.data;
        } catch (error) {
            console.error('Error analyzing resume:', error);
            throw error;
        }
    }
};

// Also export as default for backward compatibility
export default dashboardService;