// src/context/ResumeContext.jsx
import React, { createContext, useState, useContext, useCallback } from 'react';
import toast from 'react-hot-toast';

const ResumeContext = createContext({});

export const useResume = () => useContext(ResumeContext);

export const ResumeProvider = ({ children }) => {
    const [resumes, setResumes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Mock data for development
    const mockResumes = [
        {
            id: '1',
            title: 'Software Engineer Resume',
            template: 'modern',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            content: {
                personalInfo: {
                    firstName: 'John',
                    lastName: 'Doe',
                    email: 'john.doe@example.com'
                },
                summary: 'Experienced software engineer with 5+ years in full-stack development.',
                experience: [
                    { title: 'Senior Developer', company: 'Tech Corp', duration: '2020-Present' }
                ],
                education: [
                    { degree: 'BSc Computer Science', university: 'State University', year: '2019' }
                ],
                skills: ['JavaScript', 'React', 'Node.js', 'Python'],
                projects: [
                    { name: 'E-commerce Platform', description: 'Built a full-stack e-commerce solution' }
                ],
                certifications: [
                    { name: 'AWS Certified Developer', issuer: 'Amazon' }
                ]
            }
        },
        {
            id: '2',
            title: 'Marketing Manager Resume',
            template: 'professional',
            createdAt: new Date(Date.now() - 86400000).toISOString(), // Yesterday
            updatedAt: new Date(Date.now() - 86400000).toISOString(),
            content: {
                personalInfo: {
                    firstName: 'Jane',
                    lastName: 'Smith',
                    email: 'jane.smith@example.com'
                },
                summary: 'Marketing professional with expertise in digital marketing strategies.',
                experience: [
                    { title: 'Marketing Manager', company: 'Digital Agency', duration: '2018-2020' }
                ],
                education: [
                    { degree: 'MBA Marketing', university: 'Business School', year: '2017' }
                ],
                skills: ['SEO', 'Social Media', 'Content Strategy', 'Analytics'],
                projects: [],
                certifications: []
            }
        }
    ];

    const fetchResumes = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('token');

            // If no token, use mock data
            if (!token) {
                console.log('No token found, using mock data');
                setResumes(mockResumes);
                return mockResumes;
            }

            const response = await fetch('/api/resumes', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            // Check if response is JSON
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                // Server returned HTML/error page, use mock data
                console.warn('Server returned non-JSON response, using mock data');
                setResumes(mockResumes);
                return mockResumes;
            }

            if (!response.ok) {
                throw new Error(`Server error: ${response.status}`);
            }

            const data = await response.json();

            // Validate response structure
            if (!data || !Array.isArray(data.resumes)) {
                console.warn('Invalid response structure, using mock data');
                setResumes(mockResumes);
                return mockResumes;
            }

            setResumes(data.resumes || []);
            return data.resumes || [];
        } catch (err) {
            console.warn('Error fetching resumes, using mock data:', err.message);
            // Use mock data as fallback
            setResumes(mockResumes);
            return mockResumes;
        } finally {
            setLoading(false);
        }
    }, []);

    const createResume = async (resumeData) => {
        try {
            // For now, create mock resume
            const newResume = {
                id: Date.now().toString(),
                title: resumeData.title || 'New Resume',
                template: resumeData.template || 'modern',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                content: {
                    personalInfo: {},
                    summary: '',
                    experience: [],
                    education: [],
                    skills: [],
                    projects: [],
                    certifications: []
                }
            };

            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 500));

            setResumes(prev => [newResume, ...prev]);
            toast.success('Resume created successfully!');
            return newResume;
        } catch (err) {
            toast.error('Failed to create resume');
            throw err;
        }
    };

    const deleteResume = async (resumeId) => {
        try {
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 300));

            setResumes(prev => prev.filter(resume => resume.id !== resumeId));
            toast.success('Resume deleted successfully');
        } catch (err) {
            toast.error('Failed to delete resume');
            throw err;
        }
    };

    const duplicateResume = async (resumeId) => {
        try {
            const originalResume = resumes.find(r => r.id === resumeId);
            if (!originalResume) {
                throw new Error('Resume not found');
            }

            const duplicatedResume = {
                ...originalResume,
                id: Date.now().toString(),
                title: `${originalResume.title} (Copy)`,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 300));

            setResumes(prev => [duplicatedResume, ...prev]);
            toast.success('Resume duplicated successfully');
        } catch (err) {
            toast.error('Failed to duplicate resume');
            throw err;
        }
    };

    const exportResume = async (resumeId, format = 'json') => {
        try {
            const resume = resumes.find(r => r.id === resumeId);
            if (!resume) {
                throw new Error('Resume not found');
            }

            // Create and download JSON file
            const dataStr = JSON.stringify(resume, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });

            const url = window.URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `resume-${resumeId}.${format}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            toast.success('Resume exported successfully!');
        } catch (err) {
            toast.error('Failed to export resume');
            throw err;
        }
    };

    const getResumeStats = async () => {
        try {
            // Calculate stats from local data
            const total = resumes.length;

            const recent = resumes.filter(r => {
                const date = r.updatedAt || r.createdAt;
                if (!date) return false;
                const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                return new Date(date) > weekAgo;
            }).length;

            const completed = resumes.filter(r => {
                const data = r.content || {};
                return data.summary && data.summary.trim().length > 50 &&
                    data.experience && data.experience.length > 0;
            }).length;

            const templates = resumes.reduce((acc, r) => {
                const template = r.template || 'unknown';
                acc[template] = (acc[template] || 0) + 1;
                return acc;
            }, {});

            // Calculate average progress
            const averageScore = resumes.length > 0
                ? resumes.reduce((acc, r) => {
                    const data = r.content || {};
                    let completed = 0;
                    let total = 7;

                    if (data.personalInfo?.firstName && data.personalInfo?.email) completed++;
                    if (data.summary && data.summary.trim().length > 50) completed++;
                    if (data.experience && data.experience.length > 0) completed++;
                    if (data.education && data.education.length > 0) completed++;
                    if (data.skills && data.skills.length > 0) completed++;
                    if (data.projects && data.projects.length > 0) completed++;
                    if (data.certifications && data.certifications.length > 0) completed++;

                    return acc + (completed / total) * 100;
                }, 0) / resumes.length
                : 0;

            return {
                total,
                recent,
                completed,
                templates,
                averageScore: Math.round(averageScore)
            };
        } catch (err) {
            console.error('Error calculating stats:', err);
            return {
                total: resumes.length,
                recent: 0,
                completed: 0,
                templates: {},
                averageScore: 0
            };
        }
    };

    const searchResumes = async (query, filter, sortBy) => {
        try {
            let filtered = [...resumes];

            if (query) {
                const lowerQuery = query.toLowerCase();
                filtered = filtered.filter(resume => {
                    const data = resume.content || {};
                    return (
                        (resume.title || '').toLowerCase().includes(lowerQuery) ||
                        (data.personalInfo?.firstName || '').toLowerCase().includes(lowerQuery) ||
                        (data.personalInfo?.lastName || '').toLowerCase().includes(lowerQuery) ||
                        (data.summary || '').toLowerCase().includes(lowerQuery)
                    );
                });
            }

            if (filter !== 'all') {
                filtered = filtered.filter(resume => resume.template === filter);
            }

            // Apply sorting
            filtered.sort((a, b) => {
                const getDate = (resume) => {
                    if (resume.updatedAt) return new Date(resume.updatedAt);
                    if (resume.createdAt) return new Date(resume.createdAt);
                    return new Date(0);
                };

                switch (sortBy) {
                    case 'title':
                        return (a.title || '').localeCompare(b.title || '');
                    case 'created':
                        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
                    case 'updated':
                    default:
                        return getDate(b) - getDate(a);
                }
            });

            return filtered;
        } catch (err) {
            console.error('Search error:', err);
            return resumes;
        }
    };

    // Fetch resumes on mount
    React.useEffect(() => {
        fetchResumes();
    }, [fetchResumes]);

    return (
        <ResumeContext.Provider
            value={{
                resumes,
                loading,
                error,
                fetchResumes,
                createResume,
                deleteResume,
                duplicateResume,
                exportResume,
                getResumeStats,
                searchResumes,
                refreshResumes: fetchResumes
            }}
        >
            {children}
        </ResumeContext.Provider>
    );
};