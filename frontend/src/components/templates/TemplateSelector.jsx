import React, { useState } from 'react';
import {
    Check,
    X,
    Palette,
    Eye,
    Download,
    RefreshCw,
    Building2,
    Sparkles,
    GraduationCap,
    Star,
    TrendingUp,
    Users
} from 'lucide-react';

const TEMPLATE_CATEGORIES = [
    { id: 'all', name: 'All Templates', icon: Palette },
    { id: 'professional', name: 'Professional', icon: Building2 },
    { id: 'creative', name: 'Creative', icon: Sparkles },
    { id: 'academic', name: 'Academic', icon: GraduationCap },
    { id: 'executive', name: 'Executive', icon: Users },
];

const TEMPLATES = [
    {
        id: 'corporate-pro',
        name: 'Corporate Pro',
        category: 'professional',
        description: 'Clean, professional design optimized for ATS systems',
        features: ['ATS Friendly', 'Clean Layout', 'Professional'],
        color: 'from-blue-500 to-blue-600',
        icon: Building2,
        popularity: 95,
        previewImage: '🏢',
        recommendedFor: ['Corporate Jobs', 'Finance', 'IT'],
        stats: {
            atsScore: 98,
            readability: 95,
            sections: 8
        }
    },
    {
        id: 'modern-minimal',
        name: 'Modern Minimal',
        category: 'creative',
        description: 'Sleek, contemporary design with bold typography',
        features: ['Modern Typography', 'Minimalist', 'Visual Impact'],
        color: 'from-gray-800 to-gray-900',
        icon: Sparkles,
        popularity: 88,
        previewImage: '🎨',
        recommendedFor: ['Designers', 'Marketers', 'Startups'],
        stats: {
            atsScore: 85,
            readability: 90,
            sections: 6
        }
    },
    {
        id: 'academic-elite',
        name: 'Academic Elite',
        category: 'academic',
        description: 'Formal structure for academic and research positions',
        features: ['Publications Section', 'Formal Format', 'Research Focus'],
        color: 'from-purple-500 to-purple-600',
        icon: GraduationCap,
        popularity: 76,
        previewImage: '📚',
        recommendedFor: ['Researchers', 'Professors', 'PhD Candidates'],
        stats: {
            atsScore: 92,
            readability: 88,
            sections: 10
        }
    },
    {
        id: 'executive-suite',
        name: 'Executive Suite',
        category: 'executive',
        description: 'Premium design for leadership and executive roles',
        features: ['Leadership Focus', 'Premium Design', 'Achievement-Oriented'],
        color: 'from-emerald-500 to-emerald-600',
        icon: Users,
        popularity: 82,
        previewImage: '👔',
        recommendedFor: ['Executives', 'Directors', 'Senior Management'],
        stats: {
            atsScore: 90,
            readability: 92,
            sections: 7
        }
    },
    {
        id: 'startup-innovator',
        name: 'Startup Innovator',
        category: 'creative',
        description: 'Dynamic design for tech and startup environments',
        features: ['Dynamic Layout', 'Tech Focus', 'Portfolio Integration'],
        color: 'from-orange-500 to-orange-600',
        icon: TrendingUp,
        popularity: 91,
        previewImage: '🚀',
        recommendedFor: ['Tech Startups', 'Innovators', 'Entrepreneurs'],
        stats: {
            atsScore: 87,
            readability: 94,
            sections: 9
        }
    },
    {
        id: 'classic-traditional',
        name: 'Classic Traditional',
        category: 'professional',
        description: 'Time-tested format for conservative industries',
        features: ['Traditional Format', 'Conservative', 'Widely Accepted'],
        color: 'from-gray-600 to-gray-700',
        icon: Star,
        popularity: 79,
        previewImage: '📋',
        recommendedFor: ['Legal', 'Government', 'Healthcare'],
        stats: {
            atsScore: 96,
            readability: 89,
            sections: 8
        }
    },
    {
        id: 'creative-portfolio',
        name: 'Creative Portfolio',
        category: 'creative',
        description: 'Visually striking design with portfolio integration',
        features: ['Visual Focus', 'Portfolio Links', 'Creative Layout'],
        color: 'from-pink-500 to-pink-600',
        icon: Palette,
        popularity: 85,
        previewImage: '🎭',
        recommendedFor: ['Artists', 'Designers', 'Creatives'],
        stats: {
            atsScore: 78,
            readability: 91,
            sections: 7
        }
    },
    {
        id: 'research-scholar',
        name: 'Research Scholar',
        category: 'academic',
        description: 'Comprehensive format for academic achievements',
        features: ['Citation Format', 'Research Sections', 'Academic Focus'],
        color: 'from-indigo-500 to-indigo-600',
        icon: GraduationCap,
        popularity: 73,
        previewImage: '🔬',
        recommendedFor: ['Scientists', 'Academics', 'Postdocs'],
        stats: {
            atsScore: 94,
            readability: 86,
            sections: 12
        }
    }
];

const TemplatePreview = ({ template, isSelected, onSelect, isApplying }) => (
    <div className={`relative group ${isApplying ? 'opacity-50' : ''}`}>
        <div
            className={`border-2 rounded-xl overflow-hidden transition-all duration-300 cursor-pointer transform hover:-translate-y-1 hover:shadow-xl ${isSelected
                    ? 'border-blue-500 ring-4 ring-blue-100'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
            onClick={() => !isApplying && onSelect(template.id)}
        >
            {/* Template Header */}
            <div className={`bg-gradient-to-r ${template.color} p-6`}>
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                            <template.icon className="text-white" size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white">{template.name}</h3>
                            <p className="text-white text-opacity-90 text-sm">{template.category}</p>
                        </div>
                    </div>
                    {isSelected && (
                        <div className="bg-white text-blue-600 p-2 rounded-full">
                            <Check size={20} />
                        </div>
                    )}
                </div>

                {/* Popularity Badge */}
                <div className="inline-flex items-center px-3 py-1 bg-black bg-opacity-20 rounded-full">
                    <Star size={14} className="text-yellow-300 mr-1" />
                    <span className="text-white text-sm font-medium">{template.popularity}% Popular</span>
                </div>
            </div>

            {/* Template Body */}
            <div className="bg-white p-6">
                <div className="mb-4">
                    <p className="text-gray-600">{template.description}</p>
                </div>

                {/* Features */}
                <div className="mb-4">
                    <div className="flex flex-wrap gap-2">
                        {template.features.map((feature, index) => (
                            <span
                                key={index}
                                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                            >
                                {feature}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{template.stats.atsScore}</div>
                        <div className="text-xs text-gray-500">ATS Score</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{template.stats.readability}</div>
                        <div className="text-xs text-gray-500">Readability</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">{template.stats.sections}</div>
                        <div className="text-xs text-gray-500">Sections</div>
                    </div>
                </div>

                {/* Recommended For */}
                <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Recommended For:</p>
                    <div className="flex flex-wrap gap-1">
                        {template.recommendedFor.map((item, index) => (
                            <span
                                key={index}
                                className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs"
                            >
                                {item}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {/* Hover Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-0 group-hover:opacity-20 transition-opacity" />
        </div>

        {/* Preview Button */}
        <button
            onClick={(e) => {
                e.stopPropagation();
                // Handle preview functionality
            }}
            className="absolute top-4 right-4 bg-white text-gray-700 p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:shadow-xl"
            title="Quick Preview"
        >
            <Eye size={18} />
        </button>
    </div>
);

const TemplatePreviewModal = ({ template, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">{template.name}</h2>
                    <p className="text-gray-600">Live Preview - Scroll to see full template</p>
                </div>
                <button
                    onClick={onClose}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                >
                    <X size={24} />
                </button>
            </div>

            <div className="p-6 overflow-auto max-h-[70vh]">
                <div className="bg-gray-100 p-8 rounded-xl">
                    {/* Preview content similar to ResumePreview */}
                    <div className="bg-white shadow-lg mx-auto max-w-3xl">
                        <div className={`bg-gradient-to-r ${template.color} text-white p-8`}>
                            <h1 className="text-3xl font-bold">John Doe</h1>
                            <p className="text-lg opacity-90">Software Engineer</p>
                        </div>

                        <div className="p-8 space-y-6">
                            {/* Sample content for preview */}
                            <section>
                                <h2 className="text-xl font-bold text-gray-800 mb-3">Professional Experience</h2>
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="font-bold">Senior Developer</h3>
                                        <p className="text-gray-600">Tech Corp Inc. • 2020 - Present</p>
                                        <ul className="list-disc pl-5 mt-2 text-gray-700">
                                            <li>Led team of 5 developers in agile environment</li>
                                            <li>Improved system performance by 40%</li>
                                        </ul>
                                    </div>
                                </div>
                            </section>

                            <section>
                                <h2 className="text-xl font-bold text-gray-800 mb-3">Education</h2>
                                <div>
                                    <h3 className="font-bold">Computer Science</h3>
                                    <p className="text-gray-600">Stanford University • 2016 - 2020</p>
                                </div>
                            </section>
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-6 border-t flex justify-between items-center">
                <div className="text-sm text-gray-600">
                    This is a preview. All your data will be preserved when switching templates.
                </div>
                <button
                    onClick={onClose}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    Close Preview
                </button>
            </div>
        </div>
    </div>
);

export default function TemplateSelector({ currentTemplate, onSelect, onClose }) {
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedTemplate, setSelectedTemplate] = useState(currentTemplate);
    const [isApplying, setIsApplying] = useState(false);
    const [previewTemplate, setPreviewTemplate] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredTemplates = TEMPLATES.filter(template => {
        const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
        const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            template.features.some(f => f.toLowerCase().includes(searchTerm.toLowerCase()));
        return matchesCategory && matchesSearch;
    });

    const handleTemplateSelect = (templateId) => {
        setSelectedTemplate(templateId);
    };

    const handleApplyTemplate = async () => {
        setIsApplying(true);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        onSelect(selectedTemplate);
        setIsApplying(false);
    };

    const handleQuickPreview = (template) => {
        setPreviewTemplate(template);
    };

    const getCategoryTemplates = (category) => {
        return TEMPLATES.filter(t => t.category === category);
    };

    return (
        <>
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl w-full max-w-7xl max-h-[90vh] overflow-hidden">
                    {/* Header */}
                    <div className="p-8 border-b bg-gradient-to-r from-blue-50 to-purple-50">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl">
                                    <Palette className="text-white" size={32} />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900">Choose Your Template</h1>
                                    <p className="text-gray-600">
                                        Select a design that matches your industry and personality
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-3 hover:bg-white rounded-xl transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>
                    </div>

                    {/* Search and Categories */}
                    <div className="p-6 border-b">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            {/* Search */}
                            <div className="flex-1 max-w-md">
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Search templates by name, features, or category..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                                        <Palette size={20} className="text-gray-400" />
                                    </div>
                                </div>
                            </div>

                            {/* Category Filter */}
                            <div className="flex items-center space-x-2 overflow-x-auto pb-2">
                                {TEMPlATE_CATEGORIES.map((category) => {
                                    const Icon = category.icon;
                                    const count = category.id === 'all'
                                        ? TEMPLATES.length
                                        : getCategoryTemplates(category.id).length;

                                    return (
                                        <button
                                            key={category.id}
                                            onClick={() => setSelectedCategory(category.id)}
                                            className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl whitespace-nowrap transition-all ${selectedCategory === category.id
                                                    ? 'bg-blue-600 text-white shadow-lg'
                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }`}
                                        >
                                            <Icon size={18} />
                                            <span className="font-medium">{category.name}</span>
                                            <span className={`text-xs px-2 py-0.5 rounded-full ${selectedCategory === category.id
                                                    ? 'bg-white text-blue-600'
                                                    : 'bg-gray-200 text-gray-700'
                                                }`}>
                                                {count}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex h-[calc(90vh-220px)]">
                        {/* Template Grid */}
                        <div className="flex-1 p-6 overflow-auto">
                            {filteredTemplates.length === 0 ? (
                                <div className="text-center py-12">
                                    <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                        <Palette size={24} className="text-gray-400" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No templates found</h3>
                                    <p className="text-gray-600">
                                        Try a different search term or select another category
                                    </p>
                                </div>
                            ) : (
                                <>
                                    {/* Selected Template Info */}
                                    {selectedTemplate && (
                                        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h3 className="font-bold text-blue-900">
                                                        Selected: {TEMPLATES.find(t => t.id === selectedTemplate)?.name}
                                                    </h3>
                                                    <p className="text-blue-700 text-sm">
                                                        Click "Apply Template" to switch designs
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={handleApplyTemplate}
                                                    disabled={isApplying || selectedTemplate === currentTemplate}
                                                    className={`flex items-center space-x-2 px-6 py-2 rounded-lg font-medium ${selectedTemplate === currentTemplate
                                                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                            : isApplying
                                                                ? 'bg-blue-400 text-white cursor-wait'
                                                                : 'bg-blue-600 text-white hover:bg-blue-700'
                                                        }`}
                                                >
                                                    {isApplying ? (
                                                        <>
                                                            <RefreshCw size={18} className="animate-spin" />
                                                            <span>Applying...</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Check size={18} />
                                                            <span>Apply Template</span>
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Template Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {filteredTemplates.map((template) => (
                                            <TemplatePreview
                                                key={template.id}
                                                template={template}
                                                isSelected={selectedTemplate === template.id}
                                                onSelect={handleTemplateSelect}
                                                isApplying={isApplying}
                                            />
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Sidebar - Comparison & Stats */}
                        <div className="w-80 border-l p-6 overflow-auto hidden lg:block">
                            <div className="sticky top-0">
                                <h3 className="text-lg font-bold text-gray-900 mb-6">Template Comparison</h3>

                                {/* Current vs Selected */}
                                <div className="mb-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="text-sm font-medium text-gray-700">Current Template</div>
                                        <div className="text-sm font-medium text-gray-700">Selected Template</div>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="text-center">
                                            <div className={`w-12 h-12 mx-auto mb-2 rounded-lg bg-gradient-to-r ${TEMPLATES.find(t => t.id === currentTemplate)?.color || 'from-gray-400 to-gray-500'
                                                } flex items-center justify-center`}>
                                                <Palette className="text-white" size={24} />
                                            </div>
                                            <div className="text-sm font-medium">
                                                {TEMPLATES.find(t => t.id === currentTemplate)?.name || 'Unknown'}
                                            </div>
                                        </div>

                                        <div className="text-gray-400">→</div>

                                        <div className="text-center">
                                            <div className={`w-12 h-12 mx-auto mb-2 rounded-lg bg-gradient-to-r ${TEMPLATES.find(t => t.id === selectedTemplate)?.color || 'from-blue-400 to-blue-500'
                                                } flex items-center justify-center`}>
                                                <Palette className="text-white" size={24} />
                                            </div>
                                            <div className="text-sm font-medium">
                                                {TEMPLATES.find(t => t.id === selectedTemplate)?.name || 'None'}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Template Stats */}
                                <div className="mb-6">
                                    <h4 className="font-medium text-gray-900 mb-3">Template Statistics</h4>
                                    <div className="space-y-4">
                                        <div>
                                            <div className="flex justify-between text-sm mb-1">
                                                <span className="text-gray-600">ATS Compatibility</span>
                                                <span className="font-medium">
                                                    {TEMPLATES.find(t => t.id === selectedTemplate)?.stats.atsScore || 0}%
                                                </span>
                                            </div>
                                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-green-500 rounded-full"
                                                    style={{
                                                        width: `${TEMPLATES.find(t => t.id === selectedTemplate)?.stats.atsScore || 0}%`
                                                    }}
                                                ></div>
                                            </div>
                                        </div>

                                        <div>
                                            <div className="flex justify-between text-sm mb-1">
                                                <span className="text-gray-600">Readability</span>
                                                <span className="font-medium">
                                                    {TEMPLATES.find(t => t.id === selectedTemplate)?.stats.readability || 0}%
                                                </span>
                                            </div>
                                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-blue-500 rounded-full"
                                                    style={{
                                                        width: `${TEMPLATES.find(t => t.id === selectedTemplate)?.stats.readability || 0}%`
                                                    }}
                                                ></div>
                                            </div>
                                        </div>

                                        <div>
                                            <div className="flex justify-between text-sm mb-1">
                                                <span className="text-gray-600">Sections Supported</span>
                                                <span className="font-medium">
                                                    {TEMPLATES.find(t => t.id === selectedTemplate)?.stats.sections || 0}
                                                </span>
                                            </div>
                                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-purple-500 rounded-full"
                                                    style={{
                                                        width: `${(TEMPLATES.find(t => t.id === selectedTemplate)?.stats.sections || 0) * 10}%`
                                                    }}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Tips */}
                                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl">
                                    <h4 className="font-medium text-gray-900 mb-2">💡 Choosing Tips</h4>
                                    <ul className="text-sm text-gray-600 space-y-1">
                                        <li>• Higher ATS score = Better automated screening</li>
                                        <li>• Creative templates = Less formal industries</li>
                                        <li>• Professional templates = Corporate jobs</li>
                                        <li>• Your data is preserved when switching</li>
                                    </ul>
                                </div>

                                {/* Quick Actions */}
                                <div className="mt-6 space-y-3">
                                    <button
                                        onClick={() => {
                                            // Handle preview all
                                        }}
                                        className="w-full flex items-center justify-center space-x-2 px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50"
                                    >
                                        <Eye size={18} />
                                        <span>Preview All Templates</span>
                                    </button>

                                    <button
                                        onClick={() => {
                                            // Handle download preview
                                        }}
                                        className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800"
                                    >
                                        <Download size={18} />
                                        <span>Download Template Guide</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-6 border-t flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                            <div className="flex items-center space-x-4">
                                <span className="flex items-center">
                                    <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                                    ATS Optimized
                                </span>
                                <span className="flex items-center">
                                    <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                                    Mobile Responsive
                                </span>
                                <span className="flex items-center">
                                    <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
                                    Free Updates
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center space-x-3">
                            <button
                                onClick={onClose}
                                className="px-6 py-2.5 text-gray-700 hover:bg-gray-100 rounded-xl"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleApplyTemplate}
                                disabled={isApplying || !selectedTemplate || selectedTemplate === currentTemplate}
                                className={`px-8 py-2.5 rounded-xl font-medium transition-all ${!selectedTemplate || selectedTemplate === currentTemplate || isApplying
                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg'
                                    }`}
                            >
                                {isApplying ? 'Applying...' : 'Apply Selected Template'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Preview Modal */}
            {previewTemplate && (
                <TemplatePreviewModal
                    template={previewTemplate}
                    onClose={() => setPreviewTemplate(null)}
                />
            )}
        </>
    );
}