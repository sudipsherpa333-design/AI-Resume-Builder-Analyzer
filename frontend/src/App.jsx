// src/App.jsx - FIXED VERSION (Router wraps providers)
import React, { Suspense, lazy, useEffect, useState } from "react";
import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate,
    useLocation,
    useNavigate,
    Outlet
} from "react-router-dom";
import { Toaster } from "react-hot-toast";

// React Query
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// Context Providers
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { NotificationProvider } from "./context/NotificationContext";
import { ResumeProvider } from "./context/ResumeContext";
import { DashboardProvider } from "./context/DashboardContext";
import { AdminProvider } from "./admin/context/AdminContext";

// Global CSS
import "./styles/global.css";

// ================= REACT QUERY CLIENT =================
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 2,
            staleTime: 5 * 60 * 1000,
            gcTime: 10 * 60 * 1000,
            refetchOnWindowFocus: false,
        },
    },
});

// ================= ENVIRONMENT CONFIG =================
const ENV = {
    API_URL: import.meta.env.VITE_API_URL || "http://localhost:5001/api",
    APP_NAME: import.meta.env.VITE_APP_NAME || "AI Resume Builder",
    APP_VERSION: import.meta.env.VITE_APP_VERSION || "1.0.0",
    APP_MODE: import.meta.env.MODE || "development",
    ENABLE_AI: import.meta.env.VITE_ENABLE_AI === "true",
    MAINTENANCE_MODE: import.meta.env.VITE_MAINTENANCE_MODE === "true",
    PRIMARY_COLOR: import.meta.env.VITE_PRIMARY_COLOR || "#3B82F6",
    SECONDARY_COLOR: import.meta.env.VITE_SECONDARY_COLOR || "#10B981",
    IS_PRODUCTION: import.meta.env.PROD,
};

// ================= LAZY LOADING HELPER =================
function lazyWithRetry(componentImport, fallbackText = "Component") {
    return lazy(async () => {
        try {
            return await componentImport();
        } catch (error) {
            console.error(`Failed to load ${fallbackText}:`, error);

            // Retry logic
            for (let retry = 1; retry <= 3; retry++) {
                try {
                    await new Promise(resolve => setTimeout(resolve, 1000 * retry));
                    return await componentImport();
                } catch (retryError) {
                    console.error(`Retry ${retry} failed for ${fallbackText}:`, retryError);
                    if (retry === 3) throw retryError;
                }
            }

            // Fallback component
            return {
                default: () => (
                    <div className="min-h-[400px] flex items-center justify-center">
                        <div className="text-center p-8">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                                <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.246 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                                Failed to load {fallbackText}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-4">
                                Please check your connection and try again.
                            </p>
                            <button
                                onClick={() => window.location.reload()}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                            >
                                Reload Page
                            </button>
                        </div>
                    </div>
                )
            };
        }
    });
}

// ================= PAGE IMPORTS =================
// Public Pages
const Home = lazyWithRetry(() => import("./pages/public/Home"), "Home");
const About = lazyWithRetry(() => import("./pages/public/About"), "About");
const Contact = lazyWithRetry(() => import("./pages/public/Contact"), "Contact");
const PrivacyPolicy = lazyWithRetry(() => import("./pages/public/PrivacyPolicy"), "Privacy Policy");
const TermsOfService = lazyWithRetry(() => import("./pages/public/TermsOfService"), "Terms of Service");
const NotFound = lazyWithRetry(() => import("./pages/public/NotFound"), "404 Page");

// Auth Pages
const Login = lazyWithRetry(() => import("./pages/auth/Login"), "Login");
const Register = lazyWithRetry(() => import("./pages/auth/Register"), "Register");
const ForgotPassword = lazyWithRetry(() => import("./pages/auth/ForgotPassword"), "Forgot Password");
const ResetPassword = lazyWithRetry(() => import("./pages/auth/ResetPassword"), "Reset Password");

// Dashboard Pages
const Dashboard = lazyWithRetry(() => import("./pages/dashboard/Dashboard"), "Dashboard");
const Profile = lazyWithRetry(() => import("./pages/dashboard/Profile"), "Profile");
const Resumes = lazyWithRetry(() => import("./pages/dashboard/Resumes"), "My Resumes");
const ResumeDetail = lazyWithRetry(() => import("./pages/dashboard/ResumeDetail"), "Resume Details");

// Builder Pages
const BuilderHome = lazyWithRetry(() => import("./pages/builder/BuilderHome"), "Builder Home");
const Builder = lazyWithRetry(() => import("./pages/builder/Builder"), "Resume Builder");
const ImportResume = lazyWithRetry(() => import("./pages/builder/ImportResume"), "Import Resume");
const Templates = lazyWithRetry(() => import("./pages/builder/TemplateSelect"), "Templates");
const Preview = lazyWithRetry(() => import("./pages/builder/Preview"), "Preview");
const ShareResume = lazyWithRetry(() => import("./pages/builder/ShareResume"), "Share Resume");

// Analyzer Pages
const Analyzer = lazyWithRetry(() => import("./pages/analyzer/Analyzer"), "Analyzer");
const ResumeAnalyzerDashboard = lazyWithRetry(() => import("./pages/analyzer/ResumeAnalyzerDashboard"), "Analyzer Dashboard");
const AnalyzerResults = lazyWithRetry(() => import("./pages/analyzer/AnalyzerResults"), "Analyzer Results");
const ATSAnalyzer = lazyWithRetry(() => import("./pages/analyzer/ATSAnalyzer"), "ATS Analyzer");
const SkillsAnalyzer = lazyWithRetry(() => import("./pages/analyzer/SkillsAnalyzer"), "Skills Analyzer");
const JobMatchAnalyzer = lazyWithRetry(() => import("./pages/analyzer/JobMatchAnalyzer"), "Job Match Analyzer");

// Admin Pages
const AdminLogin = lazyWithRetry(() => import("./admin/pages/Login"), "Admin Login");
const AdminDashboard = lazyWithRetry(() => import("./admin/pages/Dashboard"), "Admin Dashboard");
const AdminUsers = lazyWithRetry(() => import("./admin/pages/Users"), "Admin Users");
const AdminResumes = lazyWithRetry(() => import("./admin/pages/Resumes"), "Admin Resumes");
const AdminAnalytics = lazyWithRetry(() => import("./admin/pages/Analytics"), "Admin Analytics");

// ================= LAYOUT COMPONENTS =================
const PublicLayout = () => (
    <div className="min-h-screen flex flex-col">
        <main className="flex-1">
            <Outlet />
        </main>
    </div>
);

const DashboardLayout = () => (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Outlet />
    </div>
);

const AuthLayout = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
        <Outlet />
    </div>
);

const BuilderLayout = () => (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-gray-900 dark:to-gray-800">
        <Outlet />
    </div>
);

const AnalyzerLayout = () => (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-8">
            <Outlet />
        </div>
    </div>
);

const AdminLayout = () => (
    <div className="min-h-screen bg-gray-900 text-gray-100">
        <Outlet />
    </div>
);

// ================= LOADING COMPONENTS =================
const PageLoading = () => (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
            <div className="relative">
                <div className="w-20 h-20 mx-auto mb-6">
                    <div className="absolute inset-0 border-4 border-blue-100 dark:border-blue-800 rounded-full"></div>
                    <div
                        className="absolute inset-0 border-4 border-transparent border-t-blue-600 dark:border-t-blue-500 rounded-full animate-spin"
                        style={{ animationDuration: '1.2s' }}
                    ></div>
                    <div className="absolute inset-4 bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-400 dark:to-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-sm">RB</span>
                    </div>
                </div>
            </div>
            <p className="mt-4 text-slate-600 dark:text-gray-300 font-medium animate-pulse">
                Loading {ENV.APP_NAME}...
            </p>
            <p className="mt-2 text-sm text-slate-500 dark:text-gray-400">
                v{ENV.APP_VERSION}
            </p>
        </div>
    </div>
);

const InitializingScreen = () => (
    <div className="fixed inset-0 bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
            <div className="relative w-32 h-32 mx-auto mb-8">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-400 dark:to-blue-500 rounded-full opacity-20 animate-pulse"></div>
                <div className="absolute inset-4 bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-2xl">RB</span>
                </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
                {ENV.APP_NAME}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
                Initializing...
            </p>
        </div>
    </div>
);

// ================= AUTH COMPONENTS =================
import { useAuth } from "./context/AuthContext";

const ProtectedRoute = ({ children, requireAdmin = false }) => {
    const { user, loading } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        if (!loading && !user) {
            // Store where user was trying to go
            sessionStorage.setItem('redirect_after_login', location.pathname + location.search);
            navigate("/login", { replace: true });
        }

        // Check admin permissions
        if (!loading && user && requireAdmin && !user.role?.includes('admin')) {
            navigate("/dashboard", { replace: true });
        }
    }, [user, loading, location, navigate, requireAdmin]);

    if (loading) {
        return <PageLoading />;
    }

    if (user) {
        if (requireAdmin && !user.role?.includes('admin')) {
            return null;
        }
        return children;
    }

    return null;
};

const GuestRoute = ({ children, requireAdminGuest = false }) => {
    const { user, loading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!loading && user) {
            if (requireAdminGuest && user.role?.includes('admin')) {
                navigate("/admin/dashboard", { replace: true });
            } else {
                navigate("/dashboard", { replace: true });
            }
        }
    }, [user, loading, navigate, requireAdminGuest]);

    if (loading) {
        return <PageLoading />;
    }

    if (!user) {
        return children;
    }

    return null;
};

// ================= TOASTER CONFIGURATION =================
const toasterOptions = {
    position: "top-right",
    duration: 4000,
    style: {
        background: ENV.IS_PRODUCTION ? '#1f2937' : '#374151',
        color: '#fff',
        borderRadius: '12px',
        padding: '16px',
        fontWeight: '500',
        maxWidth: '500px',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
    },
    success: {
        duration: 3000,
        iconTheme: {
            primary: ENV.SECONDARY_COLOR,
            secondary: '#fff',
        },
        style: {
            background: ENV.IS_PRODUCTION ? '#064e3b' : '#065f46',
            borderLeft: `4px solid ${ENV.SECONDARY_COLOR}`,
        },
    },
    error: {
        duration: 5000,
        iconTheme: {
            primary: '#ef4444',
            secondary: '#fff',
        },
        style: {
            background: ENV.IS_PRODUCTION ? '#7f1d1d' : '#991b1b',
            borderLeft: '4px solid #ef4444',
        },
    },
    loading: {
        duration: Infinity,
        style: {
            background: ENV.IS_PRODUCTION ? '#1e3a8a' : '#1e40af',
            borderLeft: '4px solid #3b82f6',
        },
    },
};

// ================= ERROR BOUNDARY =================
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('Error caught by ErrorBoundary:', error, errorInfo);
        this.setState({ errorInfo });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-gradient-to-br from-slate-50 to-red-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
                    <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 text-center">
                        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                            <svg className="w-10 h-10 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>

                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                            Something went wrong
                        </h1>

                        <p className="text-gray-600 dark:text-gray-300 mb-6">
                            {this.state.error?.message || "An unexpected error occurred"}
                        </p>

                        {import.meta.env.DEV && this.state.errorInfo && (
                            <details className="text-left mb-6">
                                <summary className="cursor-pointer text-sm text-gray-500 dark:text-gray-400 mb-2">
                                    Error Details
                                </summary>
                                <pre className="text-xs bg-gray-100 dark:bg-gray-900 p-3 rounded-lg overflow-auto max-h-40">
                                    {this.state.errorInfo.componentStack}
                                </pre>
                            </details>
                        )}

                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <button
                                onClick={() => window.location.reload()}
                                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                            >
                                Reload Page
                            </button>
                            <button
                                onClick={() => window.location.href = '/'}
                                className="px-6 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-medium rounded-lg transition-colors"
                            >
                                Go Home
                            </button>
                        </div>

                        <p className="mt-8 text-sm text-gray-500 dark:text-gray-400">
                            {ENV.APP_NAME} v{ENV.APP_VERSION}
                        </p>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

// ================= MAINTENANCE MODE =================
const MaintenanceMode = () => (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-blue-900 text-white flex items-center justify-center p-4">
        <div className="max-w-lg text-center">
            <div className="w-24 h-24 mx-auto mb-8">
                <div className="w-full h-full border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
            </div>

            <h1 className="text-4xl font-bold mb-4">
                ⚙️ Under Maintenance
            </h1>

            <p className="text-xl text-blue-200 mb-6">
                {ENV.APP_NAME} is currently undergoing scheduled maintenance.
            </p>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-8">
                <p className="mb-4">
                    We're working hard to improve your experience. The site will be back online shortly.
                </p>
                <p className="text-sm text-blue-300">
                    Estimated downtime: 30 minutes
                </p>
            </div>

            <div className="flex items-center justify-center space-x-4 text-sm text-blue-300">
                <span>v{ENV.APP_VERSION}</span>
                <span>•</span>
                <span>{(new Date()).toLocaleDateString()}</span>
            </div>
        </div>
    </div>
);

// ================= APP CONTENT =================
function AppContent() {
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        // Log startup info for debugging
        console.log(
            `%c${ENV.APP_NAME} v${ENV.APP_VERSION}`,
            `color: ${ENV.PRIMARY_COLOR}; font-size: 14px; font-weight: bold;`
        );
        console.log(`Mode: ${ENV.APP_MODE}`);
        console.log(`API: ${ENV.API_URL}`);
        console.log(`AI Enabled: ${ENV.ENABLE_AI}`);
        console.log(`Maintenance Mode: ${ENV.MAINTENANCE_MODE}`);

        const timer = setTimeout(() => {
            setIsInitialized(true);
        }, 100);

        return () => clearTimeout(timer);
    }, []);

    if (ENV.MAINTENANCE_MODE) {
        return <MaintenanceMode />;
    }

    if (!isInitialized) {
        return <InitializingScreen />;
    }

    return (
        <ErrorBoundary>
            <Toaster {...toasterOptions} />

            <Suspense fallback={<PageLoading />}>
                <Routes>
                    {/* Public Routes */}
                    <Route element={<PublicLayout />}>
                        <Route path="/" element={<Home />} />
                        <Route path="/about" element={<About />} />
                        <Route path="/contact" element={<Contact />} />
                        <Route path="/privacy" element={<PrivacyPolicy />} />
                        <Route path="/terms" element={<TermsOfService />} />
                    </Route>

                    {/* Auth Routes */}
                    <Route element={<AuthLayout />}>
                        <Route path="/login" element={
                            <GuestRoute>
                                <Login />
                            </GuestRoute>
                        } />
                        <Route path="/register" element={
                            <GuestRoute>
                                <Register />
                            </GuestRoute>
                        } />
                        <Route path="/forgot-password" element={
                            <GuestRoute>
                                <ForgotPassword />
                            </GuestRoute>
                        } />
                        <Route path="/reset-password/:token" element={
                            <GuestRoute>
                                <ResetPassword />
                            </GuestRoute>
                        } />
                    </Route>

                    {/* Dashboard Routes - Protected */}
                    <Route element={
                        <ProtectedRoute>
                            <DashboardLayout />
                        </ProtectedRoute>
                    }>
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/resumes" element={<Resumes />} />
                        <Route path="/resumes/:id" element={<ResumeDetail />} />
                    </Route>

                    {/* Builder Routes - Protected */}
                    <Route element={
                        <ProtectedRoute>
                            <BuilderLayout />
                        </ProtectedRoute>
                    }>
                        <Route path="/builder" element={<BuilderHome />} />
                        <Route path="/builder/import" element={<ImportResume />} />
                        <Route path="/builder/templates" element={<Templates />} />
                        <Route path="/builder/new" element={<Builder />} />
                        <Route path="/builder/edit/:id" element={<Builder />} />
                        <Route path="/preview/:id" element={<Preview />} />
                        <Route path="/resumes/:id/share" element={<ShareResume />} />
                    </Route>

                    {/* Analyzer Routes - Protected and AI-gated */}
                    {ENV.ENABLE_AI && (
                        <Route element={
                            <ProtectedRoute>
                                <AnalyzerLayout />
                            </ProtectedRoute>
                        }>
                            <Route path="/analyzer" element={<Analyzer />} />
                            <Route path="/analyzer/dashboard" element={<ResumeAnalyzerDashboard />} />
                            <Route path="/analyzer/results/:id" element={<AnalyzerResults />} />
                            <Route path="/analyzer/ats" element={<ATSAnalyzer />} />
                            <Route path="/analyzer/skills" element={<SkillsAnalyzer />} />
                            <Route path="/analyzer/job-match" element={<JobMatchAnalyzer />} />
                        </Route>
                    )}

                    {/* Admin Routes */}
                    <Route element={<AdminLayout />}>
                        <Route path="/admin/login" element={
                            <GuestRoute requireAdminGuest>
                                <AdminLogin />
                            </GuestRoute>
                        } />
                        <Route path="/admin/dashboard" element={
                            <ProtectedRoute requireAdmin>
                                <AdminDashboard />
                            </ProtectedRoute>
                        } />
                        <Route path="/admin/users" element={
                            <ProtectedRoute requireAdmin>
                                <AdminUsers />
                            </ProtectedRoute>
                        } />
                        <Route path="/admin/resumes" element={
                            <ProtectedRoute requireAdmin>
                                <AdminResumes />
                            </ProtectedRoute>
                        } />
                        <Route path="/admin/analytics" element={
                            <ProtectedRoute requireAdmin>
                                <AdminAnalytics />
                            </ProtectedRoute>
                        } />
                    </Route>

                    {/* Redirects */}
                    <Route path="/home" element={<Navigate to="/" replace />} />
                    <Route path="/signin" element={<Navigate to="/login" replace />} />
                    <Route path="/signup" element={<Navigate to="/register" replace />} />
                    <Route path="/build" element={<Navigate to="/builder" replace />} />
                    <Route path="/create" element={<Navigate to="/builder/new" replace />} />
                    <Route path="/analyze" element={<Navigate to="/analyzer" replace />} />
                    <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />

                    {/* 404 Route */}
                    <Route path="*" element={<PublicLayout><NotFound /></PublicLayout>} />
                </Routes>
            </Suspense>
        </ErrorBoundary>
    );
}

// ================= MAIN APP COMPONENT =================
function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <Router>
                <ThemeProvider>
                    <NotificationProvider>
                        <AuthProvider>
                            <ResumeProvider>
                                <DashboardProvider>
                                    <AdminProvider>
                                        <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-200">
                                            <AppContent />
                                        </div>
                                    </AdminProvider>
                                </DashboardProvider>
                            </ResumeProvider>
                        </AuthProvider>
                    </NotificationProvider>
                </ThemeProvider>
            </Router>

            {import.meta.env.DEV && (
                <ReactQueryDevtools
                    initialIsOpen={false}
                    position="bottom-right"
                    toggleButtonProps={{
                        style: {
                            margin: '10px',
                            opacity: 0.9,
                        }
                    }}
                />
            )}
        </QueryClientProvider>
    );
}

export default App;