import React, { useState, useEffect } from 'react';
import {
    FaUsers,
    FaPlus,
    FaTrash,
    FaEdit,
    FaSave,
    FaTimes,
    FaUserTie,
    FaBuilding,
    FaEnvelope,
    FaPhone,
    FaLinkedin,
    FaArrowUp,
    FaArrowDown,
    FaCopy,
    FaQuoteLeft
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const ReferencesPage = ({ resumeData, onUpdate, errors, setErrors }) => {
    const [references, setReferences] = useState(resumeData?.references || []);
    const [editingIndex, setEditingIndex] = useState(-1);
    const [isAddingNew, setIsAddingNew] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        title: '',
        company: '',
        email: '',
        phone: '',
        relationship: '',
        linkedinUrl: '',
        statement: '',
        availableUponRequest: false
    });

    const relationshipTypes = [
        'Manager',
        'Supervisor',
        'Colleague',
        'Mentor',
        'Professor',
        'Client',
        'Team Lead',
        'Director',
        'CEO',
        'Other'
    ];

    useEffect(() => {
        if (resumeData?.references) {
            setReferences(resumeData.references);
        }
    }, [resumeData?.references]);

    const handleUpdate = (data) => {
        if (onUpdate) {
            onUpdate('references', data);
        }
    };

    useEffect(() => {
        if (references.length > 0 || references.length === 0) {
            handleUpdate(references);
        }
    }, [references]);

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
        }
        if (!formData.title.trim()) {
            newErrors.title = 'Title is required';
        }
        if (!formData.company.trim()) {
            newErrors.company = 'Company is required';
        }
        if (!formData.relationship.trim()) {
            newErrors.relationship = 'Relationship is required';
        }

        // At least one contact method is required
        if (!formData.email.trim() && !formData.phone.trim() && !formData.linkedinUrl.trim()) {
            newErrors.contact = 'At least one contact method (email, phone, or LinkedIn) is required';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(prev => ({ ...prev, ...newErrors }));
            return false;
        }

        setErrors({});
        return true;
    };

    const handleAddReference = () => {
        if (!validateForm()) {
            toast.error('Please fill all required fields');
            return;
        }

        const newReference = {
            id: Date.now(),
            ...formData
        };

        setReferences(prev => [...prev, newReference]);
        resetForm();
        setIsAddingNew(false);
        toast.success('Reference added successfully!');
    };

    const handleEditReference = (index) => {
        const reference = references[index];
        setFormData({
            name: reference.name || '',
            title: reference.title || '',
            company: reference.company || '',
            email: reference.email || '',
            phone: reference.phone || '',
            relationship: reference.relationship || '',
            linkedinUrl: reference.linkedinUrl || '',
            statement: reference.statement || '',
            availableUponRequest: reference.availableUponRequest || false
        });
        setEditingIndex(index);
        setIsAddingNew(false);
    };

    const handleUpdateReference = () => {
        if (!validateForm()) {
            toast.error('Please fill all required fields');
            return;
        }

        setReferences(prev => {
            const updated = [...prev];
            updated[editingIndex] = {
                ...updated[editingIndex],
                ...formData
            };
            return updated;
        });

        resetForm();
        setEditingIndex(-1);
        toast.success('Reference updated successfully!');
    };

    const handleDeleteReference = (index) => {
        if (window.confirm('Are you sure you want to delete this reference?')) {
            setReferences(prev => prev.filter((_, i) => i !== index));
            toast.success('Reference removed successfully');
        }
    };

    const handleMoveReference = (index, direction) => {
        if ((direction === 'up' && index === 0) || (direction === 'down' && index === references.length - 1)) {
            return;
        }

        setReferences(prev => {
            const updated = [...prev];
            const newIndex = direction === 'up' ? index - 1 : index + 1;
            [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
            return updated;
        });
    };

    const handleDuplicateReference = (index) => {
        const reference = references[index];
        const duplicatedReference = {
            ...reference,
            id: Date.now(),
            name: `${reference.name} (Copy)`
        };

        setReferences(prev => [...prev, duplicatedReference]);
        toast.success('Reference duplicated successfully!');
    };

    const resetForm = () => {
        setFormData({
            name: '',
            title: '',
            company: '',
            email: '',
            phone: '',
            relationship: '',
            linkedinUrl: '',
            statement: '',
            availableUponRequest: false
        });
        setErrors({});
    };

    const handleAvailableUponRequest = () => {
        if (window.confirm('This will replace all references with "Available upon request". Continue?')) {
            setReferences([{
                id: Date.now(),
                availableUponRequest: true
            }]);
            toast.success('References set to "Available upon request"');
        }
    };

    return (
        <div className="references-page">
            {/* Header */}
            <div className="page-header">
                <div className="header-left">
                    <div className="header-icon">
                        <FaUsers />
                    </div>
                    <div>
                        <h2 className="page-title">References</h2>
                        <p className="page-subtitle">Professional references to support your application</p>
                    </div>
                </div>
                <div className="header-stats">
                    <div className="stat-chip">
                        <FaUserTie />
                        <span>References: {references.length}</span>
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
                        <FaPlus /> Add Reference
                    </button>
                </div>
            </div>

            {/* Available Upon Request Option */}
            <div className="available-option">
                <div className="option-card">
                    <div className="option-content">
                        <h4>Available Upon Request</h4>
                        <p>Use this option if you prefer to provide references only when requested</p>
                    </div>
                    <button
                        className="btn-secondary"
                        onClick={handleAvailableUponRequest}
                        type="button"
                        disabled={references.length === 1 && references[0]?.availableUponRequest}
                    >
                        Set as Default
                    </button>
                </div>
            </div>

            {/* Stats Overview */}
            {!references[0]?.availableUponRequest && (
                <div className="stats-overview">
                    <div className="stat-card">
                        <div className="stat-value">{references.length}</div>
                        <div className="stat-label">Total</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">
                            {references.filter(r => r.email).length}
                        </div>
                        <div className="stat-label">With Email</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">
                            {references.filter(r => r.phone).length}
                        </div>
                        <div className="stat-label">With Phone</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">
                            {references.filter(r => r.statement).length}
                        </div>
                        <div className="stat-label">With Statement</div>
                    </div>
                </div>
            )}

            {/* Add/Edit Form */}
            <AnimatePresence>
                {(isAddingNew || editingIndex !== -1) && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="reference-form-card"
                    >
                        <div className="form-header">
                            <div className="form-title">
                                <h3>
                                    {editingIndex !== -1 ?
                                        <><FaEdit /> Edit Reference</> :
                                        <><FaPlus /> Add New Reference</>
                                    }
                                </h3>
                                <p className="form-subtitle">
                                    {editingIndex !== -1 ? 'Update your reference details' : 'Add a new professional reference'}
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
                            {/* Name */}
                            <div className="form-group">
                                <label className="required">Full Name *</label>
                                <div className="input-with-status">
                                    <FaUserTie className="field-icon" />
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => handleInputChange('name', e.target.value)}
                                        placeholder="e.g., John Smith"
                                        className={`form-input ${errors?.name ? 'error' : ''}`}
                                    />
                                </div>
                                {errors?.name && (
                                    <div className="error-message">{errors.name}</div>
                                )}
                                <div className="field-tip">Reference's full name</div>
                            </div>

                            {/* Relationship */}
                            <div className="form-group">
                                <label className="required">Relationship *</label>
                                <div className="input-with-status">
                                    <select
                                        value={formData.relationship}
                                        onChange={(e) => handleInputChange('relationship', e.target.value)}
                                        className={`form-input ${errors?.relationship ? 'error' : ''}`}
                                    >
                                        <option value="">Select relationship</option>
                                        {relationshipTypes.map(type => (
                                            <option key={type} value={type}>{type}</option>
                                        ))}
                                    </select>
                                </div>
                                {errors?.relationship && (
                                    <div className="error-message">{errors.relationship}</div>
                                )}
                                <div className="field-tip">How you know this person</div>
                            </div>

                            {/* Title */}
                            <div className="form-group">
                                <label className="required">Title *</label>
                                <div className="input-with-status">
                                    <FaUserTie className="field-icon" />
                                    <input
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) => handleInputChange('title', e.target.value)}
                                        placeholder="e.g., Senior Manager"
                                        className={`form-input ${errors?.title ? 'error' : ''}`}
                                    />
                                </div>
                                {errors?.title && (
                                    <div className="error-message">{errors.title}</div>
                                )}
                                <div className="field-tip">Reference's job title</div>
                            </div>

                            {/* Company */}
                            <div className="form-group">
                                <label className="required">Company *</label>
                                <div className="input-with-status">
                                    <FaBuilding className="field-icon" />
                                    <input
                                        type="text"
                                        value={formData.company}
                                        onChange={(e) => handleInputChange('company', e.target.value)}
                                        placeholder="e.g., Google"
                                        className={`form-input ${errors?.company ? 'error' : ''}`}
                                    />
                                </div>
                                {errors?.company && (
                                    <div className="error-message">{errors.company}</div>
                                )}
                                <div className="field-tip">Reference's company</div>
                            </div>

                            {/* Email */}
                            <div className="form-group">
                                <label>Email</label>
                                <div className="input-with-status">
                                    <FaEnvelope className="field-icon" />
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => handleInputChange('email', e.target.value)}
                                        placeholder="john.smith@company.com"
                                        className="form-input"
                                    />
                                </div>
                                <div className="field-tip">Professional email address</div>
                            </div>

                            {/* Phone */}
                            <div className="form-group">
                                <label>Phone</label>
                                <div className="input-with-status">
                                    <FaPhone className="field-icon" />
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => handleInputChange('phone', e.target.value)}
                                        placeholder="+1 (555) 123-4567"
                                        className="form-input"
                                    />
                                </div>
                                <div className="field-tip">Phone number with country code</div>
                            </div>

                            {/* LinkedIn */}
                            <div className="form-group">
                                <label>LinkedIn Profile</label>
                                <div className="input-with-status">
                                    <FaLinkedin className="field-icon" />
                                    <input
                                        type="url"
                                        value={formData.linkedinUrl}
                                        onChange={(e) => handleInputChange('linkedinUrl', e.target.value)}
                                        placeholder="https://linkedin.com/in/username"
                                        className="form-input"
                                    />
                                </div>
                                <div className="field-tip">Link to LinkedIn profile</div>
                            </div>

                            {/* Contact Error */}
                            {errors?.contact && (
                                <div className="form-group full-width">
                                    <div className="error-message">{errors.contact}</div>
                                </div>
                            )}

                            {/* Statement */}
                            <div className="form-group full-width">
                                <label>Reference Statement</label>
                                <div className="input-with-status">
                                    <FaQuoteLeft className="field-icon" />
                                    <textarea
                                        value={formData.statement}
                                        onChange={(e) => handleInputChange('statement', e.target.value)}
                                        placeholder="Optional: Include a brief statement from your reference or describe your working relationship..."
                                        className="form-textarea"
                                        rows={4}
                                    />
                                </div>
                                <div className="field-tip">Optional statement about your work together</div>
                            </div>

                            {/* Available Upon Request Checkbox */}
                            <div className="form-group full-width">
                                <div className="checkbox-container">
                                    <input
                                        type="checkbox"
                                        id="available-upon-request"
                                        checked={formData.availableUponRequest}
                                        onChange={(e) => handleInputChange('availableUponRequest', e.target.checked)}
                                        className="checkbox"
                                    />
                                    <label htmlFor="available-upon-request" className="checkbox-label">
                                        Available upon request only
                                    </label>
                                </div>
                                {formData.availableUponRequest && (
                                    <div className="checkbox-note">
                                        This reference will be listed as "Available upon request" without contact details
                                    </div>
                                )}
                            </div>
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
                                onClick={editingIndex !== -1 ? handleUpdateReference : handleAddReference}
                                type="button"
                            >
                                <FaSave /> {editingIndex !== -1 ? 'Update Reference' : 'Save Reference'}
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* References List */}
            <div className="references-list">
                {references.length === 0 ? (
                    <div className="empty-state">
                        <FaUsers className="empty-icon" />
                        <div className="empty-content">
                            <h3>No references added yet</h3>
                            <p>Add professional references or set them as "Available upon request"</p>
                            <div className="empty-actions">
                                <button
                                    className="btn-primary"
                                    onClick={() => setIsAddingNew(true)}
                                    type="button"
                                >
                                    <FaPlus /> Add Reference
                                </button>
                                <button
                                    className="btn-secondary"
                                    onClick={handleAvailableUponRequest}
                                    type="button"
                                >
                                    Set as Available Upon Request
                                </button>
                            </div>
                        </div>
                    </div>
                ) : references[0]?.availableUponRequest ? (
                    <div className="available-state">
                        <div className="available-card">
                            <div className="available-icon">
                                <FaUsers />
                            </div>
                            <div className="available-content">
                                <h3>References Available Upon Request</h3>
                                <p>Professional references will be provided upon request from potential employers</p>
                                <button
                                    className="btn-secondary"
                                    onClick={() => {
                                        setReferences([]);
                                        setIsAddingNew(true);
                                    }}
                                    type="button"
                                >
                                    <FaPlus /> Add Specific References
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <AnimatePresence>
                        <div className="references-container">
                            {references.map((reference, index) => (
                                <motion.div
                                    key={reference.id || index}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="reference-card"
                                >
                                    <div className="reference-header">
                                        <div className="reference-info">
                                            <div className="reference-main">
                                                <h3 className="reference-name">{reference.name}</h3>
                                                <div className="reference-title">
                                                    <FaUserTie /> {reference.title} at {reference.company}
                                                </div>
                                                <div className="reference-relationship">
                                                    Relationship: {reference.relationship}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="reference-actions">
                                            <button
                                                className="btn-icon small"
                                                onClick={() => handleMoveReference(index, 'up')}
                                                disabled={index === 0}
                                                title="Move up"
                                                type="button"
                                            >
                                                <FaArrowUp />
                                            </button>
                                            <button
                                                className="btn-icon small"
                                                onClick={() => handleMoveReference(index, 'down')}
                                                disabled={index === references.length - 1}
                                                title="Move down"
                                                type="button"
                                            >
                                                <FaArrowDown />
                                            </button>
                                            <button
                                                className="btn-icon small"
                                                onClick={() => handleDuplicateReference(index)}
                                                title="Duplicate"
                                                type="button"
                                            >
                                                <FaCopy />
                                            </button>
                                            <button
                                                className="btn-icon small"
                                                onClick={() => handleEditReference(index)}
                                                title="Edit"
                                                type="button"
                                            >
                                                <FaEdit />
                                            </button>
                                            <button
                                                className="btn-icon small danger"
                                                onClick={() => handleDeleteReference(index)}
                                                title="Delete"
                                                type="button"
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>
                                    </div>

                                    {reference.statement && (
                                        <div className="reference-statement">
                                            <div className="statement-icon">
                                                <FaQuoteLeft />
                                            </div>
                                            <p>{reference.statement}</p>
                                        </div>
                                    )}

                                    <div className="reference-contact">
                                        <div className="contact-header">
                                            <strong>Contact Information</strong>
                                        </div>
                                        <div className="contact-details">
                                            {reference.email && (
                                                <div className="contact-item">
                                                    <FaEnvelope />
                                                    <span>{reference.email}</span>
                                                </div>
                                            )}
                                            {reference.phone && (
                                                <div className="contact-item">
                                                    <FaPhone />
                                                    <span>{reference.phone}</span>
                                                </div>
                                            )}
                                            {reference.linkedinUrl && (
                                                <div className="contact-item">
                                                    <FaLinkedin />
                                                    <a href={reference.linkedinUrl} target="_blank" rel="noopener noreferrer">
                                                        LinkedIn Profile
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </AnimatePresence>
                )}
            </div>

            {/* Reference Tips */}
            <div className="tips-panel">
                <div className="tips-header">
                    <FaUserTie />
                    <h4>Reference Best Practices</h4>
                </div>
                <div className="tips-content">
                    <div className="tip">
                        <h5>Choose Wisely</h5>
                        <p>Select references who know your work well and can speak positively about your skills and character.</p>
                    </div>
                    <div className="tip">
                        <h5>Ask Permission</h5>
                        <p>Always ask for permission before listing someone as a reference.</p>
                    </div>
                    <div className="tip">
                        <h5>Provide Context</h5>
                        <p>Include your relationship and how you worked together in your description.</p>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .references-page {
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
                    background: linear-gradient(135deg, #ec4899 0%, #db2777 100%);
                    border-radius: 15px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: 1.75rem;
                    box-shadow: 0 4px 12px rgba(236, 72, 153, 0.25);
                }

                .page-title {
                    font-size: 2.5rem;
                    font-weight: 800;
                    color: #1f2937;
                    margin: 0 0 0.5rem 0;
                    background: linear-gradient(135deg, #ec4899 0%, #db2777 100%);
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
                    background: linear-gradient(135deg, #ec4899, #db2777);
                    color: white;
                    padding: 0.875rem 1.75rem;
                    border-radius: 50px;
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    font-weight: 600;
                    font-size: 0.95rem;
                    box-shadow: 0 4px 12px rgba(236, 72, 153, 0.25);
                }

                .btn-primary {
                    padding: 0.875rem 1.75rem;
                    background: linear-gradient(135deg, #ec4899 0%, #db2777 100%);
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
                    box-shadow: 0 8px 20px rgba(236, 72, 153, 0.35);
                }

                /* Available Option */
                .available-option {
                    margin-bottom: 2.5rem;
                }

                .option-card {
                    background: white;
                    border-radius: 16px;
                    padding: 1.75rem;
                    border: 2px solid #e5e7eb;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 1.5rem;
                }

                .option-content h4 {
                    font-size: 1.25rem;
                    color: #1f2937;
                    margin: 0 0 0.5rem 0;
                }

                .option-content p {
                    color: #6b7280;
                    margin: 0;
                    font-size: 0.95rem;
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
                    white-space: nowrap;
                }

                .btn-secondary:hover:not(:disabled) {
                    background: #f3f4f6;
                    border-color: #d1d5db;
                }

                .btn-secondary:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
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
                    border-color: #ec4899;
                    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
                    transform: translateY(-3px);
                }

                .stat-value {
                    font-size: 2.25rem;
                    font-weight: 800;
                    color: #ec4899;
                    margin-bottom: 0.5rem;
                }

                .stat-label {
                    font-size: 0.875rem;
                    font-weight: 600;
                    color: #6b7280;
                    text-transform: uppercase;
                }

                /* Form */
                .reference-form-card {
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

                .form-input, .form-textarea, select {
                    width: 100%;
                    padding: 0.875rem 1rem 0.875rem 3rem;
                    border: 2px solid #e5e7eb;
                    border-radius: 10px;
                    font-size: 0.95rem;
                    color: #1f2937;
                    background: white;
                    transition: all 0.3s ease;
                    font-family: inherit;
                }

                .form-input:focus, .form-textarea:focus, select:focus {
                    outline: none;
                    border-color: #ec4899;
                    box-shadow: 0 0 0 4px rgba(236, 72, 153, 0.1);
                }

                .form-input.error, .form-textarea.error, select.error {
                    border-color: #ef4444;
                }

                .form-textarea {
                    min-height: 120px;
                    resize: vertical;
                    padding-left: 1rem;
                }

                select {
                    appearance: none;
                    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
                    background-repeat: no-repeat;
                    background-position: right 1rem center;
                    background-size: 1rem;
                    padding-right: 3rem;
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

                .checkbox-container {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                }

                .checkbox {
                    width: 20px;
                    height: 20px;
                    border-radius: 4px;
                    border: 2px solid #d1d5db;
                    cursor: pointer;
                }

                .checkbox:checked {
                    background-color: #ec4899;
                    border-color: #ec4899;
                }

                .checkbox-label {
                    font-weight: 600;
                    color: #4b5563;
                    font-size: 0.95rem;
                    cursor: pointer;
                }

                .checkbox-note {
                    margin-top: 0.5rem;
                    font-size: 0.875rem;
                    color: #6b7280;
                    background: #fdf2f8;
                    padding: 0.75rem 1rem;
                    border-radius: 8px;
                    border: 1px solid #fbcfe8;
                }

                /* Form Actions */
                .form-actions {
                    display: flex;
                    justify-content: flex-end;
                    gap: 1.25rem;
                    padding-top: 1.5rem;
                    border-top: 2px solid #f3f4f6;
                }

                /* References List */
                .references-list {
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
                    flex-wrap: wrap;
                }

                /* Available State */
                .available-state {
                    margin-top: 1rem;
                }

                .available-card {
                    background: white;
                    border-radius: 20px;
                    padding: 3rem;
                    border: 2px solid #e5e7eb;
                    text-align: center;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 1.5rem;
                }

                .available-icon {
                    width: 80px;
                    height: 80px;
                    background: #fdf2f8;
                    border-radius: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #ec4899;
                    font-size: 2.5rem;
                }

                .available-content h3 {
                    font-size: 1.75rem;
                    color: #1f2937;
                    margin: 0 0 1rem 0;
                }

                .available-content p {
                    color: #6b7280;
                    margin: 0 0 1.5rem 0;
                    font-size: 1.05rem;
                    max-width: 500px;
                }

                /* References Container */
                .references-container {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
                    gap: 1.5rem;
                }

                /* Reference Card */
                .reference-card {
                    background: white;
                    border-radius: 18px;
                    padding: 2rem;
                    border: 2px solid #e5e7eb;
                    transition: all 0.3s ease;
                }

                .reference-card:hover {
                    border-color: #ec4899;
                    box-shadow: 0 8px 30px rgba(236, 72, 153, 0.15);
                }

                .reference-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 1.5rem;
                    gap: 1.5rem;
                }

                .reference-info {
                    flex: 1;
                }

                .reference-name {
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: #1f2937;
                    margin: 0 0 0.5rem 0;
                }

                .reference-title {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-size: 1rem;
                    color: #4b5563;
                    margin-bottom: 0.5rem;
                }

                .reference-relationship {
                    font-size: 0.875rem;
                    color: #6b7280;
                    background: #f3f4f6;
                    padding: 0.25rem 0.75rem;
                    border-radius: 20px;
                    display: inline-block;
                }

                .reference-actions {
                    display: flex;
                    gap: 0.5rem;
                    flex-wrap: wrap;
                }

                .reference-statement {
                    margin: 1.5rem 0;
                    padding: 1.5rem;
                    background: #fdf2f8;
                    border-radius: 12px;
                    border-left: 4px solid #ec4899;
                    display: flex;
                    gap: 1.25rem;
                }

                .statement-icon {
                    color: #ec4899;
                    font-size: 1.5rem;
                    flex-shrink: 0;
                }

                .reference-statement p {
                    color: #831843;
                    margin: 0;
                    line-height: 1.6;
                    font-style: italic;
                }

                .reference-contact {
                    padding: 1.5rem;
                    background: #f9fafb;
                    border-radius: 12px;
                    border: 1px solid #e5e7eb;
                }

                .contact-header {
                    font-size: 1rem;
                    color: #1f2937;
                    margin-bottom: 1rem;
                }

                .contact-details {
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                }

                .contact-item {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    font-size: 0.95rem;
                    color: #4b5563;
                }

                .contact-item svg {
                    color: #ec4899;
                    font-size: 1rem;
                    width: 20px;
                }

                .contact-item a {
                    color: #3b82f6;
                    text-decoration: none;
                }

                .contact-item a:hover {
                    text-decoration: underline;
                }

                /* Tips Panel */
                .tips-panel {
                    margin-top: 3rem;
                    background: #fdf2f8;
                    border-radius: 18px;
                    padding: 2rem;
                    border: 2px solid #fbcfe8;
                }

                .tips-header {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    margin-bottom: 1.5rem;
                }

                .tips-header svg {
                    color: #ec4899;
                    font-size: 1.5rem;
                }

                .tips-header h4 {
                    font-size: 1.5rem;
                    color: #9d174d;
                    margin: 0;
                }

                .tips-content {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 1.5rem;
                }

                .tip h5 {
                    font-size: 1.1rem;
                    color: #9d174d;
                    margin: 0 0 0.5rem 0;
                }

                .tip p {
                    color: #be185d;
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

                    .option-card {
                        flex-direction: column;
                        text-align: center;
                        gap: 1rem;
                    }

                    .references-container {
                        grid-template-columns: 1fr;
                    }

                    .reference-header {
                        flex-direction: column;
                        gap: 1.5rem;
                    }

                    .reference-actions {
                        width: 100%;
                        justify-content: space-between;
                    }

                    .reference-statement {
                        flex-direction: column;
                        text-align: center;
                        gap: 1rem;
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

export default ReferencesPage;