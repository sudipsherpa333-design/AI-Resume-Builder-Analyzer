// src/components/builder/CertificationsPage.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Award, Calendar, Globe, Building, ExternalLink,
  CheckCircle, Clock, Shield, Code, Database,
  Edit, Trash2, Plus, X, ChevronUp, ChevronDown,
  Star, Eye, EyeOff, FileText, Target, TrendingUp,
  Zap, CreditCard, BadgeCheck
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const CertificationsPage = ({ data = {}, onUpdate, onNext, onPrev, onAIEnhance, aiCredits }) => {
  const [certifications, setCertifications] = useState(data?.items || []);
  const [editingId, setEditingId] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    if (certifications !== data?.items) {
      const timer = setTimeout(() => {
        if (onUpdate) {
          onUpdate({ items: certifications });
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [certifications, onUpdate, data?.items]);

  const categories = [
    { id: 'technical', name: 'Technical Skills', icon: Code, color: 'bg-blue-100 text-blue-600' },
    { id: 'cloud', name: 'Cloud & DevOps', icon: Cloud, color: 'bg-purple-100 text-purple-600' },
    { id: 'security', name: 'Cybersecurity', icon: Shield, color: 'bg-red-100 text-red-600' },
    { id: 'data', name: 'Data Science', icon: Database, color: 'bg-green-100 text-green-600' },
    { id: 'project', name: 'Project Management', icon: Target, color: 'bg-amber-100 text-amber-600' },
    { id: 'business', name: 'Business & Marketing', icon: TrendingUp, color: 'bg-indigo-100 text-indigo-600' },
    { id: 'language', name: 'Language Proficiency', icon: Globe, color: 'bg-teal-100 text-teal-600' },
    { id: 'soft', name: 'Soft Skills', icon: Users, color: 'bg-pink-100 text-pink-600' }
  ];

  const providers = [
    'Microsoft',
    'Amazon Web Services (AWS)',
    'Google Cloud',
    'Cisco',
    'Oracle',
    'IBM',
    'Salesforce',
    'Adobe',
    'Project Management Institute (PMI)',
    'Scrum Alliance',
    'CompTIA',
    'Red Hat',
    'VMware',
    'Linux Foundation',
    'Facebook (Meta)',
    'LinkedIn Learning',
    'Coursera',
    'Udemy',
    'edX',
    'Nepal Government',
    'Tribhuvan University',
    'CTEVT',
    'Other'
  ];

  const emptyCertification = {
    id: Date.now().toString(),
    name: '',
    category: 'technical',
    issuer: '',
    issueDate: '',
    expirationDate: '',
    credentialId: '',
    credentialUrl: '',
    skills: [],
    description: '',
    isVisible: true,
    isFeatured: false,
    doesNotExpire: false
  };

  const addCertification = () => {
    const newCert = { ...emptyCertification, id: Date.now().toString() };
    setCertifications([newCert, ...certifications]);
    setEditingId(newCert.id);
    setIsAdding(true);
  };

  const updateCertification = (id, updates) => {
    setCertifications(certifications.map(cert =>
      cert.id === id ? { ...cert, ...updates } : cert
    ));
  };

  const deleteCertification = (id) => {
    setCertifications(certifications.filter(cert => cert.id !== id));
    toast.success('Certification deleted');
  };

  const moveCertification = (id, direction) => {
    const index = certifications.findIndex(cert => cert.id === id);
    if (
      (direction === 'up' && index > 0) ||
            (direction === 'down' && index < certifications.length - 1)
    ) {
      const newCerts = [...certifications];
      const newIndex = direction === 'up' ? index - 1 : index + 1;
      [newCerts[index], newCerts[newIndex]] =
                [newCerts[newIndex], newCerts[index]];
      setCertifications(newCerts);
    }
  };

  const toggleVisibility = (id) => {
    updateCertification(id, { isVisible: !certifications.find(c => c.id === id).isVisible });
  };

  const toggleFeatured = (id) => {
    updateCertification(id, { isFeatured: !certifications.find(c => c.id === id).isFeatured });
  };

  const getExpirationStatus = (expirationDate, doesNotExpire) => {
    if (doesNotExpire) {
      return { status: 'valid', text: 'Does not expire', color: 'bg-green-100 text-green-700' };
    }

    if (!expirationDate) {
      return { status: 'unknown', text: 'No expiration', color: 'bg-gray-100 text-gray-700' };
    }

    const today = new Date();
    const expireDate = new Date(expirationDate);
    const monthsUntilExpiry = (expireDate - today) / (1000 * 60 * 60 * 24 * 30);

    if (monthsUntilExpiry < 0) {
      return { status: 'expired', text: 'Expired', color: 'bg-red-100 text-red-700' };
    }
    if (monthsUntilExpiry < 3) {
      return { status: 'expiring', text: 'Expiring soon', color: 'bg-yellow-100 text-yellow-700' };
    }
    return { status: 'valid', text: 'Valid', color: 'bg-green-100 text-green-700' };
  };

  const renderCertificationCard = (cert, index) => {
    const isEditing = editingId === cert.id;
    const category = categories.find(c => c.id === cert.category);
    const expirationStatus = getExpirationStatus(cert.expirationDate, cert.doesNotExpire);
    const issueYear = cert.issueDate ? new Date(cert.issueDate).getFullYear() : '';

    return (
      <motion.div
        key={cert.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        className={`bg-white rounded-xl border ${cert.isFeatured ? 'border-blue-300 ring-2 ring-blue-100' : 'border-gray-200'} overflow-hidden`}
      >
        {/* Header */}
        <div className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-start gap-3 mb-3">
                <div className={`w-12 h-12 ${category?.color.split(' ')[0]} rounded-xl flex items-center justify-center flex-shrink-0`}>
                  {category && React.createElement(category.icon, { className: 'w-5 h-5' })}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-1">
                        {cert.name || 'Certification Name'}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className="flex items-center gap-1 text-sm text-gray-600">
                          <Building className="w-3 h-3" />
                          {cert.issuer || 'Issuing Organization'}
                        </span>
                        {issueYear && (
                          <>
                            <span className="text-gray-300">•</span>
                            <span className="flex items-center gap-1 text-sm text-gray-600">
                              <Calendar className="w-3 h-3" />
                                                            Issued {issueYear}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${expirationStatus.color}`}>
                        {expirationStatus.text}
                      </span>
                      {cert.isFeatured && (
                        <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
                                                    Featured
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Credential ID */}
                  {cert.credentialId && !isEditing && (
                    <div className="mb-3">
                      <span className="text-sm text-gray-700 font-medium">Credential ID:</span>
                      <span className="ml-2 text-sm text-gray-600 font-mono">
                        {cert.credentialId}
                      </span>
                    </div>
                  )}

                  {/* Description */}
                  {cert.description && !isEditing && (
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {cert.description}
                    </p>
                  )}

                  {/* Skills */}
                  {cert.skills && cert.skills.length > 0 && !isEditing && (
                    <div className="flex flex-wrap gap-1.5">
                      {cert.skills.slice(0, 5).map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs"
                        >
                          {skill}
                        </span>
                      ))}
                      {cert.skills.length > 5 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded text-xs">
                                                    +{cert.skills.length - 5} more
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2 ml-4">
              <button
                onClick={() => toggleVisibility(cert.id)}
                className={`p-2 rounded-lg ${cert.isVisible ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-100'}`}
                title={cert.isVisible ? 'Visible on resume' : 'Hidden from resume'}
              >
                {cert.isVisible ? (
                  <Eye className="w-4 h-4" />
                ) : (
                  <EyeOff className="w-4 h-4" />
                )}
              </button>
              <button
                onClick={() => toggleFeatured(cert.id)}
                className={`p-2 rounded-lg ${cert.isFeatured ? 'text-yellow-500 hover:bg-yellow-50' : 'text-gray-400 hover:bg-gray-100'}`}
                title={cert.isFeatured ? 'Featured certification' : 'Mark as featured'}
              >
                <Star className={`w-4 h-4 ${cert.isFeatured ? 'fill-current' : ''}`} />
              </button>
              <button
                onClick={() => moveCertification(cert.id, 'up')}
                disabled={index === 0}
                className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg disabled:opacity-50"
                title="Move up"
              >
                <ChevronUp className="w-4 h-4" />
              </button>
              <button
                onClick={() => moveCertification(cert.id, 'down')}
                disabled={index === certifications.length - 1}
                className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg disabled:opacity-50"
                title="Move down"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
              <button
                onClick={() => setEditingId(isEditing ? null : cert.id)}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
              >
                {isEditing ? <X className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
              </button>
              <button
                onClick={() => deleteCertification(cert.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <AnimatePresence>
          {isEditing && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="p-6 border-t border-gray-200 bg-gray-50"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Certification Name *
                  </label>
                  <input
                    type="text"
                    value={cert.name}
                    onChange={(e) => updateCertification(cert.id, { name: e.target.value })}
                    placeholder="e.g., AWS Certified Solutions Architect"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Issuing Organization *
                  </label>
                  <select
                    value={cert.issuer}
                    onChange={(e) => updateCertification(cert.id, { issuer: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select issuer</option>
                    {providers.map(provider => (
                      <option key={provider} value={provider}>{provider}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Category *
                  </label>
                  <select
                    value={cert.category}
                    onChange={(e) => updateCertification(cert.id, { category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Issue Date *
                  </label>
                  <input
                    type="month"
                    value={cert.issueDate}
                    onChange={(e) => updateCertification(cert.id, { issueDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Expiration Date
                  </label>
                  <div className="space-y-2">
                    <input
                      type="month"
                      value={cert.expirationDate}
                      onChange={(e) => updateCertification(cert.id, {
                        expirationDate: e.target.value,
                        doesNotExpire: false
                      })}
                      disabled={cert.doesNotExpire}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                    />
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={cert.doesNotExpire}
                        onChange={(e) => updateCertification(cert.id, {
                          doesNotExpire: e.target.checked,
                          expirationDate: ''
                        })}
                        className="rounded"
                      />
                                            This certification does not expire
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Credential ID
                  </label>
                  <input
                    type="text"
                    value={cert.credentialId}
                    onChange={(e) => updateCertification(cert.id, { credentialId: e.target.value })}
                    placeholder="e.g., ABC123456789"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Verification URL
                  </label>
                  <input
                    type="url"
                    value={cert.credentialUrl}
                    onChange={(e) => updateCertification(cert.id, { credentialUrl: e.target.value })}
                    placeholder="https://verify.certificate.com/abc123"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Skills Covered
                  </label>
                  <input
                    type="text"
                    value={cert.skills?.join(', ') || ''}
                    onChange={(e) => updateCertification(cert.id, {
                      skills: e.target.value.split(',').map(s => s.trim()).filter(s => s)
                    })}
                    placeholder="e.g., Cloud Computing, AWS Services, Security"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="text-xs text-gray-500 mt-1">
                                        Separate skills with commas
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Description
                  </label>
                  <textarea
                    value={cert.description}
                    onChange={(e) => updateCertification(cert.id, { description: e.target.value })}
                    placeholder="Describe what this certification validates, its significance..."
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>
              </div>

              <div className="flex justify-between items-center">
                <button
                  onClick={() => {
                    if (cert.credentialUrl) {
                      window.open(cert.credentialUrl, '_blank');
                    }
                  }}
                  disabled={!cert.credentialUrl}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 ${!cert.credentialUrl
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                  }`}
                >
                  <ExternalLink className="w-4 h-4" />
                                    Verify Certificate
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingId(null)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                                        Cancel
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                                        Save Certification
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  const filteredCertifications = certifications.filter(cert => {
    if (filterStatus === 'all') {
      return true;
    }
    if (filterStatus === 'featured') {
      return cert.isFeatured;
    }
    if (filterStatus === 'valid') {
      const status = getExpirationStatus(cert.expirationDate, cert.doesNotExpire);
      return status.status === 'valid';
    }
    if (filterStatus === 'expired') {
      const status = getExpirationStatus(cert.expirationDate, cert.doesNotExpire);
      return status.status === 'expired';
    }
    return true;
  });

  const stats = {
    total: certifications.length,
    valid: certifications.filter(c => {
      const status = getExpirationStatus(c.expirationDate, c.doesNotExpire);
      return status.status === 'valid';
    }).length,
    featured: certifications.filter(c => c.isFeatured).length,
    expired: certifications.filter(c => {
      const status = getExpirationStatus(c.expirationDate, c.doesNotExpire);
      return status.status === 'expired';
    }).length,
    technical: certifications.filter(c => c.category === 'technical').length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Certifications</h2>
          <p className="text-gray-600">Add your professional certifications and credentials</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-3 py-1 bg-gray-100 rounded-lg">
            <span className="text-sm font-medium text-gray-700">
              {stats.valid} valid certifications
            </span>
          </div>
          <button
            onClick={addCertification}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
                        Add Certification
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      {certifications.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Certifications Overview</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-sm text-gray-600">Total Certifications</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{stats.valid}</div>
              <div className="text-sm text-gray-600">Valid</div>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{stats.featured}</div>
              <div className="text-sm text-gray-600">Featured</div>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{stats.expired}</div>
              <div className="text-sm text-gray-600">Expired</div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      {certifications.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${filterStatus === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
                            All Certifications ({certifications.length})
            </button>
            <button
              onClick={() => setFilterStatus('featured')}
              className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ${filterStatus === 'featured' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              <Star className="w-4 h-4" />
                            Featured ({stats.featured})
            </button>
            <button
              onClick={() => setFilterStatus('valid')}
              className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ${filterStatus === 'valid' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              <CheckCircle className="w-4 h-4" />
                            Valid ({stats.valid})
            </button>
            <button
              onClick={() => setFilterStatus('expired')}
              className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ${filterStatus === 'expired' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              <Clock className="w-4 h-4" />
                            Expired ({stats.expired})
            </button>
          </div>
        </div>
      )}

      {/* Certifications List */}
      <div className="space-y-4">
        {certifications.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-700 mb-2">No certifications added yet</h3>
            <p className="text-gray-500 mb-6">Add your professional certifications to showcase your expertise</p>
            <button
              onClick={addCertification}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto"
            >
              <Plus className="w-5 h-5" />
                            Add Your First Certification
            </button>
          </div>
        ) : filteredCertifications.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-700 mb-2">No certifications found</h3>
            <p className="text-gray-500">Try adjusting your filter criteria</p>
          </div>
        ) : (
          filteredCertifications.map((cert, index) => renderCertificationCard(cert, index))
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-6 border-t border-gray-200">
        <button
          onClick={onPrev}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
                    ← Previous
        </button>
        <button
          onClick={onNext}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
                    Next: References →
        </button>
      </div>
    </div>
  );
};

// Helper components for icons
const Cloud = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4 4 0 003 15z" />
  </svg>
);

const Users = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5 0h-15" />
  </svg>
);

export default CertificationsPage;