// src/context/ResumeContext.jsx - FIXED VERSION
import React, { createContext, useState, useContext, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import { useAuth } from './AuthContext';

const ResumeContext = createContext();

export const useResume = () => {
  const context = useContext(ResumeContext);
  if (!context) {
    throw new Error('useResume must be used within a ResumeProvider');
  }
  return context;
};

// Global request management
let pendingRequests = new Map();
let isInitialLoad = true;
let lastApiCallTime = 0;
const API_COOLDOWN = 1000; // 1 second between API calls

export const ResumeProvider = ({ children }) => {
  const { user, token, isAuthenticated } = useAuth();

  // State
  const [resumes, setResumes] = useState([]);
  const [currentResume, setCurrentResume] = useState(null);
  const [isLoading, setIsLoading] = useState(false); // Changed to false initially
  const [saveStatus, setSaveStatus] = useState('idle');
  const [cloudStatus, setCloudStatus] = useState({
    isConnected: false,
    lastSync: null,
    hasChanges: false
  });

  // Enhanced API Helper with rate limiting and request queuing
  const apiRequest = useCallback(async (endpoint, options = {}) => {
    const requestKey = `${endpoint}_${JSON.stringify(options)}`;

    // Check if same request is already pending
    if (pendingRequests.has(requestKey)) {
      console.log(`⏳ [API] Waiting for existing request: ${endpoint}`);
      return pendingRequests.get(requestKey);
    }

    // Rate limiting: Wait if we called API too recently
    const now = Date.now();
    const timeSinceLastCall = now - lastApiCallTime;
    if (timeSinceLastCall < API_COOLDOWN) {
      await new Promise(resolve => setTimeout(resolve, API_COOLDOWN - timeSinceLastCall));
    }

    try {
      console.log(`📡 [API] Requesting: ${endpoint}`);
      lastApiCallTime = Date.now();

      const headers = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers
      };

      // Create promise for this request
      const requestPromise = (async () => {
        const response = await fetch(`/api${endpoint}`, {
          ...options,
          headers,
          signal: AbortSignal.timeout(10000) // 10 second timeout
        });

        if (!response.ok) {
          // Handle rate limiting specifically
          if (response.status === 429) {
            console.warn('⚠️ [API] Rate limited, waiting 2 seconds...');
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Retry once
            const retryResponse = await fetch(`/api${endpoint}`, {
              ...options,
              headers
            });

            if (!retryResponse.ok) {
              throw new Error('Rate limited - Please try again later');
            }

            const retryData = await retryResponse.json();
            pendingRequests.delete(requestKey);
            return retryData;
          }

          if (response.status === 401) {
            throw new Error('Unauthorized - Please login again');
          }
          if (response.status === 404) {
            throw new Error('Resource not found');
          }
          if (response.status === 500) {
            throw new Error('Server error - Please try again later');
          }

          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `HTTP ${response.status}`);
        }

        const data = await response.json();
        pendingRequests.delete(requestKey);
        return data;
      })();

      // Store the promise
      pendingRequests.set(requestKey, requestPromise);

      return await requestPromise;
    } catch (error) {
      pendingRequests.delete(requestKey);

      // Don't log timeout errors as errors
      if (error.name === 'TimeoutError' || error.name === 'AbortError') {
        console.warn(`⏰ [API] Request timeout: ${endpoint}`);
        throw new Error('Request timeout - Please check your connection');
      }

      console.error(`❌ [API] Request failed for ${endpoint}:`, error);

      // Handle network errors
      if (error.message === 'Failed to fetch' || error.message.includes('NetworkError')) {
        throw new Error('Network error - Please check your connection');
      }

      throw error;
    }
  }, [token]);

  // Load User's Resumes with caching and rate limiting protection - FIXED
  const loadUserResumes = useCallback(async (forceRefresh = false) => {
    console.log('📂 [ResumeContext] Loading resumes...', {
      user,
      isAuthenticated,
      forceRefresh
    });

    // Don't load if we're already loading (unless force refresh)
    if (isLoading && !forceRefresh) {
      console.log('⏳ [ResumeContext] Already loading, skipping...');
      return;
    }

    setIsLoading(true);

    try {
      if (!user || !isAuthenticated) {
        console.log('👤 Guest mode: Loading from localStorage');
        const guestResumes = localStorage.getItem('resumeCraft_resumes_guest');
        if (guestResumes) {
          try {
            const parsedResumes = JSON.parse(guestResumes);
            setResumes(parsedResumes);
            console.log('✅ Loaded guest resumes:', parsedResumes.length);
          } catch (parseError) {
            console.error('Failed to parse guest resumes:', parseError);
            setResumes([]);
          }
        } else {
          setResumes([]);
          console.log('✅ No guest resumes found');
        }
        setCloudStatus(prev => ({ ...prev, isConnected: false }));
        setIsLoading(false);
        return;
      }

      // Check cache first (unless force refresh)
      const cacheKey = `resumeCraft_resumes_cache_${user.id}`;
      const cacheTimestampKey = `resumeCraft_resumes_cache_timestamp_${user.id}`;

      if (!forceRefresh) {
        const cachedResumes = localStorage.getItem(cacheKey);
        const cacheTimestamp = localStorage.getItem(cacheTimestampKey);

        if (cachedResumes && cacheTimestamp) {
          const cacheAge = Date.now() - parseInt(cacheTimestamp, 10);
          const MAX_CACHE_AGE = 5 * 60 * 1000; // 5 minutes

          if (cacheAge < MAX_CACHE_AGE) {
            console.log('📦 [ResumeContext] Using cached resumes (age:', Math.round(cacheAge / 1000), 'seconds)');
            try {
              const parsedResumes = JSON.parse(cachedResumes);
              setResumes(parsedResumes);
              setCloudStatus(prev => ({
                ...prev,
                isConnected: false,
                lastSync: new Date(parseInt(cacheTimestamp, 10))
              }));
              setIsLoading(false);
              return; // Skip API call
            } catch (parseError) {
              console.error('Failed to parse cached resumes:', parseError);
              // Continue to API call
            }
          }
        }
      }

      // Always try to load from API first (Single Source of Truth)
      console.log('🔄 [ResumeContext] Fetching from API...');
      try {
        const response = await apiRequest('/resumes');
        console.log('📊 [ResumeContext] API Response received:', response);

        if (response && response.success && Array.isArray(response.data)) {
          const resumesFromApi = response.data.map(resume => ({
            _id: resume._id,
            title: resume.title || 'Untitled Resume',
            userId: resume.userId,
            status: resume.status || 'draft',
            personalInfo: resume.personalInfo || {},
            summary: resume.summary || '',
            experience: resume.experience || [],
            education: resume.education || [],
            skills: resume.skills || [],
            projects: resume.projects || [],
            certifications: resume.certifications || [],
            languages: resume.languages || [],
            references: resume.references || [],
            templateSettings: resume.templateSettings || {
              templateName: 'modern',
              colors: {
                primary: '#3b82f6',
                secondary: '#6b7280',
                accent: '#10b981',
                background: '#ffffff',
                text: '#000000'
              },
              font: 'Roboto',
              fontSize: 'medium',
              spacing: 'normal',
              showPhoto: false
            },
            analysis: resume.analysis || {
              score: 0,
              atsScore: 0,
              completeness: 0,
              strengths: [],
              improvements: [],
              suggestions: ['Start by filling your personal information'],
              keywords: []
            },
            updatedAt: resume.updatedAt || new Date().toISOString(),
            createdAt: resume.createdAt || new Date().toISOString(),
            isPrimary: resume.isPrimary || false,
            version: resume.version || 1
          }));

          setResumes(resumesFromApi);

          // Store in localStorage as backup
          localStorage.setItem(`resumeCraft_resumes_${user.id}`, JSON.stringify(resumesFromApi));

          // Update cache
          localStorage.setItem(cacheKey, JSON.stringify(resumesFromApi));
          localStorage.setItem(cacheTimestampKey, Date.now().toString());

          setCloudStatus({
            isConnected: true,
            lastSync: new Date(),
            hasChanges: false
          });

          console.log('✅ [ResumeContext] Loaded from API:', resumesFromApi.length, 'resumes');

          // Clear the "Using local data" message after successful API call
          if (!isInitialLoad) {
            toast.success('Connected to cloud!');
          }
          isInitialLoad = false;

        } else {
          console.warn('⚠️ [ResumeContext] Invalid API response format:', response);
          // Don't throw, just fall back to localStorage
          throw new Error('Invalid API response format');
        }
      } catch (apiError) {
        console.error('❌ [ResumeContext] API failed:', apiError.message);

        // Don't show error toast for rate limiting or timeout - it's expected
        if (!apiError.message.includes('Rate limited') &&
          !apiError.message.includes('429') &&
          !apiError.message.includes('timeout') &&
          !apiError.message.includes('Timeout')) {
          console.log('⚠️ Using local data - Check your connection');
        }

        // Fallback to localStorage
        console.log('📦 [ResumeContext] Loading from localStorage backup...');
        const storedResumes = localStorage.getItem(`resumeCraft_resumes_${user.id}`);
        if (storedResumes) {
          try {
            const parsedResumes = JSON.parse(storedResumes);
            setResumes(parsedResumes);
            console.log('✅ [ResumeContext] Loaded from localStorage:', parsedResumes.length, 'resumes');
          } catch (parseError) {
            console.error('❌ [ResumeContext] Failed to parse localStorage:', parseError);
            setResumes([]);
          }
        } else {
          setResumes([]);
          console.log('✅ [ResumeContext] No resumes in localStorage');
        }

        setCloudStatus(prev => ({
          ...prev,
          isConnected: false,
          lastSync: null
        }));
      }

    } catch (error) {
      console.error('❌ [ResumeContext] Failed to load resumes:', error);
      // Don't show toast for expected errors
      if (!error.message.includes('Rate limited') &&
        !error.message.includes('429') &&
        !error.message.includes('timeout')) {
        toast.error('Failed to load resumes');
      }
      setResumes([]);
    } finally {
      console.log('🏁 [ResumeContext] Finished loading resumes');
      setIsLoading(false);
    }
  }, [user, isAuthenticated, apiRequest, isLoading]);

  // Create New Resume (DB First) - FIXED
  const createNewResume = useCallback(async (resumeData = {}) => {
    console.log('🆕 [ResumeContext] Creating new resume...');

    setSaveStatus('saving');

    try {
      const title = resumeData.title || `My Resume ${new Date().toLocaleDateString()}`;
      console.log('📝 [ResumeContext] Creating:', title);

      // Prepare resume data
      const resumeToCreate = {
        title: title,
        status: 'draft',
        personalInfo: resumeData.personalInfo || {},
        summary: resumeData.summary || '',
        experience: resumeData.experience || [],
        education: resumeData.education || [],
        skills: resumeData.skills || [],
        projects: resumeData.projects || [],
        certifications: resumeData.certifications || [],
        languages: resumeData.languages || [],
        references: resumeData.references || [],
        templateSettings: resumeData.templateSettings || {
          templateName: 'modern',
          colors: {
            primary: '#3b82f6',
            secondary: '#6b7280',
            accent: '#10b981',
            background: '#ffffff',
            text: '#000000'
          },
          font: 'Roboto',
          fontSize: 'medium',
          spacing: 'normal',
          showPhoto: false
        },
        analysis: {
          score: 0,
          atsScore: 0,
          completeness: 0,
          strengths: [],
          improvements: [],
          suggestions: ['Start by filling your personal information'],
          keywords: []
        }
      };

      let newResume = null;
      let mongoDbId = null;

      // Try to save to MongoDB first
      if (user && isAuthenticated) {
        try {
          console.log('💾 [ResumeContext] Saving to MongoDB...');
          const response = await apiRequest('/resumes', {
            method: 'POST',
            body: JSON.stringify(resumeToCreate)
          });

          if (response && response.success && response.data) {
            mongoDbId = response.data._id;
            newResume = {
              ...response.data,
              _id: mongoDbId
            };
            console.log('✅ [ResumeContext] Saved to MongoDB with ID:', mongoDbId);
          } else {
            throw new Error('Failed to save to database');
          }
        } catch (apiError) {
          console.error('❌ [ResumeContext] MongoDB create failed:', apiError);
          // Continue with local creation
        }
      }

      // If MongoDB failed or user is not authenticated, create local
      if (!newResume) {
        newResume = {
          ...resumeToCreate,
          _id: `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          userId: user?.id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isPrimary: false,
          version: 1
        };
        console.log('📱 [ResumeContext] Created local resume:', newResume._id);
      }

      // Update state
      setResumes(prev => [newResume, ...prev]);
      setCurrentResume(newResume);

      // Save to localStorage
      if (user && isAuthenticated) {
        const storageKey = `resumeCraft_resumes_${user.id}`;
        const existingResumes = JSON.parse(localStorage.getItem(storageKey) || '[]');
        const updatedResumes = [newResume, ...existingResumes];
        localStorage.setItem(storageKey, JSON.stringify(updatedResumes));

        // Update cache
        const cacheKey = `resumeCraft_resumes_cache_${user.id}`;
        localStorage.setItem(cacheKey, JSON.stringify(updatedResumes));
        localStorage.setItem(`resumeCraft_resumes_cache_timestamp_${user.id}`, Date.now().toString());
      } else {
        // Guest mode
        const guestResumes = localStorage.getItem('resumeCraft_resumes_guest');
        const existingResumes = guestResumes ? JSON.parse(guestResumes) : [];
        const updatedResumes = [newResume, ...existingResumes];
        localStorage.setItem('resumeCraft_resumes_guest', JSON.stringify(updatedResumes));
      }

      localStorage.setItem('resumeCraft_current', JSON.stringify(newResume));

      setSaveStatus('saved');
      setCloudStatus(prev => ({
        ...prev,
        isConnected: !!mongoDbId,
        hasChanges: !mongoDbId
      }));

      console.log('✅ [ResumeContext] Created new resume:', newResume.title);

      toast.success('Resume created successfully!');
      return newResume;

    } catch (error) {
      console.error('❌ [ResumeContext] Failed to create resume:', error);
      setSaveStatus('error');
      toast.error(error.message || 'Failed to create resume');
      return null;
    }
  }, [user, isAuthenticated, apiRequest]);

  // Load Specific Resume
  const loadResume = useCallback(async (resumeId) => {
    if (!resumeId) {
      console.log('🆕 [ResumeContext] No resume ID provided');
      return null;
    }

    console.log('📂 [ResumeContext] Loading resume:', resumeId);
    setIsLoading(true);

    try {
      let resume = null;

      // Try to load from DB first
      if (user && isAuthenticated && !resumeId.startsWith('temp_')) {
        try {
          console.log('🔄 [ResumeContext] Fetching from API...');
          const response = await apiRequest(`/resumes/${resumeId}`);

          if (response && response.success && response.data) {
            resume = response.data;
            console.log('✅ [ResumeContext] Loaded from API:', resume.title);
          }
        } catch (apiError) {
          console.log('⚠️ [ResumeContext] API load failed:', apiError.message);
          // Continue to fallback
        }
      }

      // Fallback to localStorage or state
      if (!resume) {
        // Check current resumes state
        resume = resumes.find(r => r._id === resumeId);

        if (!resume) {
          console.log('📦 [ResumeContext] Checking localStorage...');
          const storageKey = user && isAuthenticated ? `resumeCraft_resumes_${user.id}` : 'resumeCraft_resumes_guest';
          const storedResumes = localStorage.getItem(storageKey);
          if (storedResumes) {
            try {
              const parsedResumes = JSON.parse(storedResumes);
              resume = parsedResumes.find(r => r._id === resumeId);
            } catch (parseError) {
              console.error('❌ [ResumeContext] Failed to parse localStorage:', parseError);
            }
          }
        }
      }

      if (!resume) {
        console.error('❌ [ResumeContext] Resume not found:', resumeId);
        toast.error('Resume not found');
        setIsLoading(false);
        return null;
      }

      // Ensure consistent structure
      const normalizedResume = {
        _id: resume._id,
        userId: resume.userId || user?.id,
        title: resume.title || 'Untitled Resume',
        status: resume.status || 'draft',
        personalInfo: resume.personalInfo || {},
        summary: resume.summary || '',
        experience: resume.experience || [],
        education: resume.education || [],
        skills: resume.skills || [],
        projects: resume.projects || [],
        certifications: resume.certifications || [],
        languages: resume.languages || [],
        references: resume.references || [],
        templateSettings: resume.templateSettings || {
          templateName: 'modern',
          colors: {
            primary: '#3b82f6',
            secondary: '#6b7280',
            accent: '#10b981',
            background: '#ffffff',
            text: '#000000'
          },
          font: 'Roboto',
          fontSize: 'medium',
          spacing: 'normal',
          showPhoto: false
        },
        analysis: resume.analysis || {
          score: 0,
          atsScore: 0,
          completeness: 0,
          strengths: [],
          improvements: [],
          suggestions: [],
          keywords: []
        },
        updatedAt: resume.updatedAt || new Date().toISOString(),
        createdAt: resume.createdAt || new Date().toISOString(),
        isPrimary: resume.isPrimary || false,
        version: resume.version || 1
      };

      setCurrentResume(normalizedResume);
      localStorage.setItem('resumeCraft_current', JSON.stringify(normalizedResume));

      console.log('✅ [ResumeContext] Resume loaded successfully');
      return normalizedResume;

    } catch (error) {
      console.error('❌ [ResumeContext] Failed to load resume:', error);
      toast.error('Failed to load resume');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [resumes, user, isAuthenticated, apiRequest]);

  // Save Resume - CRITICAL FIX: This function was missing from context value
  const saveResume = useCallback(async (resume, manual = true, isCreate = false) => {
    if (!resume) {
      toast.error('No resume data to save');
      return null;
    }

    console.log('💾 [ResumeContext] Saving resume:', resume.title, 'isCreate:', isCreate);
    setSaveStatus('saving');

    try {
      const resumeToSave = {
        ...resume,
        updatedAt: new Date().toISOString(),
        version: (resume.version || 0) + 1
      };

      let savedResume = null;
      let apiSuccess = false;

      // Save to MongoDB
      if (user && isAuthenticated) {
        try {
          const apiResumeData = {
            title: resumeToSave.title,
            status: resumeToSave.status || 'draft',
            personalInfo: resumeToSave.personalInfo || {},
            summary: resumeToSave.summary || '',
            experience: resumeToSave.experience || [],
            education: resumeToSave.education || [],
            skills: resumeToSave.skills || [],
            projects: resumeToSave.projects || [],
            certifications: resumeToSave.certifications || [],
            languages: resumeToSave.languages || [],
            references: resumeToSave.references || [],
            templateSettings: resumeToSave.templateSettings || {},
            analysis: resumeToSave.analysis || {}
          };

          let response = null;

          if (isCreate || resumeToSave._id.startsWith('temp_')) {
            // Create new resume in DB
            console.log('🆕 [ResumeContext] Creating in DB...');
            response = await apiRequest('/resumes', {
              method: 'POST',
              body: JSON.stringify(apiResumeData)
            });
          } else {
            // Update existing resume in DB
            console.log('✏️ [ResumeContext] Updating in DB...');
            response = await apiRequest(`/resumes/${resumeToSave._id}`, {
              method: 'PUT',
              body: JSON.stringify(apiResumeData)
            });
          }

          if (response && response.success && response.data) {
            savedResume = response.data;
            apiSuccess = true;
            console.log('✅ [ResumeContext] Saved to MongoDB');
          }
        } catch (apiError) {
          console.error('❌ [ResumeContext] MongoDB save failed:', apiError);
          // Continue with local save
        }
      }

      // Use DB response if available, otherwise use local
      const finalResume = savedResume || resumeToSave;

      // Update state
      setCurrentResume(finalResume);

      // Update in resumes list
      setResumes(prev => {
        const exists = prev.some(r => r._id === finalResume._id);
        if (exists) {
          return prev.map(r => r._id === finalResume._id ? finalResume : r);
        } else {
          return [finalResume, ...prev];
        }
      });

      // Save to localStorage (backup)
      if (user && isAuthenticated) {
        const storageKey = `resumeCraft_resumes_${user.id}`;
        const existingResumes = JSON.parse(localStorage.getItem(storageKey) || '[]');

        const exists = existingResumes.some(r => r._id === finalResume._id);
        let updatedResumes;

        if (exists) {
          updatedResumes = existingResumes.map(r =>
            r._id === finalResume._id ? finalResume : r
          );
        } else {
          updatedResumes = [finalResume, ...existingResumes];
        }

        localStorage.setItem(storageKey, JSON.stringify(updatedResumes));

        // Update cache
        const cacheKey = `resumeCraft_resumes_cache_${user.id}`;
        localStorage.setItem(cacheKey, JSON.stringify(updatedResumes));
      } else {
        // Guest mode
        const guestResumes = localStorage.getItem('resumeCraft_resumes_guest');
        const existingResumes = guestResumes ? JSON.parse(guestResumes) : [];

        const exists = existingResumes.some(r => r._id === finalResume._id);
        let updatedResumes;

        if (exists) {
          updatedResumes = existingResumes.map(r =>
            r._id === finalResume._id ? finalResume : r
          );
        } else {
          updatedResumes = [finalResume, ...existingResumes];
        }

        localStorage.setItem('resumeCraft_resumes_guest', JSON.stringify(updatedResumes));
      }

      localStorage.setItem('resumeCraft_current', JSON.stringify(finalResume));

      // Update cloud status
      setCloudStatus({
        isConnected: apiSuccess,
        lastSync: apiSuccess ? new Date() : null,
        hasChanges: !apiSuccess
      });

      setSaveStatus('saved');

      if (manual) {
        if (isCreate) {
          toast.success('Resume created successfully!');
        } else {
          toast.success(apiSuccess ? 'Resume saved and synced!' : 'Resume saved locally');
        }
      }

      console.log('✅ [ResumeContext] Resume saved successfully');
      return finalResume;

    } catch (error) {
      console.error('❌ [ResumeContext] Save failed:', error);
      setSaveStatus('error');

      if (manual) {
        toast.error(error.message || 'Failed to save resume');
      }

      return null;
    }
  }, [user, isAuthenticated, apiRequest]);

  // Update Section - CRITICAL FIX: This function was missing from context value
  const updateSection = useCallback((sectionId, data) => {
    if (!currentResume) {
      console.error('❌ [ResumeContext] No current resume to update');
      return false;
    }

    console.log(`📝 [ResumeContext] Updating section "${sectionId}"`);

    try {
      // Create updated resume with the specific section data
      const updatedResume = {
        ...currentResume,
        [sectionId]: data,
        updatedAt: new Date().toISOString(),
        version: (currentResume.version || 0) + 1
      };

      // Update current resume
      setCurrentResume(updatedResume);

      // Update in resumes list
      setResumes(prev => prev.map(r =>
        r._id === updatedResume._id ? updatedResume : r
      ));

      // Save to localStorage immediately
      if (user && isAuthenticated) {
        const storageKey = `resumeCraft_resumes_${user.id}`;
        const existingResumes = JSON.parse(localStorage.getItem(storageKey) || '[]');
        const updatedResumes = existingResumes.map(r =>
          r._id === updatedResume._id ? updatedResume : r
        );
        localStorage.setItem(storageKey, JSON.stringify(updatedResumes));
      } else {
        // Guest mode
        const guestResumes = localStorage.getItem('resumeCraft_resumes_guest');
        const existingResumes = guestResumes ? JSON.parse(guestResumes) : [];
        const updatedResumes = existingResumes.map(r =>
          r._id === updatedResume._id ? updatedResume : r
        );
        localStorage.setItem('resumeCraft_resumes_guest', JSON.stringify(updatedResumes));
      }

      localStorage.setItem('resumeCraft_current', JSON.stringify(updatedResume));

      // Mark as having unsynced changes
      setCloudStatus(prev => ({ ...prev, hasChanges: true }));

      console.log('✅ [ResumeContext] Section updated successfully');
      return true;

    } catch (error) {
      console.error('❌ [ResumeContext] Failed to update section:', error);
      toast.error('Failed to update section');
      return false;
    }
  }, [currentResume, user, isAuthenticated]);

  // Delete Resume
  const deleteResume = useCallback(async (resumeId) => {
    if (!resumeId) {
      toast.error('No resume ID provided');
      return false;
    }

    console.log('🗑️ [ResumeContext] Deleting resume:', resumeId);

    try {
      // Delete from MongoDB if authenticated and not a temp resume
      if (user && isAuthenticated && !resumeId.startsWith('temp_')) {
        try {
          await apiRequest(`/resumes/${resumeId}`, {
            method: 'DELETE'
          });
          console.log('✅ [ResumeContext] Deleted from MongoDB');
        } catch (apiError) {
          console.error('❌ [ResumeContext] Failed to delete from MongoDB:', apiError);
          // Continue with local delete
        }
      }

      // Remove from state
      setResumes(prev => prev.filter(r => r._id !== resumeId));

      // Clear current resume if it's the one being deleted
      if (currentResume?._id === resumeId) {
        setCurrentResume(null);
        localStorage.removeItem('resumeCraft_current');
      }

      // Remove from localStorage
      if (user && isAuthenticated) {
        const storageKey = `resumeCraft_resumes_${user.id}`;
        const existingResumes = JSON.parse(localStorage.getItem(storageKey) || '[]');
        const updatedResumes = existingResumes.filter(r => r._id !== resumeId);
        localStorage.setItem(storageKey, JSON.stringify(updatedResumes));
      } else {
        // Guest mode
        const guestResumes = localStorage.getItem('resumeCraft_resumes_guest');
        const existingResumes = guestResumes ? JSON.parse(guestResumes) : [];
        const updatedResumes = existingResumes.filter(r => r._id !== resumeId);
        localStorage.setItem('resumeCraft_resumes_guest', JSON.stringify(updatedResumes));
      }

      toast.success('Resume deleted successfully!');
      return true;

    } catch (error) {
      console.error('❌ [ResumeContext] Delete failed:', error);
      toast.error('Failed to delete resume');
      return false;
    }
  }, [currentResume, user, isAuthenticated, apiRequest]);

  // Duplicate Resume
  const duplicateResume = useCallback(async (resumeId) => {
    const original = resumes.find(r => r._id === resumeId);
    if (!original) {
      toast.error('Resume not found');
      return null;
    }

    console.log('📋 [ResumeContext] Duplicating resume:', original.title);

    try {
      // Create duplicate with new ID
      const duplicated = {
        ...original,
        _id: `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title: `${original.title} (Copy)`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isPrimary: false,
        version: 1
      };

      // Save duplicate
      const savedDuplicate = await saveResume(duplicated, false, true);

      if (savedDuplicate) {
        toast.success('Resume duplicated successfully!');
        return savedDuplicate;
      } else {
        throw new Error('Failed to save duplicate');
      }

    } catch (error) {
      console.error('❌ [ResumeContext] Duplicate failed:', error);
      toast.error('Failed to duplicate resume');
      return null;
    }
  }, [resumes, saveResume]);

  // Sync with Cloud
  const syncWithCloud = useCallback(async () => {
    try {
      if (!user || !isAuthenticated) {
        toast.error('Please login to sync');
        return false;
      }

      console.log('🔄 [ResumeContext] Syncing with cloud...');

      const loadingToast = toast.loading('Syncing with cloud...');

      let successCount = 0;
      let errorCount = 0;

      // Sync all resumes
      for (const resume of resumes) {
        try {
          const apiResumeData = {
            title: resume.title,
            status: resume.status || 'draft',
            personalInfo: resume.personalInfo || {},
            summary: resume.summary || '',
            experience: resume.experience || [],
            education: resume.education || [],
            skills: resume.skills || [],
            projects: resume.projects || [],
            certifications: resume.certifications || [],
            languages: resume.languages || [],
            references: resume.references || [],
            templateSettings: resume.templateSettings || {},
            analysis: resume.analysis || {}
          };

          let response;
          if (resume._id.startsWith('temp_')) {
            // New resume, create it
            response = await apiRequest('/resumes', {
              method: 'POST',
              body: JSON.stringify(apiResumeData)
            });
          } else {
            // Existing resume, update it
            response = await apiRequest(`/resumes/${resume._id}`, {
              method: 'PUT',
              body: JSON.stringify(apiResumeData)
            });
          }

          if (response && response.success) {
            successCount++;
          } else {
            errorCount++;
          }
        } catch (error) {
          console.error('Sync error for resume:', resume.title, error);
          errorCount++;
        }
      }

      toast.dismiss(loadingToast);

      // Refresh from database to get updated data
      await loadUserResumes(true); // Force refresh

      if (errorCount === 0) {
        setCloudStatus({
          isConnected: true,
          lastSync: new Date(),
          hasChanges: false
        });
        toast.success(`Synced ${successCount} resumes successfully!`);
        return true;
      } else if (successCount > 0) {
        toast.warning(`Synced ${successCount} resumes, ${errorCount} failed`);
        return false;
      } else {
        toast.error('Failed to sync resumes');
        return false;
      }

    } catch (error) {
      console.error('❌ [ResumeContext] Sync failed:', error);
      toast.error('Failed to sync');
      return false;
    }
  }, [resumes, user, isAuthenticated, apiRequest, loadUserResumes]);

  // Dashboard Stats
  const dashboardStats = useMemo(() => {
    console.log('📊 [ResumeContext] Calculating dashboard stats for', resumes.length, 'resumes');

    const total = resumes.length;
    const completed = resumes.filter(r => r.status === 'completed' || r.analysis?.completeness >= 90).length;
    const inProgress = resumes.filter(r => r.status === 'in_progress' || (r.analysis?.completeness >= 50 && r.analysis?.completeness < 90)).length;
    const drafts = resumes.filter(r => r.status === 'draft' || r.analysis?.completeness < 50).length;
    const needsWork = resumes.filter(r => r.status === 'needs_work').length;

    const validScores = resumes
      .map(r => r.analysis?.atsScore || r.analysis?.score || 0)
      .filter(score => score > 0);

    const averageATSScore = validScores.length > 0
      ? Math.round(validScores.reduce((a, b) => a + b, 0) / validScores.length)
      : 0;

    const bestATSScore = validScores.length > 0
      ? Math.max(...validScores)
      : 0;

    return {
      total,
      completed,
      inProgress,
      drafts,
      needsWork,
      averageATSScore,
      bestATSScore
    };
  }, [resumes]);

  // Initialize on mount - FIXED: Simpler initialization
  useEffect(() => {
    console.log('🔧 [ResumeContext] Initializing...');

    // Check if we're in a browser environment
    if (typeof window === 'undefined') {
      return;
    }

    // Load initial data if not already loaded
    if (resumes.length === 0 && !isLoading) {
      console.log('🔄 [ResumeContext] Loading initial data...');
      loadUserResumes();
    }

    console.log('✅ [ResumeContext] Initialized');
  }, [loadUserResumes, resumes.length, isLoading]);

  // Context Value - CRITICAL FIX: Include ALL functions
  const value = useMemo(() => ({
    // State
    resumes,
    userResumes: resumes,
    currentResume,
    isLoading,
    saveStatus,
    cloudStatus,
    dashboardStats,

    // Actions - ALL functions must be included
    loadUserResumes,
    createNewResume,
    loadResume,
    updateSection,     // ← THIS WAS MISSING
    saveResume,       // ← THIS WAS MISSING
    deleteResume,
    duplicateResume,
    syncWithCloud,

    // Helpers
    getResumeById: (id) => resumes.find(r => r._id === id),
    setCurrentResume
  }), [
    resumes,
    currentResume,
    isLoading,
    saveStatus,
    cloudStatus,
    dashboardStats,
    loadUserResumes,
    createNewResume,
    loadResume,
    updateSection,     // ← Make sure it's in dependencies
    saveResume,       // ← Make sure it's in dependencies
    deleteResume,
    duplicateResume,
    syncWithCloud
  ]);

  return (
    <ResumeContext.Provider value={value}>
      {children}
    </ResumeContext.Provider>
  );
};