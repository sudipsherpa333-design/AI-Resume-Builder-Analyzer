import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { useResume } from '../../context/ResumeContext';

const DebugBuilder = () => {
    const navigate = useNavigate();
    const { id: resumeId } = useParams();
    const { user, isLoading: authLoading } = useAuth();
    const {
        currentResume,
        loadResume,
        createNewResume,
        isLoading: resumesLoading
    } = useResume();

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [debugInfo, setDebugInfo] = useState({});

    useEffect(() => {
        const initBuilder = async () => {
            console.log('🔧 Debug Builder Starting...');
            console.log('Resume ID:', resumeId);
            console.log('User:', user);
            console.log('Current Resume:', currentResume);

            setDebugInfo({
                resumeId,
                userId: user?.id,
                hasUser: !!user,
                currentResumeId: currentResume?._id,
                authLoading
            });

            if (authLoading) {
                console.log('Auth still loading...');
                return;
            }

            if (!user) {
                console.log('No user, redirecting to login');
                navigate('/login');
                return;
            }

            try {
                setIsLoading(true);

                if (resumeId === 'new') {
                    console.log('Creating new resume...');
                    const newResume = await createNewResume({
                        title: 'Untitled Resume',
                        personalInfo: {
                            fullName: user?.name || '',
                            email: user?.email || ''
                        }
                    });

                    if (newResume) {
                        console.log('✅ New resume created:', newResume._id);
                        navigate(`/builder/${newResume._id}`);
                    }
                } else if (resumeId) {
                    console.log('Loading existing resume:', resumeId);
                    const loadedResume = await loadResume(resumeId);

                    if (!loadedResume) {
                        console.log('Resume not found, creating new...');
                        toast.error('Resume not found, creating new one');

                        const newResume = await createNewResume({
                            title: 'Untitled Resume',
                            personalInfo: {
                                fullName: user?.name || '',
                                email: user?.email || ''
                            }
                        });

                        if (newResume) {
                            navigate(`/builder/${newResume._id}`);
                        }
                    } else {
                        console.log('✅ Resume loaded:', loadedResume.title);
                    }
                }
            } catch (err) {
                console.error('❌ Builder init error:', err);
                setError(err.message);
                toast.error('Failed to load builder');
            } finally {
                setIsLoading(false);
            }
        };

        initBuilder();
    }, [resumeId, user, authLoading, navigate, loadResume, createNewResume]);

    if (authLoading || isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-white">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-600 font-medium">Loading resume builder...</p>
                    <p className="text-sm text-gray-500 mt-2">This may take a moment</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center p-8 bg-white rounded-xl shadow-md max-w-md">
                    <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                        <span className="text-red-600 text-2xl">!</span>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Builder Error</h2>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <div className="space-y-2 mb-6">
                        <button
                            onClick={() => window.location.reload()}
                            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            Reload Page
                        </button>
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                        >
                            Go to Dashboard
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
            <nav className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
                    <h1 className="text-xl font-bold text-blue-600">ResumeCraft Debug Builder</h1>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Back to Dashboard
                    </button>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-4 py-8">
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Builder Debug Info</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div className="bg-blue-50 p-4 rounded-lg">
                            <h3 className="font-semibold text-blue-800 mb-2">User Info</h3>
                            <pre className="text-sm bg-white p-3 rounded border overflow-auto max-h-60">
                                {JSON.stringify(user, null, 2)}
                            </pre>
                        </div>

                        <div className="bg-green-50 p-4 rounded-lg">
                            <h3 className="font-semibold text-green-800 mb-2">Resume Info</h3>
                            <pre className="text-sm bg-white p-3 rounded border overflow-auto max-h-60">
                                {JSON.stringify(debugInfo, null, 2)}
                            </pre>
                        </div>
                    </div>

                    <div className="bg-yellow-50 p-4 rounded-lg mb-6">
                        <h3 className="font-semibold text-yellow-800 mb-2">Current Resume Data</h3>
                        <pre className="text-sm bg-white p-3 rounded border overflow-auto max-h-96">
                            {JSON.stringify(currentResume, null, 2)}
                        </pre>
                    </div>

                    <div className="flex space-x-4">
                        <button
                            onClick={() => navigate(`/builder/${resumeId}`)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            Try Real Builder
                        </button>

                        <button
                            onClick={async () => {
                                try {
                                    const newResume = await createNewResume({
                                        title: 'Debug Resume',
                                        personalInfo: { fullName: user?.name || 'Test User' }
                                    });
                                    if (newResume) {
                                        navigate(`/builder/${newResume._id}`);
                                    }
                                } catch (err) {
                                    toast.error('Failed to create resume');
                                }
                            }}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                        >
                            Create Test Resume
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default DebugBuilder;