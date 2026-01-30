import api from './api';

const resumeService = {
    // Get all user resumes
    async getUserResumes() {
        try {
            const response = await api.get('/resumes');
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to fetch resumes');
        }
    },

    // Get single resume
    async getResume(id) {
        try {
            const response = await api.get(`/resumes/${id}`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to fetch resume');
        }
    },

    // Create new resume
    async createResume(resumeData) {
        try {
            const response = await api.post('/resumes', resumeData);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to create resume');
        }
    },

    // Update resume
    async updateResume(id, resumeData) {
        try {
            const response = await api.put(`/resumes/${id}`, resumeData);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to update resume');
        }
    },

    // Delete resume
    async deleteResume(id) {
        try {
            await api.delete(`/resumes/${id}`);
            return { success: true };
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to delete resume');
        }
    },

    // Duplicate resume
    async duplicateResume(id) {
        try {
            const response = await api.post(`/resumes/${id}/duplicate`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to duplicate resume');
        }
    },

    // Export to PDF
    async exportToPDF(resumeData) {
        try {
            const response = await api.post('/export/pdf', resumeData, {
                responseType: 'blob'
            });
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to export PDF');
        }
    },

    // Export to DOCX
    async exportToDOCX(resumeData) {
        try {
            const response = await api.post('/export/docx', resumeData, {
                responseType: 'blob'
            });
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to export DOCX');
        }
    },

    // Share resume (generate shareable link)
    async shareResume(id, settings = {}) {
        try {
            const response = await api.post(`/resumes/${id}/share`, settings);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to share resume');
        }
    },

    // Get shared resume (public view)
    async getSharedResume(shareId) {
        try {
            const response = await api.get(`/shared/${shareId}`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to fetch shared resume');
        }
    },

    // Auto-save draft
    async autoSaveDraft(id, draftData) {
        try {
            const response = await api.patch(`/resumes/${id}/draft`, draftData);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Auto-save failed');
        }
    },

    // Update resume status
    async updateStatus(id, status) {
        try {
            const response = await api.patch(`/resumes/${id}/status`, { status });
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to update status');
        }
    },

    // Get resume analytics
    async getAnalytics(id) {
        try {
            const response = await api.get(`/resumes/${id}/analytics`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to fetch analytics');
        }
    },

    // Import resume from file
    async importResume(file, format) {
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('format', format);

            const response = await api.post('/resumes/import', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to import resume');
        }
    },

    // Parse resume from text (AI feature)
    async parseResumeFromText(text) {
        try {
            const response = await api.post('/resumes/parse', { text });
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to parse resume');
        }
    },

    // Get resume templates
    async getTemplates() {
        try {
            const response = await api.get('/templates');
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to fetch templates');
        }
    },

    // Get template by ID
    async getTemplate(id) {
        try {
            const response = await api.get(`/templates/${id}`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to fetch template');
        }
    },
};

export default resumeService;