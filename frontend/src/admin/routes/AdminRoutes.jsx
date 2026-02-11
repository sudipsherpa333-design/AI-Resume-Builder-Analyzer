// frontend/src/admin/routes/AdminRoutes.jsx
import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Lazy load components for better performance
const AdminLogin = React.lazy(() => import('../pages/Login'));
const Dashboard = React.lazy(() => import('../pages/Dashboard'));
const Users = React.lazy(() => import('../pages/Users'));
const Resumes = React.lazy(() => import('../pages/Resumes'));
const Analytics = React.lazy(() => import('../pages/Analytics'));
const Settings = React.lazy(() => import('../pages/Settings'));

// Loading component
const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
      <p className="mt-4 text-slate-600 font-medium">Loading admin panel...</p>
    </div>
  </div>
);

// Simple auth check
const isAuthenticated = () => {
  const token = localStorage.getItem('adminToken');
  return !!token;
};

// Protected route wrapper
const ProtectedRoute = ({ children }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
};

const AdminRoutes = () => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        {/* Public routes */}
        <Route path="login" element={<AdminLogin />} />

        {/* Protected routes */}
        <Route path="/" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />

        <Route path="dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />

        <Route path="users" element={
          <ProtectedRoute>
            <Users />
          </ProtectedRoute>
        } />

        <Route path="resumes" element={
          <ProtectedRoute>
            <Resumes />
          </ProtectedRoute>
        } />

        <Route path="analytics" element={
          <ProtectedRoute>
            <Analytics />
          </ProtectedRoute>
        } />

        <Route path="settings" element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        } />

        {/* Redirect to login for unknown routes if not authenticated */}
        <Route path="*" element={
          isAuthenticated() ?
            <Navigate to="/admin/dashboard" replace /> :
            <Navigate to="/admin/login" replace />
        } />
      </Routes>
    </Suspense>
  );
};

export default AdminRoutes;