// frontend/src/pages/auth/GoogleCallback.jsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const GoogleCallback = () => {
    const { handleGoogleCallback } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const error = urlParams.get('error');

        const processCallback = async () => {
            if (error) {
                console.error('Google OAuth error:', error);
                navigate('/login?error=google_auth_failed');
                return;
            }

            if (code) {
                try {
                    const result = await handleGoogleCallback(code);
                    if (result.success) {
                        navigate('/dashboard');
                    } else {
                        navigate('/login?error=google_auth_failed');
                    }
                } catch (error) {
                    console.error('Google callback error:', error);
                    navigate('/login?error=google_auth_failed');
                }
            } else {
                navigate('/login');
            }
        };

        processCallback();
    }, [handleGoogleCallback, navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <div className="text-center">
                <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto dark:border-gray-700 dark:border-t-blue-500"></div>
                <p className="mt-4 text-gray-600 dark:text-gray-300">Completing Google sign in...</p>
            </div>
        </div>
    );
};

export default GoogleCallback;