import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Admin from '../models/Admin.js';
import { configureGoogleOAuth } from './google-oauth.js';

/**
 * Configure all authentication strategies
 */
export const configurePassport = () => {
    // ======================
    // JWT Strategy for API authentication
    // ======================
    const jwtOptions = {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: process.env.JWT_SECRET || 'your-secret-key-change-this-in-production'
    };

    passport.use(new JwtStrategy(jwtOptions, async (payload, done) => {
        try {
            // Check if it's an admin token
            if (payload.isAdmin) {
                const admin = await Admin.findById(payload.adminId || payload.userId);
                if (admin) {
                    return done(null, admin);
                }
            } else {
                // Regular user token
                const user = await User.findById(payload.userId);
                if (user) {
                    return done(null, user);
                }
            }
            return done(null, false);
        } catch (error) {
            return done(error, false);
        }
    }));

    // ======================
    // Local Strategy for email/password
    // ======================
    passport.use(new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password'
    }, async (email, password, done) => {
        try {
            const user = await User.findOne({ email }).select('+password');

            if (!user) {
                return done(null, false, { message: 'Invalid email or password' });
            }

            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                return done(null, false, { message: 'Invalid email or password' });
            }

            // Update last login
            user.lastLogin = new Date();
            user.stats = user.stats || {};
            user.stats.loginCount = (user.stats.loginCount || 0) + 1;
            user.stats.lastActive = new Date();
            await user.save();

            return done(null, user);
        } catch (error) {
            return done(error);
        }
    }));

    // ======================
    // Google OAuth Strategies
    // ======================
    configureGoogleOAuth(passport);

    // ======================
    // Serialization
    // ======================
    passport.serializeUser((user, done) => {
        const id = user._id || user.id;
        const type = user.role === 'admin' || user.role === 'super_admin' ? 'admin' : 'user';
        done(null, { id, type });
    });

    passport.deserializeUser(async (data, done) => {
        try {
            if (data.type === 'admin') {
                const admin = await Admin.findById(data.id);
                done(null, admin);
            } else {
                const user = await User.findById(data.id);
                done(null, user);
            }
        } catch (error) {
            done(error, null);
        }
    });

    console.log('✅ All passport strategies configured');
};

export default configurePassport;