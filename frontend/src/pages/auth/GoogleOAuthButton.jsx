// frontend/src/components/auth/GoogleOAuthButton.jsx - FIXED VERSION
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const GoogleOAuthButton = ({ buttonText = "Continue with Google" }) => {
    const { loginWithGoogle, handleGoogleCallback } = useAuth();
    const navigate = useNavigate();

    // Method 1: Direct server-side OAuth (RECOMMENDED)
    const handleServerSideOAuth = () => {
        // Open Google OAuth directly from backend
        window.location.href = `${import.meta.env.VITE_API_URL}/api/auth/google`;
    };

    // Method 2: Client-side OAuth with proper error handling
    const handleGoogleSuccess = async (response) => {
        try {
            console.log('Google OAuth response:', response);

            // Send credential to backend for verification
            const verifyResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/google/verify`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    credential: response.credential || response.access_token
                }),
            });

            const data = await verifyResponse.json();
            console.log('Backend verification response:', data);

            if (data.success) {
                // Handle successful login
                const { token, user } = data.data;

                // Store auth data
                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(user));

                toast.success('Google login successful!');
                navigate('/dashboard');
                window.location.reload(); // Refresh to update auth state
            } else {
                throw new Error(data.error || 'Google authentication failed');
            }

        } catch (error) {
            console.error('Google OAuth error:', error);
            toast.error(error.message || 'Failed to login with Google');
        }
    };

    const handleGoogleFailure = (error) => {
        console.error('Google OAuth failed:', error);
        toast.error('Google login failed. Please try again.');
    };

    return (
        <div className="w-full">
            {/* Method 1: Simple button that redirects to backend OAuth */}
            <button
                onClick={handleServerSideOAuth}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium shadow-sm"
            >
                <img
                    src="https://www.google.com/favicon.ico"
                    alt="Google"
                    className="w-5 h-5"
                />
                {buttonText}
            </button>

            {/* OR Method 2: Use @react-oauth/google component */}
            {/* 
            <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleFailure}
                useOneTap={false}
                shape="rectangular"
                size="large"
                text="continue_with"
                theme="outline"
                locale="en"
                width="100%"
            />
            */}
        </div>
    );
};

export default GoogleOAuthButton;