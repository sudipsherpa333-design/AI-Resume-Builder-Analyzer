import React, { useState, useEffect } from 'react';
import {
  FaStar,
  FaPlus,
  FaTrash,
  FaEdit,
  FaSave,
  FaTimes,
  FaBook,
  FaAward,
  FaUsers,
  FaLightbulb,
  FaPalette,
  FaArrowUp,
  FaArrowDown,
  FaCopy
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const CustomPage = ({ resumeData, onUpdate, errors, setErrors }) => {
  const [customSections, setCustomSections] = useState(resumeData?.custom || []);
  const [editingIndex, setEditingIndex] = useState(-1);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    type: 'list',
    description: '',
    items: [],
    startDate: '',
    endDate: '',
    location: '',
    organization: ''
  });

  const sectionTypes = [
    { id: 'list', name: 'List', icon: <FaBook />, description: 'Bullet point list of items' },
    { id: 'timeline', name: 'Timeline', icon: <FaAward />, description: 'Events with dates' },
    { id: 'text', name: 'Text', icon: <FaLightbulb />, description: 'Paragraph description' },
    { id: 'skills', name: 'Skills', icon: <FaUsers />, description: 'Skills or technologies' }
  ];

  const commonSections = [
    { title: 'Publications', type: 'list', icon: '📝' },
    { title: 'Volunteering', type: 'timeline', icon: '🤝' },
    { title: 'Awards', type: 'list', icon: '🏆' },
    { title: 'Conferences', type: 'timeline', icon: '🎤' },
    { title: 'Patents', type: 'list', icon: '💡' },
    { title: 'Hobbies', type: 'skills', icon: '🎨' },
    { title: 'Teaching Experience', type: 'timeline', icon: '👨‍🏫' },
    { title: 'Research', type: 'text', icon: '🔬' }
  ];

  useEffect(() => {
    if (resumeData?.custom) {
      setCustomSections(resumeData.custom);
    }
  }, [resumeData?.custom]);

  const handleUpdate = (data) => {
    if (onUpdate) {
      onUpdate('custom', data);
    }
  };

  useEffect(() => {
    if (customSections.length > 0 || customSections.length === 0) {
      handleUpdate(customSections);
    }
  }, [customSections]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, '']
    }));
  };

  const handleItemChange = (index, value) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => i === index ? value : item)
    }));
  };

  const handleRemoveItem = (index) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Section title is required';
    }
    if (!formData.type) {
      newErrors.type = 'Section type is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(prev => ({ ...prev, ...newErrors }));
      return false;
    }

    setErrors({});
    return true;
  };

  const handleAddCustomSection = () => {
    if (!validateForm()) {
      toast.error('Please fill all required fields');
      return;
    }

    const newSection = {
      id: Date.now(),
      ...formData,
      items: formData.items.filter(item => item.trim() !== '')
    };

    setCustomSections(prev => [...prev, newSection]);
    resetForm();
    setIsAddingNew(false);
    toast.success('Custom section added successfully!');
  };

  const handleEditCustomSection = (index) => {
    const section = customSections[index];
    setFormData({
      title: section.title || '',
      type: section.type || 'list',
      description: section.description || '',
      items: section.items || [],
      startDate: section.startDate || '',
      endDate: section.endDate || '',
      location: section.location || '',
      organization: section.organization || ''
    });
    setEditingIndex(index);
    setIsAddingNew(false);
  };

  const handleUpdateCustomSection = () => {
    if (!validateForm()) {
      toast.error('Please fill all required fields');
      return;
    }

    setCustomSections(prev => {
      const updated = [...prev];
      updated[editingIndex] = {
        ...updated[editingIndex],
        ...formData,
        items: formData.items.filter(item => item.trim() !== '')
      };
      return updated;
    });

    resetForm();
    setEditingIndex(-1);
    toast.success('Custom section updated successfully!');
  };

  const handleDeleteCustomSection = (index) => {
    if (window.confirm('Are you sure you want to delete this custom section?')) {
      setCustomSections(prev => prev.filter((_, i) => i !== index));
      toast.success('Custom section removed successfully');
    }
  };

  const handleMoveCustomSection = (index, direction) => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === customSections.length - 1)) {
      return;
    }

    setCustomSections(prev => {
      const updated = [...prev];
      const newIndex = direction === 'up' ? index - 1 : index + 1;
      [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
      return updated;
    });
  };

  const handleDuplicateCustomSection = (index) => {
    const section = customSections[index];
    const duplicatedSection = {
      ...section,
      id: Date.now(),
      title: `${section.title} (Copy)`
    };

    setCustomSections(prev => [...prev, duplicatedSection]);
    toast.success('Custom section duplicated successfully!');
  };

  const resetForm = () => {
    setFormData({
      title: '',
      type: 'list',
      description: '',
      items: [],
      startDate: '',
      endDate: '',
      location: '',
      organization: ''
    });
    setErrors({});
  };

  const handleUseTemplate = (template) => {
    setFormData({
      title: template.title,
      type: template.type,
      description: '',
      items: [],
      startDate: '',
      endDate: '',
      location: '',
      organization: ''
    });
    setIsAddingNew(true);
    toast.success(`Template "${template.title}" loaded`);
  };

  const getSectionIcon = (type) => {
    switch (type) {
    case 'list': return '📋';
    case 'timeline': return '📅';
    case 'text': return '📝';
    case 'skills': return '💪';
    default: return '✨';
    }
  };

  const renderSectionContent = (section) => {
    switch (section.type) {
    case 'list':
      return (
        <ul className="custom-list">
          {section.items.map((item, idx) => (
            <li key={idx}>{item}</li>
          ))}
        </ul>
      );

    case 'timeline':
      return (
        <div className="timeline">
          {(section.startDate || section.endDate) && (
            <div className="timeline-dates">
              {section.startDate && (
                <span>{new Date(section.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
              )}
              {section.startDate && section.endDate && ' - '}
              {section.endDate && (
                <span>{new Date(section.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
              )}
            </div>
          )}
          {section.location && (
            <div className="timeline-location">
                                📍 {section.location}
            </div>
          )}
          {section.organization && (
            <div className="timeline-organization">
                                🏢 {section.organization}
            </div>
          )}
          {section.description && (
            <div className="timeline-description">
              {section.description}
            </div>
          )}
          {section.items.length > 0 && (
            <ul className="timeline-items">
              {section.items.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          )}
        </div>
      );

    case 'text':
      return (
        <div className="text-content">
          {section.description}
        </div>
      );

    case 'skills':
      return (
        <div className="skills-content">
          <div className="skill-tags">
            {section.items.map((skill, idx) => (
              <span key={idx} className="skill-tag">{skill}</span>
            ))}
          </div>
        </div>
      );

    default:
      return null;
    }
  };

  return (
    <div className="custom-page">
      {/* Header */}
      <div className="page-header">
        <div className="header-left">
          <div className="header-icon">
            <FaStar />
          </div>
          <div>
            <h2 className="page-title">Custom Sections</h2>
            <p className="page-subtitle">Add unique sections to highlight additional achievements</p>
          </div>
        </div>
        <div className="header-stats">
          <div className="stat-chip">
            <FaPalette />
            <span>Sections: {customSections.length}</span>
          </div>
          <button
            className="btn-primary"
            onClick={() => {
              resetForm();
              setIsAddingNew(true);
              setEditingIndex(-1);
            }}
            type="button"
          >
            <FaPlus /> Add Section
          </button>
        </div>
      </div>

      {/* Quick Templates */}
      <div className="templates-section">
        <h3 className="section-title">Quick Templates</h3>
        <p className="section-subtitle">Start with these common section templates</p>
        <div className="templates-grid">
          {commonSections.map((template, index) => (
            <button
              key={index}
              className="template-card"
              onClick={() => handleUseTemplate(template)}
              type="button"
            >
              <div className="template-icon">{template.icon}</div>
              <div className="template-info">
                <h4>{template.title}</h4>
                <p>{sectionTypes.find(t => t.id === template.type)?.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Stats Overview */}
      <div className="stats-overview">
        <div className="stat-card">
          <div className="stat-value">{customSections.length}</div>
          <div className="stat-label">Sections</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            {customSections.filter(s => s.type === 'list').length}
          </div>
          <div className="stat-label">Lists</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            {customSections.filter(s => s.type === 'timeline').length}
          </div>
          <div className="stat-label">Timelines</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            {customSections.reduce((total, s) => total + (s.items?.length || 0), 0)}
          </div>
          <div className="stat-label">Items</div>
        </div>
      </div>

      {/* Add/Edit Form */}
      <AnimatePresence>
        {(isAddingNew || editingIndex !== -1) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="custom-form-card"
          >
            <div className="form-header">
              <div className="form-title">
                <h3>
                  {editingIndex !== -1 ?
                    <><FaEdit /> Edit Custom Section</> :
                    <><FaPlus /> Add New Custom Section</>
                  }
                </h3>
                <p className="form-subtitle">
                  {editingIndex !== -1 ? 'Update your custom section' : 'Create a new custom section'}
                </p>
              </div>
              <button
                className="btn-icon"
                onClick={() => {
                  resetForm();
                  setIsAddingNew(false);
                  setEditingIndex(-1);
                }}
                type="button"
              >
                <FaTimes />
              </button>
            </div>

            <div className="form-grid">
              {/* Section Title */}
              <div className="form-group full-width">
                <label className="required">Section Title *</label>
                <div className="input-with-status">
                  <FaStar className="field-icon" />
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="e.g., Publications, Volunteering, Awards"
                    className={`form-input ${errors?.title ? 'error' : ''}`}
                  />
                </div>
                {errors?.title && (
                  <div className="error-message">{errors.title}</div>
                )}
                <div className="field-tip">Title for your custom section</div>
              </div>

              {/* Section Type */}
              <div className="form-group">
                <label className="required">Section Type *</label>
                <div className="type-select">
                  {sectionTypes.map(type => (
                    <button
                      key={type.id}
                      type="button"
                      className={`type-option ${formData.type === type.id ? 'selected' : ''}`}
                      onClick={() => handleInputChange('type', type.id)}
                    >
                      <div className="type-icon">{type.icon}</div>
                      <div className="type-info">
                        <div className="type-name">{type.name}</div>
                        <div className="type-description">{type.description}</div>
                      </div>
                    </button>
                  ))}
                </div>
                {errors?.type && (
                  <div className="error-message">{errors.type}</div>
                )}
              </div>

              {/* Additional Fields Based on Type */}
              {formData.type === 'timeline' && (
                <>
                  <div className="form-group">
                    <label>Start Date</label>
                    <div className="input-with-status">
                      <input
                        type="month"
                        value={formData.startDate}
                        onChange={(e) => handleInputChange('startDate', e.target.value)}
                        className="form-input"
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>End Date</label>
                    <div className="input-with-status">
                      <input
                        type="month"
                        value={formData.endDate}
                        onChange={(e) => handleInputChange('endDate', e.target.value)}
                        className="form-input"
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Location</label>
                    <div className="input-with-status">
                      <input
                        type="text"
                        value={formData.location}
                        onChange={(e) => handleInputChange('location', e.target.value)}
                        placeholder="e.g., New York, NY"
                        className="form-input"
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Organization</label>
                    <div className="input-with-status">
                      <input
                        type="text"
                        value={formData.organization}
                        onChange={(e) => handleInputChange('organization', e.target.value)}
                        placeholder="e.g., Non-Profit Organization"
                        className="form-input"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Description (for text type) */}
              {(formData.type === 'text' || formData.type === 'timeline') && (
                <div className="form-group full-width">
                  <label>Description</label>
                  <div className="input-with-status">
                    <textarea
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Enter description or details..."
                      className="form-textarea"
                      rows={4}
                    />
                  </div>
                </div>
              )}

              {/* Items (for list and skills types) */}
              {(formData.type === 'list' || formData.type === 'skills') && (
                <div className="form-group full-width">
                  <div className="section-header">
                    <div>
                      <label>Items</label>
                      <p className="field-subtitle">
                        {formData.type === 'list' ? 'List items (one per line)' : 'Skills or technologies'}
                      </p>
                    </div>
                    <button
                      className="btn-small"
                      onClick={handleAddItem}
                      type="button"
                    >
                      <FaPlus /> Add Item
                    </button>
                  </div>

                  <div className="items-list">
                    {formData.items.map((item, index) => (
                      <div key={index} className="item">
                        <div className="item-number">{index + 1}</div>
                        <input
                          type="text"
                          value={item}
                          onChange={(e) => handleItemChange(index, e.target.value)}
                          placeholder={
                            formData.type === 'list'
                              ? 'e.g., Published paper in Journal of Science...'
                              : 'e.g., Photography, Public Speaking...'
                          }
                          className="item-input"
                        />
                        <button
                          className="btn-icon danger"
                          onClick={() => handleRemoveItem(index)}
                          type="button"
                          title="Remove item"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    ))}

                    {formData.items.length === 0 && (
                      <div className="no-items">
                        <div className="empty-icon">
                          {getSectionIcon(formData.type)}
                        </div>
                        <div className="empty-content">
                          <h4>No items added yet</h4>
                          <p>
                            {formData.type === 'list'
                              ? 'Add items to your list'
                              : 'Add skills or technologies'}
                          </p>
                          <button
                            className="btn-small"
                            onClick={handleAddItem}
                            type="button"
                          >
                            <FaPlus /> Add First Item
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="form-actions">
              <button
                className="btn-secondary"
                onClick={() => {
                  resetForm();
                  setIsAddingNew(false);
                  setEditingIndex(-1);
                }}
                type="button"
              >
                                Cancel
              </button>
              <button
                className="btn-primary"
                onClick={editingIndex !== -1 ? handleUpdateCustomSection : handleAddCustomSection}
                type="button"
              >
                <FaSave /> {editingIndex !== -1 ? 'Update Section' : 'Save Section'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom Sections List */}
      <div className="custom-sections-list">
        {customSections.length === 0 ? (
          <div className="empty-state">
            <FaStar className="empty-icon" />
            <div className="empty-content">
              <h3>No custom sections added yet</h3>
              <p>Add custom sections to highlight additional achievements and experiences</p>
              <div className="empty-actions">
                <button
                  className="btn-primary"
                  onClick={() => setIsAddingNew(true)}
                  type="button"
                >
                  <FaPlus /> Create Custom Section
                </button>
              </div>
            </div>
          </div>
        ) : (
          <AnimatePresence>
            <div className="sections-container">
              {customSections.map((section, index) => (
                <motion.div
                  key={section.id || index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="custom-section-card"
                >
                  <div className="section-header">
                    <div className="section-title">
                      <div className="section-icon">
                        {getSectionIcon(section.type)}
                      </div>
                      <h3>{section.title}</h3>
                      <span className="section-type">
                        {sectionTypes.find(t => t.id === section.type)?.name}
                      </span>
                    </div>
                    <div className="section-actions">
                      <button
                        className="btn-icon small"
                        onClick={() => handleMoveCustomSection(index, 'up')}
                        disabled={index === 0}
                        title="Move up"
                        type="button"
                      >
                        <FaArrowUp />
                      </button>
                      <button
                        className="btn-icon small"
                        onClick={() => handleMoveCustomSection(index, 'down')}
                        disabled={index === customSections.length - 1}
                        title="Move down"
                        type="button"
                      >
                        <FaArrowDown />
                      </button>
                      <button
                        className="btn-icon small"
                        onClick={() => handleDuplicateCustomSection(index)}
                        title="Duplicate"
                        type="button"
                      >
                        <FaCopy />
                      </button>
                      <button
                        className="btn-icon small"
                        onClick={() => handleEditCustomSection(index)}
                        title="Edit"
                        type="button"
                      >
                        <FaEdit />
                      </button>
                      <button
                        className="btn-icon small danger"
                        onClick={() => handleDeleteCustomSection(index)}
                        title="Delete"
                        type="button"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>

                  <div className="section-content">
                    {renderSectionContent(section)}
                  </div>

                  {(section.startDate || section.endDate || section.location || section.organization) && (
                    <div className="section-meta">
                      {section.startDate && (
                        <span className="meta-item">
                                                    📅 Start: {new Date(section.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                        </span>
                      )}
                      {section.endDate && (
                        <span className="meta-item">
                                                    📅 End: {new Date(section.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                        </span>
                      )}
                      {section.location && (
                        <span className="meta-item">
                                                    📍 {section.location}
                        </span>
                      )}
                      {section.organization && (
                        <span className="meta-item">
                                                    🏢 {section.organization}
                        </span>
                      )}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        )}
      </div>

      {/* Custom Section Tips */}
      <div className="tips-panel">
        <div className="tips-header">
          <FaLightbulb />
          <h4>Custom Section Ideas</h4>
        </div>
        <div className="tips-content">
          <div className="tip">
            <h5>Publications</h5>
            <p>List research papers, articles, or books you've authored or contributed to.</p>
          </div>
          <div className="tip">
            <h5>Volunteering</h5>
            <p>Showcase community service and non-profit work experience.</p>
          </div>
          <div className="tip">
            <h5>Awards & Honors</h5>
            <p>Highlight professional awards, scholarships, or recognitions.</p>
          </div>
        </div>
      </div>

      <style jsx>{`
                .custom-page {
                    padding: 0;
                    max-width: 100%;
                }

                /* Header */
                .page-header {
                    margin-bottom: 2.5rem;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 1.5rem;
                }

                .header-left {
                    display: flex;
                    align-items: center;
                    gap: 1.25rem;
                }

                .header-icon {
                    width: 65px;
                    height: 65px;
                    background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
                    border-radius: 15px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: 1.75rem;
                    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.25);
                }

                .page-title {
                    font-size: 2.5rem;
                    font-weight: 800;
                    color: #1f2937;
                    margin: 0 0 0.5rem 0;
                    background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }

                .page-subtitle {
                    font-size: 1.1rem;
                    color: #6b7280;
                    margin: 0;
                }

                .header-stats {
                    display: flex;
                    align-items: center;
                    gap: 1.5rem;
                }

                .stat-chip {
                    background: linear-gradient(135deg, #6366f1, #4f46e5);
                    color: white;
                    padding: 0.875rem 1.75rem;
                    border-radius: 50px;
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    font-weight: 600;
                    font-size: 0.95rem;
                    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.25);
                }

                .btn-primary {
                    padding: 0.875rem 1.75rem;
                    background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
                    color: white;
                    border: none;
                    border-radius: 10px;
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }

                .btn-primary:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 20px rgba(99, 102, 241, 0.35);
                }

                /* Templates Section */
                .templates-section {
                    margin-bottom: 2.5rem;
                }

                .section-title {
                    font-size: 1.5rem;
                    color: #1f2937;
                    margin: 0 0 0.5rem 0;
                }

                .section-subtitle {
                    color: #6b7280;
                    margin: 0 0 1.5rem 0;
                }

                .templates-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
                    gap: 1.25rem;
                }

                .template-card {
                    background: white;
                    border: 2px solid #e5e7eb;
                    border-radius: 12px;
                    padding: 1.5rem;
                    text-align: left;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    display: flex;
                    align-items: center;
                    gap: 1.25rem;
                }

                .template-card:hover {
                    border-color: #6366f1;
                    transform: translateY(-3px);
                    box-shadow: 0 8px 25px rgba(99, 102, 241, 0.15);
                }

                .template-icon {
                    font-size: 2rem;
                    width: 50px;
                    height: 50px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: #f0f9ff;
                    border-radius: 10px;
                }

                .template-info h4 {
                    font-size: 1.1rem;
                    color: #1f2937;
                    margin: 0 0 0.25rem 0;
                }

                .template-info p {
                    font-size: 0.875rem;
                    color: #6b7280;
                    margin: 0;
                }

                /* Stats Overview */
                .stats-overview {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
                    gap: 1.25rem;
                    margin-bottom: 2.5rem;
                }

                .stat-card {
                    background: white;
                    border-radius: 15px;
                    padding: 1.75rem;
                    text-align: center;
                    border: 2px solid #e5e7eb;
                    transition: all 0.3s ease;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
                }

                .stat-card:hover {
                    border-color: #6366f1;
                    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
                    transform: translateY(-3px);
                }

                .stat-value {
                    font-size: 2.25rem;
                    font-weight: 800;
                    color: #6366f1;
                    margin-bottom: 0.5rem;
                }

                .stat-label {
                    font-size: 0.875rem;
                    font-weight: 600;
                    color: #6b7280;
                    text-transform: uppercase;
                }

                /* Form */
                .custom-form-card {
                    background: white;
                    border-radius: 20px;
                    padding: 2.5rem;
                    margin-bottom: 2.5rem;
                    border: 2px solid #e5e7eb;
                    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
                }

                .form-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 2rem;
                    padding-bottom: 1.5rem;
                    border-bottom: 2px solid #f3f4f6;
                }

                .form-title h3 {
                    font-size: 1.75rem;
                    font-weight: 700;
                    color: #1f2937;
                    margin: 0 0 0.5rem 0;
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                }

                .form-subtitle {
                    font-size: 0.95rem;
                    color: #6b7280;
                    margin: 0;
                }

                .btn-icon {
                    width: 45px;
                    height: 45px;
                    border-radius: 10px;
                    border: 2px solid #e5e7eb;
                    background: white;
                    color: #4b5563;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }

                .btn-icon:hover {
                    background: #f3f4f6;
                    border-color: #d1d5db;
                }

                .btn-icon.small {
                    width: 35px;
                    height: 35px;
                    font-size: 0.875rem;
                }

                .btn-icon.danger {
                    color: #ef4444;
                }

                .btn-icon.danger:hover {
                    background: #fef2f2;
                    border-color: #fecaca;
                }

                .form-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 1.75rem;
                    margin-bottom: 2rem;
                }

                @media (max-width: 768px) {
                    .form-grid {
                        grid-template-columns: 1fr;
                    }
                }

                .full-width {
                    grid-column: 1 / -1;
                }

                .form-group {
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                }

                .form-group label {
                    font-size: 0.875rem;
                    font-weight: 600;
                    color: #374151;
                }

                .required:after {
                    content: " *";
                    color: #ef4444;
                }

                .input-with-status {
                    position: relative;
                }

                .field-icon {
                    position: absolute;
                    left: 1rem;
                    top: 50%;
                    transform: translateY(-50%);
                    color: #9ca3af;
                    font-size: 1rem;
                }

                .form-input, .form-textarea {
                    width: 100%;
                    padding: 0.875rem 1rem 0.875rem 3rem;
                    border: 2px solid #e5e7eb;
                    border-radius: 10px;
                    font-size: 0.95rem;
                    color: #1f2937;
                    background: white;
                    transition: all 0.3s ease;
                }

                .form-input:focus, .form-textarea:focus {
                    outline: none;
                    border-color: #6366f1;
                    box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
                }

                .form-input.error, .form-textarea.error {
                    border-color: #ef4444;
                }

                .form-textarea {
                    min-height: 120px;
                    resize: vertical;
                    padding-left: 1rem;
                }

                .error-message {
                    font-size: 0.75rem;
                    color: #ef4444;
                    font-weight: 500;
                }

                .field-tip {
                    font-size: 0.75rem;
                    color: #6b7280;
                    font-style: italic;
                }

                /* Type Select */
                .type-select {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
                    gap: 1rem;
                }

                .type-option {
                    padding: 1.25rem;
                    border: 2px solid #e5e7eb;
                    border-radius: 12px;
                    background: white;
                    text-align: left;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }

                .type-option:hover {
                    border-color: #d1d5db;
                    transform: translateY(-2px);
                }

                .type-option.selected {
                    border-color: #6366f1;
                    background: #f0f9ff;
                }

                .type-icon {
                    font-size: 1.5rem;
                    color: #6366f1;
                }

                .type-name {
                    font-weight: 600;
                    color: #1f2937;
                    font-size: 0.95rem;
                }

                .type-description {
                    font-size: 0.75rem;
                    color: #6b7280;
                    margin-top: 0.25rem;
                }

                .section-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 1.5rem;
                }

                .field-subtitle {
                    font-size: 0.75rem;
                    color: #9ca3af;
                    margin: 0.25rem 0 0 0;
                }

                .btn-small {
                    padding: 0.625rem 1.25rem;
                    background: white;
                    border: 2px solid #6366f1;
                    border-radius: 8px;
                    color: #6366f1;
                    font-size: 0.875rem;
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    cursor: pointer;
                }

                .btn-small:hover {
                    background: #6366f1;
                    color: white;
                }

                .items-list {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }

                .item {
                    display: flex;
                    gap: 1rem;
                    align-items: center;
                    padding: 0.75rem;
                    background: #f9fafb;
                    border-radius: 8px;
                    border: 1px solid #e5e7eb;
                }

                .item-number {
                    width: 28px;
                    height: 28px;
                    background: linear-gradient(135deg, #6366f1, #4f46e5);
                    color: white;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 0.75rem;
                    font-weight: 600;
                }

                .item-input {
                    flex: 1;
                    padding: 0.75rem 1rem;
                    border: 1px solid #e5e7eb;
                    border-radius: 6px;
                    font-size: 0.875rem;
                    color: #1f2937;
                    background: white;
                }

                .no-items {
                    padding: 2.5rem 1.5rem;
                    text-align: center;
                    color: #6b7280;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 1rem;
                    background: #f9fafb;
                    border-radius: 12px;
                    border: 2px dashed #d1d5db;
                }

                .no-items .empty-icon {
                    font-size: 2.5rem;
                }

                .empty-content h4 {
                    font-size: 1.25rem;
                    font-weight: 600;
                    color: #4b5563;
                    margin: 0 0 0.5rem 0;
                }

                .empty-content p {
                    color: #6b7280;
                    margin: 0 0 1.5rem 0;
                    font-size: 0.95rem;
                }

                /* Form Actions */
                .form-actions {
                    display: flex;
                    justify-content: flex-end;
                    gap: 1.25rem;
                    padding-top: 1.5rem;
                    border-top: 2px solid #f3f4f6;
                }

                .btn-secondary {
                    padding: 0.875rem 2rem;
                    border: 2px solid #e5e7eb;
                    border-radius: 10px;
                    background: white;
                    color: #4b5563;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }

                .btn-secondary:hover {
                    background: #f3f4f6;
                    border-color: #d1d5db;
                }

                /* Custom Sections List */
                .custom-sections-list {
                    display: flex;
                    flex-direction: column;
                }

                .empty-state {
                    text-align: center;
                    padding: 4rem 2rem;
                    background: white;
                    border-radius: 20px;
                    border: 2px dashed #d1d5db;
                }

                .empty-state .empty-icon {
                    font-size: 4rem;
                    color: #d1d5db;
                    margin-bottom: 1.5rem;
                }

                .empty-state h3 {
                    font-size: 1.75rem;
                    color: #374151;
                    margin: 0 0 1rem 0;
                }

                .empty-state p {
                    color: #6b7280;
                    margin: 0 0 2rem 0;
                    font-size: 1.05rem;
                    max-width: 500px;
                    margin-left: auto;
                    margin-right: auto;
                }

                .empty-actions {
                    display: flex;
                    gap: 1rem;
                    justify-content: center;
                }

                /* Sections Container */
                .sections-container {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
                    gap: 1.5rem;
                }

                /* Custom Section Card */
                .custom-section-card {
                    background: white;
                    border-radius: 18px;
                    padding: 2rem;
                    border: 2px solid #e5e7eb;
                    transition: all 0.3s ease;
                }

                .custom-section-card:hover {
                    border-color: #6366f1;
                    box-shadow: 0 8px 30px rgba(99, 102, 241, 0.15);
                }

                .section-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 1.5rem;
                    gap: 1.5rem;
                }

                .section-title {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    flex-wrap: wrap;
                }

                .section-icon {
                    font-size: 1.75rem;
                }

                .section-title h3 {
                    font-size: 1.5rem;
                    color: #1f2937;
                    margin: 0;
                }

                .section-type {
                    background: #e0e7ff;
                    color: #4f46e5;
                    padding: 0.25rem 0.75rem;
                    border-radius: 20px;
                    font-size: 0.75rem;
                    font-weight: 600;
                }

                .section-actions {
                    display: flex;
                    gap: 0.5rem;
                    flex-wrap: wrap;
                }

                .section-content {
                    margin-bottom: 1.5rem;
                }

                .custom-list {
                    margin: 0;
                    padding-left: 1.5rem;
                    list-style: none;
                }

                .custom-list li {
                    padding: 0.5rem 0;
                    color: #4b5563;
                    position: relative;
                }

                .custom-list li:before {
                    content: "•";
                    color: #6366f1;
                    font-weight: bold;
                    display: inline-block;
                    width: 1em;
                    margin-left: -1em;
                }

                .timeline {
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                }

                .timeline-dates {
                    font-weight: 600;
                    color: #4f46e5;
                }

                .timeline-location, .timeline-organization {
                    color: #6b7280;
                    font-size: 0.95rem;
                }

                .timeline-description {
                    color: #4b5563;
                    line-height: 1.6;
                }

                .timeline-items {
                    margin: 0;
                    padding-left: 1.25rem;
                    list-style: none;
                }

                .timeline-items li {
                    padding: 0.25rem 0;
                    color: #4b5563;
                    position: relative;
                }

                .timeline-items li:before {
                    content: "→";
                    color: #6366f1;
                    position: absolute;
                    left: -1.25rem;
                }

                .text-content {
                    color: #4b5563;
                    line-height: 1.7;
                    font-size: 0.95rem;
                }

                .skills-content {
                    margin-top: 0.5rem;
                }

                .skill-tags {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 0.75rem;
                }

                .skill-tag {
                    background: #e0e7ff;
                    color: #4f46e5;
                    padding: 0.5rem 1rem;
                    border-radius: 20px;
                    font-size: 0.85rem;
                    font-weight: 500;
                }

                .section-meta {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 1rem;
                    padding-top: 1.25rem;
                    border-top: 1px solid #e5e7eb;
                }

                .meta-item {
                    font-size: 0.875rem;
                    color: #6b7280;
                    display: flex;
                    align-items: center;
                    gap: 0.375rem;
                }

                /* Tips Panel */
                .tips-panel {
                    margin-top: 3rem;
                    background: #e0e7ff;
                    border-radius: 18px;
                    padding: 2rem;
                    border: 2px solid #c7d2fe;
                }

                .tips-header {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    margin-bottom: 1.5rem;
                }

                .tips-header svg {
                    color: #6366f1;
                    font-size: 1.5rem;
                }

                .tips-header h4 {
                    font-size: 1.5rem;
                    color: #3730a3;
                    margin: 0;
                }

                .tips-content {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 1.5rem;
                }

                .tip h5 {
                    font-size: 1.1rem;
                    color: #3730a3;
                    margin: 0 0 0.5rem 0;
                }

                .tip p {
                    color: #4f46e5;
                    margin: 0;
                    font-size: 0.95rem;
                    line-height: 1.5;
                }

                /* Responsive */
                @media (max-width: 768px) {
                    .page-header {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 1.5rem;
                    }

                    .header-stats {
                        width: 100%;
                        justify-content: space-between;
                    }

                    .templates-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }

                    .type-select {
                        grid-template-columns: 1fr;
                    }

                    .sections-container {
                        grid-template-columns: 1fr;
                    }

                    .section-header {
                        flex-direction: column;
                        gap: 1.5rem;
                    }

                    .section-actions {
                        width: 100%;
                        justify-content: space-between;
                    }

                    .stats-overview {
                        grid-template-columns: repeat(2, 1fr);
                    }

                    .empty-actions {
                        flex-direction: column;
                    }
                }

                @media (max-width: 640px) {
                    .stats-overview {
                        grid-template-columns: 1fr;
                    }

                    .templates-grid {
                        grid-template-columns: 1fr;
                    }

                    .form-actions {
                        flex-direction: column;
                    }

                    .btn-primary, .btn-secondary {
                        width: 100%;
                        justify-content: center;
                    }
                }
            `}</style>
    </div>
  );
};

export default CustomPage;