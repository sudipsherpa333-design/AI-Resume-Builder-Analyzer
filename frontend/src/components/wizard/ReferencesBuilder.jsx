// src/components/wizard/ReferencesBuilder.jsx
import React, { useState, useCallback, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { debounce } from 'lodash';
import {
  UserPlus,
  Trash2,
  Mail,
  Phone,
  Linkedin,
  Briefcase,
  Star,
  CheckCircle,
  XCircle,
  Edit2,
  ExternalLink,
  MessageSquare,
  Award,
  Shield,
  Sparkles,
  Target,
  Calendar,
  Building,
  Users,
  FileText,
  Key,
  AlertCircle,
  Copy,
  Download,
  Upload
} from 'lucide-react';

// Validation utilities
const validateEmail = (email) => {
  if (!email) {
    return true;
  }
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const validateURL = (url) => {
  if (!url) {
    return true;
  }
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Custom hooks for better separation
const useReferenceStats = (references, jobDescription) => {
  return useMemo(() => {
    if (!references.length) {
      return {
        total: 0,
        verified: 0,
        seniorityScore: 0,
        relevanceScore: 0,
        recommendationStrength: 0
      };
    }

    const total = references.length;
    const verified = references.filter(ref => ref.isVerified).length;

    const seniorityScores = {
      executive: 100,
      senior: 75,
      mid: 50,
      junior: 25
    };

    const seniorityScore = references.reduce((sum, ref) =>
      sum + (seniorityScores[ref.seniority] || 0), 0) / total;

    const jdLower = jobDescription?.toLowerCase() || '';
    const relevanceScore = references.filter(ref => {
      const hasIndustry = ref.industries?.some(industry =>
        jdLower.includes(industry.toLowerCase())
      );
      const hasCompany = ref.companies?.some(company =>
        jdLower.includes(company.toLowerCase())
      );
      const hasSkill = ref.skills?.some(skill =>
        jdLower.includes(skill.toLowerCase())
      );

      return hasIndustry || hasCompany || hasSkill;
    }).length / total * 100;

    const recommendationStrength = references.reduce((sum, ref) =>
      sum + (ref.recommendationStrength || 5), 0) / total * 10;

    return {
      total,
      verified,
      seniorityScore: Math.round(seniorityScore),
      relevanceScore: Math.round(relevanceScore),
      recommendationStrength: Math.round(recommendationStrength)
    };
  }, [references, jobDescription]);
};

const ReferencesBuilder = ({
  data = [],
  onChange,
  onAIEnhance,
  isAnalyzing,
  targetRole = '',
  jobDescription = '',
  skills = []
}) => {
  const [references, setReferences] = useState(() =>
    Array.isArray(data) ? data : []
  );
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [importMode, setImportMode] = useState(false);
  const [importText, setImportText] = useState('');
  const [errors, setErrors] = useState({});

  const abortControllerRef = useRef(null);

  const referenceStats = useReferenceStats(references, jobDescription);

  // Debounced onChange to prevent too many parent updates
  const debouncedOnChange = useCallback(
    debounce((updatedReferences) => {
      if (onChange) {
        onChange(updatedReferences);
      }
    }, 300),
    [onChange]
  );

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      debouncedOnChange.cancel();
    };
  }, [debouncedOnChange]);

  const handleAddReference = () => {
    const newReference = {
      id: `ref_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: '',
      title: '',
      company: '',
      email: '',
      phone: '',
      linkedin: '',
      relationship: '',
      duration: '',
      industries: [],
      companies: [],
      skills: [],
      seniority: 'mid',
      recommendationStrength: 8,
      isVerified: false,
      verificationScore: 0,
      contactPermission: true,
      lastContact: new Date().toISOString().split('T')[0],
      notes: '',
      recommendationText: ''
    };

    setReferences(prev => {
      const updated = [...prev, newReference];
      debouncedOnChange(updated);
      return updated;
    });
    setEditingId(newReference.id);
    toast.success('New reference added');
  };

  const handleRemoveReference = (id) => {
    const reference = references.find(ref => ref.id === id);
    if (reference?.name && !window.confirm(`Remove reference ${reference.name}?`)) {
      return;
    }

    setReferences(prev => {
      const updated = prev.filter(ref => ref.id !== id);
      debouncedOnChange(updated);
      return updated;
    });

    if (editingId === id) {
      setEditingId(null);
    }
    toast.success('Reference removed');
  };

  const handleUpdateReference = useCallback((id, field, value) => {
    // Validate before updating
    if (field === 'email' && value && !validateEmail(value)) {
      setErrors(prev => ({
        ...prev,
        [id]: { ...prev[id], email: 'Invalid email format' }
      }));
    } else if (field === 'linkedin' && value && !validateURL(value)) {
      setErrors(prev => ({
        ...prev,
        [id]: { ...prev[id], linkedin: 'Invalid URL' }
      }));
    } else {
      // Clear error for this field
      setErrors(prev => ({
        ...prev,
        [id]: { ...prev[id], [field]: undefined }
      }));
    }

    setReferences(prev => {
      const updated = prev.map(ref =>
        ref.id === id ? { ...ref, [field]: value } : ref
      );
      debouncedOnChange(updated);
      return updated;
    });
  }, [debouncedOnChange]);

  // Generic handler for adding items to arrays
  const handleAddToArray = useCallback((id, field, value) => {
    if (!value.trim()) {
      return;
    }

    setReferences(prev => {
      const updated = prev.map(ref => {
        if (ref.id === id) {
          const currentArray = ref[field] || [];
          return {
            ...ref,
            [field]: [...new Set([...currentArray, value.trim()])]
          };
        }
        return ref;
      });
      debouncedOnChange(updated);
      return updated;
    });
  }, [debouncedOnChange]);

  const handleRemoveFromArray = useCallback((id, field, item) => {
    setReferences(prev => {
      const updated = prev.map(ref => {
        if (ref.id === id) {
          const currentArray = ref[field] || [];
          return {
            ...ref,
            [field]: currentArray.filter(i => i !== item)
          };
        }
        return ref;
      });
      debouncedOnChange(updated);
      return updated;
    });
  }, [debouncedOnChange]);

  const handleAIEnhanceReference = async (id) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsLoadingAI(true);
    const toastId = toast.loading('AI is enhancing reference details...');

    try {
      // In production, replace with actual API call
      const response = await fetch('/api/enhance-reference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reference: references.find(r => r.id === id),
          targetRole,
          skills
        }),
        signal: controller.signal
      });

      if (!response.ok) {
        throw new Error('Enhancement failed');
      }

      const enhancedData = await response.json();

      setReferences(prev => {
        const updated = prev.map(r =>
          r.id === id ? { ...r, ...enhancedData } : r
        );
        onChange(updated);
        return updated;
      });

      toast.dismiss(toastId);
      toast.success('Reference enhanced with AI!');
    } catch (error) {
      if (error.name !== 'AbortError') {
        toast.dismiss(toastId);
        toast.error('AI enhancement failed');
        console.error('AI enhancement error:', error);
      }
    } finally {
      if (abortControllerRef.current === controller) {
        abortControllerRef.current = null;
      }
      setIsLoadingAI(false);
    }
  };

  // Helper functions for color coding
  const getSeniorityColor = useCallback((seniority) => {
    const colors = {
      executive: 'from-purple-600 to-pink-600',
      senior: 'from-blue-600 to-cyan-600',
      mid: 'from-green-600 to-emerald-600',
      junior: 'from-amber-500 to-orange-500'
    };
    return colors[seniority] || 'from-gray-600 to-gray-500';
  }, []);

  const getStrengthColor = useCallback((strength) => {
    if (strength >= 9) {
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    }
    if (strength >= 7) {
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    }
    if (strength >= 5) {
      return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300';
    }
    return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
  }, []);

  // Render methods for better organization
  const renderStatsBar = () => (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
      {[
        { label: 'Total References', value: referenceStats.total, icon: UserPlus, color: 'blue' },
        { label: 'Verified', value: referenceStats.verified, icon: CheckCircle, color: 'green' },
        { label: 'Seniority Score', value: `${referenceStats.seniorityScore}%`, icon: Award, color: 'purple' },
        { label: 'Relevance Score', value: `${referenceStats.relevanceScore}%`, icon: Target, color: 'amber' },
        { label: 'Avg. Strength', value: `${referenceStats.recommendationStrength}/10`, icon: Star, color: 'pink' }
      ].map((stat, index) => (
        <div key={index} className={`bg-${stat.color}-50 dark:bg-${stat.color}-900/30 p-4 rounded-lg border border-${stat.color}-100 dark:border-${stat.color}-800`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm text-${stat.color}-700 dark:text-${stat.color}-400`}>{stat.label}</p>
              <p className={`text-2xl font-bold text-${stat.color}-900 dark:text-${stat.color}-300`}>{stat.value}</p>
            </div>
            <stat.icon className={`w-8 h-8 text-${stat.color}-600 dark:text-${stat.color}-400`} />
          </div>
        </div>
      ))}
    </div>
  );

  const renderReferenceItem = (ref, index) => {
    const isEditing = editingId === ref.id;
    const referenceErrors = errors[ref.id] || {};

    return (
      <motion.div
        key={ref.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
      >
        {/* Header and content */}
        {/* ... rest of the render logic ... */}
      </motion.div>
    );
  };

  return (
    <div className="space-y-6" role="region" aria-label="Professional References">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Professional References
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
                        Add credible references to strengthen your application
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setImportMode(!importMode)}
            className="px-4 py-2 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg hover:shadow-lg flex items-center gap-2"
            aria-label={importMode ? 'Cancel import' : 'Import references'}
          >
            <Upload className="w-4 h-4" />
            {importMode ? 'Cancel' : 'Import'}
          </button>
          <button
            onClick={handleExportReferences}
            className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:shadow-lg flex items-center gap-2"
            aria-label="Export references"
          >
            <Download className="w-4 h-4" />
                        Export
          </button>
          <button
            onClick={handleAddReference}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:shadow-lg flex items-center gap-2"
            aria-label="Add new reference"
          >
            <UserPlus className="w-4 h-4" />
                        Add Reference
          </button>
        </div>
      </div>

      {/* Import Mode */}
      {importMode && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 p-6 rounded-xl border border-blue-200 dark:border-blue-800"
        >
          {/* Import form content */}
        </motion.div>
      )}

      {/* Stats Bar */}
      {renderStatsBar()}

      {/* References List */}
      <div className="space-y-4" role="list" aria-label="Reference list">
        {references.length === 0 ? (
          <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl">
            <Users className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
            <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
                            No references added yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
                            Add professional references to increase your credibility
            </p>
            <button
              onClick={handleAddReference}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:shadow-lg flex items-center gap-2 mx-auto"
            >
              <UserPlus className="w-5 h-5" />
                            Add Your First Reference
            </button>
          </div>
        ) : (
          references.map(renderReferenceItem)
        )}
      </div>
    </div>
  );
};

export default React.memo(ReferencesBuilder);