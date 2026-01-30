import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { resumeService } from '../services/api';

// Create context
const ResumeContext = createContext();

// Custom hook to use resume context
export const useResumes = () => {
  const context = useContext(ResumeContext);
  if (!context) {
    throw new Error('useResumes must be used within a ResumeProvider');
  }
  return context;
};

// Provider component
export const ResumeProvider = ({ children }) => {
  const [resumes, setResumes] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Load resumes from API
  const loadResumes = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('📥 Loading resumes...');
      const resumesData = await resumeService.getUserResumes();
      console.log(`✅ Loaded ${resumesData.length} resumes`);

      setResumes(resumesData);
      setLastUpdated(new Date());

      // Load stats
      try {
        const statsData = await resumeService.getResumeStats();
        setStats(statsData);
      } catch (statsError) {
        console.warn('Could not load stats:', statsError.message);
        // Calculate stats locally
        const localStats = resumeService.calculateStatsFromResumes(resumesData);
        setStats(localStats);
      }
    } catch (err) {
      console.error('❌ Failed to load resumes:', err);
      setError(err.message || 'Failed to load resumes');

      // Set empty arrays
      setResumes([]);
      setStats(resumeService.getDefaultStats());
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadResumes();
  }, [loadResumes]);

  // Create new resume
  const createResume = async (resumeData) => {
    try {
      setLoading(true);
      const newResume = await resumeService.createResume(resumeData);

      // Update local state
      setResumes(prev => [newResume, ...prev]);
      setLastUpdated(new Date());

      // Update stats
      const updatedStats = await resumeService.getResumeStats();
      setStats(updatedStats);

      return newResume;
    } catch (err) {
      console.error('Failed to create resume:', err);
      setError(err.message || 'Failed to create resume');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update existing resume
  const updateResume = async (id, resumeData) => {
    try {
      const updatedResume = await resumeService.updateResume(id, resumeData);

      // Update local state
      setResumes(prev => prev.map(resume =>
        resume._id === id || resume.id === id ? updatedResume : resume
      ));
      setLastUpdated(new Date());

      // Update stats
      const updatedStats = await resumeService.getResumeStats();
      setStats(updatedStats);

      return updatedResume;
    } catch (err) {
      console.error('Failed to update resume:', err);

      // If offline, we still update local state
      if (err.message.includes('offline') || !err.response) {
        const localResume = {
          ...resumeData,
          _id: id,
          updatedAt: new Date().toISOString(),
          offline: true
        };

        setResumes(prev => prev.map(resume =>
          resume._id === id || resume.id === id ? localResume : resume
        ));

        // Update stats locally
        const updatedResumes = resumes.map(r =>
          r._id === id || r.id === id ? localResume : r
        );
        const localStats = resumeService.calculateStatsFromResumes(updatedResumes);
        setStats(localStats);

        return localResume;
      }

      throw err;
    }
  };

  // Delete resume
  const deleteResume = async (id) => {
    try {
      const result = await resumeService.deleteResume(id);

      if (result.success) {
        // Update local state
        setResumes(prev => prev.filter(resume =>
          resume._id !== id && resume.id !== id
        ));
        setLastUpdated(new Date());

        // Update stats
        const updatedStats = await resumeService.getResumeStats();
        setStats(updatedStats);
      }

      return result;
    } catch (err) {
      console.error('Failed to delete resume:', err);

      // If offline, we still update local state
      if (err.message.includes('offline') || !err.response) {
        setResumes(prev => prev.filter(resume =>
          resume._id !== id && resume.id !== id
        ));

        // Update stats locally
        const updatedResumes = resumes.filter(r => r._id !== id && r.id !== id);
        const localStats = resumeService.calculateStatsFromResumes(updatedResumes);
        setStats(localStats);

        return { success: true, offline: true };
      }

      throw err;
    }
  };

  // Get single resume
  const getResume = async (id) => {
    if (!id || id === 'new') {
      return resumeService.getEmptyResume();
    }

    // First check if we have it locally
    const localResume = resumes.find(r => r._id === id || r.id === id);
    if (localResume) {
      return localResume;
    }

    // Otherwise fetch from API
    try {
      return await resumeService.getResume(id);
    } catch (err) {
      console.error('Failed to get resume:', err);
      throw err;
    }
  };

  // Refresh resumes
  const refreshResumes = async () => {
    await loadResumes();
  };

  // Get resume by ID
  const getResumeById = (id) => {
    return resumes.find(r => r._id === id || r.id === id);
  };

  // Toggle resume star
  const toggleStar = async (id) => {
    const resume = getResumeById(id);
    if (!resume) return;

    try {
      await updateResume(id, {
        ...resume,
        isStarred: !resume.isStarred
      });
    } catch (err) {
      console.error('Failed to toggle star:', err);
    }
  };

  // Set primary resume
  const setPrimary = async (id) => {
    // First unset all other primary resumes locally
    const updatedResumes = resumes.map(resume => ({
      ...resume,
      isPrimary: resume._id === id || resume.id === id
    }));

    try {
      // Update all resumes
      for (const resume of updatedResumes) {
        if (resume._id === id || resume.id === id) {
          await updateResume(id, { isPrimary: true });
        } else if (resume.isPrimary) {
          await updateResume(resume._id, { isPrimary: false });
        }
      }

      // Update local state
      setResumes(updatedResumes);
    } catch (err) {
      console.error('Failed to set primary resume:', err);
    }
  };

  // Context value
  const value = {
    resumes,
    stats,
    loading,
    error,
    lastUpdated,

    // Actions
    createResume,
    updateResume,
    deleteResume,
    getResume,
    refreshResumes,
    getResumeById,
    toggleStar,
    setPrimary,

    // Computed values
    starredResumes: resumes.filter(r => r.isStarred),
    primaryResume: resumes.find(r => r.isPrimary),
    completedResumes: resumes.filter(r => r.status === 'completed'),
    draftResumes: resumes.filter(r => r.status === 'draft'),
    inProgressResumes: resumes.filter(r => r.status === 'in-progress'),

    // Loading states
    creating: false,
    updating: false,
    deleting: false
  };

  return (
    <ResumeContext.Provider value={value}>
      {children}
    </ResumeContext.Provider>
  );
};

export default ResumeContext;