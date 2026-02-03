// src/components/export/ExportManager.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
    Download,
    Printer,
    Share2,
    Copy,
    Check,
    FileText,
    Image as FileImage,
    FileCode,
    FileSpreadsheet,
    Mail,
    Link,
    QrCode,
    Eye,
    Cloud,
    Smartphone,
    Laptop,
    Lock,
    Unlock,
    Globe,
    Users,
    Shield,
    Calendar,
    BarChart,
    Settings,
    Sparkles,
    Zap,
    X,
    ChevronRight,
    CheckCircle,
    AlertCircle,
    ExternalLink,
    UploadCloud,
    Clock,
    HardDrive,
    Network,
    Database,
    Server,
    Terminal,
    File,
    FileType,
    FileJson,
    Smartphone as SmartphoneIcon
} from 'lucide-react';

// Mock export functions - In production, these would connect to actual services
const EXPORT_SERVICES = {
    pdf: {
        name: 'PDF',
        description: 'Professional PDF format, ATS-friendly',
        icon: File, // Using File instead of FilePdf
        color: 'from-red-500 to-pink-500',
        features: ['ATS optimized', 'Print ready', 'Vector quality'],
        estimatedTime: '3 seconds',
        size: '~200KB'
    },
    docx: {
        name: 'Microsoft Word',
        description: 'Editable Word document',
        icon: FileText,
        color: 'from-blue-600 to-cyan-600',
        features: ['Editable format', 'Office compatible', 'Track changes'],
        estimatedTime: '2 seconds',
        size: '~150KB'
    },
    html: {
        name: 'HTML Web Page',
        description: 'Interactive web version',
        icon: FileCode,
        color: 'from-orange-500 to-amber-500',
        features: ['Web compatible', 'Mobile responsive', 'SEO ready'],
        estimatedTime: '4 seconds',
        size: '~100KB'
    },
    json: {
        name: 'JSON Data',
        description: 'Structured data export',
        icon: FileJson || FileCode, // Fallback to FileCode
        color: 'from-green-500 to-emerald-500',
        features: ['API ready', 'Data migration', 'Backup format'],
        estimatedTime: '1 second',
        size: '~50KB'
    },
    txt: {
        name: 'Plain Text',
        description: 'Simple text format',
        icon: FileType || FileText, // Fallback to FileText
        color: 'from-gray-600 to-gray-700',
        features: ['Universal format', 'Lightweight', 'No formatting'],
        estimatedTime: '1 second',
        size: '~30KB'
    },
    png: {
        name: 'PNG Image',
        description: 'High-quality image',
        icon: FileImage,
        color: 'from-purple-500 to-pink-500',
        features: ['High resolution', 'Social media ready', 'Visual format'],
        estimatedTime: '5 seconds',
        size: '~1MB'
    }
};

// Cloud services
const CLOUD_SERVICES = [
    {
        id: 'google_drive',
        name: 'Google Drive',
        icon: Cloud,
        color: 'bg-blue-100 text-blue-700 border-blue-300',
        description: 'Save to Google Drive',
        enabled: true
    },
    {
        id: 'dropbox',
        name: 'Dropbox',
        icon: UploadCloud,
        color: 'bg-blue-100 text-blue-700 border-blue-300',
        description: 'Save to Dropbox',
        enabled: true
    },
    {
        id: 'onedrive',
        name: 'OneDrive',
        icon: Cloud,
        color: 'bg-green-100 text-green-700 border-green-300',
        description: 'Save to Microsoft OneDrive',
        enabled: true
    },
    {
        id: 'github',
        name: 'GitHub',
        icon: Terminal,
        color: 'bg-gray-100 text-gray-700 border-gray-300',
        description: 'Commit to GitHub repository',
        enabled: true
    }
];

// Export options
const EXPORT_OPTIONS = [
    {
        id: 'standard',
        name: 'Standard Export',
        description: 'Regular export with default settings',
        icon: Download,
        features: ['Standard formatting', 'Normal quality', 'Quick export']
    },
    {
        id: 'professional',
        name: 'Professional',
        description: 'Enhanced formatting for professional use',
        icon: FileText,
        features: ['Enhanced formatting', 'Higher quality', 'ATS optimized'],
        recommended: true
    },
    {
        id: 'executive',
        name: 'Executive',
        description: 'Premium export with advanced features',
        icon: Shield,
        features: ['Premium templates', 'Maximum ATS score', 'Advanced features'],
        premium: true
    }
];

// Device preview options
const DEVICE_PREVIEWS = [
    {
        id: 'desktop',
        name: 'Desktop',
        icon: Laptop,
        description: 'Desktop/Laptop view',
        scale: '100%'
    },
    {
        id: 'tablet',
        name: 'Tablet',
        icon: Smartphone,
        description: 'Tablet view',
        scale: '75%'
    },
    {
        id: 'mobile',
        name: 'Mobile',
        icon: Smartphone,
        description: 'Mobile view',
        scale: '50%'
    }
];

const ExportManager = ({
    resumeData,
    onExport,
    onShare,
    onClose,
    isOpen = true
}) => {
    const [selectedFormat, setSelectedFormat] = useState('pdf');
    const [exportOption, setExportOption] = useState('professional');
    const [selectedDevices, setSelectedDevices] = useState(['desktop']);
    const [selectedCloudServices, setSelectedCloudServices] = useState(['google_drive']);
    const [exportSettings, setExportSettings] = useState({
        includeAIEnhancements: true,
        optimizeForATS: true,
        addQRCode: false,
        passwordProtect: false,
        watermark: false,
        compressFile: true,
        includeMetadata: true,
        trackAnalytics: true,
        expirationDate: null
    });
    const [exportHistory, setExportHistory] = useState([]);
    const [isExporting, setIsExporting] = useState(false);
    const [exportProgress, setExportProgress] = useState(0);
    const [shareLink, setShareLink] = useState('');
    const [shareSettings, setShareSettings] = useState({
        public: false,
        allowComments: true,
        allowDownloads: true,
        requirePassword: false,
        expirationDays: 7,
        maxViews: null,
        notifyOnView: true
    });
    const [generatedQRCode, setGeneratedQRCode] = useState('');
    const [previewMode, setPreviewMode] = useState('desktop');

    // Initialize export history
    useEffect(() => {
        // Mock history data
        setExportHistory([
            {
                id: 1,
                format: 'pdf',
                date: new Date(Date.now() - 86400000), // 1 day ago
                size: '245KB',
                status: 'success',
                previewUrl: '#'
            },
            {
                id: 2,
                format: 'docx',
                date: new Date(Date.now() - 172800000), // 2 days ago
                size: '189KB',
                status: 'success',
                previewUrl: '#'
            },
            {
                id: 3,
                format: 'html',
                date: new Date(Date.now() - 259200000), // 3 days ago
                size: '102KB',
                status: 'success',
                previewUrl: '#'
            }
        ]);
    }, []);

    // Generate share link
    useEffect(() => {
        if (resumeData?._id && !resumeData._id.startsWith('temp_')) {
            const baseUrl = window.location.origin;
            const shareId = btoa(`${resumeData._id}-${Date.now()}`).replace(/=+$/, '');
            setShareLink(`${baseUrl}/share/${shareId}`);
        }
    }, [resumeData]);

    // Generate QR code
    useEffect(() => {
        if (shareLink) {
            // Generate a mock QR code data URL
            const qrData = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(shareLink)}`;
            setGeneratedQRCode(qrData);
        }
    }, [shareLink]);

    const handleExport = async (format = selectedFormat) => {
        if (!resumeData) {
            toast.error('No resume data to export');
            return;
        }

        setIsExporting(true);
        setExportProgress(0);

        // Simulate export progress
        const progressInterval = setInterval(() => {
            setExportProgress(prev => {
                if (prev >= 100) {
                    clearInterval(progressInterval);
                    return 100;
                }
                return prev + 10;
            });
        }, 100);

        try {
            // In production, this would call your actual export API
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Add to export history
            const newExport = {
                id: Date.now(),
                format,
                date: new Date(),
                size: format === 'pdf' ? '~250KB' : format === 'png' ? '~1MB' : '~150KB',
                status: 'success',
                previewUrl: '#',
                settings: { ...exportSettings }
            };

            setExportHistory(prev => [newExport, ...prev.slice(0, 9)]); // Keep last 10

            // Save to selected cloud services
            if (selectedCloudServices.length > 0) {
                await handleCloudSave(selectedCloudServices, format);
            }

            toast.success(`${EXPORT_SERVICES[format]?.name || format.toUpperCase()} exported successfully!`);

            if (onExport) {
                onExport(format);
            }

            // Trigger download
            triggerDownload(format);

        } catch (error) {
            toast.error('Export failed. Please try again.');
            console.error('Export error:', error);
        } finally {
            clearInterval(progressInterval);
            setIsExporting(false);
            setExportProgress(0);
        }
    };

    const triggerDownload = (format) => {
        // Create a blob with the resume data
        const content = JSON.stringify(resumeData, null, 2);
        const blob = new Blob([content], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `${resumeData.title || 'resume'}.${format}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleCloudSave = async (services, format) => {
        for (const serviceId of services) {
            try {
                // Simulate cloud save
                await new Promise(resolve => setTimeout(resolve, 500));
                console.log(`Saved to ${serviceId} in ${format} format`);
            } catch (error) {
                console.error(`Failed to save to ${serviceId}:`, error);
            }
        }
    };

    const handleShare = () => {
        if (!shareLink) {
            toast.error('Please save the resume first to generate share link');
            return;
        }

        navigator.clipboard.writeText(shareLink)
            .then(() => {
                toast.success('Share link copied to clipboard!');
                if (onShare) {
                    onShare();
                }
            })
            .catch(() => {
                toast.error('Failed to copy share link');
            });
    };

    const handlePrint = () => {
        toast.loading('Preparing for print...');
        setTimeout(() => {
            window.print();
            toast.success('Print dialog opened');
        }, 1000);
    };

    const handleQuickExport = (format) => {
        setSelectedFormat(format);
        setTimeout(() => handleExport(format), 100);
    };

    const toggleDevice = (deviceId) => {
        setSelectedDevices(prev => {
            if (prev.includes(deviceId)) {
                return prev.filter(id => id !== deviceId);
            } else {
                return [...prev, deviceId];
            }
        });
    };

    const toggleCloudService = (serviceId) => {
        setSelectedCloudServices(prev => {
            if (prev.includes(serviceId)) {
                return prev.filter(id => id !== serviceId);
            } else {
                return [...prev, serviceId];
            }
        });
    };

    const handleSettingsChange = (key, value) => {
        setExportSettings(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const handleShareSettingsChange = (key, value) => {
        setShareSettings(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const getExportStats = () => {
        const totalExports = exportHistory.length;
        const todayExports = exportHistory.filter(exp => {
            const expDate = new Date(exp.date);
            const today = new Date();
            return expDate.toDateString() === today.toDateString();
        }).length;

        const totalSize = exportHistory.reduce((sum, exp) => {
            const size = parseFloat(exp.size) || 0;
            return sum + size;
        }, 0);

        const mostUsedFormat = exportHistory.reduce((acc, exp) => {
            acc[exp.format] = (acc[exp.format] || 0) + 1;
            return acc;
        }, {});

        const topFormat = Object.entries(mostUsedFormat).sort((a, b) => b[1] - a[1])[0];

        return {
            totalExports,
            todayExports,
            totalSize: totalSize.toFixed(2) + 'KB',
            topFormat: topFormat ? `${topFormat[0].toUpperCase()} (${topFormat[1]} times)` : 'None'
        };
    };

    const stats = getExportStats();

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Export & Share Resume</h2>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                            Export in multiple formats and share with employers
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    </button>
                </div>
            </div>

            <div className="overflow-y-auto max-h-[calc(90vh-5rem)]">
                <div className="p-6 space-y-6">
                    {/* Quick Export Section */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <Zap className="w-5 h-5 text-amber-500" />
                            Quick Export
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                            {Object.entries(EXPORT_SERVICES).map(([key, service]) => {
                                const Icon = service.icon;
                                return (
                                    <button
                                        key={key}
                                        onClick={() => handleQuickExport(key)}
                                        disabled={isExporting}
                                        className={`p-4 rounded-xl border-2 transition-all ${selectedFormat === key ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                                    >
                                        <div className="flex flex-col items-center">
                                            <div className={`p-3 rounded-lg bg-gradient-to-r ${service.color} mb-2`}>
                                                <Icon className="w-6 h-6 text-white" />
                                            </div>
                                            <span className="font-medium text-gray-900 dark:text-white text-sm">
                                                {service.name}
                                            </span>
                                            <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                {service.size}
                                            </span>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Export Options */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <Settings className="w-5 h-5 text-blue-500" />
                            Export Options
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {EXPORT_OPTIONS.map((option) => (
                                <button
                                    key={option.id}
                                    onClick={() => setExportOption(option.id)}
                                    className={`p-4 rounded-xl border-2 text-left transition-all ${exportOption === option.id ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'}`}
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <option.icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                            <span className="font-semibold text-gray-900 dark:text-white">
                                                {option.name}
                                            </span>
                                        </div>
                                        {option.recommended && (
                                            <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-medium rounded">
                                                Recommended
                                            </span>
                                        )}
                                        {option.premium && (
                                            <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-medium rounded">
                                                Premium
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                        {option.description}
                                    </p>
                                    <ul className="space-y-1">
                                        {option.features.map((feature, idx) => (
                                            <li key={idx} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                                                <CheckCircle className="w-4 h-4 text-green-500" />
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Device Preview Selection */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <Eye className="w-5 h-5 text-purple-500" />
                            Device Previews
                        </h3>
                        <div className="flex flex-wrap gap-3">
                            {DEVICE_PREVIEWS.map((device) => {
                                const Icon = device.icon;
                                const isSelected = selectedDevices.includes(device.id);
                                return (
                                    <button
                                        key={device.id}
                                        onClick={() => toggleDevice(device.id)}
                                        className={`px-4 py-3 rounded-lg border-2 flex items-center gap-3 transition-all ${isSelected ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'}`}
                                    >
                                        <Icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                                        <div className="text-left">
                                            <div className="font-medium text-gray-900 dark:text-white">
                                                {device.name}
                                            </div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                                {device.description}
                                            </div>
                                        </div>
                                        {isSelected && (
                                            <Check className="w-5 h-5 text-blue-500" />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Advanced Settings */}
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-5">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-amber-500" />
                            Advanced Settings
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[
                                { key: 'includeAIEnhancements', label: 'Include AI Enhancements', icon: Sparkles },
                                { key: 'optimizeForATS', label: 'Optimize for ATS', icon: Shield },
                                { key: 'addQRCode', label: 'Add QR Code', icon: QrCode },
                                { key: 'passwordProtect', label: 'Password Protect', icon: Lock },
                                { key: 'watermark', label: 'Add Watermark', icon: FileImage },
                                { key: 'compressFile', label: 'Compress File', icon: HardDrive },
                                { key: 'includeMetadata', label: 'Include Metadata', icon: Database },
                                { key: 'trackAnalytics', label: 'Track Analytics', icon: BarChart }
                            ].map((setting) => {
                                const Icon = setting.icon;
                                return (
                                    <label key={setting.key} className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                                        <input
                                            type="checkbox"
                                            checked={exportSettings[setting.key]}
                                            onChange={(e) => handleSettingsChange(setting.key, e.target.checked)}
                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                        <span className="text-gray-900 dark:text-white font-medium">
                                            {setting.label}
                                        </span>
                                    </label>
                                );
                            })}
                        </div>
                    </div>

                    {/* Cloud Services */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <Cloud className="w-5 h-5 text-blue-500" />
                            Save to Cloud
                        </h3>
                        <div className="flex flex-wrap gap-3">
                            {CLOUD_SERVICES.map((service) => {
                                const Icon = service.icon;
                                const isSelected = selectedCloudServices.includes(service.id);
                                return (
                                    <button
                                        key={service.id}
                                        onClick={() => toggleCloudService(service.id)}
                                        disabled={!service.enabled}
                                        className={`px-4 py-3 rounded-lg border-2 flex items-center gap-3 transition-all ${isSelected ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'} ${!service.enabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        <Icon className="w-5 h-5" />
                                        <div className="text-left">
                                            <div className="font-medium text-gray-900 dark:text-white">
                                                {service.name}
                                            </div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                                {service.description}
                                            </div>
                                        </div>
                                        {isSelected && (
                                            <Check className="w-5 h-5 text-blue-500" />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Share Settings */}
                    {shareLink && (
                        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-5">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                <Share2 className="w-5 h-5 text-blue-600" />
                                Share Settings
                            </h3>

                            <div className="mb-4">
                                <div className="flex items-center gap-3 mb-3">
                                    <input
                                        type="text"
                                        value={shareLink}
                                        readOnly
                                        className="flex-1 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
                                    />
                                    <button
                                        onClick={handleShare}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                                    >
                                        <Copy className="w-4 h-4" />
                                        Copy Link
                                    </button>
                                </div>

                                {generatedQRCode && exportSettings.addQRCode && (
                                    <div className="mt-4">
                                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">QR Code:</p>
                                        <div className="flex items-center gap-4">
                                            <img src={generatedQRCode} alt="QR Code" className="w-32 h-32 border border-gray-300 dark:border-gray-700 rounded-lg" />
                                            <div className="space-y-2">
                                                <button className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2">
                                                    <Download className="w-4 h-4" />
                                                    Download QR Code
                                                </button>
                                                <button className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2">
                                                    <Printer className="w-4 h-4" />
                                                    Print QR Code
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <label className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                                    <input
                                        type="checkbox"
                                        checked={shareSettings.public}
                                        onChange={(e) => handleShareSettingsChange('public', e.target.checked)}
                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <Globe className="w-5 h-5 text-blue-600" />
                                    <div>
                                        <div className="font-medium text-gray-900 dark:text-white">Public Access</div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">Anyone with link can view</div>
                                    </div>
                                </label>

                                <label className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                                    <input
                                        type="checkbox"
                                        checked={shareSettings.allowComments}
                                        onChange={(e) => handleShareSettingsChange('allowComments', e.target.checked)}
                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <Users className="w-5 h-5 text-green-600" />
                                    <div>
                                        <div className="font-medium text-gray-900 dark:text-white">Allow Comments</div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">Viewers can leave feedback</div>
                                    </div>
                                </label>

                                <label className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                                    <input
                                        type="checkbox"
                                        checked={shareSettings.allowDownloads}
                                        onChange={(e) => handleShareSettingsChange('allowDownloads', e.target.checked)}
                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <Download className="w-5 h-5 text-purple-600" />
                                    <div>
                                        <div className="font-medium text-gray-900 dark:text-white">Allow Downloads</div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">Viewers can download copy</div>
                                    </div>
                                </label>

                                <label className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                                    <input
                                        type="checkbox"
                                        checked={shareSettings.notifyOnView}
                                        onChange={(e) => handleShareSettingsChange('notifyOnView', e.target.checked)}
                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <Calendar className="w-5 h-5 text-amber-600" />
                                    <div>
                                        <div className="font-medium text-gray-900 dark:text-white">Notify on View</div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">Get email when viewed</div>
                                    </div>
                                </label>
                            </div>
                        </div>
                    )}

                    {/* Export Stats */}
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-5">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <BarChart className="w-5 h-5 text-green-500" />
                            Export Statistics
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                                <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalExports}</div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">Total Exports</div>
                            </div>
                            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                                <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.todayExports}</div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">Today</div>
                            </div>
                            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                                <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalSize}</div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">Total Size</div>
                            </div>
                            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                                <div className="text-lg font-bold text-gray-900 dark:text-white truncate">{stats.topFormat}</div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">Most Used Format</div>
                            </div>
                        </div>

                        {/* Recent Exports */}
                        {exportHistory.length > 0 && (
                            <div className="mt-6">
                                <h4 className="font-medium text-gray-900 dark:text-white mb-3">Recent Exports</h4>
                                <div className="space-y-2">
                                    {exportHistory.slice(0, 3).map((exportItem) => (
                                        <div key={exportItem.id} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                                                    <FileText className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                                                </div>
                                                <div>
                                                    <div className="font-medium text-gray-900 dark:text-white">
                                                        {exportItem.format.toUpperCase()}
                                                    </div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                                        {new Date(exportItem.date).toLocaleDateString()}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <span className="text-sm text-gray-500 dark:text-gray-400">{exportItem.size}</span>
                                                <button className="text-blue-600 dark:text-blue-400 hover:text-blue-700">
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button className="text-blue-600 dark:text-blue-400 hover:text-blue-700">
                                                    <Download className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Export Progress */}
                    {isExporting && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-5">
                            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-300 mb-3">
                                Exporting {EXPORT_SERVICES[selectedFormat]?.name}...
                            </h3>
                            <div className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-blue-700 dark:text-blue-300">Progress</span>
                                    <span className="font-medium text-blue-900 dark:text-blue-300">{exportProgress}%</span>
                                </div>
                                <div className="h-2 bg-blue-200 dark:bg-blue-800 rounded-full overflow-hidden">
                                    <motion.div
                                        className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
                                        initial={{ width: '0%' }}
                                        animate={{ width: `${exportProgress}%` }}
                                        transition={{ duration: 0.3 }}
                                    />
                                </div>
                                <div className="text-sm text-blue-600 dark:text-blue-400">
                                    Estimated time: {EXPORT_SERVICES[selectedFormat]?.estimatedTime || '2 seconds'}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={handlePrint}
                                disabled={isExporting}
                                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 disabled:opacity-50"
                            >
                                <Printer className="w-4 h-4" />
                                Print
                            </button>
                            {shareLink && (
                                <button
                                    onClick={handleShare}
                                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                                >
                                    <Share2 className="w-4 h-4" />
                                    Share
                                </button>
                            )}
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={onClose}
                                className="px-6 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleExport()}
                                disabled={isExporting}
                                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:shadow-lg flex items-center gap-2 font-medium disabled:opacity-50"
                            >
                                {isExporting ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Exporting...
                                    </>
                                ) : (
                                    <>
                                        <Download className="w-4 h-4" />
                                        Export {EXPORT_SERVICES[selectedFormat]?.name}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExportManager;