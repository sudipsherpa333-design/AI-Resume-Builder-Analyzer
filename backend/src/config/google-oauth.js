import { OAuth2Client } from 'google-auth-library';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';

/**
 * Google OAuth Configuration - Production Ready
 */

// ======================
// ENVIRONMENT VALIDATION
// ======================
const validateGoogleConfig = () => {
    const requiredConfig = {
        GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
        GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET
    };

    const missing = [];
    Object.entries(requiredConfig).forEach(([key, value]) => {
        if (!value) missing.push(key);
    });

    if (missing.length > 0) {
        console.warn(`⚠️ Google OAuth not configured - Missing: ${missing.join(', ')}`);
        return false;
    }

    return true;
};

// ======================
// CONFIGURATION CONSTANTS
// ======================
const GOOGLE_CONFIG = {
    CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL || '/api/auth/google/callback',
    ADMIN_CALLBACK_URL: process.env.GOOGLE_ADMIN_CALLBACK_URL || '/api/auth/google/admin/callback',

    // Scopes for different use cases
    SCOPES: {
        USER: ['profile', 'email'],
        ADMIN: ['profile', 'email']
    },

    // Token settings
    TOKEN_OPTIONS: {
        expiresIn: '7d', // Regular users
        adminExpiresIn: '24h' // Admin users
    }
};

// ======================
// GOOGLE CLIENT SETUP
// ======================
let googleClient = null;

/**
 * Initialize Google OAuth client
 */
export const initializeGoogleClient = () => {
    if (!validateGoogleConfig()) {
        console.log('Google OAuth client not initialized - missing configuration');
        return null;
    }

    try {
        googleClient = new OAuth2Client(
            GOOGLE_CONFIG.CLIENT_ID,
            GOOGLE_CONFIG.CLIENT_SECRET
        );

        console.log('✅ Google OAuth client initialized');
        return googleClient;
    } catch (error) {
        console.error('❌ Failed to initialize Google OAuth client:', error);
        return null;
    }
};

// Initialize on import
googleClient = initializeGoogleClient();

/**
 * Verify Google ID token
 * @param {string} idToken - Google ID token
 * @returns {Promise<Object>} Verified user payload
 */
export const verifyGoogleToken = async (idToken) => {
    if (!googleClient) {
        throw new Error('Google OAuth client not initialized');
    }

    try {
        const ticket = await googleClient.verifyIdToken({
            idToken,
            audience: GOOGLE_CONFIG.CLIENT_ID
        });

        const payload = ticket.getPayload();

        // Validate required fields
        if (!payload.email || !payload.sub) {
            throw new Error('Invalid Google token payload');
        }

        console.log('✅ Google token verified:', {
            email: payload.email,
            name: payload.name
        });

        return {
            id: payload.sub,
            email: payload.email,
            name: payload.name,
            picture: payload.picture,
            email_verified: payload.email_verified,
            locale: payload.locale,
            hd: payload.hd, // Google Workspace domain
            provider: 'google'
        };

    } catch (error) {
        console.error('❌ Google token verification failed:', error.message);

        // Enhanced error messages
        let errorMessage = 'Google authentication failed';
        if (error.message.includes('Token used too late')) {
            errorMessage = 'Google token has expired. Please try again.';
        } else if (error.message.includes('audience')) {
            errorMessage = 'Invalid Google client configuration.';
        } else if (error.message.includes('jwt expired')) {
            errorMessage = 'Google token has expired.';
        }

        throw new Error(errorMessage);
    }
};

// ======================
// PASSPORT STRATEGIES
// ======================

/**
 * Configure Google OAuth Passport strategies
 * @param {Object} passportInstance - Passport instance
 */
export const configureGoogleOAuth = (passportInstance) => {
    if (!validateGoogleConfig()) {
        console.log('⚠️ Skipping Google OAuth Passport configuration');
        return;
    }

    // ======================
    // GOOGLE USER STRATEGY
    // ======================
    const userCallbackURL = process.env.NODE_ENV === 'production'
        ? `${process.env.BACKEND_URL || process.env.API_URL}${GOOGLE_CONFIG.CALLBACK_URL}`
        : `http://localhost:${process.env.PORT || 5001}${GOOGLE_CONFIG.CALLBACK_URL}`;

    passportInstance.use('google-user', new GoogleStrategy({
        clientID: GOOGLE_CONFIG.CLIENT_ID,
        clientSecret: GOOGLE_CONFIG.CLIENT_SECRET,
        callbackURL: userCallbackURL,
        scope: GOOGLE_CONFIG.SCOPES.USER,
        state: true,
        passReqToCallback: true,
        accessType: 'offline',
        prompt: 'consent'
    },
        async (req, accessToken, refreshToken, profile, done) => {
            try {
                console.log('🔐 Google OAuth user authentication:', {
                    email: profile.emails?.[0]?.value,
                    id: profile.id,
                    displayName: profile.displayName
                });

                const email = profile.emails?.[0]?.value;
                const googleId = profile.id;

                if (!email) {
                    return done(new Error('No email provided by Google'), null);
                }

                // Find or create user
                let user = await User.findOne({
                    $or: [
                        { googleId },
                        { email }
                    ]
                });

                if (!user) {
                    // Create new user
                    user = new User({
                        googleId,
                        name: profile.displayName,
                        email,
                        avatar: profile.photos?.[0]?.value || '',
                        isOAuth: true,
                        isVerified: true,
                        emailVerifiedAt: new Date(),
                        lastLogin: new Date(),
                        provider: 'google',
                        role: 'user',
                        isActive: true,
                        stats: {
                            loginCount: 1,
                            lastActive: new Date()
                        },
                        usage: {
                            loginCount: 1,
                            resumeCount: 0,
                            aiUsageCount: 0,
                            exportCount: 0,
                            lastResumeCreated: null,
                            lastAIAssisted: null
                        },
                        flags: {
                            hasCompletedProfile: false,
                            hasCreatedFirstResume: false,
                            hasUsedAI: false,
                            hasExportedResume: false
                        }
                    });

                    await user.save();
                    console.log('✅ New Google user created:', email);

                } else {
                    // Update existing user
                    if (!user.googleId) {
                        user.googleId = googleId;
                    }

                    user.isOAuth = true;
                    user.provider = 'google';
                    user.lastLogin = new Date();
                    user.isActive = true;
                    user.isSuspended = false;

                    // Update avatar if not set and Google has one
                    if (!user.avatar && profile.photos?.[0]?.value) {
                        user.avatar = profile.photos[0].value;
                    }

                    // Update login stats
                    user.usage.loginCount = (user.usage.loginCount || 0) + 1;
                    user.usage.lastLogin = new Date();

                    // Add login activity
                    await user.addActivity({
                        type: 'login',
                        description: 'Logged in via Google',
                        metadata: {
                            provider: 'google',
                            method: 'oauth',
                            ip: req.ip
                        }
                    });

                    await user.save();
                    console.log('✅ Existing user updated with Google:', email);
                }

                // Generate JWT token
                const tokenPayload = {
                    userId: user._id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    isOAuth: true,
                    provider: 'google'
                };

                const token = jwt.sign(
                    tokenPayload,
                    process.env.JWT_SECRET || 'your-jwt-secret-key-change-in-production',
                    { expiresIn: GOOGLE_CONFIG.TOKEN_OPTIONS.expiresIn }
                );

                console.log('✅ Google OAuth successful for user:', email);

                return done(null, { user, token });

            } catch (error) {
                console.error('❌ Google OAuth error:', error);
                return done(error, null);
            }
        }));

    console.log('✅ Google OAuth user strategy configured');

    // ======================
    // GOOGLE ADMIN STRATEGY (Optional)
    // ======================
    if (process.env.GOOGLE_ADMIN_CLIENT_ID && process.env.GOOGLE_ADMIN_CLIENT_SECRET) {
        const adminCallbackURL = process.env.NODE_ENV === 'production'
            ? `${process.env.BACKEND_URL || process.env.API_URL}${GOOGLE_CONFIG.ADMIN_CALLBACK_URL}`
            : `http://localhost:${process.env.PORT || 5001}${GOOGLE_CONFIG.ADMIN_CALLBACK_URL}`;

        passportInstance.use('google-admin', new GoogleStrategy({
            clientID: process.env.GOOGLE_ADMIN_CLIENT_ID,
            clientSecret: process.env.GOOGLE_ADMIN_CLIENT_SECRET,
            callbackURL: adminCallbackURL,
            scope: GOOGLE_CONFIG.SCOPES.ADMIN,
            state: true,
            passReqToCallback: true,
            prompt: 'select_account' // Force account selection for admin
        },
            async (req, accessToken, refreshToken, profile, done) => {
                try {
                    console.log('🔐 Google OAuth admin authentication:', {
                        email: profile.emails?.[0]?.value,
                        id: profile.id
                    });

                    const email = profile.emails?.[0]?.value;

                    if (!email) {
                        return done(new Error('No email provided by Google'), null);
                    }

                    // Find admin user
                    const user = await User.findOne({
                        email,
                        role: { $in: ['admin', 'super_admin'] },
                        isActive: true,
                        isSuspended: false
                    });

                    if (!user) {
                        return done(new Error('Admin user not found or unauthorized'), null);
                    }

                    // Update admin info
                    user.googleId = profile.id;
                    user.isOAuth = true;
                    user.provider = 'google';
                    user.lastLogin = new Date();

                    if (!user.avatar && profile.photos?.[0]?.value) {
                        user.avatar = profile.photos[0].value;
                    }

                    // Update login stats
                    user.usage.loginCount = (user.usage.loginCount || 0) + 1;

                    // Add admin login activity
                    await user.addActivity({
                        type: 'login',
                        description: 'Admin logged in via Google',
                        metadata: {
                            provider: 'google',
                            method: 'oauth_admin',
                            ip: req.ip
                        }
                    });

                    await user.save();

                    // Generate admin JWT token
                    const tokenPayload = {
                        userId: user._id,
                        email: user.email,
                        name: user.name,
                        role: user.role,
                        isAdmin: true,
                        isOAuth: true,
                        provider: 'google',
                        permissions: user.permissions || []
                    };

                    const token = jwt.sign(
                        tokenPayload,
                        process.env.JWT_ADMIN_SECRET || process.env.JWT_SECRET,
                        { expiresIn: GOOGLE_CONFIG.TOKEN_OPTIONS.adminExpiresIn }
                    );

                    console.log('✅ Google OAuth successful for admin:', email);

                    return done(null, { user, token });

                } catch (error) {
                    console.error('❌ Google Admin OAuth error:', error);
                    return done(error, null);
                }
            }));

        console.log('✅ Google OAuth admin strategy configured');
    }
};

// ======================
// HELPER FUNCTIONS
// ======================

/**
 * Get Google OAuth URLs for frontend
 * @returns {Object} URLs for user and admin authentication
 */
export const getGoogleAuthUrls = () => {
    const baseUrl = process.env.NODE_ENV === 'production'
        ? process.env.BACKEND_URL || process.env.API_URL
        : `http://localhost:${process.env.PORT || 5001}`;

    const urls = {
        user: {
            auth: `${baseUrl}/api/auth/google`,
            callback: `${baseUrl}${GOOGLE_CONFIG.CALLBACK_URL}`,
            verify: `${baseUrl}/api/auth/google/verify`
        }
    };

    // Add admin URLs if configured
    if (process.env.GOOGLE_ADMIN_CLIENT_ID) {
        urls.admin = {
            auth: `${baseUrl}/api/auth/google/admin`,
            callback: `${baseUrl}${GOOGLE_CONFIG.ADMIN_CALLBACK_URL}`,
            verify: `${baseUrl}/api/auth/google/admin/verify`
        };
    }

    return urls;
};

/**
 * Generate JWT token for user
 * @param {Object} user - User object
 * @param {boolean} isAdmin - Whether user is admin
 * @returns {string} JWT token
 */
export const generateUserToken = (user, isAdmin = false) => {
    const payload = {
        userId: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        isOAuth: user.isOAuth || false,
        provider: user.provider || 'local'
    };

    if (isAdmin) {
        payload.isAdmin = true;
    }

    const secret = isAdmin
        ? process.env.JWT_ADMIN_SECRET || process.env.JWT_SECRET
        : process.env.JWT_SECRET;

    const expiresIn = isAdmin
        ? GOOGLE_CONFIG.TOKEN_OPTIONS.adminExpiresIn
        : GOOGLE_CONFIG.TOKEN_OPTIONS.expiresIn;

    return jwt.sign(payload, secret, { expiresIn });
};

/**
 * Handle Google user creation/update
 * @param {Object} googleUser - Google user data
 * @param {Object} existingUser - Existing user (if any)
 * @returns {Promise<Object>} User object
 */
export const handleGoogleUser = async (googleUser, existingUser = null) => {
    try {
        let user = existingUser;

        if (!user) {
            // Create new user
            user = new User({
                googleId: googleUser.id,
                name: googleUser.name,
                email: googleUser.email,
                avatar: googleUser.picture || '',
                isOAuth: true,
                isVerified: googleUser.email_verified || false,
                emailVerifiedAt: googleUser.email_verified ? new Date() : null,
                lastLogin: new Date(),
                provider: 'google',
                role: 'user',
                isActive: true,
                stats: {
                    loginCount: 1,
                    lastActive: new Date()
                },
                usage: {
                    loginCount: 1,
                    resumeCount: 0,
                    aiUsageCount: 0,
                    exportCount: 0,
                    lastResumeCreated: null,
                    lastAIAssisted: null
                },
                flags: {
                    hasCompletedProfile: false,
                    hasCreatedFirstResume: false,
                    hasUsedAI: false,
                    hasExportedResume: false
                }
            });

            await user.save();
            console.log('✅ New Google user created:', googleUser.email);

        } else {
            // Update existing user
            if (!user.googleId) {
                user.googleId = googleUser.id;
            }

            user.isOAuth = true;
            user.provider = 'google';
            user.lastLogin = new Date();

            if (!user.avatar && googleUser.picture) {
                user.avatar = googleUser.picture;
            }

            if (googleUser.email_verified && !user.isVerified) {
                user.isVerified = true;
                user.emailVerifiedAt = new Date();
            }

            // Update login stats
            user.usage.loginCount = (user.usage.loginCount || 0) + 1;

            await user.save();
            console.log('✅ Existing user updated with Google:', googleUser.email);
        }

        return user;

    } catch (error) {
        console.error('❌ Error handling Google user:', error);
        throw error;
    }
};

/**
 * Check if Google OAuth is configured
 * @returns {boolean} Whether Google OAuth is configured
 */
export const isGoogleConfigured = () => {
    return validateGoogleConfig();
};

// Export default configuration
export default {
    initializeGoogleClient,
    verifyGoogleToken,
    configureGoogleOAuth,
    getGoogleAuthUrls,
    generateUserToken,
    handleGoogleUser,
    isGoogleConfigured,
    GOOGLE_CONFIG
};