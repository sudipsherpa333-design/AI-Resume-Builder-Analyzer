// src/components/builder/ResumeImageSections.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
    CheckCircle,
    FileImage,
    Eye,
    Download,
    Share2,
    Printer,
    AlertCircle,
    Edit,
    XCircle,
    Check,
    Star,
    Image as ImageIcon,
    Upload,
    Trash2,
    Plus,
    Camera,
    Award,
    Monitor,
    Palette,
    File,
    Folder,
    Copy,
    Maximize2,
    Filter,
    Search,
    Grid,
    List,
    ChevronLeft,
    ChevronRight,
    ZoomIn,
    ZoomOut,
    RotateCcw,
    Heart,
    Tag,
    Calendar,
    Clock,
    Lock,
    Unlock,
    Link,
    ExternalLink,
    CheckSquare,
    Square
} from 'lucide-react';

const ResumeImageSections = ({
    imageSections = {},
    onComplete,
    onEditSection,
    onUpdateImages,
    isMobile = false
}) => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [selectedSection, setSelectedSection] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
    const [zoomLevel, setZoomLevel] = useState(100);
    const [selectedImages, setSelectedImages] = useState([]);
    const [showUploadModal, setShowUploadModal] = useState(false);

    // Default image sections if none provided
    const defaultSections = {
        avatars: [],
        certificates: [],
        artwork: [],
        screenshots: [],
        misc: []
    };

    const sectionsData = imageSections || defaultSections;

    // Section metadata
    const sectionMetadata = {
        avatars: {
            icon: <Camera className="w-5 h-5" />,
            color: '#60a5fa',
            title: 'Profile Photos',
            description: 'Professional headshots and profile pictures',
            placeholder: 'Upload professional photos for your profile',
            accept: 'image/*',
            maxFiles: 5,
            tips: ['Use high-quality photos', 'Professional attire recommended', 'Good lighting is key']
        },
        certificates: {
            icon: <Award className="w-5 h-5" />,
            color: '#22d3ee',
            title: 'Certificates',
            description: 'Professional certifications and awards',
            placeholder: 'Upload your certificates and awards',
            accept: 'image/*,.pdf',
            maxFiles: 10,
            tips: ['Include credential IDs', 'Show expiration dates', 'Group by category']
        },
        artwork: {
            icon: <Palette className="w-5 h-5" />,
            color: '#f59e42',
            title: 'Artwork & Design',
            description: 'Creative projects and design work',
            placeholder: 'Upload your creative projects',
            accept: 'image/*',
            maxFiles: 15,
            tips: ['Showcase best work first', 'Include project descriptions', 'Show before/after if applicable']
        },
        screenshots: {
            icon: <Monitor className="w-5 h-5" />,
            color: '#22c55e',
            title: 'Screenshots',
            description: 'Project screenshots and demonstrations',
            placeholder: 'Upload project screenshots',
            accept: 'image/*',
            maxFiles: 20,
            tips: ['Add context captions', 'Show key features', 'Include mobile/desktop views']
        },
        misc: {
            icon: <File className="w-5 h-5" />,
            color: '#9d174d',
            title: 'Miscellaneous',
            description: 'Additional images and documents',
            placeholder: 'Upload other relevant images',
            accept: 'image/*,.pdf,.doc,.docx',
            maxFiles: 10,
            tips: ['Organize by type', 'Add descriptions', 'Keep relevant to resume']
        }
    };

    // Section weights for completion calculation
    const sectionWeights = {
        avatars: 20,
        certificates: 25,
        artwork: 15,
        screenshots: 25,
        misc: 15
    };

    // Calculate completion percentage
    const calculateCompletion = () => {
        let totalScore = 0;
        let maxScore = 0;

        Object.entries(sectionsData).forEach(([sectionKey, items]) => {
            const weight = sectionWeights[sectionKey] || 5;
            maxScore += weight;

            if (items && items.length > 0) {
                // Score based on number of items (up to weight)
                const itemCount = Math.min(items.length, 3); // Max 3 items count for scoring
                totalScore += (itemCount / 3) * weight;
            }
        });

        return Math.round((totalScore / (maxScore || 1)) * 100);
    };

    const completionPercentage = calculateCompletion();

    // Get section status
    const getSectionStatus = (sectionKey, items) => {
        if (!items || items.length === 0) {
            return {
                status: 'empty',
                message: 'No images',
                color: '#ef4444',
                icon: <XCircle className="w-4 h-4" />
            };
        }

        if (items.length === 1) {
            return {
                status: 'basic',
                message: 'One image added',
                color: '#f59e0b',
                icon: <AlertCircle className="w-4 h-4" />
            };
        }

        if (items.length >= 3) {
            return {
                status: 'excellent',
                message: 'Gallery ready',
                color: '#10b981',
                icon: <Star className="w-4 h-4" />
            };
        }

        return {
            status: 'good',
            message: `${items.length} images added`,
            color: '#3b82f6',
            icon: <CheckCircle className="w-4 h-4" />
        };
    };

    // Handle image upload
    const handleImageUpload = (sectionKey, files) => {
        if (!files || files.length === 0) return;

        setUploading(true);

        const metadata = sectionMetadata[sectionKey];
        if (files.length > metadata.maxFiles) {
            toast.error(`Maximum ${metadata.maxFiles} files allowed for ${metadata.title}`);
            setUploading(false);
            return;
        }

        // Simulate upload process
        setTimeout(() => {
            const newImages = Array.from(files).map((file, index) => ({
                id: `${sectionKey}_${Date.now()}_${index}`,
                url: URL.createObjectURL(file),
                name: file.name,
                size: file.size,
                type: file.type,
                uploadedAt: new Date().toISOString(),
                alt: `Image ${index + 1} in ${metadata.title}`
            }));

            const updatedSections = {
                ...sectionsData,
                [sectionKey]: [...(sectionsData[sectionKey] || []), ...newImages]
            };

            if (onUpdateImages) {
                onUpdateImages(updatedSections);
            }

            toast.success(`Added ${files.length} image(s) to ${metadata.title}`);
            setUploading(false);
            setShowUploadModal(false);

        }, 1500);
    };

    // Handle image removal
    const handleRemoveImage = (sectionKey, imageId) => {
        const updatedImages = sectionsData[sectionKey].filter(img => img.id !== imageId);
        const updatedSections = {
            ...sectionsData,
            [sectionKey]: updatedImages
        };

        if (onUpdateImages) {
            onUpdateImages(updatedSections);
        }

        toast.success('Image removed');
    };

    // Handle select/deselect image
    const toggleImageSelection = (sectionKey, imageId) => {
        const key = `${sectionKey}_${imageId}`;
        setSelectedImages(prev =>
            prev.includes(key)
                ? prev.filter(id => id !== key)
                : [...prev, key]
        );
    };

    // Handle bulk actions
    const handleBulkAction = (action) => {
        if (selectedImages.length === 0) {
            toast.error('No images selected');
            return;
        }

        switch (action) {
            case 'delete':
                // Implement bulk delete logic
                toast.success(`Deleted ${selectedImages.length} images`);
                setSelectedImages([]);
                break;
            case 'download':
                toast.success(`Preparing ${selectedImages.length} images for download`);
                break;
            default:
                break;
        }
    };

    // Generate gallery
    const handleGenerateGallery = () => {
        setIsGenerating(true);

        setTimeout(() => {
            setIsGenerating(false);
            toast.success('🎉 Gallery created successfully!');

            if (onComplete) {
                onComplete();
            }
        }, 2000);
    };

    // Download gallery
    const handleDownloadGallery = () => {
        toast.loading('Preparing gallery download...');

        setTimeout(() => {
            toast.dismiss();
            toast.success('📁 Gallery download ready!');
            // In a real app, this would trigger actual download
        }, 1500);
    };

    // Print gallery
    const handlePrintGallery = () => {
        toast.success('🖨️ Opening print preview...');
        setTimeout(() => {
            window.print();
        }, 500);
    };

    // Share gallery
    const handleShareGallery = () => {
        if (navigator.share) {
            navigator.share({
                title: 'My Resume Image Gallery',
                text: 'Check out my professional image gallery',
                url: window.location.href
            }).then(() => {
                toast.success('Shared successfully!');
            }).catch(() => {
                navigator.clipboard.writeText(window.location.href);
                toast.success('📋 Link copied to clipboard!');
            });
        } else {
            navigator.clipboard.writeText(window.location.href);
            toast.success('📋 Link copied to clipboard!');
        }
    };

    // Zoom controls
    const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 25, 200));
    const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 25, 50));
    const resetZoom = () => setZoomLevel(100);

    // Render section cards
    const renderSectionCard = (sectionKey) => {
        const metadata = sectionMetadata[sectionKey];
        const items = sectionsData[sectionKey] || [];
        const status = getSectionStatus(sectionKey, items);

        return (
            <motion.div
                key={sectionKey}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
            >
                {/* Section Header */}
                <div
                    className="p-4 border-b border-gray-100 cursor-pointer"
                    onClick={() => setSelectedSection(selectedSection === sectionKey ? null : sectionKey)}
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div
                                className="w-10 h-10 rounded-lg flex items-center justify-center"
                                style={{ backgroundColor: `${metadata.color}20` }}
                            >
                                <div style={{ color: metadata.color }}>
                                    {metadata.icon}
                                </div>
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-800">{metadata.title}</h3>
                                <p className="text-sm text-gray-500">{metadata.description}</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <div className="text-right">
                                <div className="text-sm font-medium text-gray-700">{items.length} images</div>
                                <div className="flex items-center text-xs" style={{ color: status.color }}>
                                    {status.icon}
                                    <span className="ml-1">{status.message}</span>
                                </div>
                            </div>
                            <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${selectedSection === sectionKey ? 'rotate-90' : ''}`} />
                        </div>
                    </div>
                </div>

                {/* Section Content (Collapsible) */}
                {selectedSection === sectionKey && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="p-4 bg-gray-50"
                    >
                        {/* Tips */}
                        <div className="mb-4">
                            <h4 className="text-sm font-medium text-gray-700 mb-2">💡 Tips:</h4>
                            <div className="flex flex-wrap gap-2">
                                {metadata.tips.map((tip, index) => (
                                    <span
                                        key={index}
                                        className="px-3 py-1 bg-white border border-gray-200 rounded-full text-xs text-gray-600"
                                    >
                                        {tip}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Image Preview */}
                        {items.length > 0 ? (
                            <div className="mb-4">
                                <div className="flex items-center justify-between mb-2">
                                    <h4 className="text-sm font-medium text-gray-700">Preview:</h4>
                                    <button
                                        onClick={() => onEditSection && onEditSection(sectionKey)}
                                        className="flex items-center text-sm text-blue-600 hover:text-blue-700"
                                    >
                                        <Edit className="w-4 h-4 mr-1" />
                                        Edit All
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {items.slice(0, 5).map((img, idx) => (
                                        <div
                                            key={img.id || idx}
                                            className="relative group"
                                        >
                                            <div className="w-16 h-16 rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                                                <img
                                                    src={img.url || img}
                                                    alt={img.alt || `Image ${idx + 1}`}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <button
                                                onClick={() => handleRemoveImage(sectionKey, img.id)}
                                                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                                            >
                                                <Trash2 className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ))}
                                    {items.length > 5 && (
                                        <div className="w-16 h-16 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center">
                                            <span className="text-sm font-medium text-gray-500">
                                                +{items.length - 5}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-6">
                                <FileImage className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-500 text-sm mb-4">{metadata.placeholder}</p>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-2">
                            <label className="flex-1">
                                <input
                                    type="file"
                                    multiple
                                    accept={metadata.accept}
                                    onChange={(e) => handleImageUpload(sectionKey, e.target.files)}
                                    className="hidden"
                                    disabled={uploading}
                                />
                                <div className={`w-full py-2 px-3 rounded-lg text-center cursor-pointer transition-colors ${uploading ? 'bg-gray-100 text-gray-400' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}>
                                    {uploading ? (
                                        <div className="flex items-center justify-center">
                                            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                                            Uploading...
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-center">
                                            <Upload className="w-4 h-4 mr-2" />
                                            Upload Images
                                        </div>
                                    )}
                                </div>
                            </label>
                            <button
                                onClick={() => onEditSection && onEditSection(sectionKey)}
                                className="py-2 px-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
                            >
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                            </button>
                        </div>
                    </motion.div>
                )}
            </motion.div>
        );
    };

    // Render gallery preview
    const renderGalleryPreview = () => {
        const hasImages = Object.values(sectionsData).some(section => section.length > 0);

        return (
            <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mt-6"
            >
                <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <Eye className="w-5 h-5 text-blue-600" />
                            <div>
                                <h3 className="font-semibold text-gray-800">Gallery Preview</h3>
                                <p className="text-sm text-gray-600">Preview your complete image gallery</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={handlePrintGallery}
                                className="p-2 hover:bg-white rounded-lg transition-colors"
                                title="Print"
                            >
                                <Printer className="w-4 h-4 text-gray-600" />
                            </button>
                            <button
                                onClick={handleShareGallery}
                                className="p-2 hover:bg-white rounded-lg transition-colors"
                                title="Share"
                            >
                                <Share2 className="w-4 h-4 text-gray-600" />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="p-4">
                    {hasImages ? (
                        <div className="space-y-6">
                            {Object.entries(sectionsData).map(([sectionKey, items]) => {
                                if (items.length === 0) return null;
                                const metadata = sectionMetadata[sectionKey];

                                return (
                                    <div key={sectionKey} className="space-y-3">
                                        <div className="flex items-center space-x-2">
                                            <div
                                                className="w-3 h-3 rounded-full"
                                                style={{ backgroundColor: metadata.color }}
                                            />
                                            <h4 className="font-medium text-gray-800">{metadata.title}</h4>
                                            <span className="text-sm text-gray-500">({items.length} images)</span>
                                        </div>
                                        <div className={`grid gap-3 ${viewMode === 'grid' ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4' : 'grid-cols-1'}`}>
                                            {items.map((img, idx) => (
                                                <div
                                                    key={img.id || idx}
                                                    className={`relative group rounded-lg overflow-hidden border border-gray-200 bg-gray-50 ${viewMode === 'list' ? 'flex items-center p-3' : ''}`}
                                                    style={{
                                                        transform: `scale(${zoomLevel / 100})`,
                                                        transformOrigin: 'center'
                                                    }}
                                                >
                                                    <div className={`${viewMode === 'list' ? 'w-16 h-16 mr-3' : 'aspect-square'}`}>
                                                        <img
                                                            src={img.url || img}
                                                            alt={img.alt || `Image ${idx + 1}`}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                    {viewMode === 'list' && (
                                                        <div className="flex-1">
                                                            <div className="font-medium text-gray-800 truncate">
                                                                {img.name || `Image ${idx + 1}`}
                                                            </div>
                                                            <div className="text-sm text-gray-500">
                                                                {img.size ? `${(img.size / 1024).toFixed(1)} KB` : 'Unknown size'}
                                                            </div>
                                                        </div>
                                                    )}
                                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                                                        <button
                                                            onClick={() => window.open(img.url || img, '_blank')}
                                                            className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
                                                            title="View full size"
                                                        >
                                                            <Maximize2 className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleRemoveImage(sectionKey, img.id)}
                                                            className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
                                                            title="Remove"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h4 className="text-lg font-medium text-gray-700 mb-2">No Images Yet</h4>
                            <p className="text-gray-500 mb-6">Upload images to see your gallery preview</p>
                            <button
                                onClick={() => setShowUploadModal(true)}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <Upload className="inline w-4 h-4 mr-2" />
                                Upload Images
                            </button>
                        </div>
                    )}

                    {/* Gallery Controls */}
                    {hasImages && (
                        <div className="flex flex-wrap items-center justify-between gap-3 mt-6 pt-6 border-t border-gray-200">
                            <div className="flex items-center space-x-3">
                                <div className="flex items-center space-x-1">
                                    <button
                                        onClick={() => setViewMode('grid')}
                                        className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:bg-gray-100'}`}
                                        title="Grid View"
                                    >
                                        <Grid className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => setViewMode('list')}
                                        className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:bg-gray-100'}`}
                                        title="List View"
                                    >
                                        <List className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="flex items-center space-x-1">
                                    <button
                                        onClick={handleZoomOut}
                                        disabled={zoomLevel <= 50}
                                        className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg disabled:opacity-50"
                                        title="Zoom Out"
                                    >
                                        <ZoomOut className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={resetZoom}
                                        className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg"
                                    >
                                        {zoomLevel}%
                                    </button>
                                    <button
                                        onClick={handleZoomIn}
                                        disabled={zoomLevel >= 200}
                                        className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg disabled:opacity-50"
                                        title="Zoom In"
                                    >
                                        <ZoomIn className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center space-x-2">
                                <span className="text-sm text-gray-500">
                                    {Object.values(sectionsData).reduce((total, section) => total + section.length, 0)} total images
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>
        );
    };

    // Render upload modal
    const renderUploadModal = () => (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-3">
                            <Upload className="w-6 h-6 text-blue-600" />
                            <h2 className="text-xl font-bold text-gray-800">Upload Images</h2>
                        </div>
                        <button
                            onClick={() => setShowUploadModal(false)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <XCircle className="w-5 h-5 text-gray-600" />
                        </button>
                    </div>

                    <div className="space-y-4">
                        {Object.entries(sectionMetadata).map(([sectionKey, metadata]) => (
                            <div key={sectionKey} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center space-x-3">
                                        <div style={{ color: metadata.color }}>
                                            {metadata.icon}
                                        </div>
                                        <div>
                                            <h3 className="font-medium text-gray-800">{metadata.title}</h3>
                                            <p className="text-sm text-gray-500">{metadata.description}</p>
                                        </div>
                                    </div>
                                    <span className="text-sm text-gray-500">
                                        {sectionsData[sectionKey]?.length || 0}/{metadata.maxFiles}
                                    </span>
                                </div>

                                <label className="block">
                                    <input
                                        type="file"
                                        multiple
                                        accept={metadata.accept}
                                        onChange={(e) => handleImageUpload(sectionKey, e.target.files)}
                                        className="hidden"
                                        disabled={uploading}
                                    />
                                    <div className={`w-full py-3 px-4 rounded-lg text-center cursor-pointer transition-colors ${uploading ? 'bg-gray-100 text-gray-400' : 'bg-blue-50 text-blue-600 hover:bg-blue-100 border-2 border-dashed border-blue-200'}`}>
                                        {uploading ? (
                                            <div className="flex items-center justify-center">
                                                <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                                                Uploading...
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-center">
                                                <Upload className="w-5 h-5 mr-2" />
                                                Select Files
                                            </div>
                                        )}
                                    </div>
                                </label>

                                <div className="mt-3 text-xs text-gray-500">
                                    Accepted: {metadata.accept.replace('image/*', 'Images').replace(',.pdf,.doc,.docx', ', PDF, Word')}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-2">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">Image Gallery</h1>
                    <p className="text-gray-600 mt-1">Manage your portfolio images and visual content</p>
                </div>

                <div className="flex items-center space-x-4">
                    <div className="text-right">
                        <div className="text-2xl font-bold text-gray-800">{completionPercentage}%</div>
                        <div className="text-sm text-gray-500">Complete</div>
                    </div>
                    <div className="w-32">
                        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${completionPercentage}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className={`h-full rounded-full ${completionPercentage >= 80 ? 'bg-green-500' : completionPercentage >= 50 ? 'bg-blue-500' : 'bg-yellow-500'}`}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Progress Status */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                        {completionPercentage >= 80 ? (
                            <CheckCircle className="w-6 h-6 text-green-500" />
                        ) : completionPercentage >= 50 ? (
                            <AlertCircle className="w-6 h-6 text-blue-500" />
                        ) : (
                            <AlertCircle className="w-6 h-6 text-yellow-500" />
                        )}
                        <div>
                            <h3 className="font-semibold text-gray-800">Gallery Progress</h3>
                            <p className="text-sm text-gray-600">
                                {completionPercentage >= 80
                                    ? '🎉 Your gallery is ready to share!'
                                    : completionPercentage >= 50
                                        ? '👍 Add a few more images for best results.'
                                        : '📝 Include more images to complete your gallery.'
                                }
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowUploadModal(true)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Images
                    </button>
                </div>
            </div>

            {/* Sections Grid */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-800">Image Categories</h2>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => setShowPreview(!showPreview)}
                            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center"
                        >
                            <Eye className="w-4 h-4 mr-2" />
                            {showPreview ? 'Hide Preview' : 'Show Preview'}
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {Object.keys(sectionsData).map(sectionKey => renderSectionCard(sectionKey))}
                </div>
            </div>

            {/* Gallery Preview */}
            {showPreview && renderGalleryPreview()}

            {/* Bulk Actions & Final Actions */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Bulk Actions */}
                    <div className="flex items-center space-x-3">
                        <span className="text-sm text-gray-600">{selectedImages.length} selected</span>
                        {selectedImages.length > 0 && (
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => handleBulkAction('download')}
                                    className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
                                >
                                    <Download className="w-4 h-4 mr-2" />
                                    Download Selected
                                </button>
                                <button
                                    onClick={() => handleBulkAction('delete')}
                                    className="px-3 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors flex items-center"
                                >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete Selected
                                </button>
                                <button
                                    onClick={() => setSelectedImages([])}
                                    className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Clear Selection
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Final Actions */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <button
                            onClick={handleDownloadGallery}
                            disabled={completionPercentage < 50}
                            className={`px-6 py-3 rounded-lg transition-colors flex items-center justify-center ${completionPercentage < 50
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-gray-800 text-white hover:bg-gray-900'
                                }`}
                        >
                            <Download className="w-5 h-5 mr-2" />
                            Download Gallery
                        </button>

                        <button
                            onClick={handleGenerateGallery}
                            disabled={isGenerating || completionPercentage < 50}
                            className={`px-6 py-3 rounded-lg transition-colors flex items-center justify-center ${isGenerating || completionPercentage < 50
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:opacity-90'
                                }`}
                        >
                            {isGenerating ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="w-5 h-5 mr-2" />
                                    Complete & Generate Gallery
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Completion Warning */}
                {completionPercentage < 50 && (
                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start space-x-3">
                        <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-yellow-800">
                            <span className="font-medium">Note:</span> Your gallery is only {completionPercentage}% complete.
                            Add more images (minimum 50% completion) to enable gallery generation and download.
                        </div>
                    </div>
                )}
            </div>

            {/* Upload Modal */}
            {showUploadModal && renderUploadModal()}

            {/* Custom Styles */}
            <style jsx>{`
                @media print {
                    .no-print {
                        display: none !important;
                    }
                }
                
                .image-thumbnail {
                    transition: all 0.2s ease;
                }
                
                .image-thumbnail:hover {
                    transform: scale(1.02);
                    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
                }
            `}</style>
        </div>
    );
};

export default ResumeImageSections;