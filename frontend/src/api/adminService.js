import axios from 'axios';
import api from './axiosConfig';

const base = '/api/admin';

const adminService = {
    getStats: () => api.get(`${base}/stats`).then(r => r.data),
    listUsers: (params) => api.get(`${base}/users`, { params }).then(r => r.data),
    changeUserRole: (id, role) => api.put(`${base}/users/${id}/role`, { role }).then(r => r.data),
    updateUserStatus: (id, action) => api.put(`${base}/users/${id}/status`, { action }).then(r => r.data),
    getUserActivity: (id) => api.get(`${base}/users/${id}/activity`).then(r => r.data),

    listResumes: (params) => api.get(`${base}/resumes`, { params }).then(r => r.data),
    getResume: (id) => api.get(`${base}/resumes/${id}`).then(r => r.data),

    listTemplates: () => api.get(`${base}/templates`).then(r => r.data),
    createTemplate: (payload) => api.post(`${base}/templates`, payload).then(r => r.data),
    updateTemplate: (id, payload) => api.put(`${base}/templates/${id}`, payload).then(r => r.data),
    deleteTemplate: (id) => api.delete(`${base}/templates/${id}`).then(r => r.data),
};

export default adminService;
