// src/pages/auth/Callback.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import apiService from '../../services/api';
import {
  Loader2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Shield,
  ExternalLink,
  Home,
  LogIn,
  RefreshCw
} from 'lucide-react';

const Callback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [status, setStatus] = useState('processing');
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState(null);

  (() => {
    const processCallback = async () => {
      try {
        setStatus('processing');
        setError(null);
        seuseEffecttDebugInfo(null);

        console.log('🔄 [Callback] Processing OAuth callback...');

        // Get URL parameters
        const urlParams = new URLSearchParams(location.search);
        const token = urlParams.get('token');
        const userId = urlParams.get('userId');
        const email = urlParams.get('email');
        const name = urlParams.get('name');
        const errorParam = urlParams.get('error');
        const success = urlParams.get('success');

        // Debug info
        setDebugInfo({
          hasToken: !!token,
          hasUserId: !!userId,
          hasEmail: !!email,
          hasName: !!name,
          hasError: !!errorParam,
          hasSuccess: !!success,
          rawParams: Object.fromEntries(urlParams.entries())
        });

        console.log('📍 [Callback] Params:', {
          token: token ? 'Present' : 'Missing',
          userId: userId || 'Missing',
          email: email || 'Missing',
          error: errorParam || 'None'
        });

        // Handle OAuth errors
        if (errorParam) {
          const decodedError = decodeURIComponent(errorParam);
          console.error('❌ [Callback] OAuth error:', decodedError);

          let userMessage = 'Authentication failed';

          if (decodedError.includes('access_denied')) {
            userMessage = 'You denied access to your Google account.';
          } else if (decodedError.includes('popup')) {
            userMessage = 'Login window was closed.';
          } else if (decodedError.includes('cookies')) {
            userMessage = 'Third-party cookies are blocked. Please enable cookies.';
          }

          throw new Error(userMessage);
        }

        // Case 1: We have token from Google OAuth callback
        if (token && userId) {
          console.log('✅ [Callback] Received token and user ID from OAuth');

          try {
            // Process OAuth callback using apiService
            const result = await apiService.oauth.processCallback();

            if (result.success) {
              console.log('✅ [Callback] OAuth processing successful');
              setStatus('success');

              toast.success(`Welcome${result.user?.name ? `, ${result.user.name}!` : '!'}`, {
                icon: '👋',
                duration: 4000
              });

              // Redirect to dashboard or saved path
              setTimeout(() => {
                navigate(result.redirectPath || '/dashboard');
              }, 1500);
              return;
            } else {
              throw new Error(result.error || 'OAuth processing failed');
            }
          } catch (processError) {
            console.error('❌ [Callback] OAuth processing failed:', processError);
            throw processError;
          }
        }

        // Case 2: Direct token in URL (backend redirect)
        if (token) {
          console.log('✅ [Callback] Using direct token from URL');

          // Store token
          localStorage.setItem('token', token);

          // Try to fetch user data
          try {
            const userResponse = await apiService.get('/api/auth/session');
            if (userResponse?.success && userResponse.user) {
              localStorage.setItem('user_data', JSON.stringify(userResponse.user));

              setStatus('success');
              toast.success(`Welcome, ${userResponse.user.name || 'User'}!`);

              setTimeout(() => {
                navigate('/dashboard');
              }, 1500);
              return;
            }
          } catch (fetchError) {
            console.warn('⚠️ [Callback] Could not fetch user data:', fetchError);

            // If we have email and name from params, create minimal user
            if (email && name) {
              const minimalUser = {
                _id: userId || `user-${Date.now()}`,
                id: userId || `user-${Date.now()}`,
                email: decodeURIComponent(email),
                name: decodeURIComponent(name),
                role: 'user',
                authProvider: 'google'
              };

              localStorage.setItem('user_data', JSON.stringify(minimalUser));
              setStatus('success');
              toast.success(`Welcome, ${decodeURIComponent(name)}!`);

              setTimeout(() => {
                navigate('/dashboard');
              }, 1500);
              return;
            }
          }
        }

        // Case 3: No authentication data found
        console.warn('⚠️ [Callback] No valid authentication data found');

        // Check for existing session
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user_data');

        if (storedToken && storedUser) {
          console.log('✅ [Callback] Found existing session, redirecting');
          setStatus('success');

          setTimeout(() => {
            navigate('/dashboard');
          }, 1000);
          return;
        }

        throw new Error('No authentication data received. Please login again.');

      } catch (err) {
        console.error('❌ [Callback] Error:', err);
        setStatus('error');
        setError(err.message);

        // Show appropriate toast
        if (err.message.includes('cancelled') || err.message.includes('denied')) {
          toast.error('Login cancelled. Please try again.');
        } else if (err.message.includes('cookies')) {
          toast.error('Please enable third-party cookies for Google login.');
        } else if (err.message.includes('network')) {
          toast.error('Network error. Please check your connection.');
        } else {
          toast.error(err.message || 'Authentication failed.');
        }

        // Redirect to login after delay
        setTimeout(() => {
          navigate('/login', {
            state: {
              error: err.message,
              showRetry: true
            }
          });
        }, 4000);
      }
    };

    processCallback();

    // Clean up URL (remove OAuth parameters)
    const cleanUrl = () => {
      if (window.location.search.includes('token') ||
        window.location.search.includes('error') ||
        window.location.search.includes('userId')) {
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    };

    const cleanupTimer = setTimeout(cleanUrl, 2000);
    return () => clearTimeout(cleanupTimer);
  }, [location, navigate]);

  const handleRetry = () => {
    // Redirect to Google OAuth login
    apiService.oauth.redirectToGoogleLogin();
  };

  const handleManualLogin = () => {
    navigate('/login');
  };

  const handleGoHome = () => {
    navigate('/');
  };

  // Processing state
  if (status === 'processing') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50/30 to-cyan-50/30 p-4 sm:p-6">
        <div className="max-w-md w-full bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-gray-200/50 p-8 text-center">
          <div className="relative mb-8">
            <div className="w-24 h-24 mx-auto">
              <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-blue-600 rounded-full animate-spin border-t-transparent"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Shield className="w-10 h-10 text-blue-600" />
              </div>
            </div>
          </div>

          <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3">
            Completing Authentication
          </h2>
          <p className="text-gray-600 text-base lg:text-lg mb-8">
            Please wait while we verify your credentials...
          </p>

          <div className="space-y-4 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-700">Checking authentication data</span>
              </div>
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-700">Verifying security tokens</span>
              </div>
              <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-700">Setting up your session</span>
              </div>
              <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
            </div>
          </div>

          <div className="text-xs text-gray-500 space-y-2">
            <p>This may take a few seconds...</p>
            <p>Do not close this window.</p>
          </div>
        </div>

        {/* Debug info */}
        {process.env.NODE_ENV === 'development' && debugInfo && (
          <div className="mt-8 max-w-md w-full bg-gray-900/90 backdrop-blur-lg rounded-2xl p-4 text-left">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="w-5 h-5 text-yellow-400" />
              <h3 className="text-sm font-medium text-white">Debug Info</h3>
            </div>
            <pre className="text-xs text-gray-300 overflow-auto">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </div>
        )}
      </div>
    );
  }

  // Error state
  if (status === 'error') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 via-red-50/20 to-rose-50/10 p-4 sm:p-6">
        <div className="max-w-md w-full bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-red-200/50 p-8 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-rose-100 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <XCircle className="w-10 h-10 text-red-600" />
          </div>

          <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3">
            Authentication Failed
          </h2>
          <p className="text-gray-600 text-base lg:text-lg mb-2">
            {error || 'Something went wrong during authentication.'}
          </p>
          <p className="text-sm text-gray-500 mb-8">
            Please try again or contact support if the issue persists.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
            <button
              onClick={handleRetry}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-2xl hover:from-blue-700 hover:to-cyan-700 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <RefreshCw className="w-5 h-5" />
              Try Again
            </button>

            <button
              onClick={handleManualLogin}
              className="px-6 py-3 bg-gradient-to-r from-gray-100 to-gray-50 text-gray-700 rounded-2xl hover:bg-gray-200 flex items-center justify-center gap-2 shadow-lg"
            >
              <LogIn className="w-5 h-5" />
              Manual Login
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={handleGoHome}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm"
            >
              <Home className="w-4 h-4" />
              Go to Homepage
            </button>

            <a
              href="https://support.google.com/accounts/answer/61416"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 text-sm"
            >
              <ExternalLink className="w-4 h-4" />
              Google Login Help
            </a>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200/50">
            <p className="text-sm text-gray-500">
              Redirecting to login page in a few seconds...
            </p>
            <div className="mt-3 w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div className="bg-gradient-to-r from-red-500 to-rose-500 h-2 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>

        <div className="mt-8 max-w-md w-full bg-gradient-to-r from-orange-50/80 to-amber-50/80 backdrop-blur-lg rounded-2xl p-6 border border-orange-200/50">
          <h3 className="font-bold text-gray-900 text-lg mb-3 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-orange-500" />
            Troubleshooting Tips
          </h3>
          <ul className="text-sm text-gray-700 space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-orange-500">•</span>
              <span>Clear browser cache and cookies</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-500">•</span>
              <span>Try using incognito/private mode</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-500">•</span>
              <span>Ensure third-party cookies are enabled</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-500">•</span>
              <span>Disable ad-blockers and privacy extensions</span>
            </li>
          </ul>
        </div>
      </div>
    );
  }

  // Success state
  if (status === 'success') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 via-green-50/20 to-emerald-50/10 p-4 sm:p-6">
        <div className="max-w-md w-full bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-green-200/50 p-8 text-center">
          <div className="relative mb-8">
            <div className="w-24 h-24 mx-auto">
              <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full animate-ping opacity-20"></div>
              <div className="absolute inset-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                <CheckCircle className="w-12 h-12 text-white" />
              </div>
            </div>
          </div>

          <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3">
            Authentication Successful! 🎉
          </h2>
          <p className="text-gray-600 text-base lg:text-lg mb-8">
            You have been successfully signed in.
          </p>

          <button
            onClick={() => navigate('/dashboard')}
            className="px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-2xl hover:from-green-700 hover:to-emerald-700 flex items-center justify-center gap-3 mx-auto shadow-lg hover:shadow-xl transition-all duration-300 mb-8"
          >
            <span className="text-lg font-semibold">Go to Dashboard</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>

          <div className="mt-8 pt-6 border-t border-gray-200/50">
            <p className="text-sm text-gray-500 mb-3">
              Redirecting to dashboard...
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full animate-[progress_2s_ease-in-out_infinite]"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default Callback;