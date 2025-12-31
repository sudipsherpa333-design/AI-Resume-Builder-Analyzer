import React, { useState } from 'react';
import {
    GripVertical, Eye, EyeOff, Plus, Trash2, Copy, Settings,
    ChevronUp, ChevronDown, Save, X
} from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

const DEFAULT_SECTIONS = [
    { id: 'personal', label: 'Personal Information', required: true, enabled: true },
    { id: 'summary', label: 'Professional Summary', required: false, enabled: true },
    { id: 'experience', label: 'Work Experience', required: true, enabled: true },
    { id: 'education', label: 'Education', required: true, enabled: true },
    { id: 'skills', label: 'Skills', required: false, enabled: true },
    { id: 'projects', label: 'Projects', required: false, enabled: true },
    { id: 'certifications', label: 'Certifications', required: false, enabled: false },
    { id: 'languages', label: 'Languages', required: false, enabled: false },
    { id: 'references', label: 'References', required: false, enabled: false },
    { id: 'publications', label: 'Publications', required: false, enabled: false },
    { id: 'awards', label: 'Awards & Honors', required: false, enabled: false },
    { id: 'volunteer', label: 'Volunteer Experience', required: false, enabled: false }
];

const CUSTOM_SECTION_TEMPLATES = [
    { id: 'portfolio', label: 'Portfolio', icon: '🎨' },
    { id: 'patents', label: 'Patents', icon: '📜' },
    { id: 'conferences', label: 'Conference Presentations', icon: '🎤' },
    { id: 'teaching', label: 'Teaching Experience', icon: '📚' },
    { id: 'leadership', label: 'Leadership Experience', icon: '👥' },
    { id: 'hobbies', label: 'Hobbies & Interests', icon: '🎯' }
];

export default function SectionManager({ sections = DEFAULT_SECTIONS, onReorder, onToggle, onClose }) {
    const [localSections, setLocalSections] = useState(sections);
    const [customSections, setCustomSections] = useState([]);
    const [showCustomTemplates, setShowCustomTemplates] = useState(false);
    const [newSectionName, setNewSectionName] = useState('');
    const [editingSection, setEditingSection] = useState(null);

    const handleDragEnd = (result) => {
        if (!result.destination) return;

        const items = Array.from(localSections);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        setLocalSections(items);
    };

    const handleToggleSection = (sectionId, enabled) => {
        const updatedSections = localSections.map(section =>
            section.id === sectionId ? { ...section, enabled } : section
        );
        setLocalSections(updatedSections);
    };

    const handleMoveSection = (index, direction) => {
        const items = [...localSections];
        if (direction === 'up' && index > 0) {
            [items[index], items[index - 1]] = [items[index - 1], items[index]];
        } else if (direction === 'down' && index < items.length - 1) {
            [items[index], items[index + 1]] = [items[index + 1], items[index]];
        }
        setLocalSections(items);
    };

    const handleAddCustomSection = (template = null) => {
        if (template) {
            const newSection = {
                id: `custom_${Date.now()}`,
                label: template.label,
                icon: template.icon,
                custom: true,
                enabled: true
            };

            const updatedCustomSections = [...customSections, newSection];
            setCustomSections(updatedCustomSections);

            // Add to main sections list
            const updatedSections = [...localSections, newSection];
            setLocalSections(updatedSections);

            setShowCustomTemplates(false);
        } else if (newSectionName.trim()) {
            const newSection = {
                id: `custom_${Date.now()}`,
                label: newSectionName.trim(),
                custom: true,
                enabled: true
            };

            const updatedCustomSections = [...customSections, newSection];
            setCustomSections(updatedCustomSections);

            const updatedSections = [...localSections, newSection];
            setLocalSections(updatedSections);

            setNewSectionName('');
        }
    };

    const handleRemoveSection = (sectionId) => {
        // Don't remove required sections
        const section = localSections.find(s => s.id === sectionId);
        if (section?.required) return;

        const updatedSections = localSections.filter(s => s.id !== sectionId);
        setLocalSections(updatedSections);

        if (section?.custom) {
            const updatedCustomSections = customSections.filter(s => s.id !== sectionId);
            setCustomSections(updatedCustomSections);
        }
    };

    const handleDuplicateSection = (sectionId) => {
        const originalSection = localSections.find(s => s.id === sectionId);
        if (!originalSection) return;

        const duplicatedSection = {
            ...originalSection,
            id: `${originalSection.id}_copy_${Date.now()}`,
            label: `${originalSection.label} (Copy)`
        };

        const updatedSections = [...localSections, duplicatedSection];
        setLocalSections(updatedSections);

        if (originalSection.custom) {
            const updatedCustomSections = [...customSections, duplicatedSection];
            setCustomSections(updatedCustomSections);
        }
    };

    const handleEditSection = (sectionId, newLabel) => {
        const updatedSections = localSections.map(section =>
            section.id === sectionId ? { ...section, label: newLabel } : section
        );
        setLocalSections(updatedSections);

        if (customSections.some(s => s.id === sectionId)) {
            const updatedCustomSections = customSections.map(section =>
                section.id === sectionId ? { ...section, label: newLabel } : section
            );
            setCustomSections(updatedCustomSections);
        }

        setEditingSection(null);
    };

    const handleSave = () => {
        // Call parent callbacks
        if (onReorder) {
            onReorder(localSections);
        }

        if (onToggle) {
            localSections.forEach(section => {
                onToggle(section.id, section.enabled);
            });
        }

        if (onClose) {
            onClose();
        }
    };

    const getSectionCounts = () => {
        const enabled = localSections.filter(s => s.enabled).length;
        const disabled = localSections.filter(s => !s.enabled).length;
        const custom = localSections.filter(s => s.custom).length;

        return { enabled, disabled, custom };
    };

    const counts = getSectionCounts();

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b bg-gradient-to-r from-blue-50 to-purple-50">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-white rounded-lg shadow-sm">
                                <Settings className="text-blue-600" size={24} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Section Manager</h2>
                                <p className="text-gray-600">Drag to reorder, toggle visibility, or add custom sections</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white rounded-lg"
                        >
                            <X size={24} />
                        </button>
                    </div>
                </div>

                <div className="flex h-[calc(90vh-140px)]">
                    {/* Left Panel - Section List */}
                    <div className="w-2/3 border-r p-6 overflow-auto">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">Resume Sections</h3>
                                <p className="text-sm text-gray-600">
                                    {counts.enabled} enabled • {counts.disabled} disabled • {counts.custom} custom
                                </p>
                            </div>

                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => setShowCustomTemplates(true)}
                                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                    <Plus size={18} />
                                    <span>Add Section</span>
                                </button>
                            </div>
                        </div>

                        <DragDropContext onDragEnd={handleDragEnd}>
                            <Droppable droppableId="sections">
                                {(provided) => (
                                    <div
                                        {...provided.droppableProps}
                                        ref={provided.innerRef}
                                        className="space-y-3"
                                    >
                                        {localSections.map((section, index) => (
                                            <Draggable
                                                key={section.id}
                                                draggableId={section.id}
                                                index={index}
                                                isDragDisabled={section.required}
                                            >
                                                {(provided, snapshot) => (
                                                    <div
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        className={`bg-white border rounded-xl p-4 transition-all ${snapshot.isDragging
                                                                ? 'shadow-lg ring-2 ring-blue-500'
                                                                : 'hover:shadow-md'
                                                            } ${section.required
                                                                ? 'border-blue-200 bg-blue-50'
                                                                : 'border-gray-200'
                                                            }`}
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center space-x-3 flex-1">
                                                                {!section.required && (
                                                                    <div
                                                                        {...provided.dragHandleProps}
                                                                        className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
                                                                    >
                                                                        <GripVertical size={20} />
                                                                    </div>
                                                                )}

                                                                <div className="flex-1">
                                                                    {editingSection === section.id ? (
                                                                        <input
                                                                            type="text"
                                                                            value={section.label}
                                                                            onChange={(e) => {
                                                                                const updatedSections = localSections.map(s =>
                                                                                    s.id === section.id
                                                                                        ? { ...s, label: e.target.value }
                                                                                        : s
                                                                                );
                                                                                setLocalSections(updatedSections);
                                                                            }}
                                                                            onBlur={() => handleEditSection(section.id, section.label)}
                                                                            onKeyPress={(e) => {
                                                                                if (e.key === 'Enter') {
                                                                                    handleEditSection(section.id, section.label);
                                                                                }
                                                                            }}
                                                                            className="w-full px-2 py-1 border rounded focus:ring-2 focus:ring-blue-500"
                                                                            autoFocus
                                                                        />
                                                                    ) : (
                                                                        <div className="flex items-center space-x-2">
                                                                            {section.icon && (
                                                                                <span className="text-lg">{section.icon}</span>
                                                                            )}
                                                                            <h4 className="font-medium text-gray-900">
                                                                                {section.label}
                                                                                {section.required && (
                                                                                    <span className="ml-2 text-xs text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
                                                                                        Required
                                                                                    </span>
                                                                                )}
                                                                                {section.custom && (
                                                                                    <span className="ml-2 text-xs text-purple-600 bg-purple-100 px-2 py-0.5 rounded-full">
                                                                                        Custom
                                                                                    </span>
                                                                                )}
                                                                            </h4>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            <div className="flex items-center space-x-2">
                                                                {!section.required && (
                                                                    <>
                                                                        <button
                                                                            onClick={() => handleMoveSection(index, 'up')}
                                                                            disabled={index === 0}
                                                                            className={`p-1 rounded ${index === 0
                                                                                    ? 'text-gray-300 cursor-not-allowed'
                                                                                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                                                                                }`}
                                                                        >
                                                                            <ChevronUp size={18} />
                                                                        </button>

                                                                        <button
                                                                            onClick={() => handleMoveSection(index, 'down')}
                                                                            disabled={index === localSections.length - 1}
                                                                            className={`p-1 rounded ${index === localSections.length - 1
                                                                                    ? 'text-gray-300 cursor-not-allowed'
                                                                                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                                                                                }`}
                                                                        >
                                                                            <ChevronDown size={18} />
                                                                        </button>
                                                                    </>
                                                                )}

                                                                <button
                                                                    onClick={() => handleDuplicateSection(section.id)}
                                                                    className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded"
                                                                    title="Duplicate"
                                                                >
                                                                    <Copy size={16} />
                                                                </button>

                                                                {!section.required && (
                                                                    <button
                                                                        onClick={() => handleRemoveSection(section.id)}
                                                                        className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"
                                                                        title="Remove"
                                                                    >
                                                                        <Trash2 size={16} />
                                                                    </button>
                                                                )}

                                                                <button
                                                                    onClick={() => handleToggleSection(section.id, !section.enabled)}
                                                                    className={`p-2 rounded-lg transition-colors ${section.enabled
                                                                            ? 'text-green-600 bg-green-50 hover:bg-green-100'
                                                                            : 'text-gray-400 bg-gray-100 hover:bg-gray-200'
                                                                        }`}
                                                                    title={section.enabled ? 'Disable section' : 'Enable section'}
                                                                >
                                                                    {section.enabled ? <Eye size={18} /> : <EyeOff size={18} />}
                                                                </button>
                                                            </div>
                                                        </div>

                                                        {/* Section Status */}
                                                        <div className="mt-3 pt-3 border-t border-gray-100">
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center space-x-4">
                                                                    <span className={`text-sm px-2 py-1 rounded-full ${section.enabled
                                                                            ? 'text-green-700 bg-green-100'
                                                                            : 'text-gray-500 bg-gray-100'
                                                                        }`}>
                                                                        {section.enabled ? 'Visible in resume' : 'Hidden from resume'}
                                                                    </span>

                                                                    <span className="text-sm text-gray-500">
                                                                        Position: {index + 1} of {localSections.length}
                                                                    </span>
                                                                </div>

                                                                {!section.required && (
                                                                    <button
                                                                        onClick={() => setEditingSection(
                                                                            editingSection === section.id ? null : section.id
                                                                        )}
                                                                        className="text-sm text-blue-600 hover:text-blue-800"
                                                                    >
                                                                        {editingSection === section.id ? 'Save' : 'Rename'}
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </Draggable>
                                        ))}
                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>
                        </DragDropContext>

                        <div className="mt-8 p-4 bg-gray-50 rounded-xl">
                            <h4 className="font-medium text-gray-900 mb-2">💡 Pro Tips</h4>
                            <ul className="text-sm text-gray-600 space-y-1">
                                <li>• Drag sections to prioritize important content</li>
                                <li>• Hide less relevant sections for different job applications</li>
                                <li>• Add custom sections for unique experiences</li>
                                <li>• Keep 4-6 sections visible for optimal readability</li>
                            </ul>
                        </div>
                    </div>

                    {/* Right Panel - Custom Sections & Preview */}
                    <div className="w-1/3 p-6 overflow-auto">
                        {showCustomTemplates ? (
                            <div>
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-lg font-semibold text-gray-900">Add Custom Section</h3>
                                    <button
                                        onClick={() => setShowCustomTemplates(false)}
                                        className="text-gray-500 hover:text-gray-700"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>

                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Quick Templates
                                    </label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {CUSTOM_SECTION_TEMPLATES.map((template) => (
                                            <button
                                                key={template.id}
                                                onClick={() => handleAddCustomSection(template)}
                                                className="p-4 border border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-colors text-left"
                                            >
                                                <div className="text-2xl mb-2">{template.icon}</div>
                                                <div className="font-medium text-gray-900">{template.label}</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Create Custom Section
                                    </label>
                                    <div className="flex space-x-2">
                                        <input
                                            type="text"
                                            value={newSectionName}
                                            onChange={(e) => setNewSectionName(e.target.value)}
                                            placeholder="e.g., Speaking Engagements"
                                            className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                            onKeyPress={(e) => {
                                                if (e.key === 'Enter') {
                                                    handleAddCustomSection();
                                                }
                                            }}
                                        />
                                        <button
                                            onClick={() => handleAddCustomSection()}
                                            disabled={!newSectionName.trim()}
                                            className={`px-4 py-2 rounded-lg font-medium ${newSectionName.trim()
                                                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                                                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                                }`}
                                        >
                                            Add
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-6">Resume Preview</h3>

                                <div className="mb-6">
                                    <div className="bg-gray-900 text-white p-4 rounded-t-xl">
                                        <div className="text-center">
                                            <div className="w-12 h-12 bg-blue-500 rounded-full mx-auto mb-2 flex items-center justify-center">
                                                <span className="text-lg font-bold">J</span>
                                            </div>
                                            <h4 className="font-bold">John Doe</h4>
                                            <p className="text-sm opacity-75">Software Engineer</p>
                                        </div>
                                    </div>

                                    <div className="border-x border-b rounded-b-xl p-4">
                                        <div className="space-y-4">
                                            {localSections
                                                .filter(s => s.enabled)
                                                .slice(0, 6)
                                                .map((section, index) => (
                                                    <div key={section.id} className="animate-fadeIn">
                                                        <div className="flex items-center space-x-2 mb-2">
                                                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                                            <h5 className="font-medium text-gray-900 text-sm">
                                                                {section.label}
                                                            </h5>
                                                        </div>
                                                        <div className="ml-4">
                                                            {Array(2).fill(0).map((_, i) => (
                                                                <div
                                                                    key={i}
                                                                    className="h-2 bg-gray-200 rounded mb-1 animate-pulse"
                                                                    style={{
                                                                        width: `${80 - i * 20}%`,
                                                                        animationDelay: `${i * 0.1}s`
                                                                    }}
                                                                ></div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                        </div>

                                        <div className="mt-6 pt-4 border-t text-center">
                                            <p className="text-xs text-gray-500">
                                                Showing {localSections.filter(s => s.enabled).length} sections
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gray-50 p-4 rounded-xl">
                                    <h4 className="font-medium text-gray-900 mb-3">Section Statistics</h4>
                                    <div className="space-y-3">
                                        <div>
                                            <div className="flex justify-between text-sm mb-1">
                                                <span className="text-gray-600">Enabled Sections</span>
                                                <span className="font-medium">{counts.enabled}</span>
                                            </div>
                                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-green-500 rounded-full transition-all duration-300"
                                                    style={{ width: `${(counts.enabled / localSections.length) * 100}%` }}
                                                ></div>
                                            </div>
                                        </div>

                                        <div>
                                            <div className="flex justify-between text-sm mb-1">
                                                <span className="text-gray-600">Total Sections</span>
                                                <span className="font-medium">{localSections.length}</span>
                                            </div>
                                        </div>

                                        <div>
                                            <div className="flex justify-between text-sm mb-1">
                                                <span className="text-gray-600">Custom Sections</span>
                                                <span className="font-medium">{counts.custom}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => {
                                    // Reset to default
                                    setLocalSections(DEFAULT_SECTIONS);
                                    setCustomSections([]);
                                }}
                                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                            >
                                Reset to Default
                            </button>

                            <button
                                onClick={() => {
                                    // Enable all sections
                                    const updatedSections = localSections.map(s => ({ ...s, enabled: true }));
                                    setLocalSections(updatedSections);
                                }}
                                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                            >
                                Enable All
                            </button>
                        </div>

                        <div className="flex items-center space-x-3">
                            <button
                                onClick={onClose}
                                className="px-6 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:opacity-90"
                            >
                                <Save size={18} />
                                <span>Save Changes</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}