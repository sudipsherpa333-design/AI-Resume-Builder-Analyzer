// src/App.jsx
import React, { Suspense, useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";

// Components
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import { PageLoader } from "./components/LoadingSpinner.jsx";

// Context
import { useAuth } from "./context/AuthContext.jsx";
import { ResumeProvider } from "./context/ResumeContext.jsx";

// Lazy loaded pages for better performance
const Home = React.lazy(() => import("./pages/Home.jsx"));
const Login = React.lazy(() => import("./pages/Login.jsx"));
const Register = React.lazy(() => import("./pages/Register.jsx"));
const ForgotPassword = React.lazy(() => import("./pages/ForgotPassword.jsx"));
const ResetPassword = React.lazy(() => import("./pages/ResetPassword.jsx"));
const Dashboard = React.lazy(() => import("./pages/Dashboard.jsx"));
const Builder = React.lazy(() => import("./pages/Builder.jsx"));
const TemplateSelect = React.lazy(() => import("./pages/TemplateSelect.jsx"));
const Analyzer = React.lazy(() => import("./pages/Analyzer.jsx"));
const Resumes = React.lazy(() => import("./pages/Resumes.jsx"));
const Profile = React.lazy(() => import("./pages/Profile.jsx"));
const NotFound = React.lazy(() => import("./pages/NotFound.jsx"));
const AdminDashboard = React.lazy(() => import("./pages/admin/AdminDashboard.jsx"));

// Enhanced Error Boundary
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Application Error:", error, errorInfo);
    }

    handleReset = () => this.setState({ hasError: false, error: null });

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
                        <div className="space-x-3">
                            <button
                                onClick={this.handleReset}
                                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                            >
                                Try Again
                            </button>
                            <button
                                onClick={this.handleReload}
                                className="px-6 py-2.5 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition-colors"
                            >
                                Reload Page
                            </button>
                        </div>
                        {process.env.NODE_ENV === 'development' && (
                            <details className="mt-4 text-left">
                                <summary className="cursor-pointer text-sm text-gray-500">
                                    Error Details (Development)
                                </summary>
                                <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
                                    {this.state.error?.toString()}
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

// Protected Route Component - only redirects to login if accessing protected routes
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, isLoading } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return <PageLoader />;
    }

    if (!isAuthenticated) {
        // Pass the current route as the redirect target to Login
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

// Public Route Component (redirects to dashboard if already authenticated)
const PublicRoute = ({ children }) => {
    const { isAuthenticated, isLoading } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return <PageLoader />;
    }

    if (isAuthenticated) {
        // Get redirect path from URL or default to dashboard
        const searchParams = new URLSearchParams(location.search);
        const redirectTo = searchParams.get('redirect') || '/dashboard';
        return <Navigate to={redirectTo} replace />;
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

// Admin Route Component
const AdminRoute = ({ children }) => {
    const { isAuthenticated, isLoading, isAdmin } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return <PageLoader />;
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

    if (!isAdmin) {
        return <Navigate to="/unauthorized" replace />;
    }

    return children;
};

// Main App Component
function App() {
    const { isAuthenticated, isLoading } = useAuth();
    const location = useLocation();

    // Check if current path is auth page
    const isAuthPage = ['/login', '/register', '/forgot-password', '/reset-password'].includes(location.pathname);

    // Check if current path is 404 page
    const isNotFoundPage = location.pathname === '/404' ||
        (!['/', '/login', '/register', '/forgot-password', '/reset-password',
            '/dashboard', '/builder', '/templates', '/analyzer', '/resumes',
            '/profile', '/admin', '/unauthorized'].includes(location.pathname) &&
            !location.pathname.startsWith('/builder/') &&
            !location.pathname.startsWith('/resumes/') &&
            !location.pathname.startsWith('/reset-password/'));

    // Don't show navbar/footer while loading initial auth state
    if (isLoading) {
        return <PageLoader />;
    }

    return (
        <ErrorBoundary>
            <div className="flex flex-col min-h-screen bg-gray-50">
                <ScrollToTop />

                {/* Conditionally render Navbar */}
                {!isAuthPage && !isNotFoundPage && <Navbar />}

                <main className="flex-1">
                    <Suspense
                        fallback={
                            <div className="min-h-screen flex items-center justify-center">
                                <PageLoader />
                            </div>
                        }
                    >
                        <Routes>
                            {/* Public Routes */}
                            <Route
                                path="/"
                                element={<Home />}
                            />

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

                            {/* Protected Routes with ResumeProvider */}
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
                                            <Builder />
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

                            {/* Resumes Routes */}
                            <Route
                                path="/resumes"
                                element={
                                    <ProtectedRoute>
                                        <ResumeProvider>
                                            <Resumes />
                                        </ResumeProvider>
                                    </ProtectedRoute>
                                }
                            />

                            <Route
                                path="/resumes/:resumeId"
                                element={
                                    <ProtectedRoute>
                                        <ResumeProvider>
                                            <Resumes />
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
                                    <div className="min-h-screen flex items-center justify-center">
                                        <div className="text-center">
                                            <h1 className="text-3xl font-bold text-red-600 mb-4">Access Denied</h1>
                                            <p className="text-gray-600 mb-6">You don't have permission to access this page.</p>
                                            <button
                                                onClick={() => window.history.back()}
                                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                            >
                                                Go Back
                                            </button>
                                        </div>
                                    </div>
                                }
                            />

                            {/* Smart Redirects for better UX */}
                            <Route
                                path="/home"
                                element={<Navigate to="/" replace />}
                            />

                            <Route
                                path="/signin"
                                element={<Navigate to="/login" replace />}
                            />

                            <Route
                                path="/signup"
                                element={<Navigate to="/register" replace />}
                            />

                            <Route
                                path="/create"
                                element={<Navigate to="/builder" replace />}
                            />

                            <Route
                                path="/create-resume"
                                element={<Navigate to="/builder" replace />}
                            />

                            <Route
                                path="/new-resume"
                                element={<Navigate to="/builder" replace />}
                            />

                            <Route
                                path="/build"
                                element={<Navigate to="/builder" replace />}
                            />

                            <Route
                                path="/analyze"
                                element={<Navigate to="/analyzer" replace />}
                            />

                            <Route
                                path="/analysis"
                                element={<Navigate to="/analyzer" replace />}
                            />

                            <Route
                                path="/ai-analyzer"
                                element={<Navigate to="/analyzer" replace />}
                            />

                            <Route
                                path="/my-resumes"
                                element={<Navigate to="/resumes" replace />}
                            />

                            <Route
                                path="/my-resumes/:resumeId"
                                element={<Navigate to="/resumes/:resumeId" replace />}
                            />

                            <Route
                                path="/account"
                                element={<Navigate to="/profile" replace />}
                            />

                            <Route
                                path="/settings"
                                element={<Navigate to="/profile" replace />}
                            />

                            <Route
                                path="/user"
                                element={<Navigate to="/profile" replace />}
                            />

                            {/* Preview Route */}
                            <Route
                                path="/preview/:resumeId"
                                element={
                                    <ProtectedRoute>
                                        <ResumeProvider>
                                            {/* You'll need to create a Preview component */}
                                            <div className="min-h-screen flex items-center justify-center">
                                                <div className="text-center">
                                                    <h1 className="text-2xl font-bold mb-4">Preview Feature Coming Soon</h1>
                                                    <p className="text-gray-600">Resume preview functionality will be available soon!</p>
                                                </div>
                                            </div>
                                        </ResumeProvider>
                                    </ProtectedRoute>
                                }
                            />

                            {/* 404 Page - Catch all route */}
                            <Route
                                path="*"
                                element={<NotFound />}
                            />
                        </Routes>
                    </Suspense>
                </main>

                {/* Conditionally render Footer */}
                {!isAuthPage && !isNotFoundPage && <Footer />}
            </div>
        </ErrorBoundary>
    );
}

// Wrap App with AuthProvider at the top level (in index.js or main.jsx)
export default App;