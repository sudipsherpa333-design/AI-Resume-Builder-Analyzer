// src/pages/dashboard/Resumes.jsx - Updated with offline-first approach
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  FileText, Plus, Edit, Trash2, Eye, Download,
  Calendar, ChevronRight, Loader2, Search, Filter,
  Star, DownloadCloud, CheckCircle, Copy, User,
  Award, Briefcase, GraduationCap, Wifi, WifiOff,
  RefreshCw, Database
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const Resumes = () => {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();

  // State management
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('updatedAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [backendStatus, setBackendStatus] = useState('checking');
  const [offlineQueueCount, setOfflineQueueCount] = useState(0);
  const [showOfflineMode, setShowOfflineMode] = useState(false);

  // Load resumes
  const loadResumes = useCallback(async (forceRefresh = false) => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('Loading resumes...');
      const data = await api.resume.getUserResumes(forceRefresh);

      // Filter by current user
      const userResumes = Array.isArray(data)
        ? data.filter(resume =>
          !resume.userId ||
          resume.userId === user._id ||
          resume.user === user._id
        )
        : [];

      setResumes(userResumes);
      console.log(`Loaded ${userResumes.length} resumes`);

      // Update backend status
      const health = await api.checkHealth();
      setBackendStatus(health ? 'online' : 'offline');

    } catch (err) {
      console.error('Error loading resumes:', err);

      // Check if we have cached data
      const cached = api.cache.get('user_resumes');
      if (cached && cached.length > 0) {
        const userResumes = cached.filter(r =>
          !r.userId || r.userId === user._id || r.user === user._id
        );
        setResumes(userResumes);
        toast.success('Using cached data', { icon: '💾' });
      } else {
        setError(err.message || 'Failed to load resumes');
      }

      setBackendStatus('offline');
      setShowOfflineMode(true);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Load offline queue count
  const loadOfflineQueue = useCallback(() => {
    const queue = api.offlineQueue.getQueue();
    setOfflineQueueCount(queue.length);
  }, []);

  // Initialize
  useEffect(() => {
    if (!authLoading && user) {
      loadResumes();
      loadOfflineQueue();

      // Initialize API
      api.init();

      // Listen for offline queue updates
      const handleQueueUpdate = () => {
        loadOfflineQueue();
      };

      window.addEventListener('offlineQueueUpdated', handleQueueUpdate);

      // Check backend status periodically
      const healthCheckInterval = setInterval(async () => {
        try {
          const isHealthy = await api.checkHealth();
          setBackendStatus(isHealthy ? 'online' : 'offline');
          setShowOfflineMode(!isHealthy);
        } catch {
          setBackendStatus('offline');
        }
      }, 30000);

      return () => {
        window.removeEventListener('offlineQueueUpdated', handleQueueUpdate);
        clearInterval(healthCheckInterval);
      };
    }
  }, [authLoading, user, loadResumes, loadOfflineQueue]);

  // Handle create new resume
  const handleCreateNew = async () => {
    if (!user) {
      toast.error('Please login to create a resume');
      navigate('/login');
      return;
    }

    try {
      const newResumeData = {
        title: `${user?.name?.split(' ')[0] || 'My'}'s Resume`,
        personalInfo: {
          firstName: user?.name?.split(' ')[0] || '',
          lastName: user?.name?.split(' ')[1] || '',
          email: user?.email || '',
          phone: '',
          location: '',
          website: '',
          linkedin: '',
          github: ''
        },
        summary: '',
        experience: [],
        education: [],
        skills: [],
        projects: [],
        certifications: [],
        languages: [],
        references: [],
        settings: {
          template: 'modern',
          color: '#3b82f6',
          font: 'inter',
          fontSize: 'medium'
        },
        status: 'draft',
        isPrimary: resumes.length === 0,
        userId: user._id,
        user: user._id
      };

      const createdResume = await api.resume.createResume(newResumeData);

      // Normalize response (some endpoints return { data: resume })
      const resumeObj = createdResume?.data || createdResume;

      // Update local state
      setResumes(prev => [resumeObj, ...prev]);
      loadOfflineQueue();

      toast.success(resumeObj.offline
        ? 'Resume saved offline'
        : 'Resume created successfully!'
      );

      // Navigate to edit page (or refresh if no valid id)
      const newId = resumeObj._id || resumeObj.id || resumeObj.operationId;
      if (newId && newId !== 'new') {
        navigate(`/builder/edit/${newId}`);
      } else {
        // ensure list shows the created resume
        loadResumes(true);
      }
    } catch (err) {
      console.error('Create error:', err);
      toast.error(err.message || 'Failed to create resume');
    }
  };

  // Handle sync all changes
  const handleSyncAll = async () => {
    try {
      toast.loading('Syncing offline changes...', { id: 'sync' });
      const result = await api.sync();

      if (result.success) {
        toast.success(`Synced ${result.processed} changes!`, { id: 'sync' });
        loadResumes(true); // Refresh with force
        loadOfflineQueue();
      } else {
        toast.error('Sync failed', { id: 'sync' });
      }
    } catch (err) {
      toast.error('Sync error: ' + err.message, { id: 'sync' });
    }
  };

  // Handle retry connection
  const handleRetryConnection = async () => {
    setLoading(true);
    try {
      const isHealthy = await api.checkHealth();
      if (isHealthy) {
        toast.success('Backend connected!');
        setShowOfflineMode(false);
        loadResumes(true);
      } else {
        toast.error('Still cannot connect to backend');
      }
    } catch {
      toast.error('Connection failed');
    } finally {
      setLoading(false);
    }
  };

  // Rest of the handlers remain the same as before...
  // (handleDelete, handleExport, handleDuplicate, handleEdit, etc.)

  // Filter and sort resumes
  const filteredResumes = resumes.filter(resume => {
    const matchesSearch = searchTerm === '' ||
      resume.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (resume.personalInfo?.firstName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (resume.personalInfo?.lastName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (resume.summary?.toLowerCase() || '').includes(searchTerm.toLowerCase());

    let matchesStatus = true;
    if (filterStatus !== 'all') {
      if (filterStatus === 'primary') {
        matchesStatus = resume.isPrimary;
      } else {
        matchesStatus = resume.status === filterStatus;
      }
    }

    return matchesSearch && matchesStatus;
  });

  // Sort resumes
  const sortedResumes = [...filteredResumes].sort((a, b) => {
    let aValue, bValue;

    switch (sortBy) {
      case 'title':
        aValue = a.title?.toLowerCase() || '';
        bValue = b.title?.toLowerCase() || '';
        break;
      case 'updatedAt':
        aValue = new Date(a.updatedAt || a.createdAt);
        bValue = new Date(b.updatedAt || b.createdAt);
        break;
      case 'createdAt':
        aValue = new Date(a.createdAt);
        bValue = new Date(b.createdAt);
        break;
      case 'status':
        aValue = a.status || '';
        bValue = b.status || '';
        break;
      default:
        aValue = a[sortBy];
        bValue = b[sortBy];
    }

    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
    } else {
      return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
    }
  });

  // Loading state
  if (authLoading || (loading && user && resumes.length === 0)) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-blue-50/30 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">Loading your resumes...</p>
              <p className="text-sm text-gray-500 mt-2">
                {backendStatus === 'checking' ? 'Checking backend connection...' : ''}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Connection error banner
  const ConnectionBanner = () => (
    <div className="mb-6">
      <div className={`rounded-lg border p-4 ${showOfflineMode
        ? 'bg-yellow-50 border-yellow-200'
        : 'bg-green-50 border-green-200'
        }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {showOfflineMode ? (
              <>
                <WifiOff className="w-5 h-5 text-yellow-600" />
                <div>
                  <h4 className="font-medium text-yellow-800">Working in Offline Mode</h4>
                  <p className="text-sm text-yellow-700">
                    Cannot connect to backend server. Your changes will be saved locally.
                  </p>
                </div>
              </>
            ) : (
              <>
                <Wifi className="w-5 h-5 text-green-600" />
                <div>
                  <h4 className="font-medium text-green-800">Backend Connected</h4>
                  <p className="text-sm text-green-700">
                    Your data is syncing with the server.
                  </p>
                </div>
              </>
            )}
          </div>

          {showOfflineMode && (
            <div className="flex gap-2">
              <button
                onClick={handleRetryConnection}
                className="px-3 py-1.5 bg-yellow-100 text-yellow-700 text-sm font-medium rounded-lg hover:bg-yellow-200 flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Retry Connection
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-blue-50/30 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Connection Status Banner */}
        <ConnectionBanner />

        {/* Offline Queue Indicator */}
        {offlineQueueCount > 0 && (
          <div className="mb-6">
            <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg p-4 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Database className="w-5 h-5" />
                  <div>
                    <h4 className="font-medium">
                      {offlineQueueCount} pending change{offlineQueueCount !== 1 ? 's' : ''}
                    </h4>
                    <p className="text-sm opacity-90">
                      Sync when you're back online
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleSyncAll}
                  className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Sync Now
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Rest of the component remains the same as before */}
        {/* ... [Include the rest of your Resumes.jsx component] */}

      </div>
    </div>
  );
};

export default Resumes;