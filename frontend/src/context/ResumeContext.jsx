// src/context/ResumeContext.jsx - UPDATED VERSION
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { resumeService } from '../services/api';

// Create context
const ResumeContext = createContext();

// Custom hook to use resume context (plural - for all resumes)
export const useResumes = () => {
  const context = useContext(ResumeContext);
  if (!context) {
    throw new Error('useResumes must be used within a ResumeProvider');
  }
  return context;
};

// Custom hook for single resume operations (singular)
export const useResume = () => {
  const context = useContext(ResumeContext);
  if (!context) {
    throw new Error('useResume must be used within a ResumeProvider');
  }
  return context;
};

// Provider component
export const ResumeProvider = ({ children }) => {
  const [resumes, setResumes] = useState([]);
  const [currentResume, setCurrentResume] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [cloudStatus, setCloudStatus] = useState({ isConnected: true, lastSynced: new Date() });

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
      setCloudStatus({ isConnected: true, lastSynced: new Date() });

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
      setCloudStatus({ isConnected: false, lastSynced: new Date() });

      // Set empty arrays
      setResumes([]);
      setStats(resumeService.getDefaultStats());
    } finally {
      setLoading(false);
    }
  }, []);

  // Load single resume
  const loadResume = useCallback(async (id) => {
    if (!id || id === 'new') {
      const emptyResume = resumeService.getEmptyResume();
      setCurrentResume(emptyResume);
      return emptyResume;
    }

    setLoading(true);
    try {
      console.log(`📥 Loading resume: ${id}`);
      const resumeData = await resumeService.getResume(id);
      console.log('✅ Resume loaded:', resumeData?.title);

      setCurrentResume(resumeData);
      setCloudStatus({ isConnected: true, lastSynced: new Date() });

      return resumeData;
    } catch (err) {
      console.error('❌ Failed to load resume:', err);
      setError(err.message || 'Failed to load resume');
      setCloudStatus({ isConnected: false, lastSynced: new Date() });
      return null;
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
      setCurrentResume(newResume);
      setLastUpdated(new Date());
      setCloudStatus({ isConnected: true, lastSynced: new Date() });

      // Update stats
      const updatedStats = await resumeService.getResumeStats();
      setStats(updatedStats);

      return newResume;
    } catch (err) {
      console.error('Failed to create resume:', err);
      setError(err.message || 'Failed to create resume');
      setCloudStatus({ isConnected: false, lastSynced: new Date() });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update existing resume
  const updateResume = async (id, resumeData) => {
    try {
      setLoading(true);
      const updatedResume = await resumeService.updateResume(id, resumeData);

      // Update local state
      setResumes(prev => prev.map(resume =>
        resume._id === id || resume.id === id ? updatedResume : resume
      ));

      if (currentResume && (currentResume._id === id || currentResume.id === id)) {
        setCurrentResume(updatedResume);
      }

      setLastUpdated(new Date());
      setCloudStatus({ isConnected: true, lastSynced: new Date() });

      // Update stats
      const updatedStats = await resumeService.getResumeStats();
      setStats(updatedStats);

      return updatedResume;
    } catch (err) {
      console.error('Failed to update resume:', err);
      setCloudStatus({ isConnected: false, lastSynced: new Date() });

      // If offline, we still update local state
      if (err.message.includes('offline') || !err.response) {
        const localResume = {
          ...resumeData,
          _id: id,
          id: id,
          updatedAt: new Date().toISOString(),
          offline: true
        };

        setResumes(prev => prev.map(resume =>
          resume._id === id || resume.id === id ? localResume : resume
        ));

        if (currentResume && (currentResume._id === id || currentResume.id === id)) {
          setCurrentResume(localResume);
        }

        // Update stats locally
        const updatedResumes = resumes.map(r =>
          r._id === id || r.id === id ? localResume : r
        );
        const localStats = resumeService.calculateStatsFromResumes(updatedResumes);
        setStats(localStats);

        return localResume;
      }

      setError(err.message || 'Failed to update resume');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete resume
  const deleteResume = async (id) => {
    try {
      setLoading(true);
      const result = await resumeService.deleteResume(id);

      if (result.success) {
        // Update local state
        setResumes(prev => prev.filter(resume =>
          resume._id !== id && resume.id !== id
        ));

        if (currentResume && (currentResume._id === id || currentResume.id === id)) {
          setCurrentResume(null);
        }

        setLastUpdated(new Date());
        setCloudStatus({ isConnected: !result.offline, lastSynced: new Date() });

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

        if (currentResume && (currentResume._id === id || currentResume.id === id)) {
          setCurrentResume(null);
        }

        setCloudStatus({ isConnected: false, lastSynced: new Date() });

        // Update stats locally
        const updatedResumes = resumes.filter(r => r._id !== id && r.id !== id);
        const localStats = resumeService.calculateStatsFromResumes(updatedResumes);
        setStats(localStats);

        return { success: true, offline: true };
      }

      setError(err.message || 'Failed to delete resume');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get single resume (without setting as current)
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

  // Get resume by ID from local state
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

  // Clear current resume
  const clearCurrentResume = () => {
    setCurrentResume(null);
  };

  // Set current resume
  const setCurrentResumeData = (resume) => {
    setCurrentResume(resume);
  };

  // Context value
  const value = {
    // State
    resumes,
    currentResume,
    stats,
    loading,
    error,
    lastUpdated,
    cloudStatus,

    // Actions
    createResume,
    updateResume,
    deleteResume,
    getResume,
    loadResume,
    refreshResumes,
    getResumeById,
    toggleStar,
    setPrimary,
    clearCurrentResume,
    setCurrentResumeData,

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