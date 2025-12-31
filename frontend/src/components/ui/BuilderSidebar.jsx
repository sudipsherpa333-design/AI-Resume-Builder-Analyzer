// src/components/ui/BuilderSidebar.jsx
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Eye,
    EyeOff,
    CheckCircle,
    ChevronDown,
    ChevronUp,
    Home,
    FileText,
    Briefcase,
    GraduationCap,
    Code,
    Award,
    Globe,
    Users,
    User,
    Plus,
    Search,
    Filter,
    Settings,
    Download,
    Upload,
    Save,
    RefreshCw,
    Trash2,
    Copy,
    Edit3,
    MoreVertical,
    X,
    List,
    Grid,
    Clock,
    BarChart,
    Target,
    Sparkles,
    Zap,
    AlertCircle,
    Lock,
    Unlock,
    ArrowUpDown,
    Star,
    StarOff,
    Shield,
    ShieldOff,
    Eye as EyeIcon,
    EyeOff as EyeOffIcon
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const BuilderSidebar = ({
    sections = [],
    activeSection = 'personalInfo',
    completedSections = [],
    onSectionChange,
    onToggleVisibility,
    showHiddenSections = false,
    onToggleHiddenSections,
    stats = {},
    showProgress = true,
    onToggleProgress,
    onSave,
    onExport,
    isSaving = false,
    saveStatus = 'idle',
    onAddCustomSection,
    onReorderSections,
    onImport,
    onDuplicate,
    onDelete,
    user,
    ...props
}) => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState('all'); // all, required, optional, completed, incomplete
    const [showSectionMenu, setShowSectionMenu] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [dragOverIndex, setDragOverIndex] = useState(null);

    // Filter sections based on search and filter
    const filteredSections = useMemo(() => {
        let filtered = sections;

        // Apply search filter
        if (searchQuery) {
            filtered = filtered.filter(section =>
                section.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
                section.description.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Apply type filter
        switch (filterType) {
            case 'required':
                filtered = filtered.filter(s => s.required);
                break;
            case 'optional':
                filtered = filtered.filter(s => !s.required);
                break;
            case 'completed':
                filtered = filtered.filter(s => completedSections.includes(s.id));
                break;
            case 'incomplete':
                filtered = filtered.filter(s => !completedSections.includes(s.id));
                break;
            case 'visible':
                filtered = filtered.filter(s => s.visible);
                break;
            case 'hidden':
                filtered = filtered.filter(s => !s.visible);
                break;
            default:
                // Show all sections by default
                break;
        }

        // If not showing hidden sections, filter them out
        if (!showHiddenSections) {
            filtered = filtered.filter(s => s.visible);
        }

        return filtered;
    }, [sections, searchQuery, filterType, completedSections, showHiddenSections]);

    // Handle section click
    const handleSectionClick = (sectionId) => {
        const section = sections.find(s => s.id === sectionId);
        if (section && (section.visible || showHiddenSections)) {
            onSectionChange?.(sectionId);
        }
    };

    // Toggle section visibility
    const handleToggleVisibility = (e, sectionId) => {
        e.stopPropagation();
        onToggleVisibility?.(sectionId);
    };

    // Handle drag start
    const handleDragStart = (e, index) => {
        e.dataTransfer.setData('text/plain', index.toString());
        setIsDragging(true);
    };

    // Handle drag over
    const handleDragOver = (e, index) => {
        e.preventDefault();
        setDragOverIndex(index);
    };

    // Handle drop
    const handleDrop = (e, dropIndex) => {
        e.preventDefault();
        const dragIndex = parseInt(e.dataTransfer.getData('text/plain'));

        if (dragIndex !== dropIndex && onReorderSections) {
            onReorderSections(dragIndex, dropIndex);
            toast.success('Sections reordered');
        }

        setDragOverIndex(null);
        setIsDragging(false);
    };

    // Handle drag end
    const handleDragEnd = () => {
        setIsDragging(false);
        setDragOverIndex(null);
    };

    // Get section icon
    const getSectionIcon = (sectionId) => {
        switch (sectionId) {
            case 'personalInfo': return User;
            case 'summary': return FileText;
            case 'experience': return Briefcase;
            case 'education': return GraduationCap;
            case 'skills': return Code;
            case 'projects': return Code;
            case 'certifications': return Award;
            case 'languages': return Globe;
            case 'references': return Users;
            default: return FileText;
        }
    };

    // Calculate section completion percentage
    const completionPercentage = useMemo(() => {
        const requiredSections = sections.filter(s => s.required);
        const completedRequired = completedSections.filter(id => {
            const section = sections.find(s => s.id === id);
            return section && section.required;
        });
        return requiredSections.length > 0
            ? Math.round((completedRequired.length / requiredSections.length) * 100)
            : 0;
    }, [sections, completedSections]);

    // Quick actions for section menu
    const sectionMenuActions = (section) => [
        {
            id: 'toggle-visibility',
            label: section.visible ? 'Hide Section' : 'Show Section',
            icon: section.visible ? EyeOff : Eye,
            color: section.visible ? 'text-red-600' : 'text-green-600',
            onClick: () => handleToggleVisibility({}, section.id)
        },
        {
            id: 'duplicate',
            label: 'Duplicate Section',
            icon: Copy,
            color: 'text-blue-600',
            onClick: () => {
                onDuplicate?.(section.id);
                toast.success(`Duplicated ${section.label}`);
            }
        },
        {
            id: 'edit',
            label: 'Edit Properties',
            icon: Edit3,
            color: 'text-purple-600',
            onClick: () => toast.success(`Editing ${section.label} properties`)
        },
        ...(section.required ? [] : [{
            id: 'delete',
            label: 'Delete Section',
            icon: Trash2,
            color: 'text-red-600',
            onClick: () => {
                if (window.confirm(`Delete "${section.label}" section?`)) {
                    onDelete?.(section.id);
                    toast.success(`Deleted ${section.label}`);
                }
            }
        }])
    ];

    // Quick stats
    const quickStats = useMemo(() => ({
        total: sections.length,
        visible: sections.filter(s => s.visible).length,
        hidden: sections.filter(s => !s.visible).length,
        completed: completedSections.length,
        required: sections.filter(s => s.required).length,
        optional: sections.filter(s => !s.required).length
    }), [sections, completedSections]);

    return (
        <div className={`h-full flex flex-col bg-white border-r border-gray-200 transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-80'}`}>
            {/* Sidebar Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
                {!isCollapsed && (
                    <div className="flex items-center space-x-2">
                        <h2 className="text-lg font-bold text-gray-800">Resume Sections</h2>
                        <div className="flex items-center text-xs">
                            <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full">
                                {quickStats.visible}/{quickStats.total}
                            </span>
                        </div>
                    </div>
                )}

                <div className="flex items-center space-x-1">
                    {/* Collapse Toggle */}
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                        title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                    >
                        {isCollapsed ? (
                            <ChevronRight className="w-4 h-4 text-gray-600" />
                        ) : (
                            <ChevronLeft className="w-4 h-4 text-gray-600" />
                        )}
                    </button>

                    {!isCollapsed && (
                        <>
                            {/* Hidden Sections Toggle */}
                            <button
                                onClick={onToggleHiddenSections}
                                className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                                title={showHiddenSections ? "Hide hidden sections" : "Show hidden sections"}
                            >
                                {showHiddenSections ? (
                                    <EyeOffIcon className="w-4 h-4 text-gray-600" />
                                ) : (
                                    <EyeIcon className="w-4 h-4 text-gray-600" />
                                )}
                            </button>

                            {/* Close Button (for mobile) */}
                            <button
                                onClick={() => setIsCollapsed(true)}
                                className="p-1.5 hover:bg-gray-100 rounded transition-colors md:hidden"
                            >
                                <X className="w-4 h-4 text-gray-600" />
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Search and Filter (when not collapsed) */}
            {!isCollapsed && (
                <div className="p-4 border-b border-gray-200">
                    {/* Search Bar */}
                    <div className="relative mb-3">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search sections..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>

                    {/* Filter Buttons */}
                    <div className="flex flex-wrap gap-1">
                        {[
                            { id: 'all', label: 'All', color: 'bg-gray-100 text-gray-700' },
                            { id: 'required', label: 'Required', color: 'bg-red-100 text-red-700' },
                            { id: 'optional', label: 'Optional', color: 'bg-blue-100 text-blue-700' },
                            { id: 'completed', label: 'Completed', color: 'bg-green-100 text-green-700' },
                            { id: 'incomplete', label: 'Incomplete', color: 'bg-amber-100 text-amber-700' },
                            { id: 'visible', label: 'Visible', color: 'bg-emerald-100 text-emerald-700' },
                            { id: 'hidden', label: 'Hidden', color: 'bg-gray-100 text-gray-700' }
                        ].map(filter => (
                            <button
                                key={filter.id}
                                onClick={() => setFilterType(filter.id)}
                                className={`px-2 py-1 text-xs rounded transition-colors ${filterType === filter.id ? 'ring-2 ring-indigo-300 ' + filter.color : filter.color + ' hover:opacity-90'}`}
                            >
                                {filter.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Sections List */}
            <div className="flex-1 overflow-y-auto">
                {isCollapsed ? (
                    // Collapsed View - Just icons
                    <div className="py-4">
                        {sections
                            .filter(s => showHiddenSections || s.visible)
                            .map((section) => {
                                const Icon = getSectionIcon(section.id);
                                const isCompleted = completedSections.includes(section.id);
                                const isActive = activeSection === section.id;

                                return (
                                    <button
                                        key={section.id}
                                        onClick={() => handleSectionClick(section.id)}
                                        className={`w-full flex items-center justify-center p-3 relative group ${isActive ? 'bg-indigo-50' : 'hover:bg-gray-50'
                                            } ${!section.visible ? 'opacity-50' : ''}`}
                                        title={section.label}
                                    >
                                        <Icon className="w-5 h-5" style={{ color: section.color }} />

                                        {/* Status Indicators */}
                                        {isCompleted && (
                                            <div className="absolute top-1 right-1">
                                                <CheckCircle className="w-3 h-3 text-green-500" />
                                            </div>
                                        )}
                                        {!section.visible && (
                                            <div className="absolute bottom-1 right-1">
                                                <EyeOff className="w-3 h-3 text-gray-400" />
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                    </div>
                ) : (
                    // Expanded View
                    <div className="p-4">
                        {/* Quick Stats */}
                        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                            <div className="grid grid-cols-3 gap-2 text-center">
                                <div className="p-2 bg-white rounded">
                                    <div className="text-lg font-bold text-indigo-600">{quickStats.completed}</div>
                                    <div className="text-xs text-gray-500">Completed</div>
                                </div>
                                <div className="p-2 bg-white rounded">
                                    <div className="text-lg font-bold text-green-600">{quickStats.visible}</div>
                                    <div className="text-xs text-gray-500">Visible</div>
                                </div>
                                <div className="p-2 bg-white rounded">
                                    <div className="text-lg font-bold text-amber-600">{quickStats.hidden}</div>
                                    <div className="text-xs text-gray-500">Hidden</div>
                                </div>
                            </div>
                        </div>

                        {/* Sections List */}
                        <div className="space-y-2">
                            {filteredSections.length === 0 ? (
                                <div className="text-center py-8">
                                    <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                    <p className="text-gray-500">No sections found</p>
                                    {searchQuery && (
                                        <button
                                            onClick={() => setSearchQuery('')}
                                            className="mt-2 text-sm text-indigo-600 hover:text-indigo-700"
                                        >
                                            Clear search
                                        </button>
                                    )}
                                </div>
                            ) : (
                                filteredSections.map((section, index) => {
                                    const Icon = getSectionIcon(section.id);
                                    const isCompleted = completedSections.includes(section.id);
                                    const isActive = activeSection === section.id;
                                    const isRequired = section.required;

                                    return (
                                        <motion.div
                                            key={section.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            className={`relative group ${isDragging ? 'cursor-grabbing' : 'cursor-pointer'}`}
                                            draggable
                                            onDragStart={(e) => handleDragStart(e, index)}
                                            onDragOver={(e) => handleDragOver(e, index)}
                                            onDrop={(e) => handleDrop(e, index)}
                                            onDragEnd={handleDragEnd}
                                            onDragLeave={() => setDragOverIndex(null)}
                                        >
                                            {/* Drag Overlay */}
                                            {dragOverIndex === index && (
                                                <div className="absolute inset-0 border-2 border-dashed border-indigo-400 bg-indigo-50 rounded-lg z-10" />
                                            )}

                                            {/* Drag Handle */}
                                            <div className="absolute left-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <div className="w-4 h-4 text-gray-400 cursor-grab active:cursor-grabbing">
                                                    <div className="w-full h-full flex flex-col justify-center">
                                                        <div className="w-full h-0.5 bg-gray-400 mb-0.5"></div>
                                                        <div className="w-full h-0.5 bg-gray-400 mb-0.5"></div>
                                                        <div className="w-full h-0.5 bg-gray-400"></div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Section Card */}
                                            <div
                                                onClick={() => handleSectionClick(section.id)}
                                                className={`pl-8 pr-3 py-3 rounded-lg transition-all ${isActive
                                                        ? 'bg-indigo-50 border border-indigo-100 shadow-sm'
                                                        : 'hover:bg-gray-50 border border-transparent hover:border-gray-200'
                                                    } ${!section.visible ? 'opacity-60' : ''} ${isDragging ? 'shadow-lg' : ''
                                                    }`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center flex-1 min-w-0">
                                                        <div
                                                            className="flex items-center justify-center w-10 h-10 rounded mr-3 flex-shrink-0"
                                                            style={{ backgroundColor: `${section.color}15` }}
                                                        >
                                                            <Icon className="w-5 h-5" style={{ color: section.color }} />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center">
                                                                <span className={`font-medium text-sm truncate ${isActive ? 'text-indigo-700' : 'text-gray-700'
                                                                    }`}>
                                                                    {section.label}
                                                                </span>
                                                                {isCompleted && (
                                                                    <CheckCircle className="w-4 h-4 ml-2 text-green-500 flex-shrink-0" />
                                                                )}
                                                                {isRequired && (
                                                                    <Lock className="w-3 h-3 ml-2 text-red-500 flex-shrink-0" />
                                                                )}
                                                                {!section.visible && (
                                                                    <EyeOff className="w-3 h-3 ml-2 text-gray-400 flex-shrink-0" />
                                                                )}
                                                            </div>
                                                            <p className="text-xs text-gray-500 truncate mt-0.5">
                                                                {section.description}
                                                            </p>
                                                            <div className="flex items-center mt-1 space-x-2">
                                                                <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                                                                    {section.fields} fields
                                                                </span>
                                                                {section.required && (
                                                                    <span className="text-xs px-2 py-0.5 bg-red-50 text-red-600 rounded">
                                                                        Required
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Action Buttons */}
                                                    <div className="flex items-center space-x-1 ml-2">
                                                        {/* Visibility Toggle */}
                                                        <button
                                                            onClick={(e) => handleToggleVisibility(e, section.id)}
                                                            className={`p-1.5 rounded transition-colors ${section.visible
                                                                    ? 'text-green-600 hover:bg-green-50'
                                                                    : 'text-gray-400 hover:bg-gray-100'
                                                                }`}
                                                            title={section.visible ? "Hide section" : "Show section"}
                                                        >
                                                            {section.visible ? (
                                                                <Eye className="w-4 h-4" />
                                                            ) : (
                                                                <EyeOff className="w-4 h-4" />
                                                            )}
                                                        </button>

                                                        {/* More Options */}
                                                        <div className="relative">
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setShowSectionMenu(showSectionMenu === section.id ? null : section.id);
                                                                }}
                                                                className="p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
                                                                title="More options"
                                                            >
                                                                <MoreVertical className="w-4 h-4" />
                                                            </button>

                                                            {/* Section Menu */}
                                                            <AnimatePresence>
                                                                {showSectionMenu === section.id && (
                                                                    <>
                                                                        <div
                                                                            className="fixed inset-0 z-40"
                                                                            onClick={() => setShowSectionMenu(null)}
                                                                        />
                                                                        <motion.div
                                                                            initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                                                            exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                                                            className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-50 py-1"
                                                                        >
                                                                            {sectionMenuActions(section).map((action) => (
                                                                                <button
                                                                                    key={action.id}
                                                                                    onClick={(e) => {
                                                                                        e.stopPropagation();
                                                                                        action.onClick();
                                                                                        setShowSectionMenu(null);
                                                                                    }}
                                                                                    className="w-full flex items-center px-3 py-2 text-sm hover:bg-gray-50 transition-colors"
                                                                                >
                                                                                    <action.icon className={`w-4 h-4 mr-2 ${action.color}`} />
                                                                                    {action.label}
                                                                                </button>
                                                                            ))}
                                                                        </motion.div>
                                                                    </>
                                                                )}
                                                            </AnimatePresence>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })
                            )}
                        </div>

                        {/* Add Custom Section */}
                        {onAddCustomSection && (
                            <button
                                onClick={() => onAddCustomSection()}
                                className="w-full mt-4 flex items-center justify-center px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-400 hover:bg-indigo-50 transition-all group"
                            >
                                <Plus className="w-5 h-5 text-gray-400 group-hover:text-indigo-500 mr-2" />
                                <span className="text-sm text-gray-600 group-hover:text-indigo-700">Add Custom Section</span>
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Progress Bar (when not collapsed) */}
            {showProgress && !isCollapsed && (
                <div className="p-4 border-t border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Resume Progress</span>
                        <span className="text-sm font-bold text-indigo-600">{completionPercentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${completionPercentage}%` }}
                        />
                    </div>
                    <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                        <span>{completedSections.length} of {sections.filter(s => s.required).length} required sections</span>
                        <button
                            onClick={onToggleProgress}
                            className="text-gray-400 hover:text-gray-600"
                            title="Hide progress"
                        >
                            <EyeOff className="w-3 h-3" />
                        </button>
                    </div>
                </div>
            )}

            {/* Footer Actions (when not collapsed) */}
            {!isCollapsed && (
                <div className="p-4 border-t border-gray-200 bg-gray-50">
                    <div className="space-y-2">
                        {/* Save Button */}
                        <button
                            onClick={onSave}
                            disabled={isSaving || saveStatus === 'saving'}
                            className={`w-full flex items-center justify-center px-4 py-3 rounded-lg transition-all ${isSaving || saveStatus === 'saving'
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                                }`}
                        >
                            {isSaving || saveStatus === 'saving' ? (
                                <>
                                    <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4 mr-2" />
                                    Save Resume
                                </>
                            )}
                        </button>

                        {/* Quick Actions */}
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                onClick={onExport}
                                className="flex items-center justify-center px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                <Download className="w-4 h-4 mr-2 text-gray-600" />
                                <span className="text-sm text-gray-700">Export</span>
                            </button>
                            <button
                                onClick={onImport}
                                className="flex items-center justify-center px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                <Upload className="w-4 h-4 mr-2 text-gray-600" />
                                <span className="text-sm text-gray-700">Import</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Add missing ChevronLeft import
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default BuilderSidebar;