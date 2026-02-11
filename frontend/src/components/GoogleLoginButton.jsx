import React from 'react';
import { useAuth } from '../context/AuthContext';
import { FcGoogle } from 'react-icons/fc';
import { useGoogleLogin } from '@react-oauth/google';
import { Button } from '@mui/material';

const GoogleLoginButton = ({ text = 'Continue with Google', variant = 'outlined', fullWidth = true }) => {
  const { loginWithGoogle } = useAuth();

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (response) => {
      console.log('Google login successful:', response);
      
      try {
        // Get user info from Google
        const userInfo = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${response.access_token}` }
        }).then(res => res.json());
        
        console.log('Google user info:', userInfo);
        
        // Call backend with Google token (using access_token as ID token)
        const result = await loginWithGoogle(response.access_token);
        
        if (result.success) {
          console.log('Backend authentication successful');
        }
      } catch (error) {
        console.error('Google login error:', error);
        alert('Google login failed. Please try again.');
      }
    },
    onError: (error) => {
      console.error('Google login error:', error);
      alert('Google login failed. Please try again.');
    },
    flow: 'implicit', // Use implicit flow for SPA
  });

  return (
    <Button
      variant={variant}
      onClick={handleGoogleLogin}
      fullWidth={fullWidth}
      startIcon={<FcGoogle size={20} />}
      sx={{
        textTransform: 'none',
        py: 1.5,
        borderColor: '#4285F4',
        color: '#4285F4',
        '&:hover': {
          borderColor: '#3367D6',
          backgroundColor: 'rgba(66, 133, 244, 0.04)'
        }
      }}
    >
      {text}
    </Button>
  );
};

export default GoogleLoginButton;
