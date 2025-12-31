import React, { useState } from 'react';
import {
    FaCheckCircle,
    FaFileImage,
    FaEye,
    FaDownload,
    FaShare,
    FaPrint,
    FaExclamationTriangle,
    FaEdit,
    FaTimesCircle,
    FaCheck,
    FaStar,
} from 'react-icons/fa';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const ResumeImageSections = ({
    imageSections = {},
    onComplete,
    onEditSection,
}) => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [showPreview, setShowPreview] = useState(false);

    // Section metadata
    const sectionIcons = {
        avatars: <FaFileImage />,
        certificates: <FaCertificate />,
        artwork: <FaFileImage />,
        screenshots: <FaFileImage />,
        misc: <FaStar />
    };

    const sectionColors = {
        avatars: '#60a5fa',
        certificates: '#22d3ee',
        artwork: '#f59e42',
        screenshots: '#22c55e',
        misc: '#9d174d'
    };

    // Assign weights if completion & progress matters
    const sectionWeights = {
        avatars: 25,
        certificates: 25,
        artwork: 15,
        screenshots: 25,
        misc: 10
    };

    const calculateCompletion = () => {
        let totalScore = 0;
        let maxScore = 0;
        Object.entries(imageSections).forEach(([section, items]) => {
            const weight = sectionWeights[section] || 5;
            maxScore += weight;
            if (items && items.length > 0) totalScore += weight;
        });
        return Math.round((totalScore / (maxScore || 1)) * 100);
    };

    const completionPercentage = calculateCompletion();

    const getSectionStatus = (list) => {
        if (!list || list.length === 0) return { status: 'empty', message: 'No images' };
        if (list.length === 1) return { status: 'basic', message: 'One image added' };
        if (list.length >= 3) return { status: 'excellent', message: 'Gallery ready' };
        return { status: 'good', message: 'Some images added' };
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'empty': return '#ef4444';
            case 'basic': return '#f59e0b';
            case 'good': return '#3b82f6';
            case 'excellent': return '#10b981';
            default: return '#6b7280';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'empty': return <FaTimesCircle />;
            case 'basic': return <FaExclamationTriangle />;
            case 'good': return <FaCheckCircle />;
            case 'excellent': return <FaStar />;
            default: return <FaCheckCircle />;
        }
    };

    const handleGenerateGallery = () => {
        setIsGenerating(true);
        setTimeout(() => {
            setIsGenerating(false);
            toast.success('Gallery created!');
            if (onComplete) onComplete();
        }, 1600);
    };

    const handleDownload = () => {
        toast.success('Downloading gallery...');
    };

    const handlePrint = () => {
        window.print();
        toast.success('Print dialog opened');
    };

    const handleShare = () => {
        toast.success('Share feature coming soon!');
    };

    // Section keys
    const sections = Object.keys(imageSections);

    return (
        <div className="review-img-page">
            {/* Header */}
            <div className="page-header">
                <div className="header-left">
                    <div className="header-icon"><FaFileImage /></div>
                    <div>
                        <h2 className="page-title">Image Sections Review</h2>
                        <p className="page-subtitle">Review your uploaded images & generate your gallery</p>
                    </div>
                </div>
                <div className="header-stats">
                    <div className="completion-score">
                        <div className="score-value">{completionPercentage}%</div>
                        <div className="score-label">Ready</div>
                    </div>
                </div>
            </div>

            {/* Progress Section */}
            <div className="completion-section">
                <div className="completion-header">
                    <h3>Gallery Completion</h3>
                    <div className="completion-percentage">
                        {completionPercentage}% Complete
                    </div>
                </div>
                <div className="progress-bar">
                    <motion.div
                        className="progress-fill"
                        initial={{ width: 0 }}
                        animate={{ width: `${completionPercentage}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        style={{ backgroundColor: completionPercentage >= 80 ? '#10b981' : completionPercentage >= 50 ? '#3b82f6' : '#f59e0b' }}
                    />
                </div>
                <div className="progress-text">
                    {completionPercentage >= 80 ? (
                        <span className="text-success">🎉 Gallery is ready!</span>
                    ) : completionPercentage >= 50 ? (
                        <span className="text-warning">👍 Add a few more images for best results.</span>
                    ) : (
                        <span className="text-danger">📝 Include more images to complete your gallery.</span>
                    )}
                </div>
            </div>

            {/* Image Sections */}
            <div className="sections-review">
                <h3 className="review-title">Image Categories</h3>
                <p className="review-subtitle">Click a section to add or edit images</p>
                <div className="sections-grid">
                    {sections.map(sectionKey => {
                        const sectionData = imageSections[sectionKey] || [];
                        const status = getSectionStatus(sectionData);
                        const sectionName = sectionKey.charAt(0).toUpperCase() + sectionKey.slice(1);
                        return (
                            <motion.div
                                key={sectionKey}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="section-card"
                                onClick={() => onEditSection && onEditSection(sectionKey)}
                                style={{ cursor: 'pointer' }}
                            >
                                <div className="section-header">
                                    <div className="section-icon" style={{ backgroundColor: sectionColors[sectionKey] }}>
                                        {sectionIcons[sectionKey] || <FaFileImage />}
                                    </div>
                                    <div className="section-info">
                                        <h4>{sectionName}</h4>
                                        <div className="section-count">{sectionData.length} images</div>
                                    </div>
                                    <div className="section-status" style={{ color: getStatusColor(status.status) }}>
                                        {getStatusIcon(status.status)}
                                    </div>
                                </div>
                                <div className="section-content">
                                    <p className="status-message">{status.message}</p>
                                    {sectionData.length ? (
                                        <div className="imgs-preview-row">
                                            {sectionData.slice(0, 3).map((img, idx) => (
                                                <div className="img-thumb" key={idx}>
                                                    <img src={img.url || img} alt={img.alt || "Section Image"} />
                                                </div>
                                            ))}
                                            {sectionData.length > 3 && (
                                                <span className="more-items">+{sectionData.length - 3} more</span>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="empty-section">No images yet</div>
                                    )}
                                </div>
                                <div className="section-action">
                                    <button
                                        className="btn-edit"
                                        onClick={e => { e.stopPropagation(); onEditSection && onEditSection(sectionKey); }}
                                        type="button"
                                    >
                                        <FaEdit /> Edit
                                    </button>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {/* Preview Section */}
            <div className="preview-toggle">
                <button
                    className="btn-preview"
                    onClick={() => setShowPreview(!showPreview)}
                    type="button"
                >
                    <FaEye /> {showPreview ? 'Hide Gallery Preview' : 'Show Gallery Preview'}
                </button>
            </div>
            {showPreview && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="resume-preview"
                >
                    <div className="preview-header">
                        <h3>Gallery Preview</h3>
                        <div className="preview-actions">
                            <button className="btn-icon" onClick={handlePrint} title="Print">
                                <FaPrint />
                            </button>
                            <button className="btn-icon" onClick={handleShare} title="Share">
                                <FaShare />
                            </button>
                        </div>
                    </div>
                    <div className="preview-content">
                        <div className="imgs-preview">
                            {sections.map(sectionKey =>
                                (imageSections[sectionKey] ?? []).length ? (
                                    <div className="preview-block" key={sectionKey}>
                                        <h4>{sectionKey.charAt(0).toUpperCase() + sectionKey.slice(1)}</h4>
                                        <div className="imgs-row">
                                            {imageSections[sectionKey].map((img, idx) => (
                                                <img
                                                    key={idx}
                                                    src={img.url || img}
                                                    alt={img.alt || "Image"}
                                                    className="preview-img"
                                                />
                                            ))}
                                        </div>
                                    </div>
                                ) : null
                            )}
                            {!sections.some(k => (imageSections[k] ?? []).length) && (
                                <div className="preview-placeholder">
                                    <FaFileImage className="placeholder-icon" />
                                    <h4>Gallery Preview</h4>
                                    <p>Your uploaded images will display here</p>
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Final Actions */}
            <div className="final-actions">
                <div className="action-buttons">
                    <button
                        className="btn-download"
                        onClick={handleDownload}
                        type="button"
                        disabled={completionPercentage < 50}
                    >
                        <FaDownload /> Download Gallery
                    </button>

                    <button
                        className="btn-generate"
                        onClick={handleGenerateGallery}
                        type="button"
                        disabled={isGenerating || completionPercentage < 50}
                    >
                        {isGenerating
                            ? (<><div className="spinner"></div>Generating...</>)
                            : (<><FaCheckCircle /> Complete & Generate Gallery</>)
                        }
                    </button>
                </div>
                {completionPercentage < 50 && (
                    <div className="completion-warning">
                        <FaExclamationTriangle />
                        <span>Your gallery is only {completionPercentage}% complete. Add more images for a better result.</span>
                    </div>
                )}
            </div>

            {/* Some basic image styles */}
            <style jsx>{`
                .imgs-preview-row, .imgs-row {
                    display: flex;
                    align-items: center;
                    gap: 0.7rem;
                }
                .img-thumb, .preview-img {
                    width: 55px;
                    height: 55px;
                    border-radius: 10px;
                    object-fit: cover;
                    background: #f3f4f6;
                    border: 1.5px solid #e5e7eb;
                }
                .preview-img {
                    width: 75px;
                    height: 75px;
                }
                .preview-block {
                    margin-bottom: 1.6rem;
                }
                .imgs-preview {
                    width: 100%;
                    min-height: 180px;
                    padding: 1rem 0;
                }
                .imgs-preview .preview-block h4 {
                    font-size: 1rem;
                    margin-bottom: 0.35rem;
                    color: #1f2937;
                }
            `}</style>
            {/* Re-use all other styles from your original as needed here */}
        </div>
    );
};

export default ResumeImageSections;