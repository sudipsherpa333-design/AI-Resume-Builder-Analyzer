// src/context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { Bell, LogOut, User, Settings, Shield, Database } from 'lucide-react';

// Create API instance
const createApi = () => {
    const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

    return {
        post: async (endpoint, data) => {
            const response = await fetch(`${baseURL}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
                credentials: 'include'
            });
            return response.json();
        },
        get: async (endpoint) => {
            const response = await fetch(`${baseURL}${endpoint}`, {
                credentials: 'include'
            });
            return response.json();
        },
        put: async (endpoint, data) => {
            const response = await fetch(`${baseURL}${endpoint}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
                credentials: 'include'
            });
            return response.json();
        },
        delete: async (endpoint) => {
            const response = await fetch(`${baseURL}${endpoint}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            return response.json();
        }
    };
};

const api = createApi();

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    // --- Authentication States ---
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isBackendAvailable, setIsBackendAvailable] = useState(false);
    const [notifications, setNotifications] = useState([]);

    // --- Utility Functions ---
    const checkBackendStatus = useCallback(async () => {
        try {
            const response = await fetch('http://localhost:5001/api/health', {
                method: 'GET',
                mode: 'cors',
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json();
                setIsBackendAvailable(true);
                return { success: true, data };
            } else {
                setIsBackendAvailable(false);
                console.warn("Backend responded with non-OK status:", response.status);
                return { success: false };
            }
        } catch (error) {
            setIsBackendAvailable(false);
            console.warn("Backend connection check failed:", error.message);
            return { success: false };
        }
    }, []);

    // --- Load user from localStorage ---
    const loadUserFromStorage = useCallback(() => {
        try {
            const savedUser = localStorage.getItem('resumeCraftUser');
            const savedToken = localStorage.getItem('resumeCraftToken');

            if (savedUser && savedToken) {
                const parsedUser = JSON.parse(savedUser);
                setUser(parsedUser);
                setIsAuthenticated(true);
                console.log('User restored from localStorage:', parsedUser.name);
                return parsedUser;
            }
        } catch (error) {
            console.error('Error parsing saved user data:', error);
            localStorage.removeItem('resumeCraftUser');
            localStorage.removeItem('resumeCraftToken');
        }
        return null;
    }, []);

    // --- Google OAuth Implementation ---
    const loginWithGoogle = useCallback(() => {
        setIsLoading(true);

        try {
            if (!isBackendAvailable) {
                // FALLBACK: Mock Google OAuth 
                const mockUser = {
                    id: `google_${Date.now()}`,
                    name: 'Google User',
                    email: 'google.user@example.com',
                    avatar: 'GU',
                    provider: 'google',
                    isVerified: true,
                    role: 'user',
                    createdAt: new Date().toISOString(),
                    plan: 'pro',
                    aiCredits: 150
                };
                const token = `google_token_${Date.now()}`;

                setUser(mockUser);
                setIsAuthenticated(true);
                localStorage.setItem('resumeCraftUser', JSON.stringify(mockUser));
                localStorage.setItem('resumeCraftToken', token);
                localStorage.setItem('resumeCraftProvider', 'google');
                toast.success(`🎉 Welcome, ${mockUser.name}! (Offline Google Login)`);
                setIsLoading(false);
                return { success: true, user: mockUser };
            }

            // BACKEND Google OAuth - Redirect to backend OAuth endpoint
            const googleAuthUrl = 'http://localhost:5001/api/auth/google';
            window.location.href = googleAuthUrl;

            // Don't set loading to false here since we're redirecting
            return { success: true, redirecting: true };

        } catch (error) {
            console.error('Google login initiation error:', error);
            const errorMsg = error.message || 'Google login failed';
            toast.error(errorMsg);
            setIsLoading(false);
            return { success: false, message: errorMsg };
        }
    }, [isBackendAvailable]);

    // --- Handle Google OAuth Callback ---
    const handleGoogleCallback = useCallback(async (code) => {
        setIsLoading(true);
        try {
            const response = await api.post('/api/auth/google/callback', { code });

            if (response.success) {
                const { token, user: userData } = response;
                localStorage.setItem('resumeCraftToken', token);
                localStorage.setItem('resumeCraftUser', JSON.stringify(userData));
                localStorage.setItem('resumeCraftProvider', 'google');
                setUser(userData);
                setIsAuthenticated(true);
                toast.success(`🎉 Welcome, ${userData.name}! Google login successful.`);
                setIsLoading(false);
                return { success: true, user: userData };
            } else {
                throw new Error(response.message || 'Google login failed');
            }
        } catch (error) {
            console.error('Google callback error:', error);
            const errorMsg = error.response?.message || error.message || 'Google login failed';
            toast.error(errorMsg);
            setIsLoading(false);
            return { success: false, message: errorMsg };
        }
    }, []);

    // --- AI Integration ---
    const generateAIResponse = useCallback(async (prompt, section, options = {}) => {
        setIsLoading(true);
        try {
            if (isBackendAvailable) {
                const response = await api.post('/api/ai/generate', {
                    prompt,
                    section,
                    options
                });

                if (response.success) {
                    toast.success('AI content generated successfully!');
                    setIsLoading(false);
                    return { success: true, data: response.content, creditsUsed: response.creditsUsed };
                } else {
                    throw new Error(response.message || 'AI generation failed');
                }
            }

            // FALLBACK: Mock AI Response
            console.log(`[AI Mock] Generating content for section: ${section}`);
            await new Promise(resolve => setTimeout(resolve, 1200));

            const mockResponses = {
                summary: `Dynamic and results-oriented professional with proven expertise in delivering innovative solutions. Strong leadership skills combined with exceptional analytical capabilities. Demonstrated success in driving business growth and operational excellence.`,
                experience: `• Led cross-functional teams to deliver projects 20% ahead of schedule\n• Implemented new processes that increased efficiency by 35%\n• Managed budgets up to $500k with 98% accuracy\n• Mentored 5 junior team members to improve overall team performance`,
                skills: 'React, Node.js, Python, AWS, Docker, Kubernetes, MongoDB, PostgreSQL, GraphQL, TypeScript, CI/CD, Agile/Scrum',
                projects: `Developed a scalable web application serving 10k+ users with 99.9% uptime. Implemented microservices architecture that reduced response time by 40%.`,
                default: `AI-enhanced content optimized for ${section}. This content highlights key achievements and professional capabilities effectively.`
            };

            const content = mockResponses[section] || mockResponses.default;
            toast.success('AI content generated (offline mode)');
            setIsLoading(false);
            return { success: true, data: content, creditsUsed: 1 };

        } catch (error) {
            console.error('AI Generation error:', error);
            const errorMsg = error.message || 'AI generation failed';
            toast.error(`AI Assistant failed: ${errorMsg}`);
            setIsLoading(false);
            return { success: false, message: errorMsg };
        }
    }, [isBackendAvailable]);

    // --- Core Authentication Functions ---
    const register = useCallback(async (name, email, password) => {
        setIsLoading(true);
        try {
            if (!isBackendAvailable) {
                // FALLBACK: Local storage registration
                const fallbackUsers = JSON.parse(localStorage.getItem('resumeCraftUsers') || '[]');
                const userExists = fallbackUsers.find(u => u.email === email);

                if (userExists) {
                    toast.error('User already exists with this email');
                    setIsLoading(false);
                    return { success: false, message: 'User already exists' };
                }

                const newUser = {
                    id: `user_${Date.now()}`,
                    name,
                    email,
                    password,
                    avatar: name.split(' ').map(n => n[0]).join('').toUpperCase(),
                    createdAt: new Date().toISOString(),
                    isVerified: false,
                    role: 'user',
                    plan: 'free',
                    aiCredits: 50
                };

                fallbackUsers.push(newUser);
                localStorage.setItem('resumeCraftUsers', JSON.stringify(fallbackUsers));

                // Auto-login after registration
                const { password: _, ...userWithoutPassword } = newUser;
                const token = `token_${Date.now()}`;

                setUser(userWithoutPassword);
                setIsAuthenticated(true);
                localStorage.setItem('resumeCraftUser', JSON.stringify(userWithoutPassword));
                localStorage.setItem('resumeCraftToken', token);
                toast.success('🎉 Registration successful! Welcome aboard!');
                setIsLoading(false);
                return { success: true, user: userWithoutPassword };
            }

            // BACKEND registration
            const response = await api.post('/api/auth/register', { name, email, password });

            if (response.success) {
                const { token, user: userData } = response;
                localStorage.setItem('resumeCraftToken', token);
                localStorage.setItem('resumeCraftUser', JSON.stringify(userData));
                setUser(userData);
                setIsAuthenticated(true);
                toast.success('🎉 Registration successful! Welcome aboard!');
                setIsLoading(false);
                return { success: true, user: userData };
            } else {
                throw new Error(response.message || 'Registration failed');
            }
        } catch (error) {
            console.error('Registration error:', error);
            const errorMsg = error.message || 'Registration failed';
            toast.error(errorMsg);
            setIsLoading(false);
            return { success: false, message: errorMsg };
        }
    }, [isBackendAvailable]);

    const login = useCallback(async (email, password) => {
        setIsLoading(true);
        try {
            if (!isBackendAvailable) {
                // FALLBACK: Local storage login
                const savedUsers = JSON.parse(localStorage.getItem('resumeCraftUsers') || '[]');
                const DEMO_USERS = [
                    {
                        id: '1',
                        name: 'Demo User',
                        email: 'demo@example.com',
                        password: 'password123',
                        avatar: 'DU',
                        role: 'user',
                        plan: 'pro',
                        aiCredits: 150,
                        createdAt: new Date().toISOString()
                    },
                ];

                let userToLogin = [...savedUsers, ...DEMO_USERS].find(u =>
                    u.email === email && u.password === password
                );

                if (userToLogin) {
                    const token = `token_${Date.now()}`;
                    const { password: _, ...userWithoutPassword } = userToLogin;

                    setUser(userWithoutPassword);
                    setIsAuthenticated(true);
                    localStorage.setItem('resumeCraftUser', JSON.stringify(userWithoutPassword));
                    localStorage.setItem('resumeCraftToken', token);
                    toast.success(`🎉 Welcome back, ${userWithoutPassword.name}!`);
                    setIsLoading(false);
                    return { success: true, user: userWithoutPassword };
                } else {
                    toast.error('Invalid email or password');
                    setIsLoading(false);
                    return { success: false, message: 'Invalid credentials' };
                }
            }

            // BACKEND login
            const response = await api.post('/api/auth/login', { email, password });

            if (response.success) {
                const { token, user: userData } = response;
                localStorage.setItem('resumeCraftToken', token);
                localStorage.setItem('resumeCraftUser', JSON.stringify(userData));
                setUser(userData);
                setIsAuthenticated(true);
                toast.success(`🎉 Welcome back, ${userData.name}!`);
                setIsLoading(false);
                return { success: true, user: userData };
            } else {
                throw new Error(response.message || 'Login failed');
            }
        } catch (error) {
            console.error('Login error:', error);
            const errorMsg = error.message || 'Login failed';
            toast.error(errorMsg);
            setIsLoading(false);
            return { success: false, message: errorMsg };
        }
    }, [isBackendAvailable]);

    // --- Demo Login ---
    const demoLogin = useCallback(async () => {
        setIsLoading(true);
        try {
            const demoUser = {
                id: 'demo_1',
                name: 'Demo User',
                email: 'demo@example.com',
                avatar: 'DU',
                role: 'user',
                plan: 'pro',
                aiCredits: 150,
                isVerified: true,
                createdAt: new Date().toISOString()
            };
            const token = `demo_token_${Date.now()}`;

            setUser(demoUser);
            setIsAuthenticated(true);
            localStorage.setItem('resumeCraftUser', JSON.stringify(demoUser));
            localStorage.setItem('resumeCraftToken', token);
            toast.success('🚀 Welcome to Demo Account! (Offline Mode)');
            setIsLoading(false);
            return { success: true, user: demoUser };
        } catch (error) {
            console.error('Demo login error:', error);
            toast.error('Demo login failed');
            setIsLoading(false);
            return { success: false, message: 'Demo login failed' };
        }
    }, []);

    // --- Logout ---
    const logout = useCallback(() => {
        try {
            localStorage.removeItem('resumeCraftUser');
            localStorage.removeItem('resumeCraftToken');
            localStorage.removeItem('resumeCraftProvider');
            setUser(null);
            setIsAuthenticated(false);
            setNotifications([]);
            toast.success('Logged out successfully');

            setTimeout(() => {
                window.location.href = '/login';
            }, 300);
        } catch (error) {
            console.error('Logout error:', error);
            toast.error('Logout failed');
        }
    }, []);

    // --- Update Profile ---
    const updateProfile = useCallback(async (updates) => {
        setIsLoading(true);
        try {
            if (!user) {
                toast.error('No user logged in');
                setIsLoading(false);
                return { success: false, message: 'No user logged in' };
            }

            const updatedUser = {
                ...user,
                ...updates,
                updatedAt: new Date().toISOString()
            };

            setUser(updatedUser);
            localStorage.setItem('resumeCraftUser', JSON.stringify(updatedUser));

            if (isBackendAvailable) {
                const response = await api.put('/api/users/profile', updates);
                if (!response.success) throw new Error(response.message);
            }

            toast.success('Profile updated successfully');
            setIsLoading(false);
            return { success: true, user: updatedUser };
        } catch (error) {
            console.error('Update profile error:', error);
            const errorMsg = error.message || 'Failed to update profile';
            toast.error(errorMsg);
            setIsLoading(false);
            return { success: false, message: errorMsg };
        }
    }, [user, isBackendAvailable]);

    // --- Add Notification ---
    const addNotification = useCallback((notification) => {
        setNotifications(prev => [
            {
                id: Date.now(),
                text: notification.text,
                type: notification.type || 'info',
                time: new Date().toISOString(),
                read: false
            },
            ...prev
        ].slice(0, 10)); // Keep only last 10 notifications
    }, []);

    // --- Mark Notification as Read ---
    const markNotificationAsRead = useCallback((id) => {
        setNotifications(prev =>
            prev.map(notification =>
                notification.id === id
                    ? { ...notification, read: true }
                    : notification
            )
        );
    }, []);

    // --- Clear All Notifications ---
    const clearAllNotifications = useCallback(() => {
        setNotifications([]);
    }, []);

    // --- Initialize on mount ---
    useEffect(() => {
        const initializeAuth = async () => {
            setIsLoading(true);
            try {
                const backendStatus = await checkBackendStatus();

                if (backendStatus.success) {
                    setIsBackendAvailable(true);
                    console.log('✅ Backend is available');

                    // Try to load user from localStorage first
                    const loadedUser = loadUserFromStorage();

                    if (loadedUser && isBackendAvailable) {
                        // Verify user with backend
                        try {
                            const response = await api.get('/api/users/profile');
                            if (response.success) {
                                // Update with latest user data
                                setUser(response.user);
                                localStorage.setItem('resumeCraftUser', JSON.stringify(response.user));
                            }
                        } catch (error) {
                            console.warn('Could not verify user with backend, using cached data');
                        }
                    }
                } else {
                    console.warn('⚠️ Backend is not available, using offline mode');
                    loadUserFromStorage();
                }

                // Load demo notifications
                setNotifications([
                    {
                        id: 1,
                        text: 'AI has suggestions for your summary',
                        type: 'ai',
                        time: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
                        read: false
                    },
                    {
                        id: 2,
                        text: 'Resume saved to cloud',
                        type: 'success',
                        time: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
                        read: true
                    },
                    {
                        id: 3,
                        text: 'ATS score improved by 15%',
                        type: 'improvement',
                        time: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
                        read: true
                    }
                ]);

            } catch (error) {
                console.error('Auth initialization error:', error);
                // Still try to load from localStorage
                loadUserFromStorage();
            } finally {
                setIsLoading(false);
            }
        };

        initializeAuth();
    }, [checkBackendStatus, loadUserFromStorage]);

    // --- Context Value ---
    const value = {
        user,
        isAuthenticated,
        isLoading,
        isBackendAvailable,
        notifications,
        register,
        login,
        loginWithGoogle,
        handleGoogleCallback,
        demoLogin,
        logout,
        updateProfile,
        generateAIResponse,
        checkBackendStatus,
        addNotification,
        markNotificationAsRead,
        clearAllNotifications,
        forgotPassword: async (email) => {
            toast.success(`Password reset link sent to ${email} (demo mode)`);
            return { success: true, message: 'Reset link sent' };
        },
        clearLocalData: () => {
            localStorage.removeItem('resumeCraftUser');
            localStorage.removeItem('resumeCraftToken');
            localStorage.removeItem('resumeCraftProvider');
            localStorage.removeItem('resumeCraftUsers');
            setUser(null);
            setIsAuthenticated(false);
            setNotifications([]);
            toast.success('Local data cleared');
        }
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook for notifications
export const useNotifications = () => {
    const { notifications, markNotificationAsRead, clearAllNotifications, addNotification } = useAuth();

    const unreadCount = notifications.filter(n => !n.read).length;

    return {
        notifications,
        unreadCount,
        markAsRead: markNotificationAsRead,
        clearAll: clearAllNotifications,
        add: addNotification
    };
};