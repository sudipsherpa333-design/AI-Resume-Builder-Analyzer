// src/App.jsx
import React, { Suspense, lazy, useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { GoogleOAuthProvider } from '@react-oauth/google';

// Import CSS
import './styles/global.css';

// Import Context Providers
import { AuthProvider, useAuth } from './context/AuthContext';
import { ResumeProvider } from './context/ResumeContext';

// Lazy load page components
const Home = lazy(() => import('./pages/Home'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const BuilderHome = lazy(() => import('./pages/BuilderHome')); // Page with options
const ResumeBuilder = lazy(() => import('./pages/Builder')); // Main builder page
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const NotFound = lazy(() => import('./pages/NotFound'));
const Analyzer = lazy(() => import('./pages/Analyzer'));
const Profile = lazy(() => import('./pages/Profile'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const Templates = lazy(() => import('./pages/TemplateSelect'));
const JobAnalyzer = lazy(() => import('./pages/JobAnalyzer'));
const About = lazy(() => import('./pages/About'));

// Loading component
const Loading = () => (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="relative">
            <div className="w-20 h-20 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-transparent border-t-purple-600 rounded-full animate-spin"></div>
            </div>
        </div>
        <p className="mt-6 text-gray-600 font-medium">Loading ResumeCraft...</p>
        <p className="text-sm text-gray-400 mt-2">AI-Powered Resume Builder</p>
    </div>
);

// Footer component
const Footer = () => (
    <footer className="bg-gradient-to-r from-gray-900 to-black text-white py-8 mt-auto">
        <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-center">
                <div className="mb-4 md:mb-0">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V8a2 2 0 00-2-2h-5L9 4H4z" />
                            </svg>
                        </div>
                        <span className="text-xl font-bold">ResumeCraft</span>
                    </div>
                    <p className="text-gray-400 text-sm mt-2">Build professional resumes with AI</p>
                </div>
                <div className="text-center md:text-right">
                    <p className="text-gray-400 text-sm">
                        &copy; {new Date().getFullYear()} ResumeCraft. All rights reserved.
                    </p>
                    <p className="text-gray-500 text-xs mt-1">v2.0.0 • AI-Powered Resume Builder</p>
                </div>
            </div>
        </div>
    </footer>
);

// Layout for public pages
const PublicLayout = ({ children, showNavbar = true }) => {
    const Navbar = lazy(() => import('./components/Navbar'));

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex flex-col">
            {showNavbar && (
                <Suspense fallback={<div className="h-16 bg-white"></div>}>
                    <Navbar />
                </Suspense>
            )}
            <main className="flex-grow">
                {children}
            </main>
            <Footer />
        </div>
    );
};

// Layout for dashboard pages
const DashboardLayout = ({ children, showNavbar = true }) => {
    const Navbar = lazy(() => import('./components/Navbar'));

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 flex flex-col">
            {showNavbar && (
                <Suspense fallback={<div className="h-16 bg-white"></div>}>
                    <Navbar />
                </Suspense>
            )}
            <main className="flex-grow">
                {children}
            </main>
            <Footer />
        </div>
    );
};

// Layout for builder pages
const BuilderLayout = ({ children }) => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
            {children}
        </div>
    );
};

// Protected Route wrapper
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return <Loading />;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

// Public Route wrapper - redirect authenticated users to dashboard
const PublicRoute = ({ children }) => {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return <Loading />;
    }

    if (isAuthenticated) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

// Main App Component
function App() {
    const [backendStatus, setBackendStatus] = useState('checking');
    const [statusColor, setStatusColor] = useState('bg-yellow-500');
    const [apiUrl, setApiUrl] = useState('');
    const [isOfflineMode, setIsOfflineMode] = useState(false);

    useEffect(() => {
        // Get API URL from environment
        const apiUrlFromEnv = import.meta.env.VITE_API_URL || 'http://localhost:5001';
        setApiUrl(apiUrlFromEnv);

        const checkBackend = async () => {
            try {
                // Add CORS mode for development
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

                const res = await fetch(`${apiUrlFromEnv}/api/health`, {
                    method: 'GET',
                    mode: 'cors', // Explicitly set CORS mode
                    credentials: 'omit', // Don't send cookies for health check
                    headers: {
                        'Content-Type': 'application/json',
                        'Origin': window.location.origin,
                    },
                    signal: controller.signal
                });

                clearTimeout(timeoutId);

                if (res.ok) {
                    const data = await res.json();
                    setBackendStatus('connected');
                    setStatusColor('bg-green-500');
                    setIsOfflineMode(false);
                    console.log('✅ Backend connected:', data);
                } else {
                    throw new Error(`Server responded with status ${res.status}`);
                }
            } catch (err) {
                // Check if it's a CORS error or network error
                if (err.name === 'AbortError') {
                    console.warn('⚠️ Backend connection timeout. Using offline mode.');
                } else if (err.message.includes('Failed to fetch') || err.message.includes('CORS')) {
                    console.warn('⚠️ CORS issue detected. Trying proxy fallback...');

                    // Try proxy fallback
                    try {
                        const proxyRes = await fetch('/api/health', {
                            method: 'GET',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                        });

                        if (proxyRes.ok) {
                            setBackendStatus('connected-via-proxy');
                            setStatusColor('bg-green-400');
                            setIsOfflineMode(false);
                            console.log('✅ Backend connected via proxy');
                            return;
                        }
                    } catch (proxyError) {
                        console.warn('❌ Proxy also failed');
                    }
                }

                setBackendStatus('offline');
                setStatusColor('bg-yellow-500');
                setIsOfflineMode(true);
                console.warn('⚠️ Backend not available. Using offline/demo mode.');
            }
        };

        checkBackend();
        const intervalId = setInterval(checkBackend, 60000); // Check every minute instead of 30 seconds
        return () => clearInterval(intervalId);
    }, []);

    // Check if Google Client ID exists
    const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    // Handle React Router future flag warnings
    useEffect(() => {
        // Suppress React Router future flag warnings in development
        if (import.meta.env.DEV) {
            const originalWarn = console.warn;
            console.warn = function (...args) {
                if (
                    typeof args[0] === 'string' &&
                    (args[0].includes('React Router Future Flag Warning') ||
                        args[0].includes('v7_startTransition') ||
                        args[0].includes('v7_relativeSplatPath'))
                ) {
                    return; // Suppress React Router warnings
                }
                originalWarn.apply(console, args);
            };

            return () => {
                console.warn = originalWarn;
            };
        }
    }, []);

    // Function to get status text
    const getStatusText = () => {
        switch (backendStatus) {
            case 'connected':
                return 'Backend Connected';
            case 'connected-via-proxy':
                return 'Connected via Proxy';
            case 'offline':
                return 'Offline Mode';
            case 'checking':
                return 'Checking...';
            default:
                return 'Unknown';
        }
    };

    // Function to get status icon
    const getStatusIcon = () => {
        switch (backendStatus) {
            case 'connected':
            case 'connected-via-proxy':
                return '✅';
            case 'offline':
                return '⚠️';
            case 'checking':
                return '⏳';
            default:
                return '❓';
        }
    };

    return (
        <GoogleOAuthProvider clientId={googleClientId || ''}>
            <AuthProvider>
                <ResumeProvider offlineMode={isOfflineMode}>
                    <Router future={{
                        v7_startTransition: true,
                        v7_relativeSplatPath: true
                    }}>
                        {/* Backend Status Indicator */}
                        <div className={`fixed top-3 right-3 px-3 py-1.5 rounded-lg text-xs font-semibold text-white shadow-lg z-50 ${statusColor} flex items-center gap-2 transition-all duration-300`}>
                            <div className={`w-2 h-2 rounded-full ${backendStatus === 'connected' || backendStatus === 'connected-via-proxy'
                                    ? 'animate-pulse bg-green-300'
                                    : backendStatus === 'checking'
                                        ? 'animate-pulse bg-yellow-300'
                                        : 'bg-red-300'
                                }`}></div>
                            <span className="hidden sm:inline">
                                {getStatusText()}
                            </span>
                            <span className="sm:hidden">
                                {getStatusIcon()}
                            </span>
                            {isOfflineMode && (
                                <span className="text-xs opacity-75 hidden md:inline">
                                    (Using demo data)
                                </span>
                            )}
                        </div>

                        <Toaster
                            position="top-right"
                            toastOptions={{
                                duration: 4000,
                                style: {
                                    background: '#1f2937',
                                    color: '#fff',
                                    borderRadius: '12px',
                                    padding: '16px',
                                    fontSize: '14px',
                                    border: '1px solid #374151',
                                },
                                success: {
                                    duration: 3000,
                                    iconTheme: {
                                        primary: '#10B981',
                                        secondary: '#fff',
                                    },
                                    style: {
                                        background: '#065f46',
                                        border: '1px solid #047857',
                                    },
                                },
                                error: {
                                    duration: 5000,
                                    iconTheme: {
                                        primary: '#EF4444',
                                        secondary: '#fff',
                                    },
                                    style: {
                                        background: '#7f1d1d',
                                        border: '1px solid #b91c1c',
                                    },
                                },
                                loading: {
                                    style: {
                                        background: '#4b5563',
                                        border: '1px solid #6b7280',
                                    },
                                },
                            }}
                        />

                        <Suspense fallback={<Loading />}>
                            <Routes>
                                {/* Public pages */}
                                <Route path="/" element={
                                    <PublicRoute>
                                        <PublicLayout>
                                            <Home />
                                        </PublicLayout>
                                    </PublicRoute>
                                } />

                                <Route path="/about" element={
                                    <PublicRoute>
                                        <PublicLayout>
                                            <About />
                                        </PublicLayout>
                                    </PublicRoute>
                                } />

                                <Route path="/features" element={
                                    <PublicRoute>
                                        <PublicLayout>
                                            <Home />
                                        </PublicLayout>
                                    </PublicRoute>
                                } />

                                <Route path="/pricing" element={
                                    <PublicRoute>
                                        <PublicLayout>
                                            <Home />
                                        </PublicLayout>
                                    </PublicRoute>
                                } />

                                {/* Auth pages - no navbar */}
                                <Route path="/login" element={
                                    <PublicRoute>
                                        <PublicLayout showNavbar={false}>
                                            <Login />
                                        </PublicLayout>
                                    </PublicRoute>
                                } />

                                <Route path="/register" element={
                                    <PublicRoute>
                                        <PublicLayout showNavbar={false}>
                                            <Register />
                                        </PublicLayout>
                                    </PublicRoute>
                                } />

                                <Route path="/forgot-password" element={
                                    <PublicRoute>
                                        <PublicLayout showNavbar={false}>
                                            <ForgotPassword />
                                        </PublicLayout>
                                    </PublicRoute>
                                } />

                                <Route path="/reset-password/:token" element={
                                    <PublicRoute>
                                        <PublicLayout showNavbar={false}>
                                            <ResetPassword />
                                        </PublicLayout>
                                    </PublicRoute>
                                } />

                                {/* Dashboard routes */}
                                <Route path="/dashboard" element={
                                    <ProtectedRoute>
                                        <DashboardLayout>
                                            <Dashboard />
                                        </DashboardLayout>
                                    </ProtectedRoute>
                                } />

                                <Route path="/profile" element={
                                    <ProtectedRoute>
                                        <DashboardLayout>
                                            <Profile />
                                        </DashboardLayout>
                                    </ProtectedRoute>
                                } />

                                <Route path="/templates" element={
                                    <ProtectedRoute>
                                        <DashboardLayout>
                                            <Templates />
                                        </DashboardLayout>
                                    </ProtectedRoute>
                                } />

                                <Route path="/job-analyzer" element={
                                    <ProtectedRoute>
                                        <DashboardLayout>
                                            <JobAnalyzer />
                                        </DashboardLayout>
                                    </ProtectedRoute>
                                } />

                                <Route path="/analyzer" element={
                                    <ProtectedRoute>
                                        <DashboardLayout>
                                            <Analyzer />
                                        </DashboardLayout>
                                    </ProtectedRoute>
                                } />

                                <Route path="/analyzer/:id" element={
                                    <ProtectedRoute>
                                        <DashboardLayout>
                                            <Analyzer />
                                        </DashboardLayout>
                                    </ProtectedRoute>
                                } />

                                {/* Builder Routes - Two-step flow */}
                                {/* Step 1: Choose creation method */}
                                <Route path="/build" element={
                                    <ProtectedRoute>
                                        <PublicLayout>
                                            <BuilderHome />
                                        </PublicLayout>
                                    </ProtectedRoute>
                                } />

                                {/* Step 2: Main builder page */}
                                <Route path="/builder" element={
                                    <ProtectedRoute>
                                        <BuilderLayout>
                                            <ResumeBuilder />
                                        </BuilderLayout>
                                    </ProtectedRoute>
                                } />

                                <Route path="/builder/:id" element={
                                    <ProtectedRoute>
                                        <BuilderLayout>
                                            <ResumeBuilder mode="edit" />
                                        </BuilderLayout>
                                    </ProtectedRoute>
                                } />

                                {/* Preview route */}
                                <Route path="/preview/:id" element={
                                    <ProtectedRoute>
                                        <DashboardLayout>
                                            <ResumeBuilder mode="preview" />
                                        </DashboardLayout>
                                    </ProtectedRoute>
                                } />

                                {/* Fallback routes */}
                                <Route path="/home" element={<Navigate to="/" replace />} />
                                <Route path="/index" element={<Navigate to="/" replace />} />
                                <Route path="/welcome" element={<Navigate to="/" replace />} />
                                <Route path="/landing" element={<Navigate to="/" replace />} />

                                {/* 404 - Catch all */}
                                <Route path="*" element={
                                    <PublicLayout>
                                        <NotFound />
                                    </PublicLayout>
                                } />
                            </Routes>
                        </Suspense>
                    </Router>
                </ResumeProvider>
            </AuthProvider>
        </GoogleOAuthProvider>
    );
}

export default App;