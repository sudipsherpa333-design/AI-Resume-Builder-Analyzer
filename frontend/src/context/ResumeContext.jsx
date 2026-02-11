// src/context/ResumeContext.jsx - FULL REWRITE - FIXED ALL ISSUES
import React, { createContext, useContext, useState, useEffect, useCallback, useRef, useMemo } from 'react';
import apiService from '../services/api';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const ResumeContext = createContext();

export const useResume = () => {
  const context = useContext(ResumeContext);
  if (!context) {
    throw new Error('useResume must be used within ResumeProvider');
  }
  return context;
};

// Empty resume template (same style as yours)
const getEmptyResume = (userId = 'demo-user-123') => ({
  _id: 'new',
  id: 'new',
  userId,
  title: 'Untitled Resume',
  template: 'modern',
  status: 'draft',
  personalInfo: {
    fullName: '',
    email: '',
    phone: '',
    location: '',
    website: '',
    linkedin: '',
    github: '',
    summary: ''
  },
  experience: [],
  education: [],
  skills: [],
  projects: [],
  certifications: [],
  languages: [],
  references: [],
  analysis: {
    atsScore: 0,
    completeness: 0,
    suggestions: ['Add more details to improve your resume']
  },
  settings: {
    template: 'modern',
    color: '#3b82f6',
    font: 'inter',
    fontSize: 'medium'
  },
  tags: [],
  views: 0,
  downloads: 0,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  version: 1
});

export const ResumeProvider = ({ children }) => {
  // ────────────────────────────────────────────────
  // STATE
  // ────────────────────────────────────────────────
  const [resumes, setResumes] = useState([]);
  const [currentResume, setCurrentResume] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [cloudStatus, setCloudStatus] = useState({
    isConnected: false,
    lastSynced: null,
    mode: 'offline'
  });
  const [isSaving, setIsSaving] = useState(false);

  // ────────────────────────────────────────────────
  // REFS (prevent loops & stale closures)
  // ────────────────────────────────────────────────
  const hasLoadedRef = useRef(false);
  const loadCountRef = useRef(0);
  const saveTimeoutRef = useRef(null);
  const mountedRef = useRef(true);
  const navigate = useNavigate();

  // ────────────────────────────────────────────────
  // HELPERS
  // ────────────────────────────────────────────────
  const getUserId = useCallback(() => {
    try {
      const userData = localStorage.getItem('user_data');
      if (userData) {
        const user = JSON.parse(userData);
        return user._id || user.id || 'demo-user-123';
      }
    } catch (err) {
      console.warn('Error parsing user data:', err);
    }
    return 'demo-user-123';
  }, []);

  // ────────────────────────────────────────────────
  // INITIALIZATION
  // ────────────────────────────────────────────────
  useEffect(() => {
    const initialize = async () => {
      if (hasLoadedRef.current) return;
      hasLoadedRef.current = true;

      console.log('🔄 Initializing ResumeContext...');

      // Auto-create new resume if none exists
      if (!currentResume && !loading) {
        console.log('No current resume → auto-creating new one');
        await createResume();
      }

      await loadResumes();
    };

    initialize();

    return () => {
      mountedRef.current = false;
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, []);

  // ────────────────────────────────────────────────
  // LOAD RESUMES (with force refresh option)
  // ────────────────────────────────────────────────
  const loadResumes = useCallback(async (force = false) => {
    if (!force && hasLoadedRef.current && loadCountRef.current > 0) {
      console.log('📦 Using cached resumes');
      return resumes;
    }

    if (loadCountRef.current >= 5) {
      console.warn('Too many load attempts — stopping');
      return resumes;
    }

    loadCountRef.current++;
    setLoading(true);
    setError(null);

    try {
      console.log(`📥 Loading resumes (attempt ${loadCountRef.current})...`);
      const resumesData = await apiService.resume.getUserResumes();

      if (!mountedRef.current) return;

      if (Array.isArray(resumesData) && resumesData.length > 0) {
        console.log(`✅ Loaded ${resumesData.length} resumes`);
        setResumes(resumesData);
        setCloudStatus({
          isConnected: true,
          lastSynced: new Date(),
          mode: 'online'
        });
      } else {
        console.log('📭 No resumes found — starting fresh');
        setResumes([]);
        setCloudStatus({
          isConnected: false,
          lastSynced: new Date(),
          mode: 'offline'
        });
      }

      // Also refresh stats
      try {
        const statsData = await apiService.dashboard.getDashboardStats();
        if (mountedRef.current && statsData) setStats(statsData);
      } catch (statsErr) {
        console.warn('Stats load failed:', statsErr.message);
      }

      setLastUpdated(new Date());
      return resumesData;
    } catch (err) {
      console.error('❌ Load resumes failed:', err);
      if (mountedRef.current) {
        setError(err.message || 'Failed to load resumes');
        setCloudStatus(prev => ({ ...prev, mode: 'offline' }));
        toast.error('Failed to load resumes. Working offline.');
      }
      return [];
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [resumes]);

  // ────────────────────────────────────────────────
  // LOAD SINGLE RESUME
  // ────────────────────────────────────────────────
  const loadResume = useCallback(async (id) => {
    if (!id || id === 'new') {
      const empty = getEmptyResume(getUserId());
      if (mountedRef.current) setCurrentResume(empty);
      return empty;
    }

    setLoading(true);

    try {
      console.log(`📥 Loading resume: ${id}`);

      // Check local first
      const local = resumes.find(r => r._id === id || r.id === id);
      if (local) {
        console.log('✅ Found in local state');
        if (mountedRef.current) setCurrentResume(local);
        return local;
      }

      // Fetch from server
      const data = await apiService.resume.getResume(id);

      if (!mountedRef.current) return data;

      console.log('✅ Resume loaded from server');
      setCurrentResume(data);
      setCloudStatus(prev => ({ ...prev, isConnected: true, mode: 'online' }));
      return data;
    } catch (err) {
      console.error('❌ Load resume failed:', err);
      if (mountedRef.current) {
        setError(err.message || 'Failed to load resume');
        toast.error('Failed to load resume');
      }
      const fallback = getEmptyResume(getUserId());
      if (mountedRef.current) setCurrentResume(fallback);
      return fallback;
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [resumes, getUserId]);

  // ────────────────────────────────────────────────
  // CREATE NEW RESUME
  // ────────────────────────────────────────────────
  const createResume = useCallback(async (initialData = {}) => {
    setIsSaving(true);

    try {
      const userId = getUserId();
      const empty = getEmptyResume(userId);

      const newData = {
        ...empty,
        ...initialData,
        title: initialData.title || `New Resume ${new Date().toLocaleDateString()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      console.log('➕ Creating new resume...');

      // Try cloud first
      let saved;
      try {
        saved = await apiService.resume.createResume(newData);
        console.log('✅ Cloud create success:', saved._id);
      } catch (cloudErr) {
        console.warn('Cloud create failed — saving locally:', cloudErr.message);
        const localId = `local_${Date.now()}`;
        saved = { ...newData, _id: localId, id: localId, offline: true };
      }

      if (!mountedRef.current) return saved;

      // Update state
      setResumes(prev => [saved, ...prev]);
      setCurrentResume(saved);
      setLastUpdated(new Date());

      // Refresh stats
      try {
        const updatedStats = await apiService.dashboard.getDashboardStats();
        if (mountedRef.current) setStats(updatedStats);
      } catch { }

      toast.success('Resume created!');
      return saved;
    } catch (err) {
      console.error('❌ Create resume failed:', err);
      toast.error('Failed to create resume');
      return null;
    } finally {
      if (mountedRef.current) setIsSaving(false);
    }
  }, [getUserId]);

  // ────────────────────────────────────────────────
  // UPDATE RESUME (debounced)
  // ────────────────────────────────────────────────
  const updateResume = useCallback(async (id, resumeData) => {
    if (!id || !resumeData) {
      toast.error('Missing resume ID or data');
      return null;
    }

    // Handle local resumes
    if (id.startsWith('local_')) {
      const updated = { ...resumeData, updatedAt: new Date().toISOString() };
      setResumes(prev => prev.map(r => (r._id === id ? updated : r)));
      if (currentResume?._id === id) setCurrentResume(updated);
      toast.success('Saved locally (offline)');
      return updated;
    }

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

    return new Promise(resolve => {
      saveTimeoutRef.current = setTimeout(async () => {
        setIsSaving(true);

        try {
          const updatedData = {
            ...resumeData,
            updatedAt: new Date().toISOString(),
            version: (resumeData.version || 0) + 1
          };

          console.log('✏️ Updating resume:', id);

          const saved = await apiService.resume.updateResume(id, updatedData);

          if (!mountedRef.current) {
            resolve(saved);
            return;
          }

          // Update state
          setResumes(prev => prev.map(r => (r._id === id ? saved : r)));
          if (currentResume?._id === id) setCurrentResume(saved);

          setLastUpdated(new Date());
          setCloudStatus({ isConnected: true, lastSynced: new Date(), mode: 'online' });

          toast.success('Resume saved!');
          resolve(saved);
        } catch (err) {
          console.error('❌ Update failed:', err);
          toast.error('Save failed — stored locally');

          const localUpdate = {
            ...resumeData,
            _id: id,
            updatedAt: new Date().toISOString(),
            offline: true
          };

          setResumes(prev => prev.map(r => (r._id === id ? localUpdate : r)));
          if (currentResume?._id === id) setCurrentResume(localUpdate);
          setCloudStatus(prev => ({ ...prev, mode: 'offline' }));

          resolve(localUpdate);
        } finally {
          if (mountedRef.current) setIsSaving(false);
        }
      }, 800); // debounce 800ms
    });
  }, [currentResume]);

  // ────────────────────────────────────────────────
  // SAVE (create or update)
  // ────────────────────────────────────────────────
  const saveResume = useCallback(async (resumeData) => {
    if (!resumeData || Object.keys(resumeData).length === 0) {
      console.error('saveResume called with empty/invalid data');
      toast.error('No resume data to save');
      return null;
    }

    const id = resumeData._id || resumeData.id;
    const isNew = !id || id === 'new' || id.startsWith('local_');

    console.log(`Saving: ${isNew ? 'CREATE' : 'UPDATE'}`, {
      id: id || 'new',
      title: resumeData.title || '(no title)'
    });

    return isNew ? createResume(resumeData) : updateResume(id, resumeData);
  }, [createResume, updateResume]);

  // ────────────────────────────────────────────────
  // UPDATE CURRENT RESUME (optimistic + auto-save)
  // ────────────────────────────────────────────────
  const updateCurrentResumeData = useCallback((updates) => {
    setCurrentResume(prev => {
      if (!prev) {
        console.warn('No current resume to update');
        return null;
      }

      const updated = {
        ...prev,
        ...updates,
        updatedAt: new Date().toISOString()
      };

      // Auto-save after update (debounced via updateResume)
      if (prev._id && prev._id !== 'new') {
        updateResume(prev._id, updated).catch(console.error);
      }

      return updated;
    });
  }, [updateResume]);

  // ────────────────────────────────────────────────
  // DELETE RESUME
  // ────────────────────────────────────────────────
  const deleteResume = useCallback(async (id) => {
    if (!id) return toast.error('No resume selected');

    setLoading(true);

    try {
      console.log('🗑️ Deleting:', id);

      if (id.startsWith('local_')) {
        setResumes(prev => prev.filter(r => r._id !== id));
        if (currentResume?._id === id) setCurrentResume(null);
        toast.success('Local resume deleted');
        return;
      }

      await apiService.resume.deleteResume(id);

      setResumes(prev => prev.filter(r => r._id !== id));
      if (currentResume?._id === id) setCurrentResume(null);

      await loadResumes(true);
      toast.success('Resume deleted');
    } catch (err) {
      console.error('❌ Delete failed:', err);
      toast.error('Failed to delete resume');
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [currentResume, loadResumes]);

  // ────────────────────────────────────────────────
  // OTHER HELPERS (same style)
  // ────────────────────────────────────────────────
  const clearCurrentResume = useCallback(() => {
    setCurrentResume(null);
  }, []);

  const getResumeById = useCallback((id) => {
    return resumes.find(r => r._id === id || r.id === id);
  }, [resumes]);

  const refreshResumes = useCallback(async () => {
    console.log('🔄 Manual refresh requested');
    await loadResumes(true);
    toast.success('Resumes refreshed');
  }, [loadResumes]);

  const syncOfflineResumes = useCallback(async () => {
    if (!apiService.auth.isAuthenticated()) {
      toast.error('Login required to sync');
      return;
    }

    const offline = resumes.filter(r => r.offline);
    if (offline.length === 0) return toast.info('Nothing to sync');

    console.log(`🔄 Syncing ${offline.length} offline resume(s)...`);

    let synced = 0;
    for (const res of offline) {
      try {
        const { offline: _, ...clean } = res;
        if (res._id.startsWith('local_')) {
          const created = await apiService.resume.createResume(clean);
          synced++;
          setResumes(prev => prev.map(r => r._id === res._id ? created : r));
        } else {
          await apiService.resume.updateResume(res._id, clean);
          synced++;
        }
      } catch (err) {
        console.error('Sync failed for:', res._id, err);
      }
    }

    if (synced > 0) {
      toast.success(`Synced ${synced} resume(s)`);
      await loadResumes(true);
      setCloudStatus({ isConnected: true, lastSynced: new Date(), mode: 'online' });
    }
  }, [resumes, loadResumes]);

  // ────────────────────────────────────────────────
  // MEMOIZED VALUES
  // ────────────────────────────────────────────────
  const value = useMemo(() => ({
    resumes,
    currentResume,
    stats,
    loading,
    error,
    lastUpdated,
    cloudStatus,
    isSaving,

    starredResumes: resumes.filter(r => r.isStarred),
    primaryResume: resumes.find(r => r.isPrimary),
    completedResumes: resumes.filter(r => r.status === 'completed'),
    draftResumes: resumes.filter(r => r.status === 'draft'),
    inProgressResumes: resumes.filter(r => r.status === 'in-progress'),
    hasResumes: resumes.length > 0,
    hasCurrentResume: !!currentResume,
    isOnline: cloudStatus.isConnected,

    createResume,
    saveResume,
    updateResume,
    deleteResume,
    loadResume,
    loadResumes,
    refreshResumes,
    updateCurrentResumeData,
    clearCurrentResume,
    getResumeById,
    syncOfflineResumes,

    getEmptyResume: () => getEmptyResume(getUserId())
  }), [
    resumes,
    currentResume,
    stats,
    loading,
    error,
    lastUpdated,
    cloudStatus,
    isSaving,
    createResume,
    saveResume,
    updateResume,
    deleteResume,
    loadResume,
    loadResumes,
    refreshResumes,
    updateCurrentResumeData,
    clearCurrentResume,
    getResumeById,
    syncOfflineResumes,
    getUserId
  ]);

  return (
    <ResumeContext.Provider value={value}>
      {children}
    </ResumeContext.Provider>
  );
};