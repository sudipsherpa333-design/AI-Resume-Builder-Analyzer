// frontend/src/admin/pages/Templates.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
    FiFileText,
    FiSearch,
    FiFilter,
    FiEdit,
    FiTrash2,
    FiEye,
    FiCheckCircle,
    FiXCircle,
    FiMoreVertical,
    FiDownload,
    FiRefreshCw,
    FiPlus,
    FiGrid,
    FiList,
    FiStar,
    FiTrendingUp,
    FiUsers,
    FiCalendar,
    FiTag,
    FiCopy,
    FiUpload,
    FiDownloadCloud,
    FiLock,
    FiUnlock,
    FiEyeOff,
    FiLayers,
    FiType,
    FiLayout,
    FiImage,
    FiSettings,
    FiX,
    FiAlertCircle,
    FiExternalLink,
    FiBarChart2,
    FiDatabase,
    FiActivity,
    FiTarget
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';

// Database Configuration
const DATABASE_CONFIG = {
    API_BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:5001',
    ENDPOINTS: {
        TEMPLATES: '/admin/templates',
        TEMPLATE_STATS: '/admin/templates/stats',
        TEMPLATE_DETAIL: (id) => `/admin/templates/${id}`,
        TEMPLATE_PREVIEW: (id) => `/admin/templates/${id}/preview`,
        TEMPLATE_DUPLICATE: (id) => `/admin/templates/${id}/duplicate`,
        TEMPLATE_EXPORT: (id) => `/admin/templates/${id}/export`,
        TEMPLATE_BULK: '/admin/templates/bulk',
        TEMPLATE_CATEGORIES: '/admin/templates/categories',
        TEMPLATE_UPLOAD: '/admin/templates/upload'
    }
};

// Database Service Layer
class DatabaseService {
    static getAuthToken() {
        return localStorage.getItem('adminToken') || localStorage.getItem('token');
    }

    static async fetchFromDatabase(endpoint, options = {}) {
        const token = this.getAuthToken();
        if (!token) {
            throw new Error('Authentication required. Please login.');
        }

        const response = await fetch(`${DATABASE_CONFIG.API_BASE_URL}${endpoint}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            credentials: 'include',
            ...options
        });

        if (!response.ok) {
            if (response.status === 401) {
                localStorage.removeItem('adminToken');
                window.location.href = '/admin/login';
                throw new Error('Session expired. Please login again.');
            }
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Database error: ${response.statusText}`);
        }

        return response.json();
    }

    // Template CRUD Operations
    static async getTemplates(queryParams = {}) {
        const params = new URLSearchParams(queryParams);
        return this.fetchFromDatabase(`${DATABASE_CONFIG.ENDPOINTS.TEMPLATES}?${params}`);
    }

    static async getTemplateStats() {
        return this.fetchFromDatabase(DATABASE_CONFIG.ENDPOINTS.TEMPLATE_STATS);
    }

    static async getTemplateById(id) {
        return this.fetchFromDatabase(DATABASE_CONFIG.ENDPOINTS.TEMPLATE_DETAIL(id));
    }

    static async createTemplate(templateData) {
        const formData = new FormData();

        // Append all template data
        Object.keys(templateData).forEach(key => {
            if (key === 'thumbnail' && templateData[key]) {
                formData.append('thumbnail', templateData[key]);
            } else if (key === 'previewImages' && Array.isArray(templateData[key])) {
                templateData[key].forEach((image, index) => {
                    if (image instanceof File) {
                        formData.append(`previewImages`, image);
                    }
                });
            } else if (templateData[key] !== undefined && templateData[key] !== null) {
                if (typeof templateData[key] === 'object') {
                    formData.append(key, JSON.stringify(templateData[key]));
                } else {
                    formData.append(key, templateData[key]);
                }
            }
        });

        return this.fetchFromDatabase(DATABASE_CONFIG.ENDPOINTS.TEMPLATES, {
            method: 'POST',
            body: formData
        });
    }

    static async updateTemplate(id, templateData) {
        const formData = new FormData();

        Object.keys(templateData).forEach(key => {
            if (key === 'thumbnail' && templateData[key]) {
                formData.append('thumbnail', templateData[key]);
            } else if (key === 'previewImages' && Array.isArray(templateData[key])) {
                templateData[key].forEach((image, index) => {
                    if (image instanceof File) {
                        formData.append(`previewImages`, image);
                    }
                });
            } else if (templateData[key] !== undefined && templateData[key] !== null) {
                if (typeof templateData[key] === 'object') {
                    formData.append(key, JSON.stringify(templateData[key]));
                } else {
                    formData.append(key, templateData[key]);
                }
            }
        });

        return this.fetchFromDatabase(DATABASE_CONFIG.ENDPOINTS.TEMPLATE_DETAIL(id), {
            method: 'PUT',
            body: formData
        });
    }

    static async deleteTemplate(id) {
        return this.fetchFromDatabase(DATABASE_CONFIG.ENDPOINTS.TEMPLATE_DETAIL(id), {
            method: 'DELETE'
        });
    }

    static async updateTemplateStatus(id, status) {
        return this.fetchFromDatabase(`${DATABASE_CONFIG.ENDPOINTS.TEMPLATE_DETAIL(id)}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status })
        });
    }

    static async duplicateTemplate(id) {
        return this.fetchFromDatabase(DATABASE_CONFIG.ENDPOINTS.TEMPLATE_DUPLICATE(id), {
            method: 'POST'
        });
    }

    static async exportTemplate(id) {
        return this.fetchFromDatabase(DATABASE_CONFIG.ENDPOINTS.TEMPLATE_EXPORT(id));
    }

    static async bulkTemplateAction(templateIds, action) {
        return this.fetchFromDatabase(DATABASE_CONFIG.ENDPOINTS.TEMPLATE_BULK, {
            method: 'POST',
            body: JSON.stringify({ templateIds, action })
        });
    }

    static async getCategories() {
        return this.fetchFromDatabase(DATABASE_CONFIG.ENDPOINTS.TEMPLATE_CATEGORIES);
    }

    static async uploadTemplate(file) {
        const formData = new FormData();
        formData.append('template', file);

        return this.fetchFromDatabase(DATABASE_CONFIG.ENDPOINTS.TEMPLATE_UPLOAD, {
            method: 'POST',
            body: formData
        });
    }
}

const Templates = () => {
    // Database State Management
    const [databaseState, setDatabaseState] = useState({
        templates: [],
        categories: [],
        loading: true,
        error: null,
        stats: {
            total: 0,
            active: 0,
            premium: 0,
            free: 0,
            featured: 0,
            newThisWeek: 0,
            usageCount: 0,
            categories: {}
        },
        pagination: {
            page: 1,
            limit: 12,
            total: 0,
            pages: 0
        },
        filters: {
            search: '',
            category: 'all',
            status: 'all',
            access: 'all',
            sortBy: 'newest'
        },
        viewMode: 'grid' // 'grid' or 'list'
    });

    // UI State Management
    const [uiState, setUiState] = useState({
        selectedTemplates: [],
        createModal: { isOpen: false, template: null },
        editModal: { isOpen: false, template: null },
        previewModal: { isOpen: false, template: null, activeImage: 0 },
        deleteConfirm: { isOpen: false, templateId: null, templateName: '' },
        duplicateModal: { isOpen: false, templateId: null, templateName: '' },
        exportModal: { isOpen: false, templateId: null, templateName: '' },
        uploadModal: { isOpen: false },
        bulkActionModal: { isOpen: false, action: '' }
    });

    // Database Operations
    const loadTemplatesFromDatabase = useCallback(async () => {
        try {
            setDatabaseState(prev => ({ ...prev, loading: true, error: null }));

            const queryParams = {
                page: databaseState.pagination.page,
                limit: databaseState.pagination.limit,
                ...(databaseState.filters.search && { search: databaseState.filters.search }),
                ...(databaseState.filters.category !== 'all' && { category: databaseState.filters.category }),
                ...(databaseState.filters.status !== 'all' && { status: databaseState.filters.status }),
                ...(databaseState.filters.access !== 'all' && { access: databaseState.filters.access }),
                ...(databaseState.filters.sortBy && { sortBy: databaseState.filters.sortBy })
            };

            const response = await DatabaseService.getTemplates(queryParams);

            if (response.success) {
                setDatabaseState(prev => ({
                    ...prev,
                    templates: response.data?.templates || [],
                    pagination: {
                        ...prev.pagination,
                        total: response.data?.total || 0,
                        pages: response.data?.pages || 0
                    },
                    loading: false
                }));

                if (response.data?.templates?.length > 0) {
                    toast.success(`Loaded ${response.data.templates.length} templates`);
                }
            } else {
                throw new Error(response.message || 'Failed to load templates');
            }
        } catch (error) {
            console.error('Database load error:', error);
            setDatabaseState(prev => ({
                ...prev,
                error: error.message,
                loading: false,
                templates: []
            }));
            toast.error(`Database error: ${error.message}`);
        }
    }, [
        databaseState.pagination.page,
        databaseState.pagination.limit,
        databaseState.filters.search,
        databaseState.filters.category,
        databaseState.filters.status,
        databaseState.filters.access,
        databaseState.filters.sortBy
    ]);

    const loadStatsFromDatabase = useCallback(async () => {
        try {
            const response = await DatabaseService.getTemplateStats();
            if (response.success) {
                setDatabaseState(prev => ({
                    ...prev,
                    stats: response.data || prev.stats
                }));
            }
        } catch (error) {
            console.error('Database stats error:', error);
            // Fallback to calculated stats
            const templates = databaseState.templates;
            setDatabaseState(prev => ({
                ...prev,
                stats: {
                    total: templates.length,
                    active: templates.filter(t => t.status === 'active').length,
                    premium: templates.filter(t => t.access === 'premium').length,
                    free: templates.filter(t => t.access === 'free').length,
                    featured: templates.filter(t => t.featured).length,
                    newThisWeek: templates.filter(t => {
                        const oneWeekAgo = new Date();
                        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
                        return new Date(t.createdAt) > oneWeekAgo;
                    }).length,
                    usageCount: templates.reduce((sum, t) => sum + (t.usageCount || 0), 0),
                    categories: databaseState.categories.reduce((acc, cat) => ({
                        ...acc,
                        [cat.name]: templates.filter(t => t.category === cat._id).length
                    }), {})
                }
            }));
        }
    }, [databaseState.templates, databaseState.categories]);

    const loadCategoriesFromDatabase = useCallback(async () => {
        try {
            const response = await DatabaseService.getCategories();
            if (response.success) {
                setDatabaseState(prev => ({
                    ...prev,
                    categories: response.data || []
                }));
            }
        } catch (error) {
            console.error('Database categories error:', error);
            // Fallback categories
            setDatabaseState(prev => ({
                ...prev,
                categories: [
                    { _id: '1', name: 'Professional', slug: 'professional', templateCount: 0 },
                    { _id: '2', name: 'Creative', slug: 'creative', templateCount: 0 },
                    { _id: '3', name: 'Modern', slug: 'modern', templateCount: 0 },
                    { _id: '4', name: 'Simple', slug: 'simple', templateCount: 0 },
                    { _id: '5', name: 'Executive', slug: 'executive', templateCount: 0 }
                ]
            }));
        }
    }, []);

    const handleCreateTemplate = async (templateData) => {
        try {
            const response = await DatabaseService.createTemplate(templateData);
            if (response.success) {
                toast.success('Template created successfully');
                await loadTemplatesFromDatabase();
                await loadStatsFromDatabase();
                await loadCategoriesFromDatabase();
                return true;
            } else {
                toast.error(response.message || 'Failed to create template');
                return false;
            }
        } catch (error) {
            console.error('Database create error:', error);
            toast.error(`Database error: ${error.message}`);
            return false;
        }
    };

    const handleUpdateTemplate = async (id, templateData) => {
        try {
            const response = await DatabaseService.updateTemplate(id, templateData);
            if (response.success) {
                toast.success('Template updated successfully');
                await loadTemplatesFromDatabase();
                await loadStatsFromDatabase();
                return true;
            } else {
                toast.error(response.message || 'Failed to update template');
                return false;
            }
        } catch (error) {
            console.error('Database update error:', error);
            toast.error(`Database error: ${error.message}`);
            return false;
        }
    };

    const handleDeleteTemplate = async (id) => {
        try {
            const response = await DatabaseService.deleteTemplate(id);
            if (response.success) {
                toast.success('Template deleted successfully');
                await loadTemplatesFromDatabase();
                await loadStatsFromDatabase();
                await loadCategoriesFromDatabase();
                return true;
            } else {
                toast.error(response.message || 'Failed to delete template');
                return false;
            }
        } catch (error) {
            console.error('Database delete error:', error);
            toast.error(`Database error: ${error.message}`);
            return false;
        }
    };

    const handleUpdateStatus = async (id, status) => {
        try {
            const response = await DatabaseService.updateTemplateStatus(id, status);
            if (response.success) {
                toast.success(`Template ${status === 'active' ? 'activated' : 'deactivated'} successfully`);
                await loadTemplatesFromDatabase();
                await loadStatsFromDatabase();
                return true;
            } else {
                toast.error(response.message || 'Failed to update status');
                return false;
            }
        } catch (error) {
            console.error('Database status update error:', error);
            toast.error(`Database error: ${error.message}`);
            return false;
        }
    };

    const handleDuplicateTemplate = async (id) => {
        try {
            const response = await DatabaseService.duplicateTemplate(id);
            if (response.success) {
                toast.success('Template duplicated successfully');
                await loadTemplatesFromDatabase();
                await loadStatsFromDatabase();
                return true;
            } else {
                toast.error(response.message || 'Failed to duplicate template');
                return false;
            }
        } catch (error) {
            console.error('Database duplicate error:', error);
            toast.error(`Database error: ${error.message}`);
            return false;
        }
    };

    const handleExportTemplate = async (id) => {
        try {
            const response = await DatabaseService.exportTemplate(id);

            if (response.success && response.data?.fileUrl) {
                // Create download link
                const a = document.createElement('a');
                a.href = response.data.fileUrl;
                a.download = `template_${id}_${new Date().toISOString().split('T')[0]}.zip`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(response.data.fileUrl);
                toast.success('Template exported successfully');
            } else {
                toast.error('Failed to export template');
            }
        } catch (error) {
            console.error('Database export error:', error);
            toast.error(`Database error: ${error.message}`);
        }
    };

    const handleBulkAction = async (action) => {
        if (uiState.selectedTemplates.length === 0) {
            toast.error('No templates selected');
            return;
        }

        try {
            const response = await DatabaseService.bulkTemplateAction(uiState.selectedTemplates, action);
            if (response.success) {
                toast.success(`Bulk ${action} completed successfully`);
                setUiState(prev => ({ ...prev, selectedTemplates: [] }));
                await loadTemplatesFromDatabase();
                await loadStatsFromDatabase();
                return true;
            } else {
                toast.error(response.message || 'Bulk action failed');
                return false;
            }
        } catch (error) {
            console.error('Database bulk action error:', error);
            toast.error(`Database error: ${error.message}`);
            return false;
        }
    };

    const handleUploadTemplate = async (file) => {
        try {
            const response = await DatabaseService.uploadTemplate(file);
            if (response.success) {
                toast.success('Template uploaded successfully');
                await loadTemplatesFromDatabase();
                await loadStatsFromDatabase();
                await loadCategoriesFromDatabase();
                return true;
            } else {
                toast.error(response.message || 'Failed to upload template');
                return false;
            }
        } catch (error) {
            console.error('Database upload error:', error);
            toast.error(`Database error: ${error.message}`);
            return false;
        }
    };

    // Initialize database
    useEffect(() => {
        loadTemplatesFromDatabase();
        loadCategoriesFromDatabase();
    }, [loadTemplatesFromDatabase, loadCategoriesFromDatabase]);

    // Load stats when templates change
    useEffect(() => {
        if (databaseState.templates.length > 0) {
            loadStatsFromDatabase();
        }
    }, [databaseState.templates, loadStatsFromDatabase]);

    // Search debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            if (databaseState.filters.search !== '') {
                setDatabaseState(prev => ({
                    ...prev,
                    pagination: { ...prev.pagination, page: 1 }
                }));
                loadTemplatesFromDatabase();
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [databaseState.filters.search, loadTemplatesFromDatabase]);

    // Filter changes
    useEffect(() => {
        setDatabaseState(prev => ({
            ...prev,
            pagination: { ...prev.pagination, page: 1 }
        }));
        const timer = setTimeout(() => {
            loadTemplatesFromDatabase();
        }, 300);

        return () => clearTimeout(timer);
    }, [
        databaseState.filters.category,
        databaseState.filters.status,
        databaseState.filters.access,
        databaseState.filters.sortBy,
        loadTemplatesFromDatabase
    ]);

    // Pagination changes
    useEffect(() => {
        loadTemplatesFromDatabase();
    }, [databaseState.pagination.page, loadTemplatesFromDatabase]);

    // UI Handlers
    const handleSearchChange = (value) => {
        setDatabaseState(prev => ({
            ...prev,
            filters: { ...prev.filters, search: value }
        }));
    };

    const handleFilterChange = (key, value) => {
        setDatabaseState(prev => ({
            ...prev,
            filters: { ...prev.filters, [key]: value }
        }));
    };

    const handlePaginationChange = (page) => {
        setDatabaseState(prev => ({
            ...prev,
            pagination: { ...prev.pagination, page }
        }));
    };

    const handleTemplateSelect = (id) => {
        setUiState(prev => ({
            ...prev,
            selectedTemplates: prev.selectedTemplates.includes(id)
                ? prev.selectedTemplates.filter(templateId => templateId !== id)
                : [...prev.selectedTemplates, id]
        }));
    };

    const handleSelectAll = () => {
        if (uiState.selectedTemplates.length === databaseState.templates.length) {
            setUiState(prev => ({ ...prev, selectedTemplates: [] }));
        } else {
            setUiState(prev => ({
                ...prev,
                selectedTemplates: databaseState.templates.map(template => template._id || template.id)
            }));
        }
    };

    const toggleViewMode = () => {
        setDatabaseState(prev => ({
            ...prev,
            viewMode: prev.viewMode === 'grid' ? 'list' : 'grid'
        }));
    };

    // Formatting helpers
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch (error) {
            return 'Invalid date';
        }
    };

    const formatNumber = (num) => {
        if (!num) return '0';
        if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
        return num.toString();
    };

    // Component: Stats Card
    const StatsCard = ({ title, value, icon: Icon, color, subtitle }) => (
        <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-gray-500 mb-1">{title}</p>
                    <p className="text-2xl font-bold text-gray-900">{value}</p>
                    {subtitle && (
                        <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
                    )}
                </div>
                <div className={`p-3 rounded-lg ${color}`}>
                    <Icon className="w-6 h-6 text-white" />
                </div>
            </div>
        </div>
    );

    // Component: Status Badge
    const StatusBadge = ({ status }) => {
        const statusMap = {
            active: {
                color: 'bg-green-100 text-green-800 border-green-200',
                icon: FiCheckCircle,
                label: 'Active'
            },
            inactive: {
                color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
                icon: FiXCircle,
                label: 'Inactive'
            },
            draft: {
                color: 'bg-blue-100 text-blue-800 border-blue-200',
                icon: FiEdit,
                label: 'Draft'
            },
            archived: {
                color: 'bg-gray-100 text-gray-800 border-gray-200',
                icon: FiArchive,
                label: 'Archived'
            }
        };

        const config = statusMap[status] || statusMap.inactive;
        const Icon = config.icon;

        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 border ${config.color}`}>
                <Icon className="w-3 h-3" />
                {config.label}
            </span>
        );
    };

    // Component: Access Badge
    const AccessBadge = ({ access }) => {
        const accessMap = {
            premium: {
                color: 'bg-purple-100 text-purple-800 border-purple-200',
                icon: FiStar,
                label: 'Premium'
            },
            free: {
                color: 'bg-green-100 text-green-800 border-green-200',
                icon: FiUnlock,
                label: 'Free'
            },
            pro: {
                color: 'bg-blue-100 text-blue-800 border-blue-200',
                icon: FiLock,
                label: 'Pro'
            }
        };

        const config = accessMap[access] || accessMap.free;
        const Icon = config.icon;

        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 border ${config.color}`}>
                <Icon className="w-3 h-3" />
                {config.label}
            </span>
        );
    };

    // Component: Category Badge
    const CategoryBadge = ({ category }) => {
        const categoryData = databaseState.categories.find(cat => cat._id === category);
        return (
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                {categoryData?.name || category || 'Uncategorized'}
            </span>
        );
    };

    // Component: Template Card (Grid View)
    const TemplateCard = ({ template }) => {
        const isSelected = uiState.selectedTemplates.includes(template._id || template.id);

        return (
            <div className={`bg-white rounded-xl border-2 ${isSelected ? 'border-indigo-500' : 'border-gray-200'} overflow-hidden hover:shadow-lg transition-all duration-200`}>
                {/* Thumbnail */}
                <div className="relative h-48 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                    {template.thumbnail ? (
                        <img
                            src={template.thumbnail}
                            alt={template.name}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <FiFileText className="w-16 h-16 text-gray-400" />
                        </div>
                    )}

                    {/* Selection Checkbox */}
                    <div className="absolute top-3 left-3">
                        <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleTemplateSelect(template._id || template.id)}
                            className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                    </div>

                    {/* Status & Access Badges */}
                    <div className="absolute top-3 right-3 flex flex-col gap-1">
                        <StatusBadge status={template.status} />
                        <AccessBadge access={template.access} />
                    </div>

                    {/* Featured Badge */}
                    {template.featured && (
                        <div className="absolute bottom-3 left-3">
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200 flex items-center gap-1">
                                <FiStar className="w-3 h-3" />
                                Featured
                            </span>
                        </div>
                    )}
                </div>

                {/* Template Info */}
                <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                        <h3 className="font-bold text-gray-900 truncate" title={template.name}>
                            {template.name}
                        </h3>
                        <span className="text-sm text-gray-500">
                            v{template.version || '1.0'}
                        </span>
                    </div>

                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {template.description || 'No description available'}
                    </p>

                    <div className="flex flex-wrap gap-1 mb-3">
                        <CategoryBadge category={template.category} />
                        {template.tags?.slice(0, 2).map((tag, index) => (
                            <span key={index} className="px-2 py-1 rounded-full text-xs bg-blue-50 text-blue-700">
                                {tag}
                            </span>
                        ))}
                    </div>

                    {/* Stats */}
                    <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                            <FiUsers className="w-3 h-3" />
                            <span>{formatNumber(template.usageCount || 0)} uses</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <FiCalendar className="w-3 h-3" />
                            <span>{formatDate(template.updatedAt || template.createdAt)}</span>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-4 mt-4 border-t border-gray-100">
                        <button
                            onClick={() => setUiState(prev => ({ ...prev, previewModal: { isOpen: true, template, activeImage: 0 } }))}
                            className="flex-1 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg flex items-center justify-center gap-2"
                        >
                            <FiEye className="w-3 h-3" />
                            Preview
                        </button>
                        <button
                            onClick={() => setUiState(prev => ({ ...prev, editModal: { isOpen: true, template } }))}
                            className="flex-1 px-3 py-2 text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg flex items-center justify-center gap-2"
                        >
                            <FiEdit className="w-3 h-3" />
                            Edit
                        </button>
                        <div className="relative group">
                            <button
                                className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg"
                                title="More Actions"
                            >
                                <FiMoreVertical className="w-3 h-3" />
                            </button>
                            <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                                <div className="py-1">
                                    <button
                                        onClick={async () => {
                                            const newStatus = template.status === 'active' ? 'inactive' : 'active';
                                            await handleUpdateStatus(template._id || template.id, newStatus);
                                        }}
                                        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center gap-2"
                                    >
                                        {template.status === 'active' ? (
                                            <>
                                                <FiXCircle className="w-3 h-3 text-yellow-600" />
                                                Deactivate
                                            </>
                                        ) : (
                                            <>
                                                <FiCheckCircle className="w-3 h-3 text-green-600" />
                                                Activate
                                            </>
                                        )}
                                    </button>
                                    <button
                                        onClick={async () => await handleDuplicateTemplate(template._id || template.id)}
                                        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center gap-2"
                                    >
                                        <FiCopy className="w-3 h-3 text-blue-600" />
                                        Duplicate
                                    </button>
                                    <button
                                        onClick={() => setUiState(prev => ({
                                            ...prev,
                                            exportModal: {
                                                isOpen: true,
                                                templateId: template._id || template.id,
                                                templateName: template.name
                                            }
                                        }))}
                                        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center gap-2"
                                    >
                                        <FiDownload className="w-3 h-3 text-purple-600" />
                                        Export
                                    </button>
                                    <button
                                        onClick={() => setUiState(prev => ({
                                            ...prev,
                                            deleteConfirm: {
                                                isOpen: true,
                                                templateId: template._id || template.id,
                                                templateName: template.name
                                            }
                                        }))}
                                        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 text-red-600 flex items-center gap-2"
                                    >
                                        <FiTrash2 className="w-3 h-3" />
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // Component: Template List Item
    const TemplateListItem = ({ template }) => {
        const isSelected = uiState.selectedTemplates.includes(template._id || template.id);

        return (
            <div className={`bg-white rounded-xl border-2 ${isSelected ? 'border-indigo-500' : 'border-gray-200'} p-4 hover:shadow-md transition-all duration-200`}>
                <div className="flex items-center gap-4">
                    {/* Selection Checkbox */}
                    <div>
                        <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleTemplateSelect(template._id || template.id)}
                            className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                    </div>

                    {/* Thumbnail */}
                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 flex-shrink-0">
                        {template.thumbnail ? (
                            <img
                                src={template.thumbnail}
                                alt={template.name}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <FiFileText className="w-8 h-8 text-gray-400" />
                            </div>
                        )}
                    </div>

                    {/* Template Info */}
                    <div className="flex-1">
                        <div className="flex items-start justify-between mb-1">
                            <div>
                                <h3 className="font-bold text-gray-900">{template.name}</h3>
                                <p className="text-sm text-gray-600 mt-1">{template.description || 'No description'}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <StatusBadge status={template.status} />
                                <AccessBadge access={template.access} />
                                {template.featured && (
                                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
                                        <FiStar className="w-3 h-3 inline mr-1" />
                                        Featured
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-4 mt-2">
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                <FiTag className="w-3 h-3" />
                                <CategoryBadge category={template.category} />
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                <FiUsers className="w-3 h-3" />
                                <span>{formatNumber(template.usageCount || 0)} uses</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                <FiCalendar className="w-3 h-3" />
                                <span>{formatDate(template.updatedAt || template.createdAt)}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                <span className="text-gray-400">v{template.version || '1.0'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setUiState(prev => ({ ...prev, previewModal: { isOpen: true, template, activeImage: 0 } }))}
                            className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"
                            title="Preview"
                        >
                            <FiEye className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setUiState(prev => ({ ...prev, editModal: { isOpen: true, template } }))}
                            className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg"
                            title="Edit"
                        >
                            <FiEdit className="w-4 h-4" />
                        </button>
                        <button
                            onClick={async () => await handleDuplicateTemplate(template._id || template.id)}
                            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                            title="Duplicate"
                        >
                            <FiCopy className="w-4 h-4" />
                        </button>
                        <div className="relative group">
                            <button
                                className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg"
                                title="More Actions"
                            >
                                <FiMoreVertical className="w-4 h-4" />
                            </button>
                            <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                                <div className="py-1">
                                    <button
                                        onClick={async () => {
                                            const newStatus = template.status === 'active' ? 'inactive' : 'active';
                                            await handleUpdateStatus(template._id || template.id, newStatus);
                                        }}
                                        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center gap-2"
                                    >
                                        {template.status === 'active' ? (
                                            <>
                                                <FiXCircle className="w-3 h-3 text-yellow-600" />
                                                Deactivate
                                            </>
                                        ) : (
                                            <>
                                                <FiCheckCircle className="w-3 h-3 text-green-600" />
                                                Activate
                                            </>
                                        )}
                                    </button>
                                    <button
                                        onClick={() => setUiState(prev => ({
                                            ...prev,
                                            exportModal: {
                                                isOpen: true,
                                                templateId: template._id || template.id,
                                                templateName: template.name
                                            }
                                        }))}
                                        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center gap-2"
                                    >
                                        <FiDownload className="w-3 h-3 text-purple-600" />
                                        Export
                                    </button>
                                    <button
                                        onClick={() => setUiState(prev => ({
                                            ...prev,
                                            deleteConfirm: {
                                                isOpen: true,
                                                templateId: template._id || template.id,
                                                templateName: template.name
                                            }
                                        }))}
                                        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 text-red-600 flex items-center gap-2"
                                    >
                                        <FiTrash2 className="w-3 h-3" />
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // Component: Template Form Modal
    const TemplateFormModal = ({ isOpen, onClose, template, mode = 'create' }) => {
        const [formData, setFormData] = useState({
            name: '',
            description: '',
            category: '',
            access: 'free',
            status: 'draft',
            version: '1.0',
            featured: false,
            tags: [],
            thumbnail: null,
            previewImages: [],
            htmlContent: '',
            cssContent: '',
            jsContent: '',
            settings: {
                fonts: [],
                colors: [],
                sections: [],
                customFields: []
            }
        });
        const [saving, setSaving] = useState(false);
        const [errors, setErrors] = useState({});
        const [tagInput, setTagInput] = useState('');

        useEffect(() => {
            if (template && mode === 'edit') {
                setFormData({
                    name: template.name || '',
                    description: template.description || '',
                    category: template.category || '',
                    access: template.access || 'free',
                    status: template.status || 'draft',
                    version: template.version || '1.0',
                    featured: template.featured || false,
                    tags: template.tags || [],
                    thumbnail: template.thumbnail || null,
                    previewImages: template.previewImages || [],
                    htmlContent: template.htmlContent || '',
                    cssContent: template.cssContent || '',
                    jsContent: template.jsContent || '',
                    settings: template.settings || {
                        fonts: [],
                        colors: [],
                        sections: [],
                        customFields: []
                    }
                });
            } else {
                setFormData({
                    name: '',
                    description: '',
                    category: '',
                    access: 'free',
                    status: 'draft',
                    version: '1.0',
                    featured: false,
                    tags: [],
                    thumbnail: null,
                    previewImages: [],
                    htmlContent: '',
                    cssContent: '',
                    jsContent: '',
                    settings: {
                        fonts: [],
                        colors: [],
                        sections: [],
                        customFields: []
                    }
                });
            }
            setErrors({});
            setTagInput('');
        }, [template, mode, isOpen]);

        const validateForm = () => {
            const newErrors = {};

            if (!formData.name.trim()) {
                newErrors.name = 'Template name is required';
            }

            if (!formData.category) {
                newErrors.category = 'Category is required';
            }

            if (!formData.htmlContent.trim()) {
                newErrors.htmlContent = 'HTML content is required';
            }

            setErrors(newErrors);
            return Object.keys(newErrors).length === 0;
        };

        const handleAddTag = () => {
            if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
                setFormData(prev => ({
                    ...prev,
                    tags: [...prev.tags, tagInput.trim()]
                }));
                setTagInput('');
            }
        };

        const handleRemoveTag = (tagToRemove) => {
            setFormData(prev => ({
                ...prev,
                tags: prev.tags.filter(tag => tag !== tagToRemove)
            }));
        };

        const handleFileUpload = (e, field) => {
            const file = e.target.files[0];
            if (file) {
                if (field === 'thumbnail') {
                    setFormData(prev => ({ ...prev, thumbnail: file }));
                } else if (field === 'previewImages') {
                    setFormData(prev => ({
                        ...prev,
                        previewImages: [...prev.previewImages, file]
                    }));
                }
            }
        };

        const handleRemovePreviewImage = (index) => {
            setFormData(prev => ({
                ...prev,
                previewImages: prev.previewImages.filter((_, i) => i !== index)
            }));
        };

        const handleSubmit = async (e) => {
            e.preventDefault();

            if (!validateForm()) {
                return;
            }

            setSaving(true);

            const success = mode === 'create'
                ? await handleCreateTemplate(formData)
                : await handleUpdateTemplate(template._id || template.id, formData);

            if (success) {
                onClose();
            }

            setSaving(false);
        };

        if (!isOpen) return null;

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                    <div className="p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-gray-900">
                                {mode === 'create' ? 'Create New Template' : 'Edit Template'}
                            </h3>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-gray-100 rounded-lg"
                                disabled={saving}
                            >
                                <FiX className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Basic Information */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Template Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none ${errors.name ? 'border-red-300' : 'border-gray-300'
                                            }`}
                                        required
                                        disabled={saving}
                                    />
                                    {errors.name && (
                                        <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Version
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.version}
                                        onChange={(e) => setFormData(prev => ({ ...prev, version: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                        placeholder="1.0"
                                        disabled={saving}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Description
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                    rows="3"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                    placeholder="Describe your template..."
                                    disabled={saving}
                                />
                            </div>

                            {/* Category & Access */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Category *
                                    </label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none ${errors.category ? 'border-red-300' : 'border-gray-300'
                                            }`}
                                        required
                                        disabled={saving}
                                    >
                                        <option value="">Select Category</option>
                                        {databaseState.categories.map(category => (
                                            <option key={category._id} value={category._id}>
                                                {category.name} ({category.templateCount || 0})
                                            </option>
                                        ))}
                                    </select>
                                    {errors.category && (
                                        <p className="mt-1 text-sm text-red-600">{errors.category}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Access Level
                                    </label>
                                    <select
                                        value={formData.access}
                                        onChange={(e) => setFormData(prev => ({ ...prev, access: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                        disabled={saving}
                                    >
                                        <option value="free">Free</option>
                                        <option value="pro">Pro</option>
                                        <option value="premium">Premium</option>
                                    </select>
                                </div>
                            </div>

                            {/* Status & Featured */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Status
                                    </label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                        disabled={saving}
                                    >
                                        <option value="draft">Draft</option>
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                        <option value="archived">Archived</option>
                                    </select>
                                </div>

                                <div className="flex items-center pt-6">
                                    <input
                                        type="checkbox"
                                        checked={formData.featured}
                                        onChange={(e) => setFormData(prev => ({ ...prev, featured: e.target.checked }))}
                                        id="featured"
                                        className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                        disabled={saving}
                                    />
                                    <label htmlFor="featured" className="ml-2 block text-sm text-gray-700">
                                        Mark as Featured Template
                                    </label>
                                </div>
                            </div>

                            {/* Tags */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Tags
                                </label>
                                <div className="flex gap-2 mb-2">
                                    <input
                                        type="text"
                                        value={tagInput}
                                        onChange={(e) => setTagInput(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                        placeholder="Add a tag and press Enter"
                                        disabled={saving}
                                    />
                                    <button
                                        type="button"
                                        onClick={handleAddTag}
                                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                                        disabled={saving}
                                    >
                                        Add
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {formData.tags.map((tag, index) => (
                                        <span
                                            key={index}
                                            className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-700"
                                        >
                                            {tag}
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveTag(tag)}
                                                className="text-blue-700 hover:text-blue-900"
                                                disabled={saving}
                                            >
                                                <FiX className="w-3 h-3" />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Thumbnail Upload */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Thumbnail Image
                                </label>
                                <div className="flex items-center gap-4">
                                    {formData.thumbnail && (
                                        <div className="w-32 h-32 rounded-lg overflow-hidden border border-gray-300">
                                            {formData.thumbnail instanceof File ? (
                                                <img
                                                    src={URL.createObjectURL(formData.thumbnail)}
                                                    alt="Thumbnail preview"
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <img
                                                    src={formData.thumbnail}
                                                    alt="Thumbnail"
                                                    className="w-full h-full object-cover"
                                                />
                                            )}
                                        </div>
                                    )}
                                    <div>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => handleFileUpload(e, 'thumbnail')}
                                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                                            disabled={saving}
                                        />
                                        <p className="text-xs text-gray-500 mt-1">
                                            Recommended: 800x600px, JPG or PNG
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Preview Images */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Preview Images
                                </label>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                                    {formData.previewImages.map((image, index) => (
                                        <div key={index} className="relative group">
                                            <div className="w-full h-32 rounded-lg overflow-hidden border border-gray-300">
                                                {image instanceof File ? (
                                                    <img
                                                        src={URL.createObjectURL(image)}
                                                        alt={`Preview ${index + 1}`}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <img
                                                        src={image}
                                                        alt={`Preview ${index + 1}`}
                                                        className="w-full h-full object-cover"
                                                    />
                                                )}
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleRemovePreviewImage(index)}
                                                className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                disabled={saving}
                                            >
                                                <FiX className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleFileUpload(e, 'previewImages')}
                                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100"
                                    disabled={saving}
                                />
                            </div>

                            {/* Template Content */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    HTML Content *
                                </label>
                                <textarea
                                    value={formData.htmlContent}
                                    onChange={(e) => setFormData(prev => ({ ...prev, htmlContent: e.target.value }))}
                                    rows="10"
                                    className={`w-full px-3 py-2 border rounded-lg font-mono text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none ${errors.htmlContent ? 'border-red-300' : 'border-gray-300'
                                        }`}
                                    placeholder="<!-- Template HTML content -->"
                                    required
                                    disabled={saving}
                                />
                                {errors.htmlContent && (
                                    <p className="mt-1 text-sm text-red-600">{errors.htmlContent}</p>
                                )}
                            </div>

                            {/* CSS & JS Content */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        CSS Content
                                    </label>
                                    <textarea
                                        value={formData.cssContent}
                                        onChange={(e) => setFormData(prev => ({ ...prev, cssContent: e.target.value }))}
                                        rows="5"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                        placeholder="/* Template CSS */"
                                        disabled={saving}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        JavaScript Content
                                    </label>
                                    <textarea
                                        value={formData.jsContent}
                                        onChange={(e) => setFormData(prev => ({ ...prev, jsContent: e.target.value }))}
                                        rows="5"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                        placeholder="// Template JavaScript"
                                        disabled={saving}
                                    />
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 pt-4 border-t border-gray-200">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                                    disabled={saving}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2"
                                    disabled={saving}
                                >
                                    {saving ? (
                                        <>
                                            <FiRefreshCw className="w-4 h-4 animate-spin" />
                                            {mode === 'create' ? 'Creating...' : 'Updating...'}
                                        </>
                                    ) : mode === 'create' ? 'Create Template' : 'Update Template'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        );
    };

    // Component: Preview Modal
    const PreviewModal = ({ isOpen, onClose, template, activeImage }) => {
        const [currentImage, setCurrentImage] = useState(activeImage || 0);

        useEffect(() => {
            setCurrentImage(activeImage || 0);
        }, [activeImage]);

        if (!isOpen || !template) return null;

        const previewImages = template.previewImages || [];
        if (template.thumbnail && !previewImages.includes(template.thumbnail)) {
            previewImages.unshift(template.thumbnail);
        }

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
                    <div className="p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-gray-900">{template.name} - Preview</h3>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-gray-100 rounded-lg"
                            >
                                <FiX className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        <div className="space-y-6">
                            {/* Main Preview Image */}
                            <div className="bg-gray-100 rounded-xl p-4">
                                <div className="aspect-video bg-white rounded-lg overflow-hidden shadow-lg">
                                    {previewImages.length > 0 ? (
                                        <img
                                            src={previewImages[currentImage]}
                                            alt={`Preview ${currentImage + 1}`}
                                            className="w-full h-full object-contain"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <FiFileText className="w-32 h-32 text-gray-400" />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Thumbnail Navigation */}
                            {previewImages.length > 1 && (
                                <div>
                                    <div className="flex flex-wrap gap-2">
                                        {previewImages.map((image, index) => (
                                            <button
                                                key={index}
                                                onClick={() => setCurrentImage(index)}
                                                className={`w-20 h-16 rounded-lg overflow-hidden border-2 ${currentImage === index ? 'border-indigo-500' : 'border-gray-300'}`}
                                            >
                                                <img
                                                    src={image}
                                                    alt={`Thumbnail ${index + 1}`}
                                                    className="w-full h-full object-cover"
                                                />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Template Details */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h4 className="font-bold text-gray-900 mb-3">Template Information</h4>
                                    <div className="space-y-3">
                                        <div>
                                            <p className="text-sm text-gray-500">Name</p>
                                            <p className="font-medium">{template.name}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Description</p>
                                            <p className="font-medium">{template.description || 'No description'}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Category</p>
                                            <CategoryBadge category={template.category} />
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div>
                                                <p className="text-sm text-gray-500">Status</p>
                                                <StatusBadge status={template.status} />
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">Access</p>
                                                <AccessBadge access={template.access} />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="font-bold text-gray-900 mb-3">Usage Statistics</h4>
                                    <div className="space-y-3">
                                        <div>
                                            <p className="text-sm text-gray-500">Total Usage</p>
                                            <p className="text-2xl font-bold text-gray-900">{formatNumber(template.usageCount || 0)}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Version</p>
                                            <p className="font-medium">v{template.version || '1.0'}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Created</p>
                                            <p className="font-medium">{formatDate(template.createdAt)}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Last Updated</p>
                                            <p className="font-medium">{formatDate(template.updatedAt || template.createdAt)}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Tags */}
                            {template.tags && template.tags.length > 0 && (
                                <div>
                                    <h4 className="font-bold text-gray-900 mb-3">Tags</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {template.tags.map((tag, index) => (
                                            <span
                                                key={index}
                                                className="px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700"
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
                                <button
                                    onClick={() => {
                                        onClose();
                                        setUiState(prev => ({ ...prev, editModal: { isOpen: true, template } }));
                                    }}
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
                                >
                                    <FiEdit className="w-4 h-4" />
                                    Edit Template
                                </button>
                                <button
                                    onClick={async () => {
                                        await handleDuplicateTemplate(template._id || template.id);
                                        onClose();
                                    }}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                                >
                                    <FiCopy className="w-4 h-4" />
                                    Duplicate
                                </button>
                                <button
                                    onClick={async () => {
                                        await handleExportTemplate(template._id || template.id);
                                        onClose();
                                    }}
                                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
                                >
                                    <FiDownload className="w-4 h-4" />
                                    Export
                                </button>
                                <button
                                    onClick={() => {
                                        onClose();
                                        setUiState(prev => ({
                                            ...prev,
                                            deleteConfirm: {
                                                isOpen: true,
                                                templateId: template._id || template.id,
                                                templateName: template.name
                                            }
                                        }));
                                    }}
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
                                >
                                    <FiTrash2 className="w-4 h-4" />
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // Component: Upload Modal
    const UploadModal = ({ isOpen, onClose }) => {
        const [file, setFile] = useState(null);
        const [uploading, setUploading] = useState(false);
        const [dragActive, setDragActive] = useState(false);

        const handleDrag = (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (e.type === 'dragenter' || e.type === 'dragover') {
                setDragActive(true);
            } else if (e.type === 'dragleave') {
                setDragActive(false);
            }
        };

        const handleDrop = (e) => {
            e.preventDefault();
            e.stopPropagation();
            setDragActive(false);

            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                const droppedFile = e.dataTransfer.files[0];
                if (droppedFile.type === 'application/zip' || droppedFile.name.endsWith('.zip')) {
                    setFile(droppedFile);
                } else {
                    toast.error('Please upload a ZIP file');
                }
            }
        };

        const handleFileChange = (e) => {
            if (e.target.files && e.target.files[0]) {
                const selectedFile = e.target.files[0];
                if (selectedFile.type === 'application/zip' || selectedFile.name.endsWith('.zip')) {
                    setFile(selectedFile);
                } else {
                    toast.error('Please upload a ZIP file');
                }
            }
        };

        const handleUpload = async () => {
            if (!file) {
                toast.error('Please select a file to upload');
                return;
            }

            setUploading(true);
            const success = await handleUploadTemplate(file);
            setUploading(false);

            if (success) {
                setFile(null);
                onClose();
            }
        };

        if (!isOpen) return null;

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl w-full max-w-md">
                    <div className="p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-gray-900">Upload Template</h3>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-gray-100 rounded-lg"
                                disabled={uploading}
                            >
                                <FiX className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        <div className="space-y-6">
                            {/* Upload Area */}
                            <div
                                className={`border-2 border-dashed rounded-xl p-8 text-center ${dragActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300'}`}
                                onDragEnter={handleDrag}
                                onDragLeave={handleDrag}
                                onDragOver={handleDrag}
                                onDrop={handleDrop}
                            >
                                <FiUpload className="w-12 h-12 text-gray-400 mx-auto mb-4" />

                                {file ? (
                                    <div>
                                        <p className="font-medium text-gray-900">{file.name}</p>
                                        <p className="text-sm text-gray-500 mt-1">
                                            {(file.size / 1024 / 1024).toFixed(2)} MB
                                        </p>
                                        <button
                                            onClick={() => setFile(null)}
                                            className="mt-3 text-sm text-red-600 hover:text-red-700"
                                            disabled={uploading}
                                        >
                                            Remove
                                        </button>
                                    </div>
                                ) : (
                                    <div>
                                        <p className="font-medium text-gray-900">
                                            Drag & drop your template ZIP file
                                        </p>
                                        <p className="text-sm text-gray-500 mt-1">
                                            or click to browse
                                        </p>
                                        <input
                                            type="file"
                                            accept=".zip"
                                            onChange={handleFileChange}
                                            className="hidden"
                                            id="template-upload"
                                            disabled={uploading}
                                        />
                                        <label
                                            htmlFor="template-upload"
                                            className="inline-block mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 cursor-pointer disabled:opacity-50"
                                        >
                                            Browse Files
                                        </label>
                                    </div>
                                )}
                            </div>

                            {/* Requirements */}
                            <div className="bg-gray-50 rounded-lg p-4">
                                <h4 className="font-medium text-gray-900 mb-2">Requirements:</h4>
                                <ul className="text-sm text-gray-600 space-y-1">
                                    <li className="flex items-center gap-2">
                                        <FiCheck className="w-4 h-4 text-green-500" />
                                        ZIP file containing template files
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <FiCheck className="w-4 h-4 text-green-500" />
                                        Must include template.json configuration
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <FiCheck className="w-4 h-4 text-green-500" />
                                        Maximum file size: 50MB
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <FiCheck className="w-4 h-4 text-green-500" />
                                        Supported formats: HTML, CSS, JS, images
                                    </li>
                                </ul>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={onClose}
                                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                                    disabled={uploading}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleUpload}
                                    className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2"
                                    disabled={uploading || !file}
                                >
                                    {uploading ? (
                                        <>
                                            <FiRefreshCw className="w-4 h-4 animate-spin" />
                                            Uploading...
                                        </>
                                    ) : (
                                        'Upload Template'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // Component: Bulk Action Modal
    const BulkActionModal = ({ isOpen, onClose, action }) => {
        const [confirmAction, setConfirmAction] = useState('');

        const handleConfirm = async () => {
            if (confirmAction === action) {
                await handleBulkAction(action);
                onClose();
                setConfirmAction('');
            } else {
                toast.error('Please type the action name correctly');
            }
        };

        if (!isOpen) return null;

        const actionMessages = {
            activate: 'This will activate all selected templates.',
            deactivate: 'This will deactivate all selected templates.',
            delete: 'This will permanently delete all selected templates. This action cannot be undone.',
            duplicate: 'This will duplicate all selected templates.'
        };

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl w-full max-w-md">
                    <div className="p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-gray-900">Bulk {action.charAt(0).toUpperCase() + action.slice(1)}</h3>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-gray-100 rounded-lg"
                            >
                                <FiX className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        <div className="space-y-6">
                            <div className="text-center">
                                <div className="mx-auto w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                                    <FiAlertCircle className="w-6 h-6 text-yellow-600" />
                                </div>
                                <p className="text-gray-700 mb-4">
                                    {actionMessages[action] || 'Are you sure you want to perform this action?'}
                                </p>
                                <p className="font-medium text-gray-900">
                                    {uiState.selectedTemplates.length} templates selected
                                </p>
                            </div>

                            {action === 'delete' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Type "<span className="text-red-600">delete</span>" to confirm:
                                    </label>
                                    <input
                                        type="text"
                                        value={confirmAction}
                                        onChange={(e) => setConfirmAction(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                                        placeholder="Type 'delete' here"
                                    />
                                </div>
                            )}

                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={onClose}
                                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleConfirm}
                                    className={`flex-1 px-4 py-3 rounded-lg text-white ${action === 'delete' ? 'bg-red-600 hover:bg-red-700' : 'bg-yellow-600 hover:bg-yellow-700'}`}
                                    disabled={action === 'delete' && confirmAction !== 'delete'}
                                >
                                    Confirm {action}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="px-6 py-8">
                {/* Header */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Template Management</h2>
                        <p className="text-gray-600">Manage and customize resume templates</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setUiState(prev => ({ ...prev, createModal: { isOpen: true, template: null } }))}
                            className="px-4 py-2.5 bg-indigo-600 text-white rounded-lg flex items-center gap-2 hover:bg-indigo-700"
                        >
                            <FiPlus className="w-4 h-4" />
                            Create Template
                        </button>
                        <button
                            onClick={() => setUiState(prev => ({ ...prev, uploadModal: { isOpen: true } }))}
                            className="px-4 py-2.5 bg-white border border-gray-300 rounded-lg flex items-center gap-2 hover:bg-gray-50"
                        >
                            <FiUpload className="w-4 h-4" />
                            Upload ZIP
                        </button>
                        <button
                            onClick={toggleViewMode}
                            className="px-4 py-2.5 bg-white border border-gray-300 rounded-lg flex items-center gap-2 hover:bg-gray-50"
                        >
                            {databaseState.viewMode === 'grid' ? (
                                <>
                                    <FiList className="w-4 h-4" />
                                    List View
                                </>
                            ) : (
                                <>
                                    <FiGrid className="w-4 h-4" />
                                    Grid View
                                </>
                            )}
                        </button>
                        <button
                            onClick={() => {
                                loadTemplatesFromDatabase();
                                loadStatsFromDatabase();
                            }}
                            disabled={databaseState.loading}
                            className="px-4 py-2.5 bg-white border border-gray-300 rounded-lg flex items-center gap-2 hover:bg-gray-50 disabled:opacity-50"
                        >
                            <FiRefreshCw className={databaseState.loading ? 'animate-spin' : ''} />
                            Refresh
                        </button>
                    </div>
                </div>

                {/* Database Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <StatsCard
                        title="Total Templates"
                        value={databaseState.stats.total}
                        icon={FiFileText}
                        color="bg-indigo-500"
                    />
                    <StatsCard
                        title="Active Templates"
                        value={databaseState.stats.active}
                        icon={FiCheckCircle}
                        color="bg-green-500"
                        subtitle={`${databaseState.stats.premium} premium, ${databaseState.stats.free} free`}
                    />
                    <StatsCard
                        title="Total Usage"
                        value={formatNumber(databaseState.stats.usageCount)}
                        icon={FiUsers}
                        color="bg-blue-500"
                        subtitle="Across all templates"
                    />
                    <StatsCard
                        title="New This Week"
                        value={databaseState.stats.newThisWeek}
                        icon={FiTrendingUp}
                        color="bg-purple-500"
                        subtitle="Recently added"
                    />
                </div>

                {/* Category Stats */}
                <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
                    <h3 className="font-bold text-gray-900 mb-3">Categories</h3>
                    <div className="flex flex-wrap gap-3">
                        <button
                            onClick={() => handleFilterChange('category', 'all')}
                            className={`px-4 py-2 rounded-lg ${databaseState.filters.category === 'all' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                        >
                            All Categories
                        </button>
                        {databaseState.categories.map(category => (
                            <button
                                key={category._id}
                                onClick={() => handleFilterChange('category', category._id)}
                                className={`px-4 py-2 rounded-lg ${databaseState.filters.category === category._id ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                            >
                                {category.name} ({databaseState.stats.categories[category.name] || 0})
                            </button>
                        ))}
                    </div>
                </div>

                {/* Filters & Search */}
                <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                        {/* Search */}
                        <div className="flex-1">
                            <div className="relative">
                                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    value={databaseState.filters.search}
                                    onChange={(e) => handleSearchChange(e.target.value)}
                                    placeholder="Search templates by name, description, tags..."
                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                />
                            </div>
                        </div>

                        {/* Filters */}
                        <div className="flex flex-wrap gap-2">
                            <select
                                value={databaseState.filters.status}
                                onChange={(e) => handleFilterChange('status', e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                            >
                                <option value="all">All Status</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                                <option value="draft">Draft</option>
                                <option value="archived">Archived</option>
                            </select>

                            <select
                                value={databaseState.filters.access}
                                onChange={(e) => handleFilterChange('access', e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                            >
                                <option value="all">All Access</option>
                                <option value="free">Free</option>
                                <option value="pro">Pro</option>
                                <option value="premium">Premium</option>
                            </select>

                            <select
                                value={databaseState.filters.sortBy}
                                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                            >
                                <option value="newest">Newest First</option>
                                <option value="oldest">Oldest First</option>
                                <option value="popular">Most Popular</option>
                                <option value="name_asc">Name A-Z</option>
                                <option value="name_desc">Name Z-A</option>
                            </select>
                        </div>
                    </div>

                    {/* Bulk Actions */}
                    {uiState.selectedTemplates.length > 0 && (
                        <div className="mt-4 p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="text-sm font-medium text-indigo-700">
                                        {uiState.selectedTemplates.length} templates selected
                                    </span>
                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            onClick={() => setUiState(prev => ({ ...prev, bulkActionModal: { isOpen: true, action: 'activate' } }))}
                                            className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 flex items-center gap-2"
                                        >
                                            <FiCheckCircle className="w-3 h-3" />
                                            Activate
                                        </button>
                                        <button
                                            onClick={() => setUiState(prev => ({ ...prev, bulkActionModal: { isOpen: true, action: 'deactivate' } }))}
                                            className="px-3 py-1.5 bg-yellow-600 text-white text-sm rounded-lg hover:bg-yellow-700 flex items-center gap-2"
                                        >
                                            <FiXCircle className="w-3 h-3" />
                                            Deactivate
                                        </button>
                                        <button
                                            onClick={() => setUiState(prev => ({ ...prev, bulkActionModal: { isOpen: true, action: 'duplicate' } }))}
                                            className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 flex items-center gap-2"
                                        >
                                            <FiCopy className="w-3 h-3" />
                                            Duplicate
                                        </button>
                                        <button
                                            onClick={() => setUiState(prev => ({ ...prev, bulkActionModal: { isOpen: true, action: 'delete' } }))}
                                            className="px-3 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 flex items-center gap-2"
                                        >
                                            <FiTrash2 className="w-3 h-3" />
                                            Delete
                                        </button>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setUiState(prev => ({ ...prev, selectedTemplates: [] }))}
                                    className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                                >
                                    Clear Selection
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Database Templates Display */}
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                    {databaseState.loading ? (
                        <div className="p-8 text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                            <p className="mt-3 text-gray-600">Loading templates from database...</p>
                        </div>
                    ) : databaseState.error ? (
                        <div className="p-8 text-center">
                            <FiAlertCircle className="mx-auto text-red-400 text-4xl mb-3" />
                            <p className="text-red-600">Database Error</p>
                            <p className="text-sm text-gray-400 mt-1">{databaseState.error}</p>
                            <button
                                onClick={loadTemplatesFromDatabase}
                                className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                            >
                                Retry
                            </button>
                        </div>
                    ) : databaseState.templates.length === 0 ? (
                        <div className="p-8 text-center">
                            <FiFileText className="mx-auto text-gray-400 text-4xl mb-3" />
                            <p className="text-gray-500">No templates found in database</p>
                            <p className="text-sm text-gray-400 mt-1">Try changing your filters or create a new template</p>
                            <div className="flex gap-3 justify-center mt-4">
                                <button
                                    onClick={() => setUiState(prev => ({ ...prev, createModal: { isOpen: true, template: null } }))}
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                                >
                                    Create Template
                                </button>
                                <button
                                    onClick={() => setUiState(prev => ({ ...prev, uploadModal: { isOpen: true } }))}
                                    className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                                >
                                    Upload Template
                                </button>
                            </div>
                        </div>
                    ) : databaseState.viewMode === 'grid' ? (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {databaseState.templates.map((template) => (
                                    <TemplateCard key={template._id || template.id} template={template} />
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="space-y-3">
                            {databaseState.templates.map((template) => (
                                <TemplateListItem key={template._id || template.id} template={template} />
                            ))}
                        </div>
                    )}

                    {/* Database Pagination */}
                    {databaseState.pagination.pages > 1 && databaseState.templates.length > 0 && (
                        <div className="mt-6 pt-4 border-t border-gray-200 flex items-center justify-between">
                            <div className="text-sm text-gray-700">
                                Showing <span className="font-medium">{(databaseState.pagination.page - 1) * databaseState.pagination.limit + 1}</span> to{' '}
                                <span className="font-medium">
                                    {Math.min(databaseState.pagination.page * databaseState.pagination.limit, databaseState.pagination.total)}
                                </span> of{' '}
                                <span className="font-medium">{databaseState.pagination.total}</span> templates
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handlePaginationChange(databaseState.pagination.page - 1)}
                                    disabled={databaseState.pagination.page === 1}
                                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50"
                                >
                                    Previous
                                </button>
                                {(() => {
                                    const pages = [];
                                    const maxPages = 5;
                                    let startPage = Math.max(1, databaseState.pagination.page - Math.floor(maxPages / 2));
                                    const endPage = Math.min(databaseState.pagination.pages, startPage + maxPages - 1);

                                    if (endPage - startPage + 1 < maxPages) {
                                        startPage = Math.max(1, endPage - maxPages + 1);
                                    }

                                    for (let i = startPage; i <= endPage; i++) {
                                        pages.push(
                                            <button
                                                key={i}
                                                onClick={() => handlePaginationChange(i)}
                                                className={`w-10 h-10 rounded-lg text-sm ${databaseState.pagination.page === i
                                                    ? 'bg-indigo-600 text-white'
                                                    : 'border border-gray-300 hover:bg-gray-50'
                                                    }`}
                                            >
                                                {i}
                                            </button>
                                        );
                                    }
                                    return pages;
                                })()}
                                <button
                                    onClick={() => handlePaginationChange(databaseState.pagination.page + 1)}
                                    disabled={databaseState.pagination.page === databaseState.pagination.pages}
                                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Database Modals */}
            <TemplateFormModal
                isOpen={uiState.createModal.isOpen}
                onClose={() => setUiState(prev => ({ ...prev, createModal: { isOpen: false, template: null } }))}
                mode="create"
            />

            <TemplateFormModal
                isOpen={uiState.editModal.isOpen}
                onClose={() => setUiState(prev => ({ ...prev, editModal: { isOpen: false, template: null } }))}
                template={uiState.editModal.template}
                mode="edit"
            />

            <PreviewModal
                isOpen={uiState.previewModal.isOpen}
                onClose={() => setUiState(prev => ({ ...prev, previewModal: { isOpen: false, template: null, activeImage: 0 } }))}
                template={uiState.previewModal.template}
                activeImage={uiState.previewModal.activeImage}
            />

            <UploadModal
                isOpen={uiState.uploadModal.isOpen}
                onClose={() => setUiState(prev => ({ ...prev, uploadModal: { isOpen: false } }))}
            />

            <BulkActionModal
                isOpen={uiState.bulkActionModal.isOpen}
                onClose={() => setUiState(prev => ({ ...prev, bulkActionModal: { isOpen: false, action: '' } }))}
                action={uiState.bulkActionModal.action}
            />

            {/* Delete Confirmation Modal */}
            {uiState.deleteConfirm.isOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6">
                        <div className="text-center">
                            <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                                <FiTrash2 className="w-6 h-6 text-red-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                Delete Template
                            </h3>
                            <p className="text-gray-500 mb-6">
                                Are you sure you want to delete <span className="font-medium">{uiState.deleteConfirm.templateName}</span>?
                                This action cannot be undone and will permanently remove the template from the database.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setUiState(prev => ({ ...prev, deleteConfirm: { isOpen: false, templateId: null, templateName: '' } }))}
                                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={async () => {
                                        await handleDeleteTemplate(uiState.deleteConfirm.templateId);
                                        setUiState(prev => ({ ...prev, deleteConfirm: { isOpen: false, templateId: null, templateName: '' } }));
                                    }}
                                    className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700"
                                >
                                    Delete Template
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Export Modal */}
            {uiState.exportModal.isOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6">
                        <div className="text-center">
                            <div className="mx-auto w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                                <FiDownload className="w-6 h-6 text-purple-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                Export Template
                            </h3>
                            <p className="text-gray-500 mb-6">
                                Export <span className="font-medium">{uiState.exportModal.templateName}</span> as a ZIP file?
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setUiState(prev => ({ ...prev, exportModal: { isOpen: false, templateId: null, templateName: '' } }))}
                                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={async () => {
                                        await handleExportTemplate(uiState.exportModal.templateId);
                                        setUiState(prev => ({ ...prev, exportModal: { isOpen: false, templateId: null, templateName: '' } }));
                                    }}
                                    className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                                >
                                    Export Template
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Templates;