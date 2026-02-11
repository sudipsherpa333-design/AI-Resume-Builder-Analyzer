// src/components/auth/GoogleOAuthButton.jsx - SIMPLE WORKING VERSION
import React, { useState } from 'react';
import { FcGoogle } from 'react-icons/fc';
import { toast } from 'react-hot-toast';

const GoogleOAuthButton = () => {
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = () => {
    if (loading) return;

    setLoading(true);

    try {
      // Store current page for redirect back
      const currentPath = window.location.pathname + window.location.search;
      localStorage.setItem('preAuthPath', currentPath);

      // Backend URL
      const backendUrl = process.env.REACT_APP_API_URL || 'http://localhost:5001';

      // Frontend callback URL (must match your frontend URL)
      const frontendCallbackUrl = `${window.location.origin}/auth/callback`;

      // Build Google OAuth URL
      const authUrl = `${backendUrl}/auth/google?redirect_uri=${encodeURIComponent(frontendCallbackUrl)}`;

      console.log('🌐 Starting Google OAuth...');
      console.log('🔗 URL:', authUrl);
      console.log('📝 Will return to:', frontendCallbackUrl);

      // Redirect to backend OAuth endpoint
      window.location.href = authUrl;

    } catch (error) {
      console.error('❌ Google login error:', error);
      toast.error('Failed to start Google login');
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <button
        onClick={handleGoogleLogin}
        disabled={loading}
        className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:shadow transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
            <span className="text-gray-700">Connecting to Google...</span>
          </>
        ) : (
          <>
            <FcGoogle className="w-5 h-5" />
            <span className="text-gray-700 font-medium">Continue with Google</span>
          </>
        )}
      </button>


    </div>
  );
};

export default GoogleOAuthButton;