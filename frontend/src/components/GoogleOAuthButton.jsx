import React from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { FcGoogle } from 'react-icons/fc';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const GoogleOAuthButton = ({ 
  text = "Continue with Google", 
  type = "login", // 'login' or 'register'
  variant = "outline",
  fullWidth = false,
  className = ""
}) => {
  const { loginWithGoogle } = useAuth();

  const handleGoogleSuccess = async (response) => {
    try {
      console.log('Google OAuth response:', response);

      if (!response.access_token) {
        toast.error('Google authentication failed: No access token received');
        return;
      }

      // Get user info from Google
      const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${response.access_token}` }
      });

      if (!userInfoResponse.ok) {
        throw new Error('Failed to fetch user info from Google');
      }

      const userInfo = await userInfoResponse.json();
      console.log('Google user info:', userInfo);

      // Send to backend
      const result = await loginWithGoogle(response.access_token);
      
      if (result.success) {
        toast.success(
          type === 'login' 
            ? 'Google login successful!'
            : 'Account created with Google!'
        );
      } else {
        toast.error(result.message || 'Google authentication failed');
      }
    } catch (error) {
      console.error('Google OAuth error:', error);
      toast.error(error.message || 'Google authentication failed. Please try again.');
    }
  };

  const handleGoogleFailure = (error) => {
    console.error('Google OAuth failed:', error);
    
    // Handle specific errors
    if (error.error === 'popup_closed_by_user') {
      toast.error('Google login was cancelled');
    } else if (error.error === 'access_denied') {
      toast.error('Access denied. Please try again.');
    } else {
      toast.error('Google authentication failed. Please try again.');
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: handleGoogleFailure,
    onNonOAuthError: (error) => {
      console.error('Non-OAuth error:', error);
      toast.error('Authentication failed. Please try again.');
    },
    flow: 'implicit',
    scope: 'email profile',
  });

  const buttonClass = `
    ${fullWidth ? 'w-full' : ''}
    flex items-center justify-center gap-3
    px-6 py-3 rounded-xl font-medium text-sm lg:text-base
    transition-all duration-300 active:scale-95
    disabled:opacity-50 disabled:cursor-not-allowed
    ${variant === 'outline' 
      ? 'border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400' 
      : 'bg-white text-gray-700 shadow-sm hover:shadow-md border border-gray-200'
    }
    ${className}
  `;

  return (
    <button
      type="button"
      onClick={googleLogin}
      className={buttonClass}
    >
      <FcGoogle className="text-lg lg:text-xl" />
      <span>{text}</span>
    </button>
  );
};

export default GoogleOAuthButton;
