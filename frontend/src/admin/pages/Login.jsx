import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useAdmin } from '../context/AdminContext';
import {
    Lock,
    Mail,
    Eye,
    EyeOff,
    LogIn,
    Shield,
    AlertCircle,
    Loader2,
    Building2,
    Server,
    Database,
    Activity,
    Terminal,
    RefreshCw,
    Wifi,
    WifiOff,
    Key,
    User,
    Cpu,
    HardDrive,
    Clock,
    CheckCircle,
    XCircle,
    AlertTriangle,
    ExternalLink,
    BarChart3,
    Users,
    FileText,
    LayoutTemplate
} from 'lucide-react';

const AdminLogin = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const {
        admin,
        login,
        loading: authLoading,
        error: authError,
        backendStatus,
        connectionInfo,
        dashboardStats,
        testConnection,
        clearError,
        isAuthenticated,
        fetchDashboardStats,
        fetchRecentActivity,
        fetchUsers,
        fetchTemplates,
        fetchResumes
    } = useAdmin();

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        rememberMe: true
    });
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const [showDebug, setShowDebug] = useState(false);
    const [showStats, setShowStats] = useState(false);
    const [testingConnection, setTestingConnection] = useState(false);
    const [loginAttempts, setLoginAttempts] = useState(0);
    const [lastAttemptTime, setLastAttemptTime] = useState(null);
    const [backendHealth, setBackendHealth] = useState(null);
    const [statsData, setStatsData] = useState(null);

    const from = location.state?.from?.pathname || '/admin/dashboard';

    // Check if already authenticated and redirect
    useEffect(() => {
        if (isAuthenticated && admin) {
            navigate(from, { replace: true });
        }
    }, [isAuthenticated, admin, navigate, from]);

    // Clear any existing errors on mount
    useEffect(() => {
        clearError();

        // Pre-fill demo credentials in development
        if (process.env.NODE_ENV === 'development') {
            setFormData({
                email: process.env.REACT_APP_ADMIN_EMAIL || 'admin@resume.ai',
                password: process.env.REACT_APP_ADMIN_PASSWORD || 'admin123',
                rememberMe: true
            });
        }
    }, [clearError]);

    // Load backend health data
    useEffect(() => {
        const loadBackendHealth = async () => {
            try {
                const response = await fetch('http://localhost:5001/health');
                if (response.ok) {
                    const data = await response.json();
                    setBackendHealth(data);
                }
            } catch (error) {
                console.log('Failed to fetch backend health:', error);
            }
        };

        if (backendStatus === 'online') {
            loadBackendHealth();
        }
    }, [backendStatus]);

    // Load stats if authenticated
    useEffect(() => {
        const loadStats = async () => {
            if (admin && backendStatus === 'online') {
                try {
                    const [stats, users, templates, resumes] = await Promise.all([
                        fetchDashboardStats(),
                        fetchUsers({ page: 1, limit: 5 }),
                        fetchTemplates({ page: 1, limit: 4 }),
                        fetchResumes({ page: 1, limit: 5 })
                    ]);

                    setStatsData({
                        stats,
                        users: users?.data?.users || [],
                        templates: templates?.data?.templates || [],
                        resumes: resumes?.data?.resumes || [],
                        timestamp: new Date().toISOString()
                    });
                } catch (error) {
                    console.error('Failed to load stats:', error);
                }
            }
        };

        loadStats();
    }, [admin, backendStatus, fetchDashboardStats, fetchUsers, fetchTemplates, fetchResumes]);

    // Rate limiting: Reset attempts after 5 minutes
    useEffect(() => {
        if (loginAttempts > 0) {
            const timer = setTimeout(() => {
                setLoginAttempts(0);
                setLastAttemptTime(null);
            }, 5 * 60 * 1000); // 5 minutes
            return () => clearTimeout(timer);
        }
    }, [loginAttempts]);

    const validateForm = useCallback(() => {
        const newErrors = {};

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [formData.email, formData.password]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        // Check rate limiting
        const now = Date.now();
        if (loginAttempts >= 5 && lastAttemptTime && (now - lastAttemptTime < 5 * 60 * 1000)) {
            toast.error('Too many login attempts. Please wait 5 minutes.', {
                icon: '⏳',
                duration: 4000
            });
            return;
        }

        setErrors({});

        console.log('🔐 Attempting admin login...', {
            email: formData.email,
            timestamp: new Date().toISOString(),
            clientInfo: {
                version: process.env.REACT_APP_VERSION,
                userAgent: navigator.userAgent
            }
        });

        const result = await login(formData.email, formData.password, formData.rememberMe);

        if (result.success) {
            setLoginAttempts(0);
            setLastAttemptTime(null);

            toast.success('Login successful! Welcome back.', {
                icon: '✅',
                duration: 3000,
                style: {
                    background: '#10B981',
                    color: 'white',
                }
            });

            // Log successful login
            console.log('✅ Admin login successful:', {
                email: formData.email,
                timestamp: new Date().toISOString(),
                user: result.user,
                redirectTo: from
            });

            // Load initial data
            try {
                await Promise.all([
                    fetchDashboardStats(),
                    fetchRecentActivity(),
                    fetchUsers({ page: 1, limit: 10 }),
                    fetchTemplates({ page: 1, limit: 12 }),
                    fetchResumes({ page: 1, limit: 10 })
                ]);
            } catch (error) {
                console.warn('Some data failed to load:', error);
            }

            // Navigate after short delay
            setTimeout(() => {
                navigate(from, { replace: true });
            }, 500);
        } else {
            // Increment failed attempts
            const newAttempts = loginAttempts + 1;
            setLoginAttempts(newAttempts);
            setLastAttemptTime(Date.now());

            // Show appropriate error message
            const errorMessage = result.error || 'Login failed. Please check your credentials.';

            toast.error(errorMessage, {
                icon: '❌',
                duration: 4000,
                style: {
                    background: '#EF4444',
                    color: 'white',
                }
            });

            console.warn('❌ Admin login failed:', {
                email: formData.email,
                attempts: newAttempts,
                error: errorMessage,
                timestamp: new Date().toISOString()
            });

            if (newAttempts >= 3) {
                toast.warning(`You have ${5 - newAttempts} attempts remaining`, {
                    icon: '⚠️',
                    duration: 3000
                });
            }
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));

        // Clear field-specific errors
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: undefined }));
        }
    };

    const handleTestConnection = async () => {
        setTestingConnection(true);
        try {
            const result = await testConnection();

            if (result) {
                toast.success('Backend connection successful!', {
                    icon: '✅',
                    duration: 2000
                });
            }
        } catch (error) {
            toast.error('Failed to connect to backend', {
                icon: '❌',
                duration: 3000
            });
        } finally {
            setTestingConnection(false);
        }
    };

    const openBackendHealth = () => {
        window.open('http://localhost:5001/health', '_blank');
    };

    const openBackendDocs = () => {
        window.open('http://localhost:5001/api/docs', '_blank');
    };

    const openAdminTest = () => {
        window.open('http://localhost:5001/admin/test', '_blank');
    };

    const openBackendURL = () => {
        window.open('http://localhost:5001', '_blank');
    };

    // Format time since last attempt
    const getTimeSinceLastAttempt = () => {
        if (!lastAttemptTime) return null;

        const now = Date.now();
        const diff = now - lastAttemptTime;
        const minutes = Math.floor(diff / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);

        return `${minutes}m ${seconds}s`;
    };

    // Get connection status color
    const getStatusColor = (status) => {
        switch (status) {
            case 'online': return 'text-green-600 dark:text-green-400';
            case 'offline': return 'text-red-600 dark:text-red-400';
            case 'checking': return 'text-yellow-600 dark:text-yellow-400';
            default: return 'text-gray-600 dark:text-gray-400';
        }
    };

    // Get status icon
    const getStatusIcon = (status) => {
        switch (status) {
            case 'online': return <Wifi className="w-4 h-4" />;
            case 'offline': return <WifiOff className="w-4 h-4" />;
            case 'checking': return <Loader2 className="w-4 h-4 animate-spin" />;
            default: return <AlertCircle className="w-4 h-4" />;
        }
    };

    // Get status text
    const getStatusText = (status) => {
        switch (status) {
            case 'online': return '✅ Connected to backend';
            case 'offline': return '❌ Backend connection failed';
            case 'checking': return '🔄 Checking connection...';
            default: return '⚡ Connection status unknown';
        }
    };

    // Get health status component
    const renderHealthStatus = () => {
        if (!backendHealth) return null;

        const isHealthy = backendHealth.status === 'healthy';
        return (
            <div className="flex items-center gap-2">
                {isHealthy ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                    <XCircle className="w-4 h-4 text-red-500" />
                )}
                <span className={`text-sm ${isHealthy ? 'text-green-600' : 'text-red-600'}`}>
                    {backendHealth.status}
                </span>
            </div>
        );
    };

    // Render system stats
    const renderSystemStats = () => {
        if (!backendHealth) return null;

        return (
            <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                    <Database className="w-3 h-3" />
                    <span>DB: {backendHealth.database}</span>
                </div>
                <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                    <HardDrive className="w-3 h-3" />
                    <span>Memory: {backendHealth.memory?.heapUsed}MB</span>
                </div>
                <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                    <Clock className="w-3 h-3" />
                    <span>Uptime: {Math.floor(backendHealth.uptime / 60)}min</span>
                </div>
                <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                    <Server className="w-3 h-3" />
                    <span>Env: {backendHealth.environment}</span>
                </div>
            </div>
        );
    };

    // Render live stats
    const renderLiveStats = () => {
        if (!statsData) return null;

        const { stats, users = [], templates = [], resumes = [] } = statsData;

        return (
            <div className="space-y-3">
                {/* Stats Summary */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-100 dark:border-blue-800 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Users</span>
                            </div>
                            <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                                {stats?.data?.totalUsers || users.length}
                            </span>
                        </div>
                        {stats?.data?.activeUsers && (
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {stats.data.activeUsers} active
                            </div>
                        )}
                    </div>

                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-100 dark:border-green-800 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <FileText className="w-4 h-4 text-green-600 dark:text-green-400" />
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Resumes</span>
                            </div>
                            <span className="text-xl font-bold text-green-600 dark:text-green-400">
                                {stats?.data?.totalResumes || resumes.length}
                            </span>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 border border-purple-100 dark:border-purple-800 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <LayoutTemplate className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Templates</span>
                            </div>
                            <span className="text-xl font-bold text-purple-600 dark:text-purple-400">
                                {templates.length}
                            </span>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-100 dark:border-amber-800 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <BarChart3 className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Health</span>
                            </div>
                            <span className="text-xl font-bold text-amber-600 dark:text-amber-400">
                                {stats?.data?.systemHealth || '98'}%
                            </span>
                        </div>
                    </div>
                </div>

                {/* Recent Users */}
                {users.length > 0 && (
                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                        <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Recent Users</h4>
                        <div className="space-y-2">
                            {users.slice(0, 3).map((user, index) => (
                                <div key={index} className="flex items-center justify-between text-sm">
                                    <span className="truncate">{user.name || user.email}</span>
                                    <span className="text-xs text-gray-500">
                                        {new Date(user.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
            <div className="w-full max-w-md">
                {/* Connection Status Banner */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`mb-4 p-4 rounded-xl border ${backendStatus === 'online'
                        ? 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10 border-green-200 dark:border-green-800'
                        : backendStatus === 'offline'
                            ? 'bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/10 dark:to-rose-900/10 border-red-200 dark:border-red-800'
                            : 'bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/10 dark:to-amber-900/10 border-yellow-200 dark:border-yellow-800'
                        }`}
                >
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            {getStatusIcon(backendStatus)}
                            <span className={`text-sm font-medium ${getStatusColor(backendStatus)}`}>
                                {getStatusText(backendStatus)}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleTestConnection}
                                disabled={testingConnection}
                                className="text-xs px-3 py-1.5 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                            >
                                {testingConnection ? (
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                    <RefreshCw className="w-3 h-3" />
                                )}
                                <span>{testingConnection ? 'Testing...' : 'Test'}</span>
                            </button>
                        </div>
                    </div>

                    {/* Connection details */}
                    {connectionInfo && (
                        <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                            <div className="flex items-center justify-between">
                                <span>Response Time:</span>
                                <span className="font-medium">
                                    {connectionInfo.responseTime || '--'}ms
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span>Last Checked:</span>
                                <span>
                                    {new Date(connectionInfo.lastChecked || Date.now()).toLocaleTimeString()}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Backend Health */}
                    {backendHealth && backendStatus === 'online' && (
                        <div className="mt-2 pt-2 border-t border-green-200 dark:border-green-800">
                            {renderHealthStatus()}
                            {renderSystemStats()}
                        </div>
                    )}
                </motion.div>

                {/* Stats Panel */}
                {showStats && admin && backendStatus === 'online' && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mb-4 p-4 bg-white dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                <BarChart3 className="w-4 h-4" />
                                Live Stats
                            </h3>
                            <button
                                onClick={() => setShowStats(false)}
                                className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                            >
                                Hide
                            </button>
                        </div>
                        {renderLiveStats()}
                    </motion.div>
                )}

                {/* Debug Panel */}
                {showDebug && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mb-4 p-4 bg-gray-50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                <Terminal className="w-4 h-4" />
                                Debug Information
                            </h3>
                            <button
                                onClick={() => setShowDebug(false)}
                                className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                            >
                                Hide
                            </button>
                        </div>

                        <div className="space-y-3 text-sm">
                            <div className="grid grid-cols-2 gap-2">
                                <div className="p-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700">
                                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Frontend</div>
                                    <div className="font-mono text-xs truncate" title={window.location.origin}>
                                        {window.location.origin}
                                    </div>
                                </div>
                                <div className="p-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700">
                                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Backend</div>
                                    <div className="font-mono text-xs truncate">http://localhost:5001</div>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                <button
                                    onClick={openBackendURL}
                                    className="text-xs px-3 py-1.5 bg-blue-100 dark:bg-blue-800/30 border border-blue-200 dark:border-blue-700 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-700/50 transition-colors flex items-center gap-1"
                                >
                                    <ExternalLink className="w-3 h-3" />
                                    Backend Home
                                </button>
                                <button
                                    onClick={openBackendHealth}
                                    className="text-xs px-3 py-1.5 bg-green-100 dark:bg-green-800/30 border border-green-200 dark:border-green-700 rounded-lg hover:bg-green-200 dark:hover:bg-green-700/50 transition-colors flex items-center gap-1"
                                >
                                    <Activity className="w-3 h-3" />
                                    /health
                                </button>
                                <button
                                    onClick={openBackendDocs}
                                    className="text-xs px-3 py-1.5 bg-purple-100 dark:bg-purple-800/30 border border-purple-200 dark:border-purple-700 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-700/50 transition-colors flex items-center gap-1"
                                >
                                    <Server className="w-3 h-3" />
                                    /docs
                                </button>
                                <button
                                    onClick={openAdminTest}
                                    className="text-xs px-3 py-1.5 bg-amber-100 dark:bg-amber-800/30 border border-amber-200 dark:border-amber-700 rounded-lg hover:bg-amber-200 dark:hover:bg-amber-700/50 transition-colors flex items-center gap-1"
                                >
                                    <Shield className="w-3 h-3" />
                                    /admin/test
                                </button>
                            </div>

                            {/* Debug Info */}
                            <div className="p-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700">
                                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Environment</div>
                                <div className="space-y-1">
                                    <div className="flex justify-between">
                                        <span>Node:</span>
                                        <span className="font-mono">{process.env.NODE_ENV}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Version:</span>
                                        <span className="font-mono">{process.env.REACT_APP_VERSION}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Login Attempts:</span>
                                        <span className="font-mono">{loginAttempts}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Login Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden backdrop-blur-sm"
                >
                    {/* Header with gradient */}
                    <div className="relative p-8 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 text-center overflow-hidden">
                        {/* Background pattern */}
                        <div className="absolute inset-0 opacity-10">
                            <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
                            <div className="absolute bottom-0 right-0 w-64 h-64 bg-white rounded-full translate-x-1/2 translate-y-1/2"></div>
                        </div>

                        <div className="relative z-10">
                            <div className="flex items-center justify-center gap-4 mb-6">
                                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm border border-white/30">
                                    <Shield className="w-8 h-8 text-white" />
                                </div>
                                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm border border-white/30">
                                    <Building2 className="w-8 h-8 text-white" />
                                </div>
                            </div>
                            <h1 className="text-3xl font-bold text-white mb-3 tracking-tight">
                                Admin Portal
                            </h1>
                            <p className="text-blue-100/80 text-sm font-medium">
                                Secure access to system administration
                            </p>
                        </div>
                    </div>

                    {/* Form Section */}
                    <div className="p-8">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Error Display */}
                            {(errors.general || authError) && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl"
                                >
                                    <div className="flex items-start gap-3">
                                        <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                                        <div className="flex-1">
                                            <h4 className="font-medium text-red-700 dark:text-red-300 text-sm mb-1">
                                                Authentication Failed
                                            </h4>
                                            <p className="text-sm text-red-600 dark:text-red-400">
                                                {errors.general || authError}
                                            </p>
                                            {loginAttempts > 0 && (
                                                <div className="mt-2 text-xs text-red-500 dark:text-red-500">
                                                    <div className="flex items-center gap-2">
                                                        <Clock className="w-3 h-3" />
                                                        <span>
                                                            Attempts: {loginAttempts}/5
                                                            {lastAttemptTime && ` • Last: ${getTimeSinceLastAttempt()} ago`}
                                                        </span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* Email Field */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                    <Mail className="w-4 h-4" />
                                    Email Address
                                </label>
                                <div className="relative group">
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        disabled={authLoading || backendStatus === 'offline'}
                                        className={`w-full px-4 py-3 pl-11 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200
                                            ${errors.email
                                                ? 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20'
                                                : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500'
                                            }
                                            disabled:opacity-50 disabled:cursor-not-allowed
                                            dark:text-white
                                            group-hover:border-blue-300 dark:group-hover:border-blue-700`}
                                        placeholder="admin@resume.ai"
                                        autoComplete="username"
                                        autoFocus
                                    />
                                    <Mail className="absolute left-3 top-3.5 w-5 h-5 text-gray-400 dark:text-gray-500 transition-colors group-hover:text-blue-500" />
                                </div>
                                {errors.email && (
                                    <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                                        <AlertCircle className="w-3 h-3" />
                                        {errors.email}
                                    </p>
                                )}
                            </div>

                            {/* Password Field */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                        <Lock className="w-4 h-4" />
                                        Password
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1"
                                    >
                                        {showPassword ? (
                                            <>
                                                <EyeOff className="w-3 h-3" />
                                                Hide
                                            </>
                                        ) : (
                                            <>
                                                <Eye className="w-3 h-3" />
                                                Show
                                            </>
                                        )}
                                    </button>
                                </div>
                                <div className="relative group">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        disabled={authLoading || backendStatus === 'offline'}
                                        className={`w-full px-4 py-3 pl-11 pr-11 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200
                                            ${errors.password
                                                ? 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20'
                                                : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500'
                                            }
                                            disabled:opacity-50 disabled:cursor-not-allowed
                                            dark:text-white
                                            group-hover:border-blue-300 dark:group-hover:border-blue-700`}
                                        placeholder="••••••••"
                                        autoComplete="current-password"
                                    />
                                    <Lock className="absolute left-3 top-3.5 w-5 h-5 text-gray-400 dark:text-gray-500 transition-colors group-hover:text-blue-500" />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        disabled={authLoading}
                                        className="absolute right-3 top-3.5 text-gray-400 dark:text-gray-500 hover:text-blue-500 dark:hover:text-blue-400 transition-colors disabled:opacity-50"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="w-5 h-5" />
                                        ) : (
                                            <Eye className="w-5 h-5" />
                                        )}
                                    </button>
                                </div>
                                {errors.password && (
                                    <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                                        <AlertCircle className="w-3 h-3" />
                                        {errors.password}
                                    </p>
                                )}
                            </div>

                            {/* Remember Me */}
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="rememberMe"
                                    name="rememberMe"
                                    checked={formData.rememberMe}
                                    onChange={handleInputChange}
                                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                                />
                                <label htmlFor="rememberMe" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                                    Remember me on this device
                                </label>
                            </div>

                            {/* Login Attempts Warning */}
                            {loginAttempts >= 3 && (
                                <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl">
                                    <div className="flex items-center gap-2 text-sm text-yellow-700 dark:text-yellow-300">
                                        <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                                        <span>
                                            Multiple failed attempts. You have {5 - loginAttempts} attempts remaining.
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* Submit Button */}
                            <motion.button
                                type="submit"
                                disabled={authLoading || backendStatus === 'offline' || loginAttempts >= 5}
                                whileHover={{ scale: backendStatus !== 'offline' && loginAttempts < 5 ? 1.02 : 1 }}
                                whileTap={{ scale: backendStatus !== 'offline' && loginAttempts < 5 ? 0.98 : 1 }}
                                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-3.5 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl active:shadow-lg"
                            >
                                {authLoading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        <span>Signing In...</span>
                                    </>
                                ) : backendStatus === 'offline' ? (
                                    <>
                                        <WifiOff className="w-5 h-5" />
                                        <span>Backend Offline</span>
                                    </>
                                ) : loginAttempts >= 5 ? (
                                    <>
                                        <Clock className="w-5 h-5" />
                                        <span>Try Again Later</span>
                                    </>
                                ) : (
                                    <>
                                        <LogIn className="w-5 h-5" />
                                        <span>Sign In to Admin Portal</span>
                                    </>
                                )}
                            </motion.button>

                            {/* Server Status Help */}
                            {backendStatus === 'offline' && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="p-4 bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/10 dark:to-rose-900/10 border border-red-200 dark:border-red-800 rounded-xl"
                                >
                                    <h4 className="font-medium text-red-700 dark:text-red-300 text-sm mb-2 flex items-center gap-2">
                                        <Server className="w-4 h-4" />
                                        Backend Server Required
                                    </h4>
                                    <ol className="list-decimal pl-5 space-y-1 text-sm text-red-600 dark:text-red-400">
                                        <li>Navigate to backend directory</li>
                                        <li>Run: <code className="bg-red-100 dark:bg-red-900/30 px-2 py-0.5 rounded">npm start</code></li>
                                        <li>Verify at:
                                            <a
                                                href="http://localhost:5001/health"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="ml-1 underline hover:text-red-700 dark:hover:text-red-300"
                                            >
                                                http://localhost:5001/health
                                            </a>
                                        </li>
                                        <li>Should return: <code className="bg-red-100 dark:bg-red-900/30 px-2 py-0.5 rounded">{"{\"status\":\"healthy\"}"}</code></li>
                                    </ol>
                                </motion.div>
                            )}
                        </form>
                    </div>
                </motion.div>

                {/* Footer */}
                <div className="mt-8 text-center">
                    <div className="flex items-center justify-center gap-4 mb-4">
                        {admin && backendStatus === 'online' && (
                            <>
                                <button
                                    onClick={() => setShowStats(!showStats)}
                                    className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors flex items-center gap-1"
                                >
                                    <BarChart3 className="w-3 h-3" />
                                    {showStats ? 'Hide Stats' : 'Show Stats'}
                                </button>
                                <div className="w-px h-3 bg-gray-300 dark:bg-gray-700"></div>
                            </>
                        )}
                        <button
                            onClick={() => setShowDebug(!showDebug)}
                            className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors flex items-center gap-1"
                        >
                            <Terminal className="w-3 h-3" />
                            {showDebug ? 'Hide Debug' : 'Debug Mode'}
                        </button>
                        <div className="w-px h-3 bg-gray-300 dark:bg-gray-700"></div>
                        <button
                            onClick={handleTestConnection}
                            disabled={testingConnection}
                            className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors flex items-center gap-1"
                        >
                            <RefreshCw className={`w-3 h-3 ${testingConnection ? 'animate-spin' : ''}`} />
                            Test Connection
                        </button>
                    </div>

                    <div className="flex items-center justify-center gap-4 mb-3">
                        <div className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1">
                            <Key className="w-3 h-3" />
                            <span>Secure Admin Portal</span>
                        </div>
                        <div className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1">
                            <User className="w-3 h-3" />
                            <span>Restricted Access</span>
                        </div>
                    </div>

                    <p className="text-xs text-gray-400 dark:text-gray-500">
                        © {new Date().getFullYear()} ResumeBuilder AI • v{process.env.REACT_APP_VERSION || '2.0.0'}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;