// src/pages/auth/Callback.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';

const Callback = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { getCurrentUser } = useAuth();
    const [status, setStatus] = useState('processing');
    const [error, setError] = useState(null);

    useEffect(() => {
        const processCallback = async () => {
            try {
                setStatus('processing');
                console.log('🔄 Processing OAuth callback...');

                // Check for token and user in URL
                const urlParams = new URLSearchParams(location.search);
                const token = urlParams.get('token');
                const userParam = urlParams.get('user');

                if (!token || !userParam) {
                    throw new Error('Missing authentication data in URL');
                }

                // Parse user data
                const userData = JSON.parse(decodeURIComponent(userParam));

                // Store in localStorage
                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(userData));

                // Clear URL parameters
                window.history.replaceState({}, document.title, window.location.pathname);

                // Verify with backend
                await getCurrentUser();

                setStatus('success');
                toast.success('Successfully logged in with Google!');

                // Redirect to dashboard
                setTimeout(() => {
                    navigate('/dashboard');
                }, 1000);

            } catch (err) {
                console.error('❌ OAuth callback error:', err);
                setStatus('error');
                setError(err.message);

                toast.error('Authentication failed. Please try again.');

                // Redirect to login after delay
                setTimeout(() => {
                    navigate('/login', {
                        state: { error: err.message }
                    });
                }, 3000);
            }
        };

        processCallback();
    }, [location, navigate, getCurrentUser]);

    if (status === 'processing') {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-6">
                <div className="w-20 h-20 mb-6 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-3">
                    Completing Authentication
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-center max-w-md">
                    Please wait while we sign you in with Google.
                </p>
                <div className="mt-8 space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                        <span className="text-sm text-gray-500">Verifying credentials...</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                        <span className="text-sm text-gray-500">Setting up your session...</span>
                    </div>
                </div>
            </div>
        );
    }

    if (status === 'error') {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-6">
                <div className="w-20 h-20 mb-6 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                    <svg className="w-10 h-10 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">
                    Authentication Failed
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-center mb-6 max-w-md">
                    {error || 'Something went wrong during authentication.'}
                </p>
                <div className="flex gap-4">
                    <button
                        onClick={() => navigate('/login')}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                    >
                        Go to Login
                    </button>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-lg transition-colors dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200"
                    >
                        Try Again
                    </button>
                </div>
                <p className="mt-8 text-sm text-gray-500 dark:text-gray-400">
                    You will be redirected to the login page in a few seconds...
                </p>
            </div>
        );
    }

    if (status === 'success') {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-6">
                <div className="w-20 h-20 mb-6 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                    <svg className="w-10 h-10 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">
                    Authentication Successful!
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-center mb-6 max-w-md">
                    You have been successfully signed in with Google.
                </p>
                <div className="flex gap-4">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                    >
                        Go to Dashboard
                    </button>
                </div>
                <p className="mt-8 text-sm text-gray-500 dark:text-gray-400">
                    Redirecting to dashboard...
                </p>
            </div>
        );
    }

    return null;
};

export default Callback;