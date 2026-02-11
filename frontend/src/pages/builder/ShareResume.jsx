// src/pages/builder/ShareResume.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { Copy, Check, Link, Eye, Download, Mail, X, Globe, Lock, QrCode, Share2, Facebook, Twitter, Linkedin, MessageSquare } from 'lucide-react';
import Navbar from '../../components/Navbar';
import { useResume } from '../../context/ResumeContext';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ErrorDisplay from '../../components/ui/ErrorDisplay';

const ShareResume = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { getResume, loading, error } = useResume();
    const { user } = useAuth();

    const [resume, setResume] = useState(null);
    const [shareSettings, setShareSettings] = useState({
        isPublic: false,
        password: '',
        allowComments: true,
        allowDownloads: true,
        expiryDate: '',
        maxViews: 0
    });
    const [copied, setCopied] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [activeTab, setActiveTab] = useState('link');
    const [qrCodeData, setQrCodeData] = useState('');

    const baseUrl = window.location.origin;
    const shareUrl = resume ? `${baseUrl}/resume/${resume._id}` : '';
    const previewUrl = resume ? `${baseUrl}/builder/preview/${resume._id}` : '';

    useEffect(() => {
        const loadResume = async () => {
            try {
                const data = await getResume(id);
                setResume(data);
                setShareSettings({
                    isPublic: data?.isPublic || false,
                    password: data?.sharePassword || '',
                    allowComments: data?.shareSettings?.allowComments ?? true,
                    allowDownloads: data?.shareSettings?.allowDownloads ?? true,
                    expiryDate: data?.shareExpiry || '',
                    maxViews: data?.shareMaxViews || 0
                });

                // Generate QR code data
                setQrCodeData(`${baseUrl}/resume/${data._id}`);
            } catch (err) {
                console.error('Failed to load resume:', err);
            }
        };

        if (id) {
            loadResume();
        }
    }, [id, getResume, baseUrl]);

    const handleCopyLink = () => {
        navigator.clipboard.writeText(shareUrl)
            .then(() => {
                setCopied(true);
                toast.success('Link copied to clipboard!');
                setTimeout(() => setCopied(false), 2000);
            })
            .catch(err => {
                console.error('Failed to copy:', err);
                toast.error('Failed to copy link');
            });
    };

    const handleSaveSettings = async () => {
        if (!resume) return;

        setIsSaving(true);
        try {
            // In a real app, you would call an API endpoint
            // await updateResumeShareSettings(resume._id, shareSettings);

            await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call

            toast.success('Share settings updated!');
        } catch (err) {
            console.error('Failed to save settings:', err);
            toast.error('Failed to update settings');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDownloadQRCode = () => {
        // In a real app, you would generate and download QR code
        toast.success('QR code downloaded!');
    };

    const handleShareToSocial = (platform) => {
        const message = `Check out my resume: ${resume.title}`;
        const urls = {
            facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
            twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}&url=${encodeURIComponent(shareUrl)}`,
            linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
            whatsapp: `https://wa.me/?text=${encodeURIComponent(`${message} ${shareUrl}`)}`
        };

        window.open(urls[platform], '_blank', 'width=600,height=400');
    };

    const handleGenerateEmbedCode = () => {
        const embedCode = `<iframe src="${shareUrl}" width="100%" height="800" frameborder="0"></iframe>`;
        navigator.clipboard.writeText(embedCode)
            .then(() => toast.success('Embed code copied!'))
            .catch(() => toast.error('Failed to copy embed code'));
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
                <Navbar />
                <div className="pt-24 flex items-center justify-center">
                    <LoadingSpinner size="lg" text="Loading resume..." />
                </div>
            </div>
        );
    }

    if (error || !resume) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
                <Navbar />
                <div className="pt-24">
                    <ErrorDisplay
                        error={error || 'Resume not found'}
                        onRetry={() => navigate(`/builder/edit/${id}`)}
                        onBack={() => navigate('/dashboard')}
                    />
                </div>
            </div>
        );
    }

    const shareOptions = [
        { id: 'link', label: 'Share Link', icon: Link, color: 'from-blue-500 to-cyan-500' },
        { id: 'qr', label: 'QR Code', icon: QrCode, color: 'from-purple-500 to-pink-500' },
        { id: 'embed', label: 'Embed Code', icon: Code, color: 'from-green-500 to-emerald-600' },
        { id: 'social', label: 'Social Media', icon: Share2, color: 'from-orange-500 to-red-500' }
    ];

    const socialPlatforms = [
        { id: 'linkedin', label: 'LinkedIn', icon: Linkedin, color: 'bg-blue-600 hover:bg-blue-700' },
        { id: 'twitter', label: 'Twitter', icon: Twitter, color: 'bg-sky-500 hover:bg-sky-600' },
        { id: 'facebook', label: 'Facebook', icon: Facebook, color: 'bg-blue-800 hover:bg-blue-900' },
        { id: 'whatsapp', label: 'WhatsApp', icon: MessageSquare, color: 'bg-green-500 hover:bg-green-600' }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
            <Navbar />

            <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                                    Share Your Resume
                                </h1>
                                <p className="text-gray-600">
                                    Share "{resume.title}" with potential employers
                                </p>
                            </div>
                            <button
                                onClick={() => navigate(`/builder/edit/${id}`)}
                                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 flex items-center gap-2"
                            >
                                <X className="w-4 h-4" />
                                Close
                            </button>
                        </div>
                    </motion.div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Column - Share Methods */}
                        <div className="lg:col-span-2">
                            {/* Share Method Tabs */}
                            <div className="mb-8">
                                <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl mb-6">
                                    {shareOptions.map((option) => (
                                        <button
                                            key={option.id}
                                            onClick={() => setActiveTab(option.id)}
                                            className={`flex-1 py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all ${activeTab === option.id
                                                ? 'bg-white shadow-lg text-gray-900'
                                                : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                                                }`}
                                        >
                                            <option.icon className="w-5 h-5" />
                                            <span className="font-medium">{option.label}</span>
                                        </button>
                                    ))}
                                </div>

                                {/* Share Link Tab */}
                                {activeTab === 'link' && (
                                    <motion.div
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6"
                                    >
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                                                <Link className="w-6 h-6 text-white" />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold text-gray-900">Shareable Link</h3>
                                                <p className="text-gray-600">Copy and share this link anywhere</p>
                                            </div>
                                        </div>

                                        <div className="mb-6">
                                            <div className="flex items-center gap-2 mb-2">
                                                <label className="text-sm font-medium text-gray-700">Share URL</label>
                                                <span className={`px-2 py-1 text-xs rounded-full ${shareSettings.isPublic ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                                    {shareSettings.isPublic ? 'Public' : 'Private'}
                                                </span>
                                            </div>
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={shareUrl}
                                                    readOnly
                                                    className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-600"
                                                />
                                                <button
                                                    onClick={handleCopyLink}
                                                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:from-blue-700 hover:to-cyan-700 flex items-center gap-2"
                                                >
                                                    {copied ? (
                                                        <>
                                                            <Check className="w-5 h-5" />
                                                            Copied
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Copy className="w-5 h-5" />
                                                            Copy
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </div>

                                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                                            <div className="flex items-start gap-3">
                                                <Eye className="w-5 h-5 text-blue-600 mt-0.5" />
                                                <div>
                                                    <h4 className="font-medium text-blue-900 mb-1">Preview Before Sharing</h4>
                                                    <p className="text-blue-700 text-sm">
                                                        View how your resume will appear to others before sharing.
                                                    </p>
                                                    <button
                                                        onClick={() => window.open(previewUrl, '_blank')}
                                                        className="mt-2 text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 text-sm"
                                                    >
                                                        Open Preview
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {/* QR Code Tab */}
                                {activeTab === 'qr' && (
                                    <motion.div
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6"
                                    >
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                                                <QrCode className="w-6 h-6 text-white" />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold text-gray-900">QR Code</h3>
                                                <p className="text-gray-600">Scan to view resume on mobile devices</p>
                                            </div>
                                        </div>

                                        <div className="text-center">
                                            <div className="inline-block p-8 bg-white border-2 border-gray-200 rounded-2xl mb-6">
                                                {/* QR Code Placeholder - In real app, use a QR code library */}
                                                <div className="w-48 h-48 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg flex items-center justify-center">
                                                    <div className="relative">
                                                        <div className="w-40 h-40 bg-white border-4 border-gray-900 rounded-lg"></div>
                                                        <div className="absolute inset-0 flex items-center justify-center">
                                                            <QrCode className="w-24 h-24 text-gray-900" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                                <button
                                                    onClick={handleDownloadQRCode}
                                                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 flex items-center justify-center gap-2"
                                                >
                                                    <Download className="w-5 h-5" />
                                                    Download QR Code
                                                </button>
                                                <button
                                                    onClick={handleCopyLink}
                                                    className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 flex items-center justify-center gap-2"
                                                >
                                                    <Copy className="w-5 h-5" />
                                                    Copy Link Instead
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {/* Social Media Tab */}
                                {activeTab === 'social' && (
                                    <motion.div
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6"
                                    >
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                                                <Share2 className="w-6 h-6 text-white" />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold text-gray-900">Share on Social Media</h3>
                                                <p className="text-gray-600">Share your resume on professional networks</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                                            {socialPlatforms.map((platform) => (
                                                <button
                                                    key={platform.id}
                                                    onClick={() => handleShareToSocial(platform.id)}
                                                    className={`${platform.color} text-white p-4 rounded-xl hover:shadow-lg transition-all flex flex-col items-center justify-center gap-2`}
                                                >
                                                    <platform.icon className="w-8 h-8" />
                                                    <span className="font-medium">{platform.label}</span>
                                                </button>
                                            ))}
                                        </div>

                                        <div className="bg-gray-50 rounded-xl p-4">
                                            <h4 className="font-medium text-gray-900 mb-2">Custom Message</h4>
                                            <textarea
                                                placeholder="Add a custom message when sharing..."
                                                defaultValue={`Check out my resume: ${resume.title}`}
                                                className="w-full h-24 px-4 py-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        </div>

                        {/* Right Column - Settings */}
                        <div>
                            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sticky top-24">
                                <h3 className="text-xl font-bold text-gray-900 mb-6">Share Settings</h3>

                                {/* Privacy Toggle */}
                                <div className="mb-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-2">
                                            {shareSettings.isPublic ? (
                                                <Globe className="w-5 h-5 text-green-600" />
                                            ) : (
                                                <Lock className="w-5 h-5 text-gray-600" />
                                            )}
                                            <span className="font-medium text-gray-900">
                                                {shareSettings.isPublic ? 'Public Access' : 'Private Access'}
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => setShareSettings(prev => ({ ...prev, isPublic: !prev.isPublic }))}
                                            className={`relative inline-flex h-6 w-11 items-center rounded-full ${shareSettings.isPublic ? 'bg-green-500' : 'bg-gray-300'}`}
                                        >
                                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${shareSettings.isPublic ? 'translate-x-6' : 'translate-x-1'}`} />
                                        </button>
                                    </div>
                                    <p className="text-sm text-gray-600">
                                        {shareSettings.isPublic
                                            ? 'Anyone with the link can view your resume'
                                            : 'Only people with the password can view'}
                                    </p>
                                </div>

                                {/* Password Protection */}
                                {!shareSettings.isPublic && (
                                    <div className="mb-6">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Password Protection
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                value={shareSettings.password}
                                                onChange={(e) => setShareSettings(prev => ({ ...prev, password: e.target.value }))}
                                                placeholder="Enter password"
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
                                            >
                                                {showPassword ? <Eye className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Additional Options */}
                                <div className="space-y-4 mb-8">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="font-medium text-gray-900">Allow Downloads</div>
                                            <div className="text-sm text-gray-600">Users can download PDF copy</div>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={shareSettings.allowDownloads}
                                            onChange={(e) => setShareSettings(prev => ({ ...prev, allowDownloads: e.target.checked }))}
                                            className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                                        />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="font-medium text-gray-900">Allow Comments</div>
                                            <div className="text-sm text-gray-600">Users can leave feedback</div>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={shareSettings.allowComments}
                                            onChange={(e) => setShareSettings(prev => ({ ...prev, allowComments: e.target.checked }))}
                                            className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Link Expiry (Optional)
                                        </label>
                                        <input
                                            type="date"
                                            value={shareSettings.expiryDate}
                                            onChange={(e) => setShareSettings(prev => ({ ...prev, expiryDate: e.target.value }))}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>

                                {/* Stats */}
                                <div className="bg-gray-50 rounded-xl p-4 mb-6">
                                    <h4 className="font-medium text-gray-900 mb-3">Share Stats</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <div className="text-2xl font-bold text-gray-900">0</div>
                                            <div className="text-sm text-gray-600">Total Views</div>
                                        </div>
                                        <div>
                                            <div className="text-2xl font-bold text-gray-900">0</div>
                                            <div className="text-sm text-gray-600">Downloads</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Save Button */}
                                <button
                                    onClick={handleSaveSettings}
                                    disabled={isSaving}
                                    className="w-full py-3 bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-xl hover:from-gray-800 hover:to-gray-700 disabled:opacity-50 flex items-center justify-center gap-2 font-semibold transition-all"
                                >
                                    {isSaving ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        'Save Settings'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="mt-8"
                    >
                        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl p-6 text-white">
                            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                                <div>
                                    <h3 className="text-xl font-bold mb-2">Ready to share?</h3>
                                    <p className="text-blue-100">
                                        Your resume is now ready to be shared with employers.
                                    </p>
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        onClick={handleCopyLink}
                                        className="px-6 py-3 bg-white text-blue-600 rounded-xl hover:bg-blue-50 flex items-center gap-2 font-semibold"
                                    >
                                        <Copy className="w-5 h-5" />
                                        Copy Link
                                    </button>
                                    <button
                                        onClick={() => navigate(`/builder/edit/${id}`)}
                                        className="px-6 py-3 bg-blue-800 text-white rounded-xl hover:bg-blue-900 flex items-center gap-2 font-semibold"
                                    >
                                        <Eye className="w-5 h-5" />
                                        Edit Resume
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

// Add missing icon import
const Code = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
    </svg>
);

export default ShareResume;