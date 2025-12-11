// src/App.jsx
import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ResumeProvider } from './context/ResumeContext';

// Lazy load components
const Home = lazy(() => import('./pages/Home'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Builder = lazy(() => import('./pages/Builder'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const NotFound = lazy(() => import('./pages/NotFound'));
const Profile = lazy(() => import('./pages/Profile'));

// Loading component
const Loading = () => (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mb-4"></div>
        <p className="text-gray-600 animate-pulse">Loading...</p>
    </div>
);

// Protected Route Component
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

// Public Route Component - redirects to dashboard if already logged in
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
    return (
        <Router>
            <AuthProvider>
                <ResumeProvider>
                    <Suspense fallback={<Loading />}>
                        <Routes>
                            {/* Home page - accessible to all */}
                            <Route path="/" element={<Home />} />

                            {/* Auth pages - redirect to dashboard if already logged in */}
                            <Route path="/login" element={
                                <PublicRoute>
                                    <Login />
                                </PublicRoute>
                            } />

                            <Route path="/register" element={
                                <PublicRoute>
                                    <Register />
                                </PublicRoute>
                            } />

                            {/* Protected pages - require authentication */}
                            <Route path="/dashboard" element={
                                <ProtectedRoute>
                                    <Dashboard />
                                </ProtectedRoute>
                            } />

                            <Route path="/builder" element={
                                <ProtectedRoute>
                                    <Builder />
                                </ProtectedRoute>
                            } />

                            <Route path="/profile" element={
                                <ProtectedRoute>
                                    <Profile />
                                </ProtectedRoute>
                            } />

                            {/* 404 page */}
                            <Route path="*" element={<NotFound />} />
                        </Routes>
                    </Suspense>
                </ResumeProvider>
            </AuthProvider>
        </Router>
    );
}

export default App;