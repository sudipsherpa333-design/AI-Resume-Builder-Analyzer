// frontend/src/admin/pages/Logs.jsx
import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Download,
  RefreshCw,
  Trash2,
  Eye,
  EyeOff,
  Calendar,
  Clock,
  User,
  FileText,
  AlertTriangle,
  Info,
  XCircle,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Copy,
  ExternalLink,
  Terminal,
  Server,
  Database,
  Network,
  HardDrive,
  Shield
} from 'lucide-react';
import adminApi from '../services/adminApi.js';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';

const Logs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [filters, setFilters] = useState({
    level: '',
    resource: '',
    adminId: '',
    dateRange: {
      start: '',
      end: ''
    },
    search: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 1
  });
  const [expandedLogs, setExpandedLogs] = useState({});
  const [selectedLogs, setSelectedLogs] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    byLevel: {},
    byResource: {},
    today: 0,
    errors: 0
  });

  // Log levels with colors
  const logLevels = [
    { value: 'ERROR', label: 'Error', color: 'bg-red-100 text-red-800', icon: XCircle },
    { value: 'WARN', label: 'Warning', color: 'bg-yellow-100 text-yellow-800', icon: AlertTriangle },
    { value: 'INFO', label: 'Info', color: 'bg-blue-100 text-blue-800', icon: Info },
    { value: 'DEBUG', label: 'Debug', color: 'bg-gray-100 text-gray-800', icon: Terminal },
    { value: 'SECURITY', label: 'Security', color: 'bg-purple-100 text-purple-800', icon: Shield }
  ];

  // Resource types
  const resourceTypes = [
    { value: 'USER', label: 'Users', icon: User },
    { value: 'RESUME', label: 'Resumes', icon: FileText },
    { value: 'ADMIN', label: 'Admins', icon: Shield },
    { value: 'SYSTEM', label: 'System', icon: Server },
    { value: 'DATABASE', label: 'Database', icon: Database },
    { value: 'NETWORK', label: 'Network', icon: Network },
    { value: 'STORAGE', label: 'Storage', icon: HardDrive }
  ];

  // Fetch logs
  const fetchLogs = async (page = 1, append = false) => {
    try {
      if (page === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
        ...(filters.level && { level: filters.level }),
        ...(filters.resource && { resource: filters.resource }),
        ...(filters.adminId && { adminId: filters.adminId }),
        ...(filters.dateRange.start && { startDate: filters.dateRange.start }),
        ...(filters.dateRange.end && { endDate: filters.dateRange.end }),
        ...(filters.search && { search: filters.search })
      });

      const response = await adminApi.get(`/admin/logs?${params}`);
      const data = response.data.data;

      if (append) {
        setLogs(prev => [...prev, ...data.logs]);
      } else {
        setLogs(data.logs);
      }

      setPagination({
        page: data.page,
        limit: data.limit,
        total: data.total,
        totalPages: data.totalPages
      });

    } catch (error) {
      console.error('Failed to fetch logs:', error);
      toast.error('Failed to load logs');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Fetch log statistics
  const fetchStats = async () => {
    try {
      const response = await adminApi.get('/admin/logs/stats');
      setStats(response.data.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  useEffect(() => {
    fetchLogs();
    fetchStats();
  }, []);

  // Auto refresh
  useEffect(() => {
    let interval;
    if (autoRefresh) {
      interval = setInterval(() => {
        fetchLogs(1, false);
        fetchStats();
      }, 30000); // Refresh every 30 seconds
    }
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [autoRefresh]);

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleDateRangeChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      dateRange: {
        ...prev.dateRange,
        [key]: value
      }
    }));
  };

  // Apply filters
  const applyFilters = () => {
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchLogs(1, false);
    fetchStats();
  };

  // Clear filters
  const clearFilters = () => {
    setFilters({
      level: '',
      resource: '',
      adminId: '',
      dateRange: {
        start: '',
        end: ''
      },
      search: ''
    });
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchLogs(1, false);
    fetchStats();
  };

  // Toggle log expansion
  const toggleLogExpansion = (logId) => {
    setExpandedLogs(prev => ({
      ...prev,
      [logId]: !prev[logId]
    }));
  };

  // Toggle log selection
  const toggleLogSelection = (logId) => {
    setSelectedLogs(prev =>
      prev.includes(logId)
        ? prev.filter(id => id !== logId)
        : [...prev, logId]
    );
  };

  // Select all logs
  const selectAllLogs = () => {
    if (selectedLogs.length === logs.length) {
      setSelectedLogs([]);
    } else {
      setSelectedLogs(logs.map(log => log._id));
    }
  };

  // Load more logs
  const loadMoreLogs = () => {
    if (pagination.page < pagination.totalPages) {
      const nextPage = pagination.page + 1;
      setPagination(prev => ({ ...prev, page: nextPage }));
      fetchLogs(nextPage, true);
    }
  };

  // Download logs
  const handleDownloadLogs = async (format = 'json') => {
    try {
      const response = await adminApi.get('/admin/logs/export', {
        params: {
          format,
          logIds: selectedLogs.length > 0 ? selectedLogs.join(',') : undefined,
          ...filters
        },
        responseType: 'blob'
      });

      const blob = new Blob([response.data], { type: response.headers['content-type'] });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `logs-${format}-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success(`Logs downloaded as ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Failed to download logs:', error);
      toast.error('Failed to download logs');
    }
  };

  // Delete selected logs
  const handleDeleteLogs = async () => {
    if (!selectedLogs.length) {
      toast.error('No logs selected');
      return;
    }

    if (!window.confirm(`Delete ${selectedLogs.length} selected log(s)? This action cannot be undone.`)) {
      return;
    }

    try {
      await adminApi.delete('/admin/logs', {
        data: { logIds: selectedLogs }
      });

      toast.success(`${selectedLogs.length} log(s) deleted`);
      setSelectedLogs([]);
      fetchLogs();
      fetchStats();
    } catch (error) {
      console.error('Failed to delete logs:', error);
      toast.error('Failed to delete logs');
    }
  };

  // Clear all logs
  const handleClearAllLogs = async () => {
    if (!window.confirm('Clear all logs? This action cannot be undone.')) {
      return;
    }

    try {
      await adminApi.delete('/admin/logs/all');
      toast.success('All logs cleared');
      setLogs([]);
      setSelectedLogs([]);
      fetchStats();
    } catch (error) {
      console.error('Failed to clear logs:', error);
      toast.error('Failed to clear logs');
    }
  };

  // Copy log details
  const copyLogDetails = (log) => {
    const details = JSON.stringify(log, null, 2);
    navigator.clipboard.writeText(details);
    toast.success('Log details copied to clipboard');
  };

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return {
      date: format(date, 'MMM d, yyyy'),
      time: format(date, 'HH:mm:ss'),
      full: format(date, 'PPpp')
    };
  };

  // Get log level icon
  const getLogLevelIcon = (level) => {
    const levelConfig = logLevels.find(l => l.value === level);
    return levelConfig ? levelConfig.icon : Info;
  };

  // Get resource icon
  const getResourceIcon = (resource) => {
    const resourceConfig = resourceTypes.find(r => r.value === resource);
    return resourceConfig ? resourceConfig.icon : FileText;
  };

  if (loading && pagination.page === 1) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Logs</h1>
          <p className="text-gray-600">Monitor and analyze system activities and events</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-4 py-2 rounded-lg flex items-center ${autoRefresh
              ? 'bg-green-600 hover:bg-green-700 text-white'
              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            {autoRefresh ? 'Auto Refresh ON' : 'Auto Refresh OFF'}
          </button>
          <button
            onClick={fetchLogs}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
                        Refresh
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-sm text-gray-500">Total</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">
            {stats.total?.toLocaleString() || '0'}
          </h3>
          <p className="text-sm text-gray-600">Log Entries</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-red-50 rounded-lg">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
            <span className="text-sm text-gray-500">Errors</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">
            {stats.errors?.toLocaleString() || '0'}
          </h3>
          <p className="text-sm text-gray-600">Error Count</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-green-50 rounded-lg">
              <Calendar className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-sm text-gray-500">Today</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">
            {stats.today?.toLocaleString() || '0'}
          </h3>
          <p className="text-sm text-gray-600">Today's Logs</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-purple-50 rounded-lg">
              <Shield className="w-6 h-6 text-purple-600" />
            </div>
            <span className="text-sm text-gray-500">Security</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">
            {stats.byLevel?.SECURITY?.toLocaleString() || '0'}
          </h3>
          <p className="text-sm text-gray-600">Security Events</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search logs..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && applyFilters()}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center"
              >
                <Filter className="w-4 h-4 mr-2" />
                                Filters
                {showFilters ? (
                  <ChevronUp className="w-4 h-4 ml-2" />
                ) : (
                  <ChevronDown className="w-4 h-4 ml-2" />
                )}
              </button>
              <button
                onClick={applyFilters}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                                Apply
              </button>
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                                Clear
              </button>
            </div>
          </div>

          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Log Level
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={filters.level}
                    onChange={(e) => handleFilterChange('level', e.target.value)}
                  >
                    <option value="">All Levels</option>
                    {logLevels.map(level => (
                      <option key={level.value} value={level.value}>
                        {level.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Resource Type
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={filters.resource}
                    onChange={(e) => handleFilterChange('resource', e.target.value)}
                  >
                    <option value="">All Resources</option>
                    {resourceTypes.map(resource => (
                      <option key={resource.value} value={resource.value}>
                        {resource.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Start Date
                  </label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={filters.dateRange.start}
                    onChange={(e) => handleDateRangeChange('start', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                        End Date
                  </label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={filters.dateRange.end}
                    onChange={(e) => handleDateRangeChange('end', e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Batch Actions */}
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                className="h-4 w-4 text-blue-600 rounded border-gray-300"
                checked={selectedLogs.length === logs.length && logs.length > 0}
                onChange={selectAllLogs}
                disabled={logs.length === 0}
              />
              <span className="ml-2 text-sm text-gray-700">
                {selectedLogs.length} of {logs.length} selected
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedLogs.length > 0 && (
                <>
                  <button
                    onClick={() => handleDownloadLogs('json')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center text-sm"
                  >
                    <Download className="w-4 h-4 mr-2" />
                                        Export JSON
                  </button>
                  <button
                    onClick={() => handleDownloadLogs('csv')}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center text-sm"
                  >
                    <Download className="w-4 h-4 mr-2" />
                                        Export CSV
                  </button>
                  <button
                    onClick={handleDeleteLogs}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center text-sm"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                                        Delete Selected
                  </button>
                </>
              )}
              <button
                onClick={handleClearAllLogs}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center text-sm"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                                Clear All Logs
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {logs.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No logs found</p>
            {Object.values(filters).some(filter => filter !== '') && (
              <button
                onClick={clearFilters}
                className="mt-2 text-blue-600 hover:text-blue-800"
              >
                                Clear filters to see all logs
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 rounded border-gray-300"
                      checked={selectedLogs.length === logs.length}
                      onChange={selectAllLogs}
                    />
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Level
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Message
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Resource
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Admin
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Timestamp
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {logs.map((log) => {
                  const LevelIcon = getLogLevelIcon(log.level);
                  const ResourceIcon = getResourceIcon(log.resource);
                  const timeInfo = formatTimestamp(log.timestamp);
                  const isExpanded = expandedLogs[log._id];
                  const isSelected = selectedLogs.includes(log._id);
                  const levelConfig = logLevels.find(l => l.value === log.level);

                  return (
                    <React.Fragment key={log._id}>
                      <tr className={`hover:bg-gray-50 ${isSelected ? 'bg-blue-50' : ''}`}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            className="h-4 w-4 text-blue-600 rounded border-gray-300"
                            checked={isSelected}
                            onChange={() => toggleLogSelection(log._id)}
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${levelConfig?.color || 'bg-gray-100 text-gray-800'}`}>
                            <LevelIcon className="w-3 h-3 mr-1" />
                            {log.level}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 max-w-md truncate">
                            {log.message || log.action}
                          </div>
                          {log.details && (
                            <div className="text-xs text-gray-500 truncate">
                              {log.details}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <ResourceIcon className="w-4 h-4 text-gray-400 mr-2" />
                            <span className="text-sm text-gray-900">
                              {log.resource}
                            </span>
                            {log.resourceId && (
                              <span className="text-xs text-gray-500 ml-1">
                                                                (#{log.resourceId})
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {log.adminId?.name || 'System'}
                          </div>
                          <div className="text-xs text-gray-500">
                            {log.adminId?.email || ''}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{timeInfo.date}</div>
                          <div className="text-xs text-gray-500">{timeInfo.time}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => toggleLogExpansion(log._id)}
                              className="text-blue-600 hover:text-blue-900"
                              title={isExpanded ? 'Collapse' : 'Expand'}
                            >
                              {isExpanded ? (
                                <EyeOff className="w-4 h-4" />
                              ) : (
                                <Eye className="w-4 h-4" />
                              )}
                            </button>
                            <button
                              onClick={() => copyLogDetails(log)}
                              className="text-gray-600 hover:text-gray-900"
                              title="Copy details"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                            {log.ipAddress && (
                              <button
                                onClick={() => {
                                  // Handle IP lookup or show more info
                                }}
                                className="text-purple-600 hover:text-purple-900"
                                title="IP Address Info"
                              >
                                <Network className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>

                      {/* Expanded Details */}
                      {isExpanded && (
                        <tr className="bg-gray-50">
                          <td colSpan="7" className="px-6 py-4">
                            <div className="bg-white border border-gray-200 rounded-lg p-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Log Details</h4>
                                  <div className="space-y-2">
                                    <div>
                                      <span className="text-xs text-gray-500">Action:</span>
                                      <p className="text-sm text-gray-900">{log.action}</p>
                                    </div>
                                    {log.message && (
                                      <div>
                                        <span className="text-xs text-gray-500">Message:</span>
                                        <p className="text-sm text-gray-900">{log.message}</p>
                                      </div>
                                    )}
                                    {log.details && (
                                      <div>
                                        <span className="text-xs text-gray-500">Details:</span>
                                        <p className="text-sm text-gray-900 whitespace-pre-wrap">{log.details}</p>
                                      </div>
                                    )}
                                    {log.changes && (
                                      <div>
                                        <span className="text-xs text-gray-500">Changes:</span>
                                        <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-auto">
                                          {JSON.stringify(log.changes, null, 2)}
                                        </pre>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                <div>
                                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Metadata</h4>
                                  <div className="space-y-2">
                                    <div className="grid grid-cols-2 gap-2">
                                      <div>
                                        <span className="text-xs text-gray-500">Log ID:</span>
                                        <p className="text-sm text-gray-900 truncate">{log._id}</p>
                                      </div>
                                      <div>
                                        <span className="text-xs text-gray-500">Full Time:</span>
                                        <p className="text-sm text-gray-900">{timeInfo.full}</p>
                                      </div>
                                    </div>
                                    {log.ipAddress && (
                                      <div>
                                        <span className="text-xs text-gray-500">IP Address:</span>
                                        <p className="text-sm text-gray-900">{log.ipAddress}</p>
                                      </div>
                                    )}
                                    {log.userAgent && (
                                      <div>
                                        <span className="text-xs text-gray-500">User Agent:</span>
                                        <p className="text-sm text-gray-900 text-xs truncate">{log.userAgent}</p>
                                      </div>
                                    )}
                                    {log.endpoint && (
                                      <div>
                                        <span className="text-xs text-gray-500">Endpoint:</span>
                                        <p className="text-sm text-gray-900">{log.endpoint}</p>
                                      </div>
                                    )}
                                    {log.method && (
                                      <div>
                                        <span className="text-xs text-gray-500">HTTP Method:</span>
                                        <p className="text-sm text-gray-900">{log.method}</p>
                                      </div>
                                    )}
                                    {log.statusCode && (
                                      <div>
                                        <span className="text-xs text-gray-500">Status Code:</span>
                                        <span className={`px-2 py-1 text-xs rounded-full ${log.statusCode >= 400
                                          ? 'bg-red-100 text-red-800'
                                          : log.statusCode >= 300
                                            ? 'bg-yellow-100 text-yellow-800'
                                            : 'bg-green-100 text-green-800'
                                        }`}>
                                          {log.statusCode}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Load More */}
        {pagination.page < pagination.totalPages && (
          <div className="p-4 border-t border-gray-200 text-center">
            <button
              onClick={loadMoreLogs}
              disabled={loadingMore}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center mx-auto"
            >
              {loadingMore ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Loading...
                </>
              ) : (
                <>
                                    Load More ({pagination.total - (pagination.page * pagination.limit)} remaining)
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Statistics Summary */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Log Statistics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Distribution by Level</h4>
            <div className="space-y-3">
              {logLevels.map(level => {
                const count = stats.byLevel?.[level.value] || 0;
                const percentage = stats.total ? (count / stats.total) * 100 : 0;

                return (
                  <div key={level.value} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <div className="flex items-center">
                        <level.icon className="w-4 h-4 mr-2" />
                        <span className="text-gray-700">{level.label}</span>
                      </div>
                      <span className="text-gray-900 font-medium">
                        {count.toLocaleString()} ({percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${level.color.split(' ')[0]}`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Distribution by Resource</h4>
            <div className="space-y-3">
              {resourceTypes.map(resource => {
                const count = stats.byResource?.[resource.value] || 0;
                const percentage = stats.total ? (count / stats.total) * 100 : 0;

                return (
                  <div key={resource.value} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <div className="flex items-center">
                        <resource.icon className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="text-gray-700">{resource.label}</span>
                      </div>
                      <span className="text-gray-900 font-medium">
                        {count.toLocaleString()} ({percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 rounded-full"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => {
              const today = new Date().toISOString().split('T')[0];
              setFilters(prev => ({
                ...prev,
                dateRange: {
                  start: today,
                  end: today
                }
              }));
              applyFilters();
            }}
            className="px-4 py-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 flex items-center justify-center"
          >
            <Calendar className="w-5 h-5 mr-2" />
                        Today's Logs
          </button>
          <button
            onClick={() => {
              handleFilterChange('level', 'ERROR');
              applyFilters();
            }}
            className="px-4 py-3 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 flex items-center justify-center"
          >
            <XCircle className="w-5 h-5 mr-2" />
                        View Errors Only
          </button>
          <button
            onClick={() => handleDownloadLogs('json')}
            className="px-4 py-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 flex items-center justify-center"
          >
            <Download className="w-5 h-5 mr-2" />
                        Export All Logs
          </button>
        </div>
      </div>
    </div>
  );
};

export default Logs;