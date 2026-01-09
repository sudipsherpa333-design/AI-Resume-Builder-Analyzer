// frontend/src/App.jsx
import React, { Suspense, lazy, useEffect, useState } from "react";
import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate,
    useLocation,
    useSearchParams,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";

// Context Providers
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ResumeProvider } from "./context/ResumeContext";
import { ThemeProvider } from "./context/ThemeContext";
import { NotificationProvider } from "./context/NotificationContext";
import { AdminProvider } from "./admin/context/AdminContext";

// Import Global CSS
import "./styles/global.css";

// Get environment variables
const APP_NAME = import.meta.env.VITE_APP_NAME || "ResumeCraft";
const APP_VERSION = import.meta.env.VITE_APP_VERSION || "1.0.0";
const ENABLE_GOOGLE_OAUTH = import.meta.env.VITE_ENABLE_GOOGLE_OAUTH === 'true';

// Lazy load components
const Navbar = lazy(() => import("./components/Navbar"));
const Footer = lazy(() => import("./components/Footer"));
const Home = lazy(() => import("./pages/Home"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Builder = lazy(() => import("./pages/Builder"));
const BuilderHome = lazy(() => import("./pages/BuilderHome"));
const ImportResume = lazy(() => import("./pages/ImportResume"));
const Preview = lazy(() => import("./pages/Preview"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Profile = lazy(() => import("./pages/Profile"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Templates = lazy(() => import("./pages/TemplateSelect"));
const About = lazy(() => import("./pages/About"));
const Resumes = lazy(() => import("./pages/Resumes"));
const Analyzer = lazy(() => import("./pages/Analyzer"));
const QuestionForm = lazy(() => import("./pages/QuestionForm"));
const ResumeAnalyzerDashboard = lazy(() => import("./pages/ResumeAnalyzerDashbaord"));
const GoogleCallback = lazy(() => import("./pages/auth/GoogleCallback"));

// Admin App (handles all admin routes)
const AdminApp = lazy(() => import("./AdminApp"));

// Loading Component
const Loading = () => (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 transition-colors duration-200">
        <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto dark:border-gray-700 dark:border-t-blue-500"></div>
            <p className="mt-4 text-slate-600 font-medium dark:text-gray-300 animate-pulse">
                Loading {APP_NAME}...
            </p>
            <p className="text-sm text-slate-500 dark:text-gray-400 mt-2">v{APP_VERSION}</p>
        </div>
    </div>
);

// Layout Components
const PublicLayout = ({ children }) => (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 to-white dark:from-gray-900 dark:to-gray-800 transition-colors duration-200">
        <Suspense fallback={<div className="h-16 bg-white dark:bg-gray-800"></div>}>
            <Navbar />
        </Suspense>
        <main className="flex-1">{children}</main>
        <Suspense fallback={null}>
            <Footer />
        </Suspense>
    </div>
);

const DashboardLayout = ({ children }) => (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-900 transition-colors duration-200">
        <Suspense fallback={<div className="h-16 bg-white dark:bg-gray-800"></div>}>
            <Navbar />
        </Suspense>
        <main className="pt-4 pb-8 px-4 md:px-6">{children}</main>
    </div>
);

const AuthLayout = ({ children }) => (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 transition-colors duration-200 flex items-center justify-center p-4">
        {children}
    </div>
);

const BuilderLayout = ({ children }) => (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-gray-900 dark:to-gray-800 transition-colors duration-200">
        {children}
    </div>
);

// Initialize theme
const initializeTheme = () => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        document.documentElement.classList.toggle('dark', savedTheme === 'dark');
        return savedTheme;
    }
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.classList.toggle('dark', prefersDark);
    return prefersDark ? 'dark' : 'light';
};

// Google OAuth Callback Handler
const GoogleCallbackHandler = () => {
    const { handleGoogleCallback } = useAuth();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    useEffect(() => {
        const code = searchParams.get('code');
        const error = searchParams.get('error');

        if (error) {
            console.error('Google OAuth error:', error);
            navigate('/login?error=google_auth_failed');
            return;
        }

        if (code) {
            handleGoogleCallback(code).then(result => {
                if (!result.success) {
                    navigate('/login?error=google_auth_failed');
                }
            });
        } else {
            navigate('/login');
        }
    }, [searchParams, handleGoogleCallback, navigate]);

    return <Loading />;
};

// Route Guards
const ProtectedRoute = ({ children }) => {
    const { user, loading, authChecked } = useAuth();
    const location = useLocation();

    if (loading || !authChecked) {
        return <Loading />;
    }

    if (!user) {
        return (
            <Navigate
                to={`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`}
                replace
                state={{ from: location }}
            />
        );
    }

    return children;
};

const GuestRoute = ({ children }) => {
    const { user, loading, authChecked } = useAuth();

    if (loading || !authChecked) {
        return <Loading />;
    }

    if (user) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

// Main App Component
function App() {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        console.log(`${APP_NAME} v${APP_VERSION} - ${import.meta.env.MODE}`);

        // Log enabled features
        if (import.meta.env.VITE_DEBUG === 'true') {
            console.log('Features enabled:', {
                googleOAuth: ENABLE_GOOGLE_OAUTH,
                ai: import.meta.env.VITE_ENABLE_AI === 'true',
                fileUpload: import.meta.env.VITE_ENABLE_FILE_UPLOAD === 'true'
            });
        }

        initializeTheme();
        const timer = setTimeout(() => setIsMounted(true), 100);
        return () => clearTimeout(timer);
    }, []);

    if (!isMounted) {
        return (
            <div className="fixed inset-0 bg-white dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-gray-200 dark:border-gray-700 border-t-blue-600 dark:border-t-blue-500 rounded-full animate-spin mx-auto"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-300">Initializing {APP_NAME}...</p>
                </div>
            </div>
        );
    }

    return (
        <ThemeProvider>
            <NotificationProvider>
                <AuthProvider>
                    <ResumeProvider>
                        <Router>
                            <div className="transition-colors duration-200">
                                <Toaster
                                    position="top-right"
                                    toastOptions={{
                                        duration: 4000,
                                        style: {
                                            background: '#1f2937',
                                            color: '#fff',
                                            borderRadius: '12px',
                                            padding: '16px',
                                            fontWeight: '500',
                                        },
                                        success: {
                                            duration: 3000,
                                            iconTheme: {
                                                primary: import.meta.env.VITE_SECONDARY_COLOR || '#10B981',
                                                secondary: '#fff',
                                            },
                                        },
                                        error: {
                                            duration: 5000,
                                            iconTheme: {
                                                primary: '#ef4444',
                                                secondary: '#fff',
                                            },
                                        },
                                    }}
                                />

                                <Suspense fallback={<Loading />}>
                                    <Routes>
                                        {/* ================= PUBLIC ROUTES ================= */}
                                        <Route
                                            path="/"
                                            element={
                                                <PublicLayout>
                                                    <Home />
                                                </PublicLayout>
                                            }
                                        />

                                        <Route
                                            path="/about"
                                            element={
                                                <PublicLayout>
                                                    <About />
                                                </PublicLayout>
                                            }
                                        />

                                        {/* ================= AUTH ROUTES ================= */}
                                        <Route
                                            path="/login"
                                            element={
                                                <GuestRoute>
                                                    <AuthLayout>
                                                        <Login />
                                                    </AuthLayout>
                                                </GuestRoute>
                                            }
                                        />

                                        <Route
                                            path="/register"
                                            element={
                                                <GuestRoute>
                                                    <AuthLayout>
                                                        <Register />
                                                    </AuthLayout>
                                                </GuestRoute>
                                            }
                                        />

                                        <Route
                                            path="/forgot-password"
                                            element={
                                                <GuestRoute>
                                                    <AuthLayout>
                                                        <ForgotPassword />
                                                    </AuthLayout>
                                                </GuestRoute>
                                            }
                                        />

                                        <Route
                                            path="/reset-password/:token"
                                            element={
                                                <GuestRoute>
                                                    <AuthLayout>
                                                        <ResetPassword />
                                                    </AuthLayout>
                                                </GuestRoute>
                                            }
                                        />

                                        {/* Google OAuth Callback */}
                                        {ENABLE_GOOGLE_OAUTH && (
                                            <Route
                                                path="/auth/google/callback"
                                                element={
                                                    <GuestRoute>
                                                        <AuthLayout>
                                                            <GoogleCallbackHandler />
                                                        </AuthLayout>
                                                    </GuestRoute>
                                                }
                                            />
                                        )}

                                        {/* ================= USER DASHBOARD ROUTES ================= */}
                                        <Route
                                            path="/dashboard"
                                            element={
                                                <ProtectedRoute>
                                                    <DashboardLayout>
                                                        <Dashboard />
                                                    </DashboardLayout>
                                                </ProtectedRoute>
                                            }
                                        />

                                        <Route
                                            path="/profile"
                                            element={
                                                <ProtectedRoute>
                                                    <DashboardLayout>
                                                        <Profile />
                                                    </DashboardLayout>
                                                </ProtectedRoute>
                                            }
                                        />

                                        <Route
                                            path="/my-resumes"
                                            element={
                                                <ProtectedRoute>
                                                    <DashboardLayout>
                                                        <Resumes />
                                                    </DashboardLayout>
                                                </ProtectedRoute>
                                            }
                                        />

                                        {/* ================= BUILDER FLOW ================= */}
                                        <Route
                                            path="/builder"
                                            element={
                                                <ProtectedRoute>
                                                    <BuilderLayout>
                                                        <BuilderHome />
                                                    </BuilderLayout>
                                                </ProtectedRoute>
                                            }
                                        />

                                        <Route
                                            path="/builder/import"
                                            element={
                                                <ProtectedRoute>
                                                    <BuilderLayout>
                                                        <ImportResume />
                                                    </BuilderLayout>
                                                </ProtectedRoute>
                                            }
                                        />

                                        <Route
                                            path="/builder/templates"
                                            element={
                                                <ProtectedRoute>
                                                    <BuilderLayout>
                                                        <Templates />
                                                    </BuilderLayout>
                                                </ProtectedRoute>
                                            }
                                        />

                                        <Route
                                            path="/builder/new"
                                            element={
                                                <ProtectedRoute>
                                                    <BuilderLayout>
                                                        <Builder />
                                                    </BuilderLayout>
                                                </ProtectedRoute>
                                            }
                                        />

                                        <Route
                                            path="/builder/:id"
                                            element={
                                                <ProtectedRoute>
                                                    <BuilderLayout>
                                                        <Builder />
                                                    </BuilderLayout>
                                                </ProtectedRoute>
                                            }
                                        />

                                        {/* PREVIEW */}
                                        <Route
                                            path="/preview/:id"
                                            element={
                                                <ProtectedRoute>
                                                    <BuilderLayout>
                                                        <Preview />
                                                    </BuilderLayout>
                                                </ProtectedRoute>
                                            }
                                        />

                                        {/* ================= ANALYZER ================= */}
                                        <Route
                                            path="/analyzer"
                                            element={
                                                <ProtectedRoute>
                                                    <DashboardLayout>
                                                        <ResumeAnalyzerDashboard />
                                                    </DashboardLayout>
                                                </ProtectedRoute>
                                            }
                                        />

                                        <Route
                                            path="/analyzer/:id"
                                            element={
                                                <ProtectedRoute>
                                                    <DashboardLayout>
                                                        <Analyzer />
                                                    </DashboardLayout>
                                                </ProtectedRoute>
                                            }
                                        />

                                        <Route
                                            path="/questions/:id"
                                            element={
                                                <ProtectedRoute>
                                                    <DashboardLayout>
                                                        <QuestionForm />
                                                    </DashboardLayout>
                                                </ProtectedRoute>
                                            }
                                        />

                                        {/* ================= ADMIN ROUTES ================= */}
                                        {/* All admin routes handled by AdminApp component */}
                                        <Route
                                            path="/admin/*"
                                            element={
                                                <AdminProvider>
                                                    <AdminApp />
                                                </AdminProvider>
                                            }
                                        />

                                        {/* ================= REDIRECTS ================= */}
                                        <Route path="/build" element={<Navigate to="/builder" replace />} />
                                        <Route path="/admin-panel" element={<Navigate to="/admin/dashboard" replace />} />
                                        <Route path="/administrator" element={<Navigate to="/admin/dashboard" replace />} />
                                        <Route path="/admin-login" element={<Navigate to="/admin/login" replace />} />

                                        {/* ================= 404 ================= */}
                                        <Route
                                            path="*"
                                            element={
                                                <PublicLayout>
                                                    <NotFound />
                                                </PublicLayout>
                                            }
                                        />
                                    </Routes>
                                </Suspense>
                            </div>
                        </Router>
                    </ResumeProvider>
                </AuthProvider>
            </NotificationProvider>
        </ThemeProvider>
    );
}

export default App;