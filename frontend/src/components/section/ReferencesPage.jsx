// src/components/builder/ReferencesPage.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Mail, Phone, Building, Globe, Link,
  Edit, Trash2, Plus, X, ChevronUp, ChevronDown,
  Star, Eye, EyeOff, Briefcase, Calendar, Award,
  MessageSquare, Shield, CheckCircle, MapPin,
  Twitter, Facebook, Instagram, Users
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const ReferencesPage = ({ data = {}, onUpdate, onNext, onPrev, onAIEnhance, aiCredits }) => {
  const [references, setReferences] = useState(data?.items || []);
  const [editingId, setEditingId] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    if (references !== data?.items) {
      const timer = setTimeout(() => {
        if (onUpdate) {
          onUpdate({ items: references });
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [references, onUpdate, data?.items]);

  const referenceTypes = [
    { id: 'professional', name: 'Professional', icon: Briefcase, color: 'bg-blue-100 text-blue-600' },
    { id: 'academic', name: 'Academic', icon: Award, color: 'bg-purple-100 text-purple-600' },
    { id: 'personal', name: 'Personal', icon: User, color: 'bg-green-100 text-green-600' },
    { id: 'client', name: 'Client', icon: Building, color: 'bg-amber-100 text-amber-600' }
  ];

  const nepaliCompanies = [
    'Nepal Rastra Bank',
    'Nepal Telecom',
    'Ncell',
    'Standard Chartered Bank Nepal',
    'Himalayan Bank',
    'NIC Asia Bank',
    'Global IME Bank',
    'Prabhu Bank',
    'Civil Bank',
    'Sunrise Bank',
    'Nepal Airlines',
    'Yeti Airlines',
    'Siddhartha Bank',
    'Machhapuchchhre Bank',
    'Prime Commercial Bank',
    'NMB Bank',
    'Sanima Bank',
    'Laxmi Bank',
    'Agricultural Development Bank',
    'Rastriya Banijya Bank'
  ];

  const nepaliUniversities = [
    'Tribhuvan University',
    'Kathmandu University',
    'Pokhara University',
    'Purbanchal University',
    'Nepal Sanskrit University',
    'Mid-Western University',
    'Far-Western University',
    'Lumbini Buddhist University',
    'Agriculture and Forestry University',
    'BP Koirala Institute of Health Sciences'
  ];

  const emptyReference = {
    id: Date.now().toString(),
    name: '',
    type: 'professional',
    title: '',
    company: '',
    relationship: '',
    email: '',
    phone: '',
    address: '',
    linkedin: '',
    website: '',
    yearsKnown: '',
    testimonial: '',
    permissionGranted: false,
    contactPreference: 'email',
    isVisible: true,
    isPrimary: false
  };

  const addReference = () => {
    const newRef = { ...emptyReference, id: Date.now().toString() };
    setReferences([newRef, ...references]);
    setEditingId(newRef.id);
    setIsAdding(true);
  };

  const updateReference = (id, updates) => {
    setReferences(references.map(ref =>
      ref.id === id ? { ...ref, ...updates } : ref
    ));
  };

  const deleteReference = (id) => {
    setReferences(references.filter(ref => ref.id !== id));
    toast.success('Reference deleted');
  };

  const moveReference = (id, direction) => {
    const index = references.findIndex(ref => ref.id === id);
    if (
      (direction === 'up' && index > 0) ||
            (direction === 'down' && index < references.length - 1)
    ) {
      const newRefs = [...references];
      const newIndex = direction === 'up' ? index - 1 : index + 1;
      [newRefs[index], newRefs[newIndex]] =
                [newRefs[newIndex], newRefs[index]];
      setReferences(newRefs);
    }
  };

  const toggleVisibility = (id) => {
    updateReference(id, { isVisible: !references.find(r => r.id === id).isVisible });
  };

  const togglePrimary = (id) => {
    // If setting this as primary, unset all others
    const newReferences = references.map(ref => ({
      ...ref,
      isPrimary: ref.id === id ? !ref.isPrimary : false
    }));
    setReferences(newReferences);
  };

  const handleAIEnhance = (id) => {
    if (aiCredits <= 0) {
      toast.error('Insufficient AI credits');
      return;
    }

    const ref = references.find(r => r.id === id);
    if (ref) {
      const enhanced = {
        ...ref,
        testimonial: `${ref.testimonial}\n\nAI-enhanced: This reference has been enhanced to better highlight professional qualifications and working relationship.`,
        aiEnhanced: true
      };
      updateReference(id, enhanced);
      toast.success('Reference enhanced with AI!');

      if (onAIEnhance) {
        onAIEnhance();
      }
    }
  };

  const renderReferenceCard = (ref, index) => {
    const isEditing = editingId === ref.id;
    const type = referenceTypes.find(t => t.id === ref.type);

    return (
      <motion.div
        key={ref.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        className={`bg-white rounded-xl border ${ref.isPrimary ? 'border-blue-300 ring-2 ring-blue-100' : 'border-gray-200'} overflow-hidden`}
      >
        {/* Header */}
        <div className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-start gap-3 mb-3">
                <div className={`w-12 h-12 ${type?.color.split(' ')[0]} rounded-xl flex items-center justify-center flex-shrink-0`}>
                  {type && React.createElement(type.icon, { className: 'w-5 h-5' })}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold text-gray-800">
                          {ref.name || 'Reference Name'}
                        </h3>
                        {ref.isPrimary && (
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                                                        Primary
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${type?.color}`}>
                          {type?.name} Reference
                        </span>
                        <span className="text-sm text-gray-600">
                          {ref.title} {ref.company && `at ${ref.company}`}
                        </span>
                      </div>
                    </div>
                    {ref.yearsKnown && (
                      <span className="text-sm text-gray-500">
                        <Calendar className="inline w-3 h-3 mr-1" />
                        {ref.yearsKnown} years
                      </span>
                    )}
                  </div>

                  {/* Contact Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                    {ref.email && !isEditing && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail className="w-4 h-4" />
                        <a href={`mailto:${ref.email}`} className="hover:text-blue-600">
                          {ref.email}
                        </a>
                      </div>
                    )}
                    {ref.phone && !isEditing && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="w-4 h-4" />
                        <a href={`tel:${ref.phone}`} className="hover:text-blue-600">
                          {ref.phone}
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Relationship */}
                  {ref.relationship && !isEditing && (
                    <div className="mb-3">
                      <span className="text-sm font-medium text-gray-700">Relationship: </span>
                      <span className="text-sm text-gray-600">{ref.relationship}</span>
                    </div>
                  )}

                  {/* Testimonial */}
                  {ref.testimonial && !isEditing && (
                    <div className="mb-3">
                      <div className="flex items-center gap-2 mb-1">
                        <MessageSquare className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-700">Testimonial</span>
                      </div>
                      <p className="text-gray-600 text-sm italic pl-6">
                                                "{ref.testimonial}"
                      </p>
                    </div>
                  )}

                  {/* Social Links */}
                  {(ref.linkedin || ref.website) && !isEditing && (
                    <div className="flex gap-3">
                      {ref.linkedin && (
                        <a
                          href={ref.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-blue-600"
                        >
                          <LinkedinIcon className="w-4 h-4" />
                                                    LinkedIn
                        </a>
                      )}
                      {ref.website && (
                        <a
                          href={ref.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-green-600"
                        >
                          <Globe className="w-4 h-4" />
                                                    Website
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2 ml-4">
              <button
                onClick={() => toggleVisibility(ref.id)}
                className={`p-2 rounded-lg ${ref.isVisible ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-100'}`}
                title={ref.isVisible ? 'Visible on resume' : 'Hidden from resume'}
              >
                {ref.isVisible ? (
                  <Eye className="w-4 h-4" />
                ) : (
                  <EyeOff className="w-4 h-4" />
                )}
              </button>
              <button
                onClick={() => togglePrimary(ref.id)}
                className={`p-2 rounded-lg ${ref.isPrimary ? 'text-blue-500 hover:bg-blue-50' : 'text-gray-400 hover:bg-gray-100'}`}
                title={ref.isPrimary ? 'Primary reference' : 'Set as primary'}
              >
                <Star className={`w-4 h-4 ${ref.isPrimary ? 'fill-current' : ''}`} />
              </button>
              <button
                onClick={() => moveReference(ref.id, 'up')}
                disabled={index === 0}
                className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg disabled:opacity-50"
                title="Move up"
              >
                <ChevronUp className="w-4 h-4" />
              </button>
              <button
                onClick={() => moveReference(ref.id, 'down')}
                disabled={index === references.length - 1}
                className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg disabled:opacity-50"
                title="Move down"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
              <button
                onClick={() => setEditingId(isEditing ? null : ref.id)}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
              >
                {isEditing ? <X className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
              </button>
              <button
                onClick={() => deleteReference(ref.id)}
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
                                        Full Name *
                  </label>
                  <input
                    type="text"
                    value={ref.name}
                    onChange={(e) => updateReference(ref.id, { name: e.target.value })}
                    placeholder="e.g., Ram Bahadur Thapa"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Reference Type *
                  </label>
                  <select
                    value={ref.type}
                    onChange={(e) => updateReference(ref.id, { type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select type</option>
                    {referenceTypes.map(type => (
                      <option key={type.id} value={type.id}>{type.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Job Title *
                  </label>
                  <input
                    type="text"
                    value={ref.title}
                    onChange={(e) => updateReference(ref.id, { title: e.target.value })}
                    placeholder="e.g., Senior Software Engineer"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Company/Organization *
                  </label>
                  <input
                    type="text"
                    value={ref.company}
                    onChange={(e) => updateReference(ref.id, { company: e.target.value })}
                    placeholder="e.g., Nepal Telecom"
                    list="company-suggestions"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <datalist id="company-suggestions">
                    {nepaliCompanies.map(company => (
                      <option key={company} value={company} />
                    ))}
                    {nepaliUniversities.map(university => (
                      <option key={university} value={university} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Email Address *
                  </label>
                  <input
                    type="email"
                    value={ref.email}
                    onChange={(e) => updateReference(ref.id, { email: e.target.value })}
                    placeholder="e.g., reference@company.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Phone Number
                  </label>
                  <input
                    type="tel"
                    value={ref.phone}
                    onChange={(e) => updateReference(ref.id, { phone: e.target.value })}
                    placeholder="e.g., +977 98XXXXXXXX"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Relationship *
                  </label>
                  <input
                    type="text"
                    value={ref.relationship}
                    onChange={(e) => updateReference(ref.id, { relationship: e.target.value })}
                    placeholder="e.g., Former Manager, Professor, Colleague"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Years Known
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min="0"
                      max="50"
                      value={ref.yearsKnown}
                      onChange={(e) => updateReference(ref.id, { yearsKnown: e.target.value })}
                      placeholder="e.g., 3"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="px-3 py-2 bg-gray-100 rounded-lg text-sm text-gray-600">
                                            years
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                        LinkedIn Profile
                  </label>
                  <input
                    type="url"
                    value={ref.linkedin}
                    onChange={(e) => updateReference(ref.id, { linkedin: e.target.value })}
                    placeholder="https://linkedin.com/in/username"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Website
                  </label>
                  <input
                    type="url"
                    value={ref.website}
                    onChange={(e) => updateReference(ref.id, { website: e.target.value })}
                    placeholder="https://company.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Address
                  </label>
                  <input
                    type="text"
                    value={ref.address}
                    onChange={(e) => updateReference(ref.id, { address: e.target.value })}
                    placeholder="e.g., Kathmandu, Nepal"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Testimonial/Recommendation
                  </label>
                  <textarea
                    value={ref.testimonial}
                    onChange={(e) => updateReference(ref.id, { testimonial: e.target.value })}
                    placeholder="What would this person say about you? Leave blank if you'll request permission later."
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>

                <div className="md:col-span-2 space-y-3">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={ref.permissionGranted}
                      onChange={(e) => updateReference(ref.id, { permissionGranted: e.target.checked })}
                      className="rounded"
                    />
                    <span className="text-sm font-medium text-gray-700">
                                            I have obtained permission to use this reference
                    </span>
                  </label>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Preferred Contact Method
                    </label>
                    <div className="flex flex-wrap gap-3">
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name={`contact-${ref.id}`}
                          checked={ref.contactPreference === 'email'}
                          onChange={() => updateReference(ref.id, { contactPreference: 'email' })}
                          className="rounded"
                        />
                        <span className="text-sm text-gray-600">Email</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name={`contact-${ref.id}`}
                          checked={ref.contactPreference === 'phone'}
                          onChange={() => updateReference(ref.id, { contactPreference: 'phone' })}
                          className="rounded"
                        />
                        <span className="text-sm text-gray-600">Phone</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name={`contact-${ref.id}`}
                          checked={ref.contactPreference === 'both'}
                          onChange={() => updateReference(ref.id, { contactPreference: 'both' })}
                          className="rounded"
                        />
                        <span className="text-sm text-gray-600">Both</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <button
                  onClick={() => handleAIEnhance(ref.id)}
                  disabled={aiCredits <= 0 || !ref.testimonial}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 ${aiCredits <= 0 || !ref.testimonial
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:opacity-90'
                  }`}
                >
                  <MessageSquare className="w-4 h-4" />
                                    AI Enhance Testimonial (2 credits)
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
                                        Save Reference
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  const filteredReferences = references.filter(ref => {
    if (filterType === 'all') {
      return true;
    }
    return ref.type === filterType;
  });

  const stats = {
    total: references.length,
    visible: references.filter(r => r.isVisible).length,
    primary: references.filter(r => r.isPrimary).length,
    professional: references.filter(r => r.type === 'professional').length,
    academic: references.filter(r => r.type === 'academic').length,
    withPermission: references.filter(r => r.permissionGranted).length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">References</h2>
          <p className="text-gray-600">Add professional references who can vouch for your work</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-3 py-1 bg-gray-100 rounded-lg">
            <span className="text-sm font-medium text-gray-700">
              {stats.visible} references
            </span>
          </div>
          <button
            onClick={addReference}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
                        Add Reference
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      {references.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">References Overview</h3>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-sm text-gray-600">Total References</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{stats.visible}</div>
              <div className="text-sm text-gray-600">Visible</div>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{stats.primary}</div>
              <div className="text-sm text-gray-600">Primary</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{stats.professional}</div>
              <div className="text-sm text-gray-600">Professional</div>
            </div>
            <div className="text-center p-3 bg-indigo-50 rounded-lg">
              <div className="text-2xl font-bold text-indigo-600">{stats.academic}</div>
              <div className="text-sm text-gray-600">Academic</div>
            </div>
            <div className="text-center p-3 bg-teal-50 rounded-lg">
              <div className="text-2xl font-bold text-teal-600">{stats.withPermission}</div>
              <div className="text-sm text-gray-600">Permission Granted</div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      {references.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilterType('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${filterType === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
                            All References ({references.length})
            </button>
            {referenceTypes.map(type => {
              const count = references.filter(r => r.type === type.id).length;
              return (
                <button
                  key={type.id}
                  onClick={() => setFilterType(type.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ${filterType === type.id ? `${type.color} text-${type.color.split('-')[1]}-700` : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {React.createElement(type.icon, { className: 'w-4 h-4' })}
                  {type.name} ({count})
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* References List */}
      <div className="space-y-4">
        {references.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-700 mb-2">No references added yet</h3>
            <p className="text-gray-500 mb-6">Add professional references who can recommend you</p>
            <button
              onClick={addReference}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto"
            >
              <Plus className="w-5 h-5" />
                            Add Your First Reference
            </button>
          </div>
        ) : filteredReferences.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-700 mb-2">No references found</h3>
            <p className="text-gray-500">Try adjusting your filter criteria</p>
          </div>
        ) : (
          filteredReferences.map((ref, index) => renderReferenceCard(ref, index))
        )}
      </div>

      {/* Guidelines */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-blue-800 mb-3 flex items-center gap-2">
          <Shield className="w-5 h-5" />
                    Reference Guidelines
        </h3>
        <ul className="space-y-2 text-sm text-blue-700">
          <li className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>Always ask for permission before listing someone as a reference</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>Choose references who know your work well and can speak positively about you</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>Include a mix of professional, academic, and character references</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>Keep your references updated on your job search and provide them with your resume</span>
          </li>
        </ul>
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
                    Next: Languages →
        </button>
      </div>
    </div>
  );
};

// Custom LinkedIn icon component
const LinkedinIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

export default ReferencesPage;