// src/App.jsx - WITH FIX FOR UPLOAD ROUTE
import React, { Suspense, lazy, useEffect, useState } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useParams,
  Navigate,
  useLocation,
  useNavigate,
  Outlet
} from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// Context Providers
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';
import { ResumeProvider, useResume } from './context/ResumeContext';
import { DashboardProvider } from './context/DashboardContext';
import { AIProvider } from './context/AIContext';

// Global Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ErrorBoundary from './components/ErrorBoundary';
import MaintenanceMode from './components/MaintenanceMode';
import PageLoading from './components/ui/LoadingSpinner';

// Global CSS
import './styles/global.css';
import './index.css';

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
  API_URL: import.meta.env.VITE_API_URL || 'http://localhost:5001/api',
  APP_NAME: import.meta.env.VITE_APP_NAME || 'ResumeCraft Pro',
  APP_VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',
  APP_MODE: import.meta.env.MODE || 'development',
  ENABLE_AI: import.meta.env.VITE_ENABLE_AI === 'true',
  ENABLE_ADMIN: import.meta.env.VITE_ENABLE_ADMIN !== 'false',
  MAINTENANCE_MODE: import.meta.env.VITE_MAINTENANCE_MODE === 'true',
  IS_PRODUCTION: import.meta.env.PROD,
  ENABLE_GOOGLE_AUTH: import.meta.env.VITE_ENABLE_GOOGLE_AUTH === 'true',
};

// ================= LAZY LOADING WITH BETTER ERROR HANDLING =================
const lazyWithRetry = (componentImport, fallbackText = 'Component') =>
  lazy(() => componentImport().catch((error) => {
    console.error(`❌ Failed to load ${fallbackText}:`, error);
    return {
      default: () => (
        <div className="min-h-[400px] flex items-center justify-center p-6">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Failed to load {fallbackText}
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              {error.message || 'Check the browser console for details'}
            </p>
            <div className="space-x-4">
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Reload Page
              </button>
              <button
                onClick={() => window.history.back()}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      )
    };
  }));

// ================= PAGE IMPORTS =================
// Public Pages
const Home = lazyWithRetry(() => import('./pages/public/Home'), 'Home');
const About = lazyWithRetry(() => import('./pages/public/About'), 'About');
const Contact = lazyWithRetry(() => import('./pages/public/Contact'), 'Contact');
const PrivacyPolicy = lazyWithRetry(() => import('./pages/public/PrivacyPolicy'), 'Privacy Policy');
const TermsOfService = lazyWithRetry(() => import('./pages/public/TermsOfService'), 'Terms of Service');
const NotFound = lazyWithRetry(() => import('./pages/public/NotFound'), '404');

// Auth Pages
const Login = lazyWithRetry(() => import('./pages/auth/Login'), 'Login');
const Register = lazyWithRetry(() => import('./pages/auth/Register'), 'Register');
const ForgotPassword = lazyWithRetry(() => import('./pages/auth/ForgotPassword'), 'Forgot Password');
const ResetPassword = lazyWithRetry(() => import('./pages/auth/ResetPassword'), 'Reset Password');
const VerifyEmail = lazyWithRetry(() => import('./pages/auth/VerifyEmail'), 'Verify Email');
const Callback = lazyWithRetry(() => import('./pages/auth/Callback'), 'OAuth Callback');
const Logout = lazyWithRetry(() => import('./pages/auth/Logout'), 'Logout');

// Dashboard Pages
const Dashboard = lazyWithRetry(() => import('./pages/dashboard/Dashboard'), 'Dashboard');
const Profile = lazyWithRetry(() => import('./pages/dashboard/Profile'), 'Profile');
const Resumes = lazyWithRetry(() => import('./pages/dashboard/Resumes'), 'My Resumes');
const ResumeDetail = lazyWithRetry(() => import('./pages/dashboard/ResumeDetail'), 'Resume Details');

// Builder Pages
const BuilderHome = lazyWithRetry(() => import('./pages/builder/BuilderHome'), 'Builder Home');
const Builder = lazyWithRetry(() => import('./pages/builder/Builder'), 'Resume Builder');
// ✅ IMPORTANT: Add the UploadResume import
const UploadResume = lazyWithRetry(() => import('./pages/builder/UploadResume'), 'Upload Resume');
const Preview = lazyWithRetry(() => import('./pages/builder/Preview'), 'Preview');
const ShareResume = lazyWithRetry(() => import('./pages/builder/ShareResume'), 'Share Resume');
const TemplatePage = lazyWithRetry(() => import('./pages/builder/Templatepage'), 'Templates');

// Analyzer Pages
const AIAnalyzerPage = lazyWithRetry(() => import('./pages/analyzer/AIAnalyzerPage'), 'AI Analyzer');
const AnalyzerResults = lazyWithRetry(() => import('./pages/analyzer/AIAnalysisReport'), 'Analysis Results');

// Admin Pages
const AdminLogin = lazyWithRetry(() => import('./admin/pages/Login'), 'Admin Login');
const AdminDashboard = lazyWithRetry(() => import('./admin/pages/Dashboard'), 'Admin Dashboard');
const AdminUsers = lazyWithRetry(() => import('./admin/pages/Users'), 'Admin Users');
const AdminResumes = lazyWithRetry(() => import('./admin/pages/Resumes'), 'Admin Resumes');
const AdminTemplates = lazyWithRetry(() => import('./admin/pages/Templates'), 'Admin Templates');
const AdminSettings = lazyWithRetry(() => import('./admin/pages/Settings'), 'Admin Settings');
const AdminAnalytics = lazyWithRetry(() => import('./admin/pages/Analytics'), 'Admin Analytics');
const AdminSystem = lazyWithRetry(() => import('./admin/pages/System'), 'Admin System');
const AdminLogs = lazyWithRetry(() => import('./admin/pages/Logs'), 'Admin Logs');

// ================= ROUTE PROTECTION =================
const ProtectedRoute = ({ children, requireVerified = false }) => {
  const { user, loading, isVerified } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        sessionStorage.setItem('redirect_after_login', location.pathname);
        navigate('/login');
      } else if (requireVerified && !isVerified) {
        navigate('/verify-email');
      }
    }
  }, [user, loading, isVerified, location, navigate, requireVerified]);

  if (loading) return <PageLoading />;
  if (!user || (requireVerified && !isVerified)) return null;

  return children;
};

const GuestRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  if (loading) return <PageLoading />;
  if (user) return null;

  return children;
};

// ================= ADMIN ROUTE PROTECTION =================
const AdminRoute = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdmin = () => {
      try {
        const adminSession = localStorage.getItem('admin_user');
        const adminToken = localStorage.getItem('admin_token');
        const adminAuthenticated = localStorage.getItem('admin_authenticated');

        const isAdminLoggedIn = adminSession && adminToken && adminAuthenticated === 'true';

        if (isAdminLoggedIn) {
          const adminUser = JSON.parse(adminSession);
          const allowedAdmins = [
            'admin@example.com',
            'admin@admin.com',
            'admin@resumecraft.com',
            'sudip@example.com'
          ];

          setIsAdmin(allowedAdmins.includes(adminUser.email));
        } else {
          setIsAdmin(false);
        }
      } catch (error) {
        setIsAdmin(false);
      }
      setChecking(false);
    };

    checkAdmin();
  }, [location.pathname]);

  if (checking) {
    return <PageLoading />;
  }

  if (!isAdmin) {
    if (location.pathname.startsWith('/admin') && location.pathname !== '/admin/login') {
      return <Navigate to="/admin/login" state={{ from: location.pathname }} replace />;
    }
    return null;
  }

  return children;
};

// ================= LAYOUT COMPONENTS =================
const PublicLayout = () => (
  <div className="min-h-screen flex flex-col">
    <Navbar />
    <main className="flex-1">
      <Outlet />
    </main>
    <Footer />
  </div>
);

const AuthLayout = () => (
  <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-indigo-50">
    <Navbar />
    <div className="flex-1 flex items-center justify-center p-4 pt-20">
      <Outlet />
    </div>
  </div>
);

const DashboardLayout = () => (
  <div className="min-h-screen bg-gray-50">
    <Outlet />
  </div>
);

const BuilderLayout = () => (
  <div className="min-h-screen bg-gray-50">
    <Outlet />
  </div>
);

const AnalyzerLayout = () => (
  <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
    <Outlet />
  </div>
);

const AdminLayout = () => (
  <div className="min-h-screen bg-gray-50">
    <Outlet />
  </div>
);

// ================= IMPORT RESUME WRAPPER =================
const ImportResumeWrapper = () => {
  const navigate = useNavigate();
  const { createResume } = useResume();

  const handleImportSuccess = async (importedData) => {
    try {
      const userStr = localStorage.getItem('user') || '{}';
      const user = JSON.parse(userStr);

      const newResumeData = {
        title: `Imported: ${importedData.title || 'Resume'}`,
        template: 'modern',
        status: 'draft',
        createdBy: user?._id || user?.id || null,
        isPublic: false,
        personalInfo: importedData.personalInfo || {},
        experience: importedData.experience || [],
        education: importedData.education || [],
        skills: importedData.skills || [],
        projects: importedData.projects || [],
        certifications: importedData.certifications || [],
        languages: importedData.languages || [],
        references: importedData.references || [],
        settings: {
          template: 'modern',
          color: '#3b82f6',
          font: 'inter',
          fontSize: 'medium'
        }
      };

      const newResume = await createResume(newResumeData);

      if (newResume && newResume._id) {
        navigate(`/builder/edit/${newResume._id}`);
      } else {
        navigate('/builder/new', { state: { importedData } });
      }
    } catch (error) {
      console.error('Error creating resume from import:', error);
      navigate('/builder/new', { state: { importedData } });
    }
  };

  // ✅ Changed from ImportResume to UploadResume
  return <UploadResume onImportSuccess={handleImportSuccess} />;
};

// ================= BUILDER WRAPPER =================
const BuilderWrapper = ({ isNew = true }) => {
  const location = useLocation();
  const { id } = useParams();
  const importedData = location.state?.importedData;

  return (
    <Builder
      isNewResume={isNew}
      resumeId={id}
      importedData={importedData}
    />
  );
};

// ================= APP CONTENT =================
function AppContent() {
  if (ENV.MAINTENANCE_MODE) {
    return <MaintenanceMode />;
  }

  return (
    <ErrorBoundary>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10B981',
              secondary: '#FFFFFF',
            },
          },
          error: {
            duration: 5000,
            iconTheme: {
              primary: '#EF4444',
              secondary: '#FFFFFF',
            },
          },
        }}
      />

      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center">
            <PageLoading size="lg" text="Loading application..." />
          </div>
        }
      >
        <Routes>
          {/* ================= PUBLIC ROUTES ================= */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsOfService />} />
          </Route>

          {/* ================= AUTH ROUTES ================= */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
            <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
            <Route path="/forgot-password" element={<GuestRoute><ForgotPassword /></GuestRoute>} />
            <Route path="/reset-password/:token" element={<GuestRoute><ResetPassword /></GuestRoute>} />
            <Route path="/verify-email/:token" element={<GuestRoute><VerifyEmail /></GuestRoute>} />
            <Route path="/logout" element={<Logout />} />

            {/* OAuth Routes */}
            {ENV.ENABLE_GOOGLE_AUTH && (
              <>
                <Route path="/auth/callback" element={<Callback />} />
                <Route path="/auth/google" element={<Navigate to="/login" replace />} />
              </>
            )}
          </Route>

          {/* ================= DASHBOARD ROUTES ================= */}
          <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/resumes" element={<Resumes />} />
            <Route path="/resumes/:id" element={<ResumeDetail />} />
            <Route path="/resumes/:id/share" element={<ShareResume />} />
          </Route>

          {/* ================= BUILDER ROUTES ================= */}
          <Route element={<ProtectedRoute><BuilderLayout /></ProtectedRoute>}>
            <Route path="/builder" element={<BuilderHome />} />
            <Route path="/builder/templates" element={<TemplatePage />} />
            <Route path="/builder/preview/:id" element={<Preview />} />
            {/* ✅ FIXED: Added UploadResume route */}
            <Route path="/builder/upload" element={<UploadResume />} />
          </Route>

          {/* Special Builder Routes with Data Passing */}
          <Route element={<ProtectedRoute><BuilderLayout /></ProtectedRoute>}>
            {/* ✅ FIXED: Changed /builder/import to /builder/upload to match your file */}
            <Route path="/builder/import" element={<ImportResumeWrapper />} />
            <Route path="/builder/new" element={<BuilderWrapper isNew={true} />} />
            <Route path="/builder/edit/:id" element={<BuilderWrapper isNew={false} />} />
          </Route>

          {/* ================= ANALYZER ROUTES ================= */}
          <Route element={<ProtectedRoute><AnalyzerLayout /></ProtectedRoute>}>
            <Route path="/analyzer" element={<AIAnalyzerPage />} />
            <Route path="/analyzer/results" element={<AnalyzerResults />} />
            <Route path="/analyzer/results/:id" element={<AnalyzerResults />} />
          </Route>

          {/* ================= ADMIN ROUTES ================= */}
          {ENV.ENABLE_ADMIN && (
            <>
              <Route path="/admin/login" element={<AdminLogin />} />

              <Route element={<AdminRoute><AdminLayout /></AdminRoute>}>
                <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/users" element={<AdminUsers />} />
                <Route path="/admin/users/:id" element={<AdminUsers />} />
                <Route path="/admin/resumes" element={<AdminResumes />} />
                <Route path="/admin/templates" element={<AdminTemplates />} />
                <Route path="/admin/analytics" element={<AdminAnalytics />} />
                <Route path="/admin/system" element={<AdminSystem />} />
                <Route path="/admin/logs" element={<AdminLogs />} />
                <Route path="/admin/settings" element={<AdminSettings />} />
              </Route>
            </>
          )}

          {/* ================= REDIRECTS & ALIASES ================= */}
          <Route path="/create" element={<Navigate to="/builder" replace />} />
          <Route path="/build" element={<Navigate to="/builder" replace />} />
          <Route path="/create-resume" element={<Navigate to="/builder/new" replace />} />
          {/* ✅ FIXED: Updated upload redirect to match your routing */}
          <Route path="/upload-resume" element={<Navigate to="/builder/upload" replace />} />
          <Route path="/templates" element={<Navigate to="/builder/templates" replace />} />
          <Route path="/analyze" element={<Navigate to="/analyzer" replace />} />
          <Route path="/ai-analyzer" element={<Navigate to="/analyzer" replace />} />

          {/* Dashboard aliases */}
          <Route path="/my-resumes" element={<Navigate to="/resumes" replace />} />
          <Route path="/account" element={<Navigate to="/profile" replace />} />

          {/* ================= 404 ROUTE ================= */}
          <Route path="*" element={<PublicLayout><NotFound /></PublicLayout>} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}

// ================= MAIN APP =================
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <ThemeProvider>
          <NotificationProvider>
            <AuthProvider>
              <ResumeProvider>
                <AIProvider>
                  <DashboardProvider>
                    <div className="min-h-screen antialiased">
                      <AppContent />
                    </div>
                  </DashboardProvider>
                </AIProvider>
              </ResumeProvider>
            </AuthProvider>
          </NotificationProvider>
        </ThemeProvider>
      </Router>

      {/* Development Tools */}
      {import.meta.env.DEV && (
        <>
          <ReactQueryDevtools initialIsOpen={false} />
          <div className="fixed bottom-4 right-4 z-50">
            <div className="bg-gray-900 text-white text-xs px-3 py-2 rounded-lg opacity-75">
              v{ENV.APP_VERSION} | {ENV.APP_MODE}
            </div>
          </div>
        </>
      )}
    </QueryClientProvider>
  );
}

export default App;