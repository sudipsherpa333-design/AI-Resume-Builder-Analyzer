// ------------------- ResumeVersionHistory.jsx -------------------
// src/components/ui/ResumeVersionHistory.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { History, Clock, RotateCcw, Eye, Download, Trash2, Calendar, User, Sparkles, Check, X } from 'lucide-react';
import { toast } from 'react-hot-toast';

const ResumeVersionHistory = ({ resumeId, currentVersion, onRestore, onClose }) => {
  const [versions, setVersions] = useState([]);
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Mock versions - In production, this would come from an API
  const mockVersions = [
    {
      id: 'v1',
      version: 1,
      title: 'Initial Draft',
      timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      changes: ['Initial creation'],
      author: 'You',
      type: 'manual',
      size: '45 KB'
    },
    {
      id: 'v2',
      version: 2,
      title: 'AI Enhanced',
      timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      changes: ['Added metrics to experience', 'Optimized summary', 'Added 5 keywords'],
      author: 'AI Assistant',
      type: 'ai',
      size: '48 KB'
    },
    {
      id: 'v3',
      version: 3,
      title: 'Updated Education',
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      changes: ['Added new certification', 'Updated graduation date'],
      author: 'You',
      type: 'manual',
      size: '49 KB'
    },
    {
      id: 'v4',
      version: 4,
      title: 'Job Tailored - Google',
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      changes: ['Optimized for Google job description', 'Added relevant keywords', 'Restructured experience'],
      author: 'AI Tailoring',
      type: 'ai',
      size: '52 KB'
    },
    {
      id: 'v5',
      version: 5,
      title: 'Current Version',
      timestamp: new Date().toISOString(),
      changes: ['Minor formatting fixes', 'Updated contact info'],
      author: 'You',
      type: 'manual',
      size: '53 KB',
      isCurrent: true
    }
  ];

  useEffect(() => {
    const loadVersions = async () => {
      setIsLoading(true);
      // Simulate API call
      setTimeout(() => {
        setVersions(mockVersions);
        setIsLoading(false);
      }, 1000);
    };

    loadVersions();
  }, [resumeId]);

  const handleRestore = () => {
    if (!selectedVersion) {
      toast.error('Please select a version to restore');
      return;
    }

    const confirm = window.confirm(`Are you sure you want to restore version ${selectedVersion.version}? This will replace your current resume.`);
    if (confirm) {
      onRestore(selectedVersion);
    }
  };

  const handleDelete = (versionId) => {
    const confirm = window.confirm('Are you sure you want to delete this version?');
    if (confirm) {
      setVersions(prev => prev.filter(v => v.id !== versionId));
      toast.success('Version deleted');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getVersionColor = (type) => {
    switch (type) {
    case 'ai': return 'from-purple-500 to-pink-500';
    case 'manual': return 'from-blue-500 to-cyan-500';
    default: return 'from-gray-500 to-gray-700';
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
            <History className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Version History</h2>
            <p className="text-gray-600">Browse and restore previous versions</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Current Version Banner */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Check className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Current Version</h3>
                  <p className="text-sm text-gray-600">Version {currentVersion} • You're currently editing this version</p>
                </div>
              </div>
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                                Active
              </span>
            </div>
          </div>

          {/* Versions List */}
          <div className="space-y-4">
            {versions
              .filter(v => !v.isCurrent)
              .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
              .map((version) => (
                <motion.div
                  key={version.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`border rounded-xl p-4 hover:shadow-md transition-shadow cursor-pointer ${selectedVersion?.id === version.id ? 'ring-2 ring-blue-500 border-blue-300' : 'border-gray-200'}`}
                  onClick={() => setSelectedVersion(version)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${getVersionColor(version.type)} flex items-center justify-center`}>
                        {version.type === 'ai' ? (
                          <Sparkles className="w-5 h-5 text-white" />
                        ) : (
                          <User className="w-5 h-5 text-white" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{version.title}</h4>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="flex items-center gap-1 text-sm text-gray-500">
                            <Clock className="w-3 h-3" />
                            {formatDate(version.timestamp)}
                          </span>
                          <span className="flex items-center gap-1 text-sm text-gray-500">
                            <User className="w-3 h-3" />
                            {version.author}
                          </span>
                          <span className="text-sm text-gray-500">{version.size}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(version.id);
                        }}
                        className="p-1.5 hover:bg-gray-100 rounded"
                      >
                        <Trash2 className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                  </div>

                  {/* Changes List */}
                  {version.changes && version.changes.length > 0 && (
                    <div className="ml-13">
                      <p className="text-sm font-medium text-gray-700 mb-1">Changes:</p>
                      <ul className="space-y-1">
                        {version.changes.map((change, idx) => (
                          <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                            {change}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Version Number */}
                  <div className="mt-3 ml-13">
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded">
                                            Version {version.version}
                    </span>
                  </div>
                </motion.div>
              ))}
          </div>

          {/* Selected Version Actions */}
          {selectedVersion && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-blue-50 rounded-xl p-4 border border-blue-200"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900">
                                    Selected: {selectedVersion.title}
                </h3>
                <span className="text-sm text-blue-600">
                                    Version {selectedVersion.version}
                </span>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleRestore}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                                    Restore This Version
                </button>
                <button
                  onClick={() => {
                    // Preview version logic
                    toast.info('Preview feature coming soon');
                  }}
                  className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                                    Preview
                </button>
                <button
                  onClick={() => {
                    // Download version logic
                    toast.info('Download feature coming soon');
                  }}
                  className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                                    Export
                </button>
              </div>

              <p className="text-xs text-gray-500 mt-2 text-center">
                                Restoring will replace your current resume with this version
              </p>
            </motion.div>
          )}

          {/* Auto-save Info */}
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm font-medium text-gray-700">Auto-save Enabled</p>
                <p className="text-xs text-gray-500">
                                    New versions are automatically saved every 3 seconds when you make changes
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeVersionHistory;