import React, { useState, useEffect } from 'react';
import {
    FaCertificate,
    FaPlus,
    FaTrash,
    FaEdit,
    FaSave,
    FaTimes,
    FaCalendarAlt,
    FaBuilding,
    FaExternalLinkAlt,
    FaStar,
    FaIdCard,
    FaCheckCircle,
    FaRegCalendarCheck
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const CertificationsPage = ({ resumeData, onUpdate, errors, setErrors }) => {
    const [certifications, setCertifications] = useState(resumeData?.certifications || []);
    const [editingIndex, setEditingIndex] = useState(-1);
    const [isAddingNew, setIsAddingNew] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        issuer: '',
        issueDate: '',
        expirationDate: '',
        neverExpires: false,
        credentialId: '',
        credentialUrl: '',
        description: '',
        skills: []
    });

    useEffect(() => {
        if (resumeData?.certifications) {
            setCertifications(resumeData.certifications);
        }
    }, [resumeData?.certifications]);

    const handleUpdate = (data) => {
        if (onUpdate) {
            onUpdate('certifications', data);
        }
    };

    useEffect(() => {
        if (certifications.length > 0 || certifications.length === 0) {
            handleUpdate(certifications);
        }
    }, [certifications]);

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleAddSkill = () => {
        setFormData(prev => ({
            ...prev,
            skills: [...prev.skills, '']
        }));
    };

    const handleSkillChange = (index, value) => {
        setFormData(prev => ({
            ...prev,
            skills: prev.skills.map((item, i) => i === index ? value : item)
        }));
    };

    const handleRemoveSkill = (index) => {
        setFormData(prev => ({
            ...prev,
            skills: prev.skills.filter((_, i) => i !== index)
        }));
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Certification name is required';
        }
        if (!formData.issuer.trim()) {
            newErrors.issuer = 'Issuing organization is required';
        }
        if (!formData.issueDate) {
            newErrors.issueDate = 'Issue date is required';
        }
        if (!formData.neverExpires && !formData.expirationDate) {
            newErrors.expirationDate = 'Expiration date is required';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(prev => ({ ...prev, ...newErrors }));
            return false;
        }

        setErrors({});
        return true;
    };

    const handleAddCertification = () => {
        if (!validateForm()) {
            toast.error('Please fill all required fields');
            return;
        }

        const newCertification = {
            id: Date.now(),
            ...formData,
            skills: formData.skills.filter(s => s.trim() !== '')
        };

        setCertifications(prev => [...prev, newCertification]);
        resetForm();
        setIsAddingNew(false);
        toast.success('Certification added successfully!');
    };

    const handleEditCertification = (index) => {
        const certification = certifications[index];
        setFormData({
            name: certification.name || '',
            issuer: certification.issuer || '',
            issueDate: certification.issueDate || '',
            expirationDate: certification.expirationDate || '',
            neverExpires: certification.neverExpires || false,
            credentialId: certification.credentialId || '',
            credentialUrl: certification.credentialUrl || '',
            description: certification.description || '',
            skills: certification.skills || []
        });
        setEditingIndex(index);
        setIsAddingNew(false);
    };

    const handleUpdateCertification = () => {
        if (!validateForm()) {
            toast.error('Please fill all required fields');
            return;
        }

        setCertifications(prev => {
            const updated = [...prev];
            updated[editingIndex] = {
                ...updated[editingIndex],
                ...formData,
                skills: formData.skills.filter(s => s.trim() !== '')
            };
            return updated;
        });

        resetForm();
        setEditingIndex(-1);
        toast.success('Certification updated successfully!');
    };

    const handleDeleteCertification = (index) => {
        if (window.confirm('Are you sure you want to delete this certification?')) {
            setCertifications(prev => prev.filter((_, i) => i !== index));
            toast.success('Certification removed successfully');
        }
    };

    const handleMoveCertification = (index, direction) => {
        if ((direction === 'up' && index === 0) || (direction === 'down' && index === certifications.length - 1)) {
            return;
        }

        setCertifications(prev => {
            const updated = [...prev];
            const newIndex = direction === 'up' ? index - 1 : index + 1;
            [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
            return updated;
        });
    };

    const handleDuplicateCertification = (index) => {
        const certification = certifications[index];
        const duplicatedCertification = {
            ...certification,
            id: Date.now(),
            name: `${certification.name} (Copy)`
        };

        setCertifications(prev => [...prev, duplicatedCertification]);
        toast.success('Certification duplicated successfully!');
    };

    const resetForm = () => {
        setFormData({
            name: '',
            issuer: '',
            issueDate: '',
            expirationDate: '',
            neverExpires: false,
            credentialId: '',
            credentialUrl: '',
            description: '',
            skills: []
        });
        setErrors({});
    };

    const getExpirationStatus = (expirationDate) => {
        if (!expirationDate) return 'no-expiry';
        const expDate = new Date(expirationDate);
        const today = new Date();

        if (expDate < today) return 'expired';
        const diffTime = expDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays <= 30) return 'expiring-soon';
        if (diffDays <= 90) return 'expiring';
        return 'valid';
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'expired': return '#ef4444';
            case 'expiring-soon': return '#f59e0b';
            case 'expiring': return '#fbbf24';
            case 'valid': return '#10b981';
            default: return '#6b7280';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'expired': return 'Expired';
            case 'expiring-soon': return 'Expiring Soon';
            case 'expiring': return 'Expiring';
            case 'valid': return 'Valid';
            case 'no-expiry': return 'No Expiry';
            default: return 'Unknown';
        }
    };

    const getIssuerLogo = (issuer) => {
        const issuerLower = issuer.toLowerCase();
        if (issuerLower.includes('aws')) return '🌩️';
        if (issuerLower.includes('google')) return '🔍';
        if (issuerLower.includes('microsoft')) return '🪟';
        if (issuerLower.includes('cisco')) return '🔗';
        if (issuerLower.includes('comptia')) return '💻';
        if (issuerLower.includes('ibm')) return '💠';
        if (issuerLower.includes('oracle')) return '🗃️';
        if (issuerLower.includes('salesforce')) return '☁️';
        return '🏢';
    };

    return (
        <div className="certifications-page">
            {/* Header */}
            <div className="page-header">
                <div className="header-left">
                    <div className="header-icon">
                        <FaCertificate />
                    </div>
                    <div>
                        <h2 className="page-title">Certifications</h2>
                        <p className="page-subtitle">Showcase your professional certifications and licenses</p>
                    </div>
                </div>
                <div className="header-stats">
                    <div className="stat-chip">
                        <FaCheckCircle />
                        <span>Certifications: {certifications.length}</span>
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
                        <FaPlus /> Add Certification
                    </button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="stats-overview">
                <div className="stat-card">
                    <div className="stat-value">{certifications.length}</div>
                    <div className="stat-label">Total</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">
                        {certifications.filter(c => getExpirationStatus(c.expirationDate) === 'valid').length}
                    </div>
                    <div className="stat-label">Valid</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">
                        {certifications.filter(c => getExpirationStatus(c.expirationDate) === 'expired').length}
                    </div>
                    <div className="stat-label">Expired</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">
                        {certifications.filter(c => c.neverExpires || !c.expirationDate).length}
                    </div>
                    <div className="stat-label">No Expiry</div>
                </div>
            </div>

            {/* Add/Edit Form */}
            <AnimatePresence>
                {(isAddingNew || editingIndex !== -1) && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="certification-form-card"
                    >
                        <div className="form-header">
                            <div className="form-title">
                                <h3>
                                    {editingIndex !== -1 ?
                                        <><FaEdit /> Edit Certification</> :
                                        <><FaPlus /> Add New Certification</>
                                    }
                                </h3>
                                <p className="form-subtitle">
                                    {editingIndex !== -1 ? 'Update your certification details' : 'Add a new professional certification'}
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
                            {/* Certification Name */}
                            <div className="form-group full-width">
                                <label className="required">Certification Name *</label>
                                <div className="input-with-status">
                                    <FaCertificate className="field-icon" />
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => handleInputChange('name', e.target.value)}
                                        placeholder="e.g., AWS Certified Solutions Architect"
                                        className={`form-input ${errors?.name ? 'error' : ''}`}
                                    />
                                </div>
                                {errors?.name && (
                                    <div className="error-message">{errors.name}</div>
                                )}
                                <div className="field-tip">Full name of the certification</div>
                            </div>

                            {/* Issuer */}
                            <div className="form-group">
                                <label className="required">Issuing Organization *</label>
                                <div className="input-with-status">
                                    <FaBuilding className="field-icon" />
                                    <input
                                        type="text"
                                        value={formData.issuer}
                                        onChange={(e) => handleInputChange('issuer', e.target.value)}
                                        placeholder="e.g., Amazon Web Services"
                                        className={`form-input ${errors?.issuer ? 'error' : ''}`}
                                    />
                                </div>
                                {errors?.issuer && (
                                    <div className="error-message">{errors.issuer}</div>
                                )}
                                <div className="field-tip">Organization that issued the certification</div>
                            </div>

                            {/* Issue Date */}
                            <div className="form-group">
                                <label className="required">Issue Date *</label>
                                <div className="input-with-status">
                                    <FaCalendarAlt className="field-icon" />
                                    <input
                                        type="month"
                                        value={formData.issueDate}
                                        onChange={(e) => handleInputChange('issueDate', e.target.value)}
                                        className={`form-input ${errors?.issueDate ? 'error' : ''}`}
                                    />
                                </div>
                                {errors?.issueDate && (
                                    <div className="error-message">{errors.issueDate}</div>
                                )}
                                <div className="field-tip">When the certification was issued</div>
                            </div>

                            {/* Expiration Date */}
                            <div className="form-group">
                                <label className={!formData.neverExpires ? 'required' : ''}>
                                    Expiration Date {!formData.neverExpires ? '*' : ''}
                                </label>
                                <div className="date-container">
                                    <div className="never-expires-checkbox">
                                        <input
                                            type="checkbox"
                                            id="never-expires"
                                            checked={formData.neverExpires}
                                            onChange={(e) => handleInputChange('neverExpires', e.target.checked)}
                                            className="checkbox"
                                        />
                                        <label htmlFor="never-expires" className="checkbox-label">
                                            Does not expire
                                        </label>
                                    </div>
                                    <div className="input-with-status">
                                        <FaRegCalendarCheck className="field-icon" />
                                        <input
                                            type="month"
                                            value={formData.neverExpires ? '' : formData.expirationDate}
                                            onChange={(e) => handleInputChange('expirationDate', e.target.value)}
                                            className={`form-input ${errors?.expirationDate ? 'error' : ''}`}
                                            disabled={formData.neverExpires}
                                            placeholder={formData.neverExpires ? 'Never expires' : ''}
                                        />
                                    </div>
                                </div>
                                {errors?.expirationDate && (
                                    <div className="error-message">{errors.expirationDate}</div>
                                )}
                                <div className="field-tip">Leave empty for certifications that don't expire</div>
                            </div>

                            {/* Credential ID */}
                            <div className="form-group">
                                <label>Credential ID</label>
                                <div className="input-with-status">
                                    <FaIdCard className="field-icon" />
                                    <input
                                        type="text"
                                        value={formData.credentialId}
                                        onChange={(e) => handleInputChange('credentialId', e.target.value)}
                                        placeholder="e.g., AWS-SOL-ARCH-12345"
                                        className="form-input"
                                    />
                                </div>
                                <div className="field-tip">Unique identifier for your certification</div>
                            </div>

                            {/* Credential URL */}
                            <div className="form-group">
                                <label>Credential URL</label>
                                <div className="input-with-status">
                                    <FaExternalLinkAlt className="field-icon" />
                                    <input
                                        type="url"
                                        value={formData.credentialUrl}
                                        onChange={(e) => handleInputChange('credentialUrl', e.target.value)}
                                        placeholder="https://www.credly.com/badges/..."
                                        className="form-input"
                                    />
                                </div>
                                <div className="field-tip">Link to verify your certification</div>
                            </div>

                            {/* Description */}
                            <div className="form-group full-width">
                                <label>Description</label>
                                <div className="input-with-status">
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => handleInputChange('description', e.target.value)}
                                        placeholder="Describe the certification, its significance, and what you learned..."
                                        className="form-textarea"
                                        rows={3}
                                    />
                                </div>
                                <div className="field-tip">Optional description of the certification</div>
                            </div>

                            {/* Skills */}
                            <div className="form-group full-width">
                                <div className="section-header">
                                    <div>
                                        <label>Skills & Technologies</label>
                                        <p className="field-subtitle">Skills validated by this certification</p>
                                    </div>
                                    <button
                                        className="btn-small"
                                        onClick={handleAddSkill}
                                        type="button"
                                    >
                                        <FaPlus /> Add Skill
                                    </button>
                                </div>

                                <div className="items-list">
                                    {formData.skills.map((skill, index) => (
                                        <div key={index} className="item">
                                            <div className="item-number">{index + 1}</div>
                                            <input
                                                type="text"
                                                value={skill}
                                                onChange={(e) => handleSkillChange(index, e.target.value)}
                                                placeholder="e.g., Cloud Architecture, AWS Services, Security..."
                                                className="item-input"
                                            />
                                            <button
                                                className="btn-icon danger"
                                                onClick={() => handleRemoveSkill(index)}
                                                type="button"
                                                title="Remove skill"
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>
                                    ))}

                                    {formData.skills.length === 0 && (
                                        <div className="no-items">
                                            <FaStar className="empty-icon" />
                                            <div className="empty-content">
                                                <h4>No skills added yet</h4>
                                                <p>Add skills that this certification validates</p>
                                                <button
                                                    className="btn-small"
                                                    onClick={handleAddSkill}
                                                    type="button"
                                                >
                                                    <FaPlus /> Add First Skill
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
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
                                onClick={editingIndex !== -1 ? handleUpdateCertification : handleAddCertification}
                                type="button"
                            >
                                <FaSave /> {editingIndex !== -1 ? 'Update Certification' : 'Save Certification'}
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Certifications List */}
            <div className="certifications-list">
                {certifications.length === 0 ? (
                    <div className="empty-state">
                        <FaCertificate className="empty-icon" />
                        <div className="empty-content">
                            <h3>No certifications added yet</h3>
                            <p>Add your professional certifications to showcase your expertise</p>
                            <button
                                className="btn-primary"
                                onClick={() => setIsAddingNew(true)}
                                type="button"
                            >
                                <FaPlus /> Add Your First Certification
                            </button>
                        </div>
                    </div>
                ) : (
                    <AnimatePresence>
                        {certifications.map((certification, index) => {
                            const status = getExpirationStatus(certification.expirationDate);
                            const statusColor = getStatusColor(status);

                            return (
                                <motion.div
                                    key={certification.id || index}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="certification-card"
                                >
                                    <div className="certification-header">
                                        <div className="certification-info">
                                            <div className="certification-main">
                                                <div className="issuer-logo">
                                                    {getIssuerLogo(certification.issuer)}
                                                </div>
                                                <div>
                                                    <h3 className="certification-name">{certification.name}</h3>
                                                    <div className="certification-issuer">
                                                        <FaBuilding /> {certification.issuer}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="certification-meta">
                                                <div className="credential-id">
                                                    {certification.credentialId && (
                                                        <span className="id-badge">
                                                            <FaIdCard /> ID: {certification.credentialId}
                                                        </span>
                                                    )}
                                                    <span
                                                        className="status-badge"
                                                        style={{
                                                            backgroundColor: statusColor,
                                                            color: 'white'
                                                        }}
                                                    >
                                                        {getStatusText(status)}
                                                    </span>
                                                </div>
                                                <div className="dates">
                                                    <FaCalendarAlt />
                                                    <span>
                                                        Issued: {new Date(certification.issueDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                                                    </span>
                                                    {certification.expirationDate && (
                                                        <span>
                                                            • Expires: {new Date(certification.expirationDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                                                        </span>
                                                    )}
                                                    {certification.neverExpires && (
                                                        <span className="never-expires-badge">
                                                            • No Expiry
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="certification-actions">
                                            <button
                                                className="btn-icon"
                                                onClick={() => handleMoveCertification(index, 'up')}
                                                disabled={index === 0}
                                                title="Move up"
                                                type="button"
                                            >
                                                <FaArrowUp />
                                            </button>
                                            <button
                                                className="btn-icon"
                                                onClick={() => handleMoveCertification(index, 'down')}
                                                disabled={index === certifications.length - 1}
                                                title="Move down"
                                                type="button"
                                            >
                                                <FaArrowDown />
                                            </button>
                                            <button
                                                className="btn-icon"
                                                onClick={() => handleDuplicateCertification(index)}
                                                title="Duplicate"
                                                type="button"
                                            >
                                                <FaCopy />
                                            </button>
                                            <button
                                                className="btn-icon"
                                                onClick={() => handleEditCertification(index)}
                                                title="Edit"
                                                type="button"
                                            >
                                                <FaEdit />
                                            </button>
                                            <button
                                                className="btn-icon danger"
                                                onClick={() => handleDeleteCertification(index)}
                                                title="Delete"
                                                type="button"
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>
                                    </div>

                                    {certification.description && (
                                        <div className="certification-description">
                                            <p>{certification.description}</p>
                                        </div>
                                    )}

                                    {certification.skills && certification.skills.length > 0 && (
                                        <div className="certification-skills">
                                            <div className="section-header">
                                                <FaStar />
                                                <strong>Validated Skills</strong>
                                            </div>
                                            <div className="skill-tags">
                                                {certification.skills.map((skill, idx) => (
                                                    <span key={idx} className="skill-tag">{skill}</span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {(certification.credentialUrl) && (
                                        <div className="certification-links">
                                            <a
                                                href={certification.credentialUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="certification-link"
                                            >
                                                <FaExternalLinkAlt /> Verify Certification
                                            </a>
                                        </div>
                                    )}
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                )}
            </div>

            {/* Certification Tips */}
            <div className="tips-panel">
                <div className="tips-header">
                    <FaCheckCircle />
                    <h4>Certification Tips</h4>
                </div>
                <div className="tips-content">
                    <div className="tip">
                        <h5>Industry Standards</h5>
                        <p>Include certifications from recognized organizations like AWS, Google, Microsoft, Cisco, etc.</p>
                    </div>
                    <div className="tip">
                        <h5>Relevance</h5>
                        <p>Focus on certifications relevant to your target role or industry.</p>
                    </div>
                    <div className="tip">
                        <h5>Verification</h5>
                        <p>Always include credential IDs and verification URLs when available.</p>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .certifications-page {
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
                    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
                    border-radius: 15px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: 1.75rem;
                    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.25);
                }

                .page-title {
                    font-size: 2.5rem;
                    font-weight: 800;
                    color: #1f2937;
                    margin: 0 0 0.5rem 0;
                    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
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
                    background: linear-gradient(135deg, #ef4444, #dc2626);
                    color: white;
                    padding: 0.875rem 1.75rem;
                    border-radius: 50px;
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    font-weight: 600;
                    font-size: 0.95rem;
                    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.25);
                }

                .btn-primary {
                    padding: 0.875rem 1.75rem;
                    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
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
                    box-shadow: 0 8px 20px rgba(239, 68, 68, 0.35);
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
                    border-color: #ef4444;
                    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
                    transform: translateY(-3px);
                }

                .stat-value {
                    font-size: 2.25rem;
                    font-weight: 800;
                    color: #ef4444;
                    margin-bottom: 0.5rem;
                }

                .stat-label {
                    font-size: 0.875rem;
                    font-weight: 600;
                    color: #6b7280;
                    text-transform: uppercase;
                }

                /* Form */
                .certification-form-card {
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
                    border-color: #ef4444;
                    box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.1);
                }

                .form-input.error, .form-textarea.error {
                    border-color: #ef4444;
                }

                .form-textarea {
                    min-height: 100px;
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

                .never-expires-checkbox {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    margin-bottom: 0.5rem;
                }

                .checkbox {
                    width: 18px;
                    height: 18px;
                }

                .checkbox-label {
                    font-weight: 600;
                    color: #4b5563;
                    font-size: 0.875rem;
                    cursor: pointer;
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
                    border: 2px solid #ef4444;
                    border-radius: 8px;
                    color: #ef4444;
                    font-size: 0.875rem;
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    cursor: pointer;
                }

                .btn-small:hover {
                    background: #ef4444;
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
                    background: linear-gradient(135deg, #ef4444, #dc2626);
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

                .empty-icon {
                    font-size: 2.5rem;
                    color: #9ca3af;
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

                /* Certifications List */
                .certifications-list {
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
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

                /* Certification Card */
                .certification-card {
                    background: white;
                    border-radius: 18px;
                    padding: 2rem;
                    border: 2px solid #e5e7eb;
                    transition: all 0.3s ease;
                }

                .certification-card:hover {
                    border-color: #ef4444;
                    box-shadow: 0 8px 30px rgba(239, 68, 68, 0.15);
                }

                .certification-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 1.5rem;
                    gap: 1.5rem;
                }

                .certification-info {
                    flex: 1;
                }

                .certification-main {
                    display: flex;
                    align-items: center;
                    gap: 1.25rem;
                    margin-bottom: 1rem;
                }

                .issuer-logo {
                    font-size: 2.5rem;
                    width: 65px;
                    height: 65px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: #fef2f2;
                    border-radius: 12px;
                    color: #ef4444;
                }

                .certification-name {
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: #1f2937;
                    margin: 0 0 0.5rem 0;
                }

                .certification-issuer {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-size: 1rem;
                    color: #4b5563;
                }

                .certification-meta {
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                }

                .credential-id {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }

                .id-badge {
                    background: #f3f4f6;
                    color: #4b5563;
                    padding: 0.375rem 1rem;
                    border-radius: 20px;
                    font-size: 0.8rem;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .status-badge {
                    padding: 0.375rem 1rem;
                    border-radius: 20px;
                    font-size: 0.8rem;
                    font-weight: 600;
                }

                .dates {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    font-size: 0.95rem;
                    color: #6b7280;
                }

                .never-expires-badge {
                    color: #10b981;
                    font-weight: 600;
                }

                .certification-actions {
                    display: flex;
                    gap: 0.5rem;
                    flex-wrap: wrap;
                }

                .certification-description {
                    color: #4b5563;
                    line-height: 1.7;
                    margin-bottom: 1.5rem;
                }

                .certification-skills {
                    margin: 1.5rem 0;
                    padding: 1.25rem;
                    background: #fef2f2;
                    border-radius: 12px;
                    border-left: 4px solid #ef4444;
                }

                .section-header {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    margin-bottom: 1rem;
                }

                .section-header svg {
                    color: #ef4444;
                    font-size: 1.1rem;
                }

                .section-header strong {
                    font-size: 1.1rem;
                    color: #1f2937;
                    font-weight: 600;
                }

                .skill-tags {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 0.75rem;
                }

                .skill-tag {
                    background: white;
                    color: #ef4444;
                    padding: 0.5rem 1rem;
                    border-radius: 20px;
                    font-size: 0.85rem;
                    font-weight: 500;
                    border: 1px solid #fecaca;
                }

                .certification-links {
                    display: flex;
                    gap: 1rem;
                    margin-top: 1.5rem;
                }

                .certification-link {
                    padding: 0.75rem 1.5rem;
                    background: #ef4444;
                    color: white;
                    border-radius: 8px;
                    text-decoration: none;
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    transition: all 0.3s ease;
                }

                .certification-link:hover {
                    background: #dc2626;
                    transform: translateY(-2px);
                }

                /* Tips Panel */
                .tips-panel {
                    margin-top: 3rem;
                    background: #fef2f2;
                    border-radius: 18px;
                    padding: 2rem;
                    border: 2px solid #fecaca;
                }

                .tips-header {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    margin-bottom: 1.5rem;
                }

                .tips-header svg {
                    color: #ef4444;
                    font-size: 1.5rem;
                }

                .tips-header h4 {
                    font-size: 1.5rem;
                    color: #991b1b;
                    margin: 0;
                }

                .tips-content {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 1.5rem;
                }

                .tip h5 {
                    font-size: 1.1rem;
                    color: #991b1b;
                    margin: 0 0 0.5rem 0;
                }

                .tip p {
                    color: #dc2626;
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

                    .certification-header {
                        flex-direction: column;
                        gap: 1.5rem;
                    }

                    .certification-actions {
                        width: 100%;
                        justify-content: space-between;
                    }

                    .certification-main {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 1rem;
                    }

                    .issuer-logo {
                        width: 50px;
                        height: 50px;
                        font-size: 2rem;
                    }

                    .stats-overview {
                        grid-template-columns: repeat(2, 1fr);
                    }
                }

                @media (max-width: 640px) {
                    .stats-overview {
                        grid-template-columns: 1fr;
                    }

                    .credential-id {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 0.5rem;
                    }

                    .dates {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 0.5rem;
                    }

                    .certification-link {
                        width: 100%;
                        justify-content: center;
                    }
                }
            `}</style>
        </div>
    );
};

export default CertificationsPage;