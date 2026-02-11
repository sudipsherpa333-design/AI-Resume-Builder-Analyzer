// src/components/auth/GoogleOAuthButton.jsx
import React, { useState } from 'react';
import { FcGoogle } from 'react-icons/fc';
import { toast } from 'react-hot-toast';
import apiService from '../../services/api';

const GoogleOAuthButton = () => {
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    if (loading) return;

    setLoading(true);

    try {
      console.log('🚀 Starting Google OAuth...');

      // Store current page for redirect back
      localStorage.setItem('preAuthPath', window.location.pathname);

      // Check if OAuth is enabled
      const config = await apiService.auth.getOAuthConfig();

      if (!config.googleOAuth?.enabled) {
        toast.error('Google OAuth is not configured');
        setLoading(false);
        return;
      }

      console.log('✅ Google OAuth is enabled');

      // Get Google OAuth URL from backend (or construct it)
      const authUrl = `${apiService.baseURL}/api/auth/google?redirect_uri=${encodeURIComponent(window.location.origin + '/auth/callback')}&prompt=select_account`;

      console.log('🔗 Redirecting to:', authUrl);

      // Use window.location (NO POPUP) to avoid Cross-Origin-Opener-Policy
      window.location.href = authUrl;

      // Note: No need to setLoading(false) here since page will redirect

    } catch (error) {
      console.error('❌ Google login error:', error);
      toast.error('Failed to start Google login');
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <button
        onClick={handleGoogleLogin}
        disabled={loading}
        className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-white text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 transition-colors shadow hover:shadow-md"
      >
        {loading ? (
          <>
            <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
            <span>Connecting to Google...</span>
          </>
        ) : (
          <>
            <FcGoogle className="w-5 h-5" />
            <span>Continue with Google</span>
          </>
        )}
      </button>

      {/* Simple debug info */}
      {process.env.NODE_ENV === 'development' && (
        <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
          <p>Using redirect method (no popup)</p>
          <p className="mt-1">Backend: {apiService.baseURL}</p>
          <p>Callback: {window.location.origin}/auth/callback</p>
        </div>
      )}
    </div>
  );
};

export default GoogleOAuthButton;