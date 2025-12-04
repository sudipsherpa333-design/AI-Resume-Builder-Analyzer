// src/context/ResumeContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

// API configuration - use environment variable or fallback
const API_BASE_URL = window.REACT_APP_API_URL || 'http://localhost:5000/api';

// Resume API service
const resumeApi = {
    // Get all resumes for user
    async getResumes(token) {
        try {
            // For demo users, return from localStorage
            if (!token || token.startsWith('demo_token_')) {
                const savedResumes = localStorage.getItem('demo_resumes');
                return {
                    success: true,
                    data: savedResumes ? JSON.parse(savedResumes) : []
                };
            }

            const response = await fetch(`${API_BASE_URL}/resumes`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Failed to fetch resumes');
            }

            return await response.json();
        } catch (error) {
            console.error('Get resumes error:', error);
            throw error;
        }
    },

    // Get single resume by ID
    async getResumeById(id, token) {
        try {
            // For demo users, get from localStorage
            if (!token || token.startsWith('demo_token_')) {
                const savedResumes = localStorage.getItem('demo_resumes');
                const resumes = savedResumes ? JSON.parse(savedResumes) : [];
                const resume = resumes.find(r => r.id === id);

                if (!resume) {
                    throw new Error('Resume not found');
                }

                return { success: true, data: resume };
            }

            const response = await fetch(`${API_BASE_URL}/resumes/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Failed to fetch resume');
            }

            return await response.json();
        } catch (error) {
            console.error('Get resume error:', error);
            throw error;
        }
    },

    // Create new resume
    async createResume(resumeData, token) {
        try {
            // For demo users, save to localStorage
            if (!token || token.startsWith('demo_token_')) {
                const savedResumes = localStorage.getItem('demo_resumes');
                const resumes = savedResumes ? JSON.parse(savedResumes) : [];

                const newResume = {
                    id: `res_${Date.now()}`,
                    ...resumeData,
                    userId: 'demo_user',
                    meta: {
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                        version: 1,
                        score: this.calculateScore(resumeData.content || resumeData.data)
                    }
                };

                const updatedResumes = [newResume, ...resumes];
                localStorage.setItem('demo_resumes', JSON.stringify(updatedResumes));

                return { success: true, data: newResume };
            }

            const response = await fetch(`${API_BASE_URL}/resumes`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(resumeData)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Failed to create resume');
            }

            return await response.json();
        } catch (error) {
            console.error('Create resume error:', error);
            throw error;
        }
    },

    // Update resume
    async updateResume(id, updates, token) {
        try {
            // For demo users, update in localStorage
            if (!token || token.startsWith('demo_token_')) {
                const savedResumes = localStorage.getItem('demo_resumes');
                const resumes = savedResumes ? JSON.parse(savedResumes) : [];
                const index = resumes.findIndex(r => r.id === id);

                if (index === -1) {
                    throw new Error('Resume not found');
                }

                const updatedResume = {
                    ...resumes[index],
                    ...updates,
                    meta: {
                        ...resumes[index].meta,
                        updatedAt: new Date().toISOString(),
                        version: (resumes[index].meta?.version || 0) + 1,
                        score: this.calculateScore(updates.content || updates.data || resumes[index].content || resumes[index].data)
                    }
                };

                resumes[index] = updatedResume;
                localStorage.setItem('demo_resumes', JSON.stringify(resumes));

                return { success: true, data: updatedResume };
            }

            const response = await fetch(`${API_BASE_URL}/resumes/${id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updates)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Failed to update resume');
            }

            return await response.json();
        } catch (error) {
            console.error('Update resume error:', error);
            throw error;
        }
    },

    // Delete resume
    async deleteResume(id, token) {
        try {
            // For demo users, delete from localStorage
            if (!token || token.startsWith('demo_token_')) {
                const savedResumes = localStorage.getItem('demo_resumes');
                const resumes = savedResumes ? JSON.parse(savedResumes) : [];
                const filteredResumes = resumes.filter(r => r.id !== id);

                localStorage.setItem('demo_resumes', JSON.stringify(filteredResumes));
                return { success: true };
            }

            const response = await fetch(`${API_BASE_URL}/resumes/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Failed to delete resume');
            }

            return await response.json();
        } catch (error) {
            console.error('Delete resume error:', error);
            throw error;
        }
    },

    // Duplicate resume
    async duplicateResume(id, token) {
        try {
            // For demo users, duplicate in localStorage
            if (!token || token.startsWith('demo_token_')) {
                const savedResumes = localStorage.getItem('demo_resumes');
                const resumes = savedResumes ? JSON.parse(savedResumes) : [];
                const original = resumes.find(r => r.id === id);

                if (!original) {
                    throw new Error('Resume not found');
                }

                const duplicated = {
                    ...original,
                    id: `res_${Date.now()}`,
                    title: `${original.title} (Copy)`,
                    meta: {
                        ...original.meta,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                        version: 1
                    }
                };

                const updatedResumes = [duplicated, ...resumes];
                localStorage.setItem('demo_resumes', JSON.stringify(updatedResumes));

                return { success: true, data: duplicated };
            }

            const response = await fetch(`${API_BASE_URL}/resumes/${id}/duplicate`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Failed to duplicate resume');
            }

            return await response.json();
        } catch (error) {
            console.error('Duplicate resume error:', error);
            throw error;
        }
    },

    // Export resume
    async exportResume(id, format, token) {
        try {
            // For demo users, export locally
            if (!token || token.startsWith('demo_token_')) {
                const savedResumes = localStorage.getItem('demo_resumes');
                const resumes = savedResumes ? JSON.parse(savedResumes) : [];
                const resume = resumes.find(r => r.id === id);

                if (!resume) {
                    throw new Error('Resume not found');
                }

                let content, fileName, mimeType;

                switch (format) {
                    case 'json':
                        content = JSON.stringify(resume, null, 2);
                        fileName = `${resume.title.replace(/\s+/g, '_')}.json`;
                        mimeType = 'application/json';
                        break;
                    case 'pdf':
                        // Simple text export as fallback for PDF
                        content = this.generateTextResume(resume);
                        fileName = `${resume.title.replace(/\s+/g, '_')}.txt`;
                        mimeType = 'text/plain';
                        break;
                    default:
                        throw new Error('Unsupported export format');
                }

                const blob = new Blob([content], { type: mimeType });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = fileName;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);

                return { success: true };
            }

            const response = await fetch(`${API_BASE_URL}/resumes/${id}/export`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ format })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Failed to export resume');
            }

            return await response.json();
        } catch (error) {
            console.error('Export resume error:', error);
            throw error;
        }
    },

    // Get resume stats
    async getResumeStats(token) {
        try {
            // For demo users, calculate from localStorage
            if (!token || token.startsWith('demo_token_')) {
                const savedResumes = localStorage.getItem('demo_resumes');
                const resumes = savedResumes ? JSON.parse(savedResumes) : [];

                const thirtyDaysAgo = new Date();
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

                const recentCount = resumes.filter(resume => {
                    const updatedAt = new Date(resume.meta?.updatedAt || resume.updatedAt || 0);
                    return updatedAt >= thirtyDaysAgo;
                }).length;

                const completedCount = resumes.filter(resume => {
                    const data = resume.content || resume.data || {};
                    return data.summary && data.summary.trim().length > 50 &&
                        data.experience && data.experience.length > 0;
                }).length;

                const templates = {};
                resumes.forEach(resume => {
                    const template = resume.template || 'modern';
                    templates[template] = (templates[template] || 0) + 1;
                });

                const totalScore = resumes.reduce((sum, resume) =>
                    sum + (resume.meta?.score || this.calculateScore(resume.content || resume.data)), 0
                );
                const averageScore = resumes.length > 0 ? Math.round(totalScore / resumes.length) : 0;

                return {
                    success: true,
                    data: {
                        total: resumes.length,
                        recent: recentCount,
                        completed: completedCount,
                        templates,
                        averageScore
                    }
                };
            }

            const response = await fetch(`${API_BASE_URL}/resumes/stats`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Failed to fetch stats');
            }

            return await response.json();
        } catch (error) {
            console.error('Get stats error:', error);
            throw error;
        }
    },

    // Search resumes
    async searchResumes(query, filter, sort, token) {
        try {
            // For demo users, filter from localStorage
            if (!token || token.startsWith('demo_token_')) {
                const savedResumes = localStorage.getItem('demo_resumes');
                const resumes = savedResumes ? JSON.parse(savedResumes) : [];

                let filtered = [...resumes];

                if (query) {
                    const lowerQuery = query.toLowerCase();
                    filtered = filtered.filter(resume => {
                        const data = resume.content || resume.data || {};
                        return (
                            resume.title.toLowerCase().includes(lowerQuery) ||
                            (data.personalInfo?.firstName?.toLowerCase() || '').includes(lowerQuery) ||
                            (data.personalInfo?.lastName?.toLowerCase() || '').includes(lowerQuery) ||
                            (data.summary?.toLowerCase() || '').includes(lowerQuery)
                        );
                    });
                }

                if (filter && filter !== 'all') {
                    filtered = filtered.filter(resume => resume.template === filter);
                }

                // Apply sorting
                filtered.sort((a, b) => {
                    const getDate = (resume) => {
                        if (resume.updatedAt) return new Date(resume.updatedAt);
                        if (resume.meta?.updatedAt) return new Date(resume.meta.updatedAt);
                        return new Date(0);
                    };

                    switch (sort) {
                        case 'title':
                            return a.title.localeCompare(b.title);
                        case 'created':
                            return new Date(b.createdAt || b.meta?.createdAt || 0) -
                                new Date(a.createdAt || a.meta?.createdAt || 0);
                        case 'updated':
                        default:
                            return getDate(b) - getDate(a);
                    }
                });

                return {
                    success: true,
                    data: filtered
                };
            }

            const params = new URLSearchParams();
            if (query) params.append('q', query);
            if (filter && filter !== 'all') params.append('template', filter);
            params.append('sort', sort);

            const response = await fetch(`${API_BASE_URL}/resumes/search?${params.toString()}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Failed to search resumes');
            }

            return await response.json();
        } catch (error) {
            console.error('Search resumes error:', error);
            throw error;
        }
    },

    // Generate text resume for demo exports
    generateTextResume(resume) {
        const data = resume.content || resume.data || {};
        let text = `RESUME: ${resume.title}\n\n`;
        text += `Personal Information:\n`;
        if (data.personalInfo) {
            const { firstName, lastName, email, phone, location, title } = data.personalInfo;
            text += `${firstName} ${lastName}\n`;
            if (title) text += `${title}\n`;
            text += `${email}\n`;
            if (phone) text += `${phone}\n`;
            if (location) text += `${location}\n`;
        }

        if (data.summary) {
            text += `\nSummary:\n${data.summary}\n`;
        }

        if (data.experience && data.experience.length > 0) {
            text += `\nExperience:\n`;
            data.experience.forEach(exp => {
                text += `${exp.jobTitle || exp.position} at ${exp.company}\n`;
                text += `${exp.startDate} - ${exp.endDate || 'Present'}\n`;
                if (exp.description) text += `${exp.description}\n\n`;
            });
        }

        return text;
    },

    // Calculate resume score
    calculateScore(content) {
        if (!content) return 0;

        let score = 0;
        if (content.personalInfo?.firstName && content.personalInfo?.email) score += 10;
        if (content.summary && content.summary.trim().length > 50) score += 15;
        if (content.experience && content.experience.length > 0) score += 25;
        if (content.education && content.education.length > 0) score += 15;
        if (content.skills && content.skills.length > 0) score += 15;
        if (content.projects && content.projects.length > 0) score += 10;
        if (content.certifications && content.certifications.length > 0) score += 5;
        if (content.languages && content.languages.length > 0) score += 5;

        return Math.min(100, score);
    }
};

// Create context
const ResumeContext = createContext();

// Custom hook to use resume context
export const useResume = () => {
    const context = useContext(ResumeContext);
    if (!context) {
        throw new Error('useResume must be used within ResumeProvider');
    }
    return context;
};

// Resume Provider component
export const ResumeProvider = ({ children }) => {
    const { user, token, isDemo } = useAuth();
    const [resumes, setResumes] = useState([]);
    const [currentResume, setCurrentResume] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [stats, setStats] = useState({
        total: 0,
        recent: 0,
        completed: 0,
        templates: {},
        averageScore: 0
    });

    // Load resumes when user changes
    useEffect(() => {
        const loadResumes = async () => {
            if (!user) {
                setResumes([]);
                setCurrentResume(null);
                return;
            }

            setLoading(true);
            setError(null);

            try {
                const result = await resumeApi.getResumes(token);

                if (result.success) {
                    const formattedResumes = result.data.map(resume => ({
                        ...resume,
                        id: resume._id || resume.id,
                        data: resume.content || resume.data || getDefaultContent()
                    }));

                    setResumes(formattedResumes);
                } else {
                    throw new Error(result.message || 'Failed to load resumes');
                }
            } catch (err) {
                console.error('Error loading resumes:', err);
                setError(err.message);
                toast.error(err.message || 'Failed to load resumes');
            } finally {
                setLoading(false);
            }
        };

        loadResumes();
    }, [user, token]);

    // Load single resume by ID
    const loadResumeById = async (id) => {
        setLoading(true);
        setError(null);

        try {
            const result = await resumeApi.getResumeById(id, token);

            if (result.success) {
                const resume = {
                    ...result.data,
                    id: result.data._id || result.data.id,
                    data: result.data.content || result.data.data || getDefaultContent()
                };

                setCurrentResume(resume);
                return resume;
            } else {
                throw new Error(result.message || 'Failed to load resume');
            }
        } catch (err) {
            console.error('Error loading resume:', err);
            setError(err.message);
            toast.error(err.message || 'Resume not found');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Create new resume
    const createResume = async (resumeData) => {
        setLoading(true);
        setError(null);

        try {
            const result = await resumeApi.createResume(resumeData, token);

            if (result.success) {
                const newResume = {
                    ...result.data,
                    id: result.data._id || result.data.id,
                    data: result.data.content || result.data.data || getDefaultContent()
                };

                setResumes(prev => [newResume, ...prev]);
                setCurrentResume(newResume);
                toast.success('Resume created successfully');
                return newResume;
            } else {
                throw new Error(result.message || 'Failed to create resume');
            }
        } catch (err) {
            console.error('Error creating resume:', err);
            setError(err.message);
            toast.error(err.message || 'Failed to create resume');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Update resume
    const updateResume = async (id, updates) => {
        setLoading(true);
        setError(null);

        try {
            const result = await resumeApi.updateResume(id, updates, token);

            if (result.success) {
                const updatedResume = {
                    ...result.data,
                    id: result.data._id || result.data.id,
                    data: result.data.content || result.data.data
                };

                setResumes(prev =>
                    prev.map(resume => resume.id === id ? updatedResume : resume)
                );

                if (currentResume?.id === id) {
                    setCurrentResume(updatedResume);
                }

                toast.success('Resume updated successfully');
                return updatedResume;
            } else {
                throw new Error(result.message || 'Failed to update resume');
            }
        } catch (err) {
            console.error('Error updating resume:', err);
            setError(err.message);
            toast.error(err.message || 'Failed to update resume');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Delete resume
    const deleteResume = async (id) => {
        setLoading(true);
        setError(null);

        try {
            const result = await resumeApi.deleteResume(id, token);

            if (result.success) {
                setResumes(prev => prev.filter(resume => resume.id !== id));

                if (currentResume?.id === id) {
                    setCurrentResume(null);
                }

                toast.success('Resume deleted successfully');
                return true;
            } else {
                throw new Error(result.message || 'Failed to delete resume');
            }
        } catch (err) {
            console.error('Error deleting resume:', err);
            setError(err.message);
            toast.error(err.message || 'Failed to delete resume');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Duplicate resume
    const duplicateResume = async (id) => {
        setLoading(true);
        setError(null);

        try {
            const result = await resumeApi.duplicateResume(id, token);

            if (result.success) {
                const duplicated = {
                    ...result.data,
                    id: result.data._id || result.data.id,
                    data: result.data.content || result.data.data
                };

                setResumes(prev => [duplicated, ...prev]);
                toast.success('Resume duplicated successfully');
                return duplicated;
            } else {
                throw new Error(result.message || 'Failed to duplicate resume');
            }
        } catch (err) {
            console.error('Error duplicating resume:', err);
            setError(err.message);
            toast.error(err.message || 'Failed to duplicate resume');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Export resume
    const exportResume = async (id, format = 'json') => {
        try {
            const result = await resumeApi.exportResume(id, format, token);

            if (result.success) {
                toast.success(`Resume exported as ${format.toUpperCase()}`);
                return true;
            } else {
                throw new Error(result.message || 'Failed to export resume');
            }
        } catch (err) {
            console.error('Error exporting resume:', err);
            toast.error(err.message || 'Failed to export resume');
            throw err;
        }
    };

    // Get resume stats
    const getResumeStats = useCallback(async () => {
        try {
            const result = await resumeApi.getResumeStats(token);

            if (result.success) {
                const statsData = result.data;
                setStats(statsData);
                return statsData;
            } else {
                throw new Error(result.message || 'Failed to get stats');
            }
        } catch (err) {
            console.error('Error getting stats:', err);
            const defaultStats = {
                total: 0,
                recent: 0,
                completed: 0,
                templates: {},
                averageScore: 0
            };
            setStats(defaultStats);
            return defaultStats;
        }
    }, [token]);

    // Search resumes
    const searchResumes = async (query, filter, sort) => {
        try {
            const result = await resumeApi.searchResumes(query, filter, sort, token);

            if (result.success) {
                return result.data.map(resume => ({
                    ...resume,
                    id: resume._id || resume.id,
                    data: resume.content || resume.data || getDefaultContent()
                }));
            } else {
                throw new Error(result.message || 'Failed to search resumes');
            }
        } catch (err) {
            console.error('Error searching resumes:', err);
            // Return all resumes as fallback
            return resumes;
        }
    };

    // Get default content
    const getDefaultContent = () => ({
        personalInfo: {
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            location: '',
            linkedin: '',
            github: '',
            portfolio: '',
            title: ''
        },
        summary: '',
        experience: [],
        education: [],
        skills: [],
        projects: [],
        certifications: [],
        languages: [],
        references: []
    });

    // Refresh resumes
    const refreshResumes = async () => {
        setLoading(true);
        setError(null);

        try {
            const result = await resumeApi.getResumes(token);

            if (result.success) {
                const formattedResumes = result.data.map(resume => ({
                    ...resume,
                    id: resume._id || resume.id,
                    data: resume.content || resume.data || getDefaultContent()
                }));

                setResumes(formattedResumes);
                toast.success('Resumes refreshed successfully');
            } else {
                throw new Error(result.message || 'Failed to refresh resumes');
            }
        } catch (err) {
            console.error('Error refreshing resumes:', err);
            setError(err.message);
            toast.error(err.message || 'Failed to refresh resumes');
        } finally {
            setLoading(false);
        }
    };

    // Context value
    const value = {
        // State
        resumes,
        currentResume,
        loading,
        error,
        stats,

        // Actions
        loadResumes: refreshResumes, // alias for refreshResumes
        loadResumeById,
        createResume,
        updateResume,
        deleteResume,
        duplicateResume,
        exportResume,
        getResumeStats,
        searchResumes,
        refreshResumes,

        // Helper functions
        getDefaultContent,
        calculateScore: resumeApi.calculateScore,
        setCurrentResume: (resume) => setCurrentResume(resume),
        clearCurrentResume: () => setCurrentResume(null),
        getResumeById: (id) => resumes.find(r => r.id === id)
    };

    return (
        <ResumeContext.Provider value={value}>
            {children}
        </ResumeContext.Provider>
    );
};

export default ResumeContext;