// src/pages/auth/VerifyEmail.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Mail, CheckCircle, AlertCircle, Loader, ArrowLeft, RefreshCw } from 'lucide-react';

const VerifyEmail = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    const [verificationStatus, setVerificationStatus] = useState('verifying');
    const [isLoading, setIsLoading] = useState(true);
    const [isResending, setIsResending] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const [email, setEmail] = useState('');

    const emailFromState = location.state?.email || '';
    const redirectPath = location.state?.from || '/dashboard';

    useEffect(() => {
        // Get email from various sources
        const getUserEmail = () => {
            if (emailFromState) return emailFromState;

            const userData = localStorage.getItem('auth_user');
            if (userData) {
                try {
                    const parsedUser = JSON.parse(userData);
                    return parsedUser.email || '';
                } catch (error) {
                    console.error('Error parsing user data:', error);
                }
            }

            return '';
        };

        setEmail(getUserEmail());
    }, [emailFromState]);

    useEffect(() => {
        const verifyToken = async () => {
            if (!token) {
                setVerificationStatus('error');
                setIsLoading(false);
                return;
            }

            try {
                setIsLoading(true);
                // Call your API to verify the token
                const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001/api'}/auth/verify-email`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ token }),
                });

                const data = await response.json();

                if (response.ok) {
                    // Update user verification status in localStorage
                    const userData = localStorage.getItem('auth_user');
                    if (userData) {
                        const user = JSON.parse(userData);
                        user.isVerified = true;
                        localStorage.setItem('auth_user', JSON.stringify(user));
                    }

                    setVerificationStatus('success');

                    // Redirect after delay
                    setTimeout(() => {
                        navigate(redirectPath);
                    }, 3000);
                } else {
                    if (data.code === 'ALREADY_VERIFIED') {
                        setVerificationStatus('already_verified');
                        setTimeout(() => {
                            navigate(redirectPath);
                        }, 3000);
                    } else {
                        setVerificationStatus('error');
                    }
                }
            } catch (error) {
                console.error('Verification error:', error);
                setVerificationStatus('error');
            } finally {
                setIsLoading(false);
            }
        };

        verifyToken();
    }, [token, navigate, redirectPath]);

    useEffect(() => {
        let timer;
        if (countdown > 0) {
            timer = setTimeout(() => setCountdown(countdown - 1), 1000);
        }
        return () => clearTimeout(timer);
    }, [countdown]);

    const handleResendEmail = async () => {
        if (!email || isResending || countdown > 0) return;

        try {
            setIsResending(true);
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001/api'}/auth/resend-verification`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (response.ok) {
                toast.success('Verification email sent successfully!');
                setCountdown(60); // 60 seconds cooldown
            } else {
                toast.error(data.message || 'Failed to send verification email');
            }
        } catch (error) {
            console.error('Resend error:', error);
            toast.error('An error occurred while sending the verification email');
        } finally {
            setIsResending(false);
        }
    };

    const handleLoginClick = () => {
        navigate('/login');
    };

    const handleDashboardClick = () => {
        navigate('/dashboard');
    };

    const renderContent = () => {
        switch (verificationStatus) {
            case 'verifying':
                return (
                    <div className="text-center">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-6">
                            <Loader className="w-10 h-10 text-blue-600 animate-spin" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-4">
                            Verifying your email...
                        </h1>
                        <p className="text-gray-600 mb-8">
                            Please wait while we verify your email address.
                        </p>
                        <div className="space-y-4">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div className="bg-blue-600 h-2 rounded-full animate-pulse w-3/4"></div>
                            </div>
                            <p className="text-sm text-gray-500">
                                This should only take a moment
                            </p>
                        </div>
                    </div>
                );

            case 'success':
                return (
                    <div className="text-center">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
                            <CheckCircle className="w-10 h-10 text-green-600" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-4">
                            Email Verified Successfully!
                        </h1>
                        <p className="text-gray-600 mb-8">
                            Your email address has been verified. You will be redirected to your dashboard shortly.
                        </p>
                        <div className="space-y-4">
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                <p className="text-green-700">
                                    <span className="font-semibold">Email:</span> {email}
                                </p>
                            </div>
                            <div className="flex justify-center space-x-3">
                                <button
                                    onClick={handleDashboardClick}
                                    className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
                                >
                                    Go to Dashboard Now
                                </button>
                                <button
                                    onClick={() => navigate('/')}
                                    className="px-6 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-lg transition-colors"
                                >
                                    Back to Home
                                </button>
                            </div>
                            <p className="text-sm text-gray-500 mt-4">
                                Redirecting in 3 seconds...
                            </p>
                        </div>
                    </div>
                );

            case 'already_verified':
                return (
                    <div className="text-center">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-6">
                            <CheckCircle className="w-10 h-10 text-blue-600" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-4">
                            Email Already Verified
                        </h1>
                        <p className="text-gray-600 mb-8">
                            Your email address has already been verified. You will be redirected to your dashboard.
                        </p>
                        <div className="space-y-4">
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <p className="text-blue-700">
                                    <span className="font-semibold">Email:</span> {email}
                                </p>
                            </div>
                            <div className="flex justify-center space-x-3">
                                <button
                                    onClick={handleDashboardClick}
                                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                                >
                                    Go to Dashboard
                                </button>
                                <button
                                    onClick={() => navigate('/')}
                                    className="px-6 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-lg transition-colors"
                                >
                                    Back to Home
                                </button>
                            </div>
                        </div>
                    </div>
                );

            case 'error':
                return (
                    <div className="text-center">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-6">
                            <AlertCircle className="w-10 h-10 text-red-600" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-4">
                            Verification Failed
                        </h1>
                        <p className="text-gray-600 mb-8">
                            We couldn't verify your email address. The verification link may be invalid or expired.
                        </p>

                        <div className="space-y-6">
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-left">
                                <h3 className="font-semibold text-yellow-800 mb-2">What to do next:</h3>
                                <ul className="list-disc list-inside text-yellow-700 space-y-1">
                                    <li>Check if you clicked the latest verification email</li>
                                    <li>Make sure the verification link hasn't expired</li>
                                    <li>Try requesting a new verification email</li>
                                    <li>Contact support if the issue persists</li>
                                </ul>
                            </div>

                            <div className="space-y-4">
                                <div className="text-left">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Your Email Address
                                    </label>
                                    <div className="flex items-center space-x-2">
                                        <Mail className="w-5 h-5 text-gray-400" />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="Enter your email"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <button
                                        onClick={handleResendEmail}
                                        disabled={!email || isResending || countdown > 0}
                                        className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex items-center justify-center space-x-2"
                                    >
                                        {isResending ? (
                                            <>
                                                <Loader className="w-5 h-5 animate-spin" />
                                                <span>Sending...</span>
                                            </>
                                        ) : (
                                            <>
                                                <RefreshCw className="w-5 h-5" />
                                                <span>
                                                    {countdown > 0
                                                        ? `Resend in ${countdown}s`
                                                        : 'Resend Verification Email'
                                                    }
                                                </span>
                                            </>
                                        )}
                                    </button>

                                    <button
                                        onClick={handleLoginClick}
                                        className="w-full px-6 py-3 border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-lg transition-colors"
                                    >
                                        Return to Login
                                    </button>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-gray-200">
                                <p className="text-sm text-gray-500">
                                    Still having issues?{' '}
                                    <Link
                                        to="/contact"
                                        className="text-blue-600 hover:text-blue-700 font-medium"
                                    >
                                        Contact Support
                                    </Link>
                                </p>
                            </div>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    if (isLoading && verificationStatus === 'verifying') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-4">
                <div className="w-full max-w-md">
                    {renderContent()}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    {/* Header */}
                    <div className="mb-8">
                        <Link
                            to="/"
                            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Home
                        </Link>
                        <div className="flex items-center justify-center mb-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Mail className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                        <h2 className="text-center text-3xl font-bold text-gray-900">
                            Email Verification
                        </h2>
                        <p className="text-center text-gray-600 mt-2">
                            {verificationStatus === 'verifying'
                                ? 'Securing your account'
                                : 'Account Security'
                            }
                        </p>
                    </div>

                    {/* Main Content */}
                    {renderContent()}

                    {/* Footer */}
                    <div className="mt-8 pt-6 border-t border-gray-200">
                        <div className="text-center text-sm text-gray-500">
                            <p>
                                Having trouble?{' '}
                                <Link
                                    to="/help/email-verification"
                                    className="text-blue-600 hover:text-blue-700 font-medium"
                                >
                                    View Help Guide
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Success Toast Placeholder */}
                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-500">
                        © {new Date().getFullYear()} AI Resume Builder. All rights reserved.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default VerifyEmail;