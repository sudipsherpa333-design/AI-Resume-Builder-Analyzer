// frontend/src/AdminApp.jsx
import React, { Suspense } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAdmin } from './admin/context/AdminContext';

// Lazy load admin components
const AdminLogin = React.lazy(() => import('./admin/pages/Login'));
const AdminLayout = React.lazy(() => import('./admin/components/layout/AdminLayout'));
const AdminDashboard = React.lazy(() => import('./admin/pages/Dashboard'));
const AdminUsers = React.lazy(() => import('./admin/pages/Users'));
const AdminUserDetail = React.lazy(() => import('./admin/pages/UserDetail'));
const AdminResumes = React.lazy(() => import('./admin/pages/Resumes'));
const AdminResumeDetail = React.lazy(() => import('./admin/pages/ResumeDetail'));
const AdminAnalytics = React.lazy(() => import('./admin/pages/Analytics'));
const AdminSystem = React.lazy(() => import('./admin/pages/System'));
const AdminLogs = React.lazy(() => import('./admin/pages/Logs'));
const AdminSettings = React.lazy(() => import('./admin/pages/Settings'));
const AdminTemplates = React.lazy(() => import('./admin/pages/Templates'));

const AdminLoading = () => (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto dark:border-gray-700 dark:border-t-blue-500"></div>
            <p className="mt-4 text-slate-600 font-medium dark:text-gray-300">
                Loading Admin Panel...
            </p>
        </div>
    </div>
);

const AdminApp = () => {
    const { admin, isAdminLoading } = useAdmin();
    const location = useLocation();

    // Show loading while checking auth
    if (isAdminLoading) {
        return <AdminLoading />;
    }

    // If on login page and already authenticated, redirect to dashboard
    if (admin && location.pathname === '/admin/login') {
        return <Navigate to="/admin/dashboard" replace />;
    }

    // If not on login page and not authenticated, redirect to login
    if (!admin && location.pathname !== '/admin/login') {
        return <Navigate to="/admin/login" replace state={{ from: location }} />;
    }

    return (
        <Suspense fallback={<AdminLoading />}>
            <Routes>
                {/* Admin Login (public route) */}
                <Route path="/login" element={<AdminLogin />} />

                {/* Protected Admin Routes */}
                <Route path="/" element={<AdminLayout />}>
                    <Route index element={<Navigate to="dashboard" replace />} />
                    <Route path="dashboard" element={<AdminDashboard />} />
                    <Route path="users" element={<AdminUsers />} />
                    <Route path="users/:id" element={<AdminUserDetail />} />
                    <Route path="resumes" element={<AdminResumes />} />
                    <Route path="resumes/:id" element={<AdminResumeDetail />} />
                    <Route path="analytics" element={<AdminAnalytics />} />
                    <Route path="system" element={<AdminSystem />} />
                    <Route path="logs" element={<AdminLogs />} />
                    <Route path="templates" element={<AdminTemplates />} />
                    <Route path="settings" element={<AdminSettings />} />
                    <Route path="*" element={<Navigate to="dashboard" replace />} />
                </Route>
            </Routes>
        </Suspense>
    );
};

export default AdminApp;