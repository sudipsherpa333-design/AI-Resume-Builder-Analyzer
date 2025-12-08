// src/App.jsx
import React, { Suspense, useEffect, lazy } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';

// Components
const Navbar = lazy(() => import('./components/Navbar.jsx'));
const Footer = lazy(() => import('./components/Footer.jsx'));
const PageLoader = lazy(() => import('./components/LoadingSpinner.jsx').then(module => ({ default: module.PageLoader })));

// Context
import { useAuth } from './context/AuthContext.jsx';
import { ResumeProvider } from './context/ResumeContext.jsx';

// Lazy loaded pages for better performance
const Home = lazy(() => import('./pages/Home.jsx'));
const Login = lazy(() => import('./pages/Login.jsx'));
const Register = lazy(() => import('./pages/Register.jsx'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword.jsx'));
const ResetPassword = lazy(() => import('./pages/ResetPassword.jsx'));
const Dashboard = lazy(() => import('./pages/Dashboard.jsx'));
const Builder = lazy(() => import('./pages/Builder.jsx'));
const TemplateSelect = lazy(() => import('./pages/TemplateSelect.jsx'));
const Analyzer = lazy(() => import('./pages/Analyzer.jsx'));
const Resumes = lazy(() => import('./pages/Resumes.jsx'));
const Profile = lazy(() => import('./pages/Profile.jsx'));
const NotFound = lazy(() => import('./pages/NotFound.jsx'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard.jsx'));

// Enhanced Error Boundary
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('Application Error:', error, errorInfo);
        this.setState({ errorInfo });
    }

    handleReset = () => this.setState({ hasError: false, error: null, errorInfo: null });

    handleReload = () => window.location.reload();

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
                    <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
                        <div className="text-6xl mb-4">😵</div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">
                            Oops! Something went wrong
                        </h1>
                        <p className="text-gray-600 mb-6">
                            We encountered an unexpected error. Please try refreshing the page.
                        </p>
                        <div className="space-y-3">
                            <button
                                onClick={this.handleReset}
                                className="w-full px-6 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                            >
                                Try Again
                            </button>
                            <button
                                onClick={this.handleReload}
                                className="w-full px-6 py-2.5 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition-colors"
                            >
                                Reload Page
                            </button>
                        </div>
                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <details className="mt-4 text-left">
                                <summary className="cursor-pointer text-sm text-gray-500">
                                    Error Details (Development)
                                </summary>
                                <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto max-h-40">
                                    {this.state.error.toString()}
                                </pre>
                            </details>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

// Protected Route Component
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, isLoading } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        const from = location.pathname + location.search;
        return (
            <Navigate
                to={`/login?redirect=${encodeURIComponent(from)}`}
                replace
                state={{ from: location }}
            />
        );
    }

    return children;
};

// Public Route Component
const PublicRoute = ({ children }) => {
    const { isAuthenticated, isLoading } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (isAuthenticated) {
        const searchParams = new URLSearchParams(location.search);
        const redirectTo = searchParams.get('redirect') || '/dashboard';
        return <Navigate to={redirectTo} replace />;
    }

    return children;
};

// Admin Route Component
const AdminRoute = ({ children }) => {
    const { isAuthenticated, isLoading, user } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        const from = location.pathname + location.search;
        return (
            <Navigate
                to={`/login?redirect=${encodeURIComponent(from)}`}
                replace
                state={{ from: location }}
            />
        );
    }

    if (!user?.isAdmin) {
        return <Navigate to="/unauthorized" replace />;
    }

    return children;
};

// Scroll to top on route change
const ScrollToTop = () => {
    const { pathname } = useLocation();

    useEffect(() => {
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: 'smooth'
        });
    }, [pathname]);

    return null;
};

// Loading fallback component
const LoadingFallback = () => (
    <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
        </div>
    </div>
);

// Main App Component
function App() {
    const { isAuthenticated, isLoading } = useAuth();
    const location = useLocation();

    // Check if current path is auth page
    const isAuthPage = ['/login', '/register', '/forgot-password', '/reset-password'].some(path =>
        location.pathname.startsWith(path)
    );

    // Don't show navbar/footer while loading initial auth state
    if (isLoading) {
        return <LoadingFallback />;
    }

    return (
        <ErrorBoundary>
            <div className="flex flex-col min-h-screen bg-gray-50">
                <ScrollToTop />

                {/* Conditionally render Navbar - using Suspense for lazy loading */}
                {!isAuthPage && (
                    <Suspense fallback={null}>
                        <Navbar />
                    </Suspense>
                )}

                <main className="flex-1">
                    <Suspense fallback={<LoadingFallback />}>
                        <Routes>
                            {/* Public Routes */}
                            <Route path="/" element={<Home />} />

                            <Route
                                path="/login"
                                element={
                                    <PublicRoute>
                                        <Login />
                                    </PublicRoute>
                                }
                            />

                            <Route
                                path="/register"
                                element={
                                    <PublicRoute>
                                        <Register />
                                    </PublicRoute>
                                }
                            />

                            <Route
                                path="/forgot-password"
                                element={
                                    <PublicRoute>
                                        <ForgotPassword />
                                    </PublicRoute>
                                }
                            />

                            <Route
                                path="/reset-password"
                                element={
                                    <PublicRoute>
                                        <ResetPassword />
                                    </PublicRoute>
                                }
                            />

                            <Route
                                path="/reset-password/:token"
                                element={
                                    <PublicRoute>
                                        <ResetPassword />
                                    </PublicRoute>
                                }
                            />

                            {/* Protected Routes */}
                            <Route
                                path="/dashboard"
                                element={
                                    <ProtectedRoute>
                                        <ResumeProvider>
                                            <Dashboard />
                                        </ResumeProvider>
                                    </ProtectedRoute>
                                }
                            />

                            {/* Builder Routes */}
                            <Route
                                path="/builder"
                                element={
                                    <ProtectedRoute>
                                        <ResumeProvider>
                                            <TemplateSelect />
                                        </ResumeProvider>
                                    </ProtectedRoute>
                                }
                            />

                            <Route
                                path="/builder/:resumeId"
                                element={
                                    <ProtectedRoute>
                                        <ResumeProvider>
                                            <Builder />
                                        </ResumeProvider>
                                    </ProtectedRoute>
                                }
                            />

                            <Route
                                path="/templates"
                                element={
                                    <ProtectedRoute>
                                        <ResumeProvider>
                                            <TemplateSelect />
                                        </ResumeProvider>
                                    </ProtectedRoute>
                                }
                            />

                            {/* Analyzer Route */}
                            <Route
                                path="/analyzer"
                                element={
                                    <ProtectedRoute>
                                        <ResumeProvider>
                                            <Analyzer />
                                        </ResumeProvider>
                                    </ProtectedRoute>
                                }
                            />

                            {/* Profile Route */}
                            <Route
                                path="/profile"
                                element={
                                    <ProtectedRoute>
                                        <Profile />
                                    </ProtectedRoute>
                                }
                            />

                            {/* Admin Routes */}
                            <Route
                                path="/admin"
                                element={
                                    <AdminRoute>
                                        <AdminDashboard />
                                    </AdminRoute>
                                }
                            />

                            <Route
                                path="/unauthorized"
                                element={
                                    <div className="min-h-screen flex items-center justify-center p-4">
                                        <div className="text-center max-w-md">
                                            <h1 className="text-3xl font-bold text-red-600 mb-4">Access Denied</h1>
                                            <p className="text-gray-600 mb-6">
                                                You don't have permission to access this page.
                                            </p>
                                            <div className="space-y-3">
                                                <button
                                                    onClick={() => navigate(-1)}
                                                    className="w-full px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                                                >
                                                    Go Back
                                                </button>
                                                <button
                                                    onClick={() => navigate('/dashboard')}
                                                    className="w-full px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
                                                >
                                                    Go to Dashboard
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                }
                            />

                            {/* Smart Redirects */}
                            <Route path="/home" element={<Navigate to="/" replace />} />
                            <Route path="/signin" element={<Navigate to="/login" replace />} />
                            <Route path="/signup" element={<Navigate to="/register" replace />} />
                            <Route path="/create" element={<Navigate to="/builder" replace />} />
                            <Route path="/create-resume" element={<Navigate to="/builder" replace />} />
                            <Route path="/new-resume" element={<Navigate to="/builder" replace />} />
                            <Route path="/build" element={<Navigate to="/builder" replace />} />
                            <Route path="/analyze" element={<Navigate to="/analyzer" replace />} />
                            <Route path="/analysis" element={<Navigate to="/analyzer" replace />} />
                            <Route path="/ai-analyzer" element={<Navigate to="/analyzer" replace />} />
                            <Route path="/my-resumes" element={<Navigate to="/dashboard" replace />} />
                            <Route path="/account" element={<Navigate to="/profile" replace />} />
                            <Route path="/settings" element={<Navigate to="/profile" replace />} />
                            <Route path="/user" element={<Navigate to="/profile" replace />} />

                            {/* Preview Route */}
                            <Route
                                path="/preview/:resumeId"
                                element={
                                    <ProtectedRoute>
                                        <ResumeProvider>
                                            <div className="min-h-screen flex items-center justify-center p-4">
                                                <div className="text-center max-w-md">
                                                    <h1 className="text-2xl font-bold mb-4">Preview Feature</h1>
                                                    <p className="text-gray-600 mb-6">
                                                        Resume preview will be available in the next update!
                                                    </p>
                                                    <button
                                                        onClick={() => window.history.back()}
                                                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                                                    >
                                                        Go Back
                                                    </button>
                                                </div>
                                            </div>
                                        </ResumeProvider>
                                    </ProtectedRoute>
                                }
                            />

                            {/* 404 Page */}
                            <Route path="*" element={<NotFound />} />
                        </Routes>
                    </Suspense>
                </main>

                {/* Conditionally render Footer */}
                {!isAuthPage && (
                    <Suspense fallback={null}>
                        <Footer />
                    </Suspense>
                )}
            </div>
        </ErrorBoundary>
    );
}

export default App;