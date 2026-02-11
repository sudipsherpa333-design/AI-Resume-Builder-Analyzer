// frontend/src/admin/pages/System.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { formatBytes, formatUptime, formatDate } from '../utils/formatters';

const System = () => {
  const [systemInfo, setSystemInfo] = useState({
    cpuUsage: 45,
    memoryUsage: 78,
    diskUsage: 62,
    uptime: 86400 * 5 + 3600 * 12, // 5 days 12 hours in seconds
    totalMemory: 8589934592, // 8 GB in bytes
    usedMemory: 6710886400, // 6.25 GB in bytes
    totalDisk: 107374182400, // 100 GB in bytes
    usedDisk: 67108864000, // 62.5 GB in bytes
    lastBackup: '2024-01-07T10:30:00Z',
    databaseSize: 536870912, // 512 MB in bytes
    cacheSize: 268435456, // 256 MB in bytes
    logsSize: 107374182, // 102 MB in bytes
    activeConnections: 42,
    avgResponseTime: 145,
    errorRate: 0.3
  });

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedLogType, setSelectedLogType] = useState('all');

  useEffect(() => {
    // Mock logs data
    setLogs([
      { id: 1, type: 'info', message: 'System startup completed', timestamp: new Date(Date.now() - 300000).toISOString() },
      { id: 2, type: 'warning', message: 'Memory usage above 75%', timestamp: new Date(Date.now() - 1800000).toISOString() },
      { id: 3, type: 'info', message: 'Backup completed successfully', timestamp: new Date(Date.now() - 7200000).toISOString() },
      { id: 4, type: 'error', message: 'Database connection timeout', timestamp: new Date(Date.now() - 14400000).toISOString() },
      { id: 5, type: 'info', message: 'Cache cleared successfully', timestamp: new Date(Date.now() - 21600000).toISOString() },
      { id: 6, type: 'warning', message: 'High CPU usage detected', timestamp: new Date(Date.now() - 28800000).toISOString() },
      { id: 7, type: 'info', message: 'User authentication service restarted', timestamp: new Date(Date.now() - 36000000).toISOString() },
      { id: 8, type: 'info', message: 'AI analysis queue processed', timestamp: new Date(Date.now() - 43200000).toISOString() }
    ]);
  }, []);

  const handleClearCache = () => {
    if (window.confirm('Are you sure you want to clear all cache?')) {
      setLoading(true);
      setTimeout(() => {
        alert('Cache cleared successfully!');
        setLoading(false);
      }, 1000);
    }
  };

  const handleRunBackup = () => {
    setLoading(true);
    setTimeout(() => {
      alert('Backup completed successfully!');
      setLoading(false);
    }, 2000);
  };

  const handleOptimizeDB = () => {
    setLoading(true);
    setTimeout(() => {
      alert('Database optimized successfully!');
      setLoading(false);
    }, 1500);
  };

  const getLogTypeColor = (type) => {
    switch (type) {
    case 'error': return 'bg-red-100 text-red-800 border-red-200';
    case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'info': return 'bg-blue-100 text-blue-800 border-blue-200';
    default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const filteredLogs = selectedLogType === 'all'
    ? logs
    : logs.filter(log => log.type === selectedLogType);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/admin/dashboard" className="text-slate-600 hover:text-blue-600 flex items-center">
                <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                                Back to Dashboard
              </Link>
              <h1 className="text-2xl font-bold text-slate-900">System Management</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="p-4 md:p-6">
        {/* System Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* CPU Usage */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">CPU Usage</h3>
              <span className="text-2xl font-bold text-blue-600">{systemInfo.cpuUsage}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2.5">
              <div
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${systemInfo.cpuUsage}%` }}
              ></div>
            </div>
            <p className="text-sm text-slate-500 mt-2">Processor load across all cores</p>
          </div>

          {/* Memory Usage */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">Memory</h3>
              <span className="text-2xl font-bold text-green-600">{systemInfo.memoryUsage}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2.5">
              <div
                className="bg-gradient-to-r from-green-500 to-green-600 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${systemInfo.memoryUsage}%` }}
              ></div>
            </div>
            <p className="text-sm text-slate-500 mt-2">
              {formatBytes(systemInfo.usedMemory)} / {formatBytes(systemInfo.totalMemory)}
            </p>
          </div>

          {/* Disk Usage */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">Disk Space</h3>
              <span className="text-2xl font-bold text-purple-600">{systemInfo.diskUsage}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2.5">
              <div
                className="bg-gradient-to-r from-purple-500 to-purple-600 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${systemInfo.diskUsage}%` }}
              ></div>
            </div>
            <p className="text-sm text-slate-500 mt-2">
              {formatBytes(systemInfo.usedDisk)} / {formatBytes(systemInfo.totalDisk)}
            </p>
          </div>
        </div>

        {/* System Information Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Uptime</p>
                <p className="text-lg font-bold text-slate-900">{formatUptime(systemInfo.uptime)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Database Size</p>
                <p className="text-lg font-bold text-slate-900">{formatBytes(systemInfo.databaseSize)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Cache Size</p>
                <p className="text-lg font-bold text-slate-900">{formatBytes(systemInfo.cacheSize)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Logs Size</p>
                <p className="text-lg font-bold text-slate-900">{formatBytes(systemInfo.logsSize)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* System Actions */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-8">
          <h2 className="text-xl font-bold text-slate-900 mb-6">System Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={handleClearCache}
              disabled={loading}
              className="p-4 bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded-lg transition-colors disabled:opacity-50"
            >
              <div className="flex items-center">
                <svg className="w-6 h-6 text-orange-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <div className="text-left">
                  <h3 className="font-semibold text-orange-800">Clear Cache</h3>
                  <p className="text-sm text-orange-600">Remove temporary cached data</p>
                </div>
              </div>
            </button>

            <button
              onClick={handleRunBackup}
              disabled={loading}
              className="p-4 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors disabled:opacity-50"
            >
              <div className="flex items-center">
                <svg className="w-6 h-6 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
                <div className="text-left">
                  <h3 className="font-semibold text-blue-800">Run Backup</h3>
                  <p className="text-sm text-blue-600">Create system backup</p>
                </div>
              </div>
            </button>

            <button
              onClick={handleOptimizeDB}
              disabled={loading}
              className="p-4 bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg transition-colors disabled:opacity-50"
            >
              <div className="flex items-center">
                <svg className="w-6 h-6 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <div className="text-left">
                  <h3 className="font-semibold text-green-800">Optimize Database</h3>
                  <p className="text-sm text-green-600">Clean and optimize database</p>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* System Logs */}
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="px-6 py-4 border-b border-slate-200">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <h2 className="text-xl font-bold text-slate-900">System Logs</h2>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-slate-600">Filter:</span>
                  <select
                    value={selectedLogType}
                    onChange={(e) => setSelectedLogType(e.target.value)}
                    className="border border-slate-300 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Logs</option>
                    <option value="info">Info</option>
                    <option value="warning">Warnings</option>
                    <option value="error">Errors</option>
                  </select>
                </div>
                <button className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors">
                                    Download Logs
                </button>
              </div>
            </div>
          </div>

          <div className="p-6">
            {filteredLogs.length === 0 ? (
              <div className="text-center py-8">
                <svg className="w-12 h-12 text-slate-300 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="mt-4 text-slate-500">No logs found for selected filter</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredLogs.map((log) => (
                  <div
                    key={log.id}
                    className={`flex items-start p-4 rounded-lg border ${getLogTypeColor(log.type)}`}
                  >
                    <div className="flex-shrink-0 mr-3">
                      {log.type === 'error' && (
                        <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      )}
                      {log.type === 'warning' && (
                        <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      )}
                      {log.type === 'info' && (
                        <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{log.message}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        {formatDate(log.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default System;