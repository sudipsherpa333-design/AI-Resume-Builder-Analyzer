import express from 'express';
import passport from 'passport';
import { verifyGoogleToken, handleGoogleUser, generateUserToken, getGoogleAuthUrls } from '../config/google-oauth.js';

const router = express.Router();

/**
 * @route   GET /api/auth/google/urls
 * @desc    Get Google OAuth URLs for frontend
 * @access  Public
 */
router.get('/google/urls', (req, res) => {
    try {
        const urls = getGoogleAuthUrls();

        return res.json({
            success: true,
            data: urls,
            configured: process.env.GOOGLE_CLIENT_ID ? true : false,
            requestId: req.headers['x-request-id']
        });
    } catch (error) {
        console.error('Error getting Google URLs:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to get Google OAuth URLs',
            requestId: req.headers['x-request-id']
        });
    }
});

/**
 * @route   POST /api/auth/google/verify
 * @desc    Verify Google ID token (for frontend Google Sign-In button)
 * @access  Public
 */
router.post('/google/verify', async (req, res) => {
    const { token, isAdmin = false } = req.body;
    const requestId = req.headers['x-request-id'];

    console.log('🔐 Google OAuth verification request:', { requestId, isAdmin });

    try {
        if (!token) {
            return res.status(400).json({
                success: false,
                error: 'Google token is required',
                requestId
            });
        }

        // Verify Google token
        const googleUser = await verifyGoogleToken(token);

        // Check if user exists
        let user = await User.findOne({
            $or: [
                { googleId: googleUser.id },
                { email: googleUser.email }
            ]
        });

        // Handle user creation/update
        user = await handleGoogleUser(googleUser, user);

        // Check admin authorization if isAdmin is true
        if (isAdmin && !['admin', 'super_admin'].includes(user.role)) {
            return res.status(403).json({
                success: false,
                error: 'User is not authorized as admin',
                requestId
            });
        }

        // Generate JWT token
        const jwtToken = generateUserToken(user, isAdmin);

        // Prepare user response
        const userResponse = user.toObject();
        delete userResponse.password;
        delete userResponse.resetPasswordToken;
        delete userResponse.resetPasswordExpires;
        delete userResponse.emailVerificationToken;
        delete userResponse.emailVerificationExpires;

        console.log('✅ Google OAuth successful:', { email: user.email, isAdmin });

        return res.json({
            success: true,
            token: jwtToken,
            user: userResponse,
            isAdmin: isAdmin,
            isOAuth: true,
            provider: 'google',
            message: 'Google authentication successful',
            requestId
        });

    } catch (error) {
        console.error('❌ Google OAuth verification error:', error.message);

        return res.status(401).json({
            success: false,
            error: error.message || 'Google authentication failed',
            timestamp: new Date().toISOString(),
            requestId
        });
    }
});

/**
 * @route   GET /api/auth/google
 * @desc    Initiate Google OAuth flow for users
 * @access  Public
 */
router.get('/google',
    passport.authenticate('google-user', {
        scope: ['profile', 'email'],
        session: false,
        accessType: 'offline',
        prompt: 'consent'
    })
);

/**
 * @route   GET /api/auth/google/callback
 * @desc    Google OAuth callback for users
 * @access  Public
 */
router.get('/google/callback',
    passport.authenticate('google-user', {
        failureRedirect: '/login?error=auth_failed',
        session: false
    }),
    async (req, res) => {
        try {
            const { user, token } = req.user;

            // Redirect to frontend with token
            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
            const redirectUrl = `${frontendUrl}/auth/callback?token=${token}&user=${encodeURIComponent(JSON.stringify({
                id: user._id,
                email: user.email,
                name: user.name,
                avatar: user.avatar,
                role: user.role,
                isOAuth: true,
                provider: 'google'
            }))}`;

            return res.redirect(redirectUrl);

        } catch (error) {
            console.error('❌ Google callback error:', error);
            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
            return res.redirect(`${frontendUrl}/login?error=auth_failed`);
        }
    }
);

/**
 * @route   GET /api/auth/google/admin
 * @desc    Initiate Google OAuth flow for admin (if configured)
 * @access  Public
 */
router.get('/google/admin',
    (req, res, next) => {
        if (!process.env.GOOGLE_ADMIN_CLIENT_ID) {
            return res.status(501).json({
                success: false,
                error: 'Google Admin OAuth not configured'
            });
        }
        next();
    },
    passport.authenticate('google-admin', {
        scope: ['profile', 'email'],
        session: false,
        prompt: 'select_account'
    })
);

/**
 * @route   GET /api/auth/google/admin/callback
 * @desc    Google OAuth callback for admin
 * @access  Public
 */
router.get('/google/admin/callback',
    (req, res, next) => {
        if (!process.env.GOOGLE_ADMIN_CLIENT_ID) {
            return res.redirect('/admin/login?error=not_configured');
        }
        next();
    },
    passport.authenticate('google-admin', {
        failureRedirect: '/admin/login?error=auth_failed',
        session: false
    }),
    async (req, res) => {
        try {
            const { user, token } = req.user;

            // Redirect to admin frontend
            const adminFrontendUrl = process.env.ADMIN_FRONTEND_URL || 'http://localhost:3000/admin';
            const redirectUrl = `${adminFrontendUrl}/auth/callback?token=${token}&admin=${encodeURIComponent(JSON.stringify({
                id: user._id,
                email: user.email,
                name: user.name,
                avatar: user.avatar,
                role: user.role,
                isAdmin: true,
                isOAuth: true,
                provider: 'google'
            }))}`;

            return res.redirect(redirectUrl);

        } catch (error) {
            console.error('❌ Google admin callback error:', error);
            const adminFrontendUrl = process.env.ADMIN_FRONTEND_URL || 'http://localhost:3000/admin';
            return res.redirect(`${adminFrontendUrl}/login?error=auth_failed`);
        }
    }
);

export default router;