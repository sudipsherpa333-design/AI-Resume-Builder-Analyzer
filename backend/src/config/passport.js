// config/passport.js - Updated
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';
import { generateToken } from '../utils/jwtToken.js';

const configurePassport = () => {
    // Serialization
    passport.serializeUser((user, done) => {
        done(null, user.id || user._id);
    });

    passport.deserializeUser(async (id, done) => {
        try {
            const user = await User.findById(id);
            done(null, user);
        } catch (error) {
            done(error, null);
        }
    });

    // Google Strategy - FIXED
    if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
        // Dynamic callback URL
        const callbackURL = process.env.NODE_ENV === 'production'
            ? `${process.env.BACKEND_URL}/api/auth/google/callback`
            : `${process.env.BACKEND_URL || 'http://localhost:5001'}/api/auth/google/callback`;

        console.log('Google OAuth Callback URL:', callbackURL);

        passport.use(new GoogleStrategy({
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: callbackURL,
            passReqToCallback: true,
            scope: ['profile', 'email']
        },
            async (req, accessToken, refreshToken, profile, done) => {
                try {
                    console.log('Google Profile received:', {
                        id: profile.id,
                        email: profile.emails?.[0]?.value,
                        name: profile.displayName
                    });

                    // Find user by googleId or email
                    let user = await User.findOne({
                        $or: [
                            { googleId: profile.id },
                            { email: profile.emails[0].value }
                        ]
                    });

                    if (!user) {
                        // Create new user
                        user = new User({
                            googleId: profile.id,
                            name: profile.displayName,
                            email: profile.emails[0].value,
                            avatar: profile.photos?.[0]?.value || '',
                            isOAuth: true,
                            isVerified: true,
                            emailVerifiedAt: new Date(),
                            lastLogin: new Date(),
                            provider: 'google',
                            stats: {
                                loginCount: 1,
                                lastActive: new Date()
                            }
                        });
                        await user.save();
                        console.log('✅ New Google user created:', user.email);
                    } else {
                        // Update existing user
                        user.googleId = profile.id;
                        user.lastLogin = new Date();
                        user.isOAuth = true;
                        user.provider = 'google';
                        user.stats.loginCount = (user.stats?.loginCount || 0) + 1;
                        user.stats.lastActive = new Date();

                        if (!user.avatar && profile.photos?.[0]?.value) {
                            user.avatar = profile.photos[0].value;
                        }

                        await user.save();
                        console.log('✅ Existing user updated:', user.email);
                    }

                    const token = generateToken(user._id);
                    return done(null, { user, token });

                } catch (error) {
                    console.error('❌ Google OAuth error:', error);
                    return done(error, null);
                }
            }));
        console.log('✅ Google OAuth strategy configured');
    } else {
        console.warn('⚠️ Google OAuth not configured - missing CLIENT_ID or CLIENT_SECRET');
    }
};

export default configurePassport;