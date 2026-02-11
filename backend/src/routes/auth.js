// backend/src/routes/auth.js - COMPLETE FIXED VERSION
import express from 'express';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import User from '../models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// DEBUG: Log configuration
console.log('\n🔧 [Auth] Configuration:');
console.log('========================================');
console.log('✅ NODE_ENV:', process.env.NODE_ENV);
console.log('✅ GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? '✓' : '✗');
console.log('✅ GOOGLE_REDIRECT_URI:', process.env.GOOGLE_REDIRECT_URI);
console.log('✅ FRONTEND_URL:', process.env.FRONTEND_URL || 'http://localhost:5173');
console.log('✅ BACKEND_URL:', process.env.BACKEND_URL || 'http://localhost:5001');
console.log('✅ JWT_SECRET:', process.env.JWT_SECRET ? '✓' : '✗');
console.log('========================================\n');

// Validate required config
if (!process.env.GOOGLE_CLIENT_ID || !process.env.JWT_SECRET) {
  console.error('❌ CRITICAL: Missing required environment variables!');
}

// Create Google OAuth client
const googleClient = new OAuth2Client({
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  redirectUri: process.env.GOOGLE_REDIRECT_URI
});

// Helper function to create user response
const createUserResponse = (user) => {
  const userObj = user.toObject ? user.toObject() : user;

  // Remove sensitive fields
  delete userObj.password;
  delete userObj.emailVerificationToken;
  delete userObj.emailVerificationExpires;
  delete userObj.resetPasswordToken;
  delete userObj.resetPasswordExpires;
  delete userObj.loginAttempts;
  delete userObj.lockUntil;
  delete userObj.__v;

  return {
    _id: userObj._id,
    id: userObj._id,
    name: userObj.name || '',
    email: userObj.email || '',
    avatar: userObj.avatar || '',
    role: userObj.role || 'user',
    isVerified: userObj.isVerified || false,
    isActive: userObj.isActive !== false,
    authProvider: userObj.provider || 'local',
    isOAuth: userObj.isOAuth || false,
    createdAt: userObj.createdAt || new Date(),
    updatedAt: userObj.updatedAt || new Date(),
    lastLogin: userObj.lastLogin || new Date()
  };
};

// ======================
// HEALTH CHECK & TEST ROUTES
// ======================

// Health check - NO /api/auth prefix (will be added by server.js)
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Auth service is running',
    timestamp: new Date().toISOString(),
    googleOAuth: !!process.env.GOOGLE_CLIENT_ID,
    endpoints: [
      'GET    /health',
      'GET    /test',
      'POST   /register',
      'POST   /login',
      'GET    /verify',
      'GET    /google',
      'GET    /google/callback'
    ]
  });
});

// Test all endpoints - NO /api/auth prefix
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Auth API is working',
    endpoints: {
      register: 'POST /register',
      login: 'POST /login',
      verify: 'GET /verify',
      googleOAuth: 'GET /google',
      googleCallback: 'GET /google/callback'
    },
    currentUrl: req.protocol + '://' + req.get('host') + req.originalUrl
  });
});

// Test Google configuration - NO /api/auth prefix
router.get('/google-config', (req, res) => {
  res.json({
    success: true,
    config: {
      googleClientId: process.env.GOOGLE_CLIENT_ID ? '✅ Set' : '❌ Missing',
      googleRedirectUri: process.env.GOOGLE_REDIRECT_URI,
      frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
      backendUrl: process.env.BACKEND_URL || 'http://localhost:5001'
    },
    urls: {
      startGoogleOAuth: `${req.protocol}://${req.get('host')}/api/auth/google`,
      googleCallback: `${req.protocol}://${req.get('host')}/api/auth/google/callback`
    }
  });
});

// ======================
// GOOGLE OAUTH ROUTES
// ======================

// 1. Start Google OAuth - NO prefix (will be added by server.js)
router.get('/google', (req, res) => {
  try {
    const { redirect_uri } = req.query;
    const frontendCallbackUrl = redirect_uri || `${process.env.FRONTEND_URL}/auth/callback`;

    console.log('🚀 Starting Google OAuth...');
    console.log('📝 Frontend callback:', frontendCallbackUrl);

    // Store in cookie for callback
    res.cookie('frontend_callback', frontendCallbackUrl, {
      httpOnly: true,
      maxAge: 5 * 60 * 1000, // 5 minutes
      secure: process.env.NODE_ENV === 'production'
    });

    // Generate Google auth URL
    const authUrl = googleClient.generateAuthUrl({
      access_type: 'offline',
      scope: ['profile', 'email'],
      redirect_uri: process.env.GOOGLE_REDIRECT_URI,
      prompt: 'consent',
      include_granted_scopes: true
    });

    console.log('✅ Google Auth URL generated');

    // Redirect immediately to Google
    res.redirect(authUrl);

  } catch (error) {
    console.error('❌ Google OAuth error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start Google login'
    });
  }
});

// 2. Google OAuth Callback - NO /api/auth prefix (will be added by server.js)
router.get('/google/callback', async (req, res) => {
  try {
    const { code, error } = req.query;
    const frontendCallbackUrl = req.cookies?.frontend_callback || `${process.env.FRONTEND_URL}/auth/callback`;

    console.log('🔄 Google callback received');
    console.log('📝 Will redirect to:', frontendCallbackUrl);

    if (error) {
      throw new Error(`Google OAuth error: ${error}`);
    }

    if (!code) {
      throw new Error('No authorization code received');
    }

    // Exchange code for tokens
    console.log('🔄 Exchanging code for tokens...');
    const { tokens } = await googleClient.getToken({
      code,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI
    });

    googleClient.setCredentials(tokens);
    console.log('✅ Tokens received from Google');

    // Get user info from Google
    const ticket = await googleClient.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const googleUser = ticket.getPayload();
    console.log('👤 Google user:', googleUser.email);

    // Find or create user
    let user = await User.findOne({
      $or: [
        { email: googleUser.email },
        { googleId: googleUser.sub }
      ]
    });

    if (!user) {
      console.log('➕ Creating new user');
      user = new User({
        name: googleUser.name,
        email: googleUser.email,
        avatar: googleUser.picture,
        googleId: googleUser.sub,
        provider: 'google',
        isOAuth: true,
        isVerified: true,
        emailVerified: true,
        lastLogin: new Date()
      });
      await user.save();
      console.log('✅ New user created');
    } else {
      console.log('🔄 Updating existing user');
      user.name = googleUser.name;
      user.avatar = googleUser.picture;
      user.googleId = googleUser.sub;
      user.provider = 'google';
      user.isOAuth = true;
      user.isVerified = true;
      user.emailVerified = true;
      user.lastLogin = new Date();
      await user.save();
      console.log('✅ Existing user updated');
    }

    // ✅ FIXED: Generate JWT token with FLAT structure
    const tokenPayload = {
      userId: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role || 'user',
      avatar: user.avatar || '',
      authProvider: 'google'
    };

    const token = jwt.sign(
      tokenPayload,
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    console.log('✅ JWT Token generated');
    console.log('📦 Token payload:', tokenPayload);

    // Clear cookie
    res.clearCookie('frontend_callback');

    // Build redirect URL
    const redirectUrl = new URL(frontendCallbackUrl);
    redirectUrl.searchParams.append('token', token);
    redirectUrl.searchParams.append('userId', user._id.toString());
    redirectUrl.searchParams.append('email', encodeURIComponent(user.email));
    redirectUrl.searchParams.append('name', encodeURIComponent(user.name));
    redirectUrl.searchParams.append('avatar', encodeURIComponent(user.avatar || ''));

    console.log('📍 Redirecting to:', redirectUrl.toString());
    res.redirect(redirectUrl.toString());

  } catch (error) {
    console.error('❌ Google callback error:', error);

    // Clear cookie
    res.clearCookie('frontend_callback');

    const frontendCallbackUrl = req.cookies?.frontend_callback || `${process.env.FRONTEND_URL}/auth/callback`;
    const errorUrl = `${frontendCallbackUrl}?error=${encodeURIComponent(error.message)}`;

    res.redirect(errorUrl);
  }
});

// ======================
// REGULAR AUTH ROUTES
// ======================

// ✅ FIXED: Registration endpoint - NO /api/auth prefix
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    console.log('📝 Registration attempt:', { name, email });

    // Validation
    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Email already registered'
      });
    }

    // Create user
    const user = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      provider: 'local',
      isOAuth: false,
      isVerified: false,
      lastLogin: new Date()
    });

    await user.save();
    console.log('✅ User registered:', user.email);

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    const userResponse = createUserResponse(user);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: userResponse
    });

  } catch (error) {
    console.error('❌ Registration error:', error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Email already registered'
      });
    }

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
});

// ✅ FIXED: Login endpoint - NO /api/auth prefix
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('🔑 Login attempt:', email);

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find user with password
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    user.lastLogin = new Date();
    await user.save();

    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    const userResponse = createUserResponse(user);

    console.log('✅ Login successful for:', user.email);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: userResponse
    });

  } catch (error) {
    console.error('❌ Login error:', error);

    if (error.message.includes('locked')) {
      return res.status(423).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
});

// ✅ FIXED: Verify token endpoint - NO /api/auth prefix
router.get('/verify', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : req.query.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    const userResponse = createUserResponse(user);

    res.json({
      success: true,
      message: 'Token is valid',
      user: userResponse
    });

  } catch (error) {
    console.error('Token verification error:', error);

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token expired' });
    }

    res.status(401).json({ success: false, message: 'Token verification failed' });
  }
});

// ======================
// USER PROFILE ROUTES
// ======================

// Get user profile - NO /api/auth prefix
router.get('/profile', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;

    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const userResponse = createUserResponse(user);

    res.json({
      success: true,
      user: userResponse
    });

  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch profile' });
  }
});

// Update user profile - NO /api/auth prefix
router.put('/profile', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;

    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Update allowed fields
    const { name, avatar, phone, profile } = req.body;

    if (name) user.name = name.trim();
    if (avatar) user.avatar = avatar;
    if (phone) user.phone = phone;
    if (profile) {
      user.profile = { ...user.profile, ...profile };
    }

    await user.save();

    const userResponse = createUserResponse(user);

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: userResponse
    });

  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ success: false, message: 'Failed to update profile' });
  }
});

// Logout - NO /api/auth prefix
router.post('/logout', (req, res) => {
  console.log('Logout request received');
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

export default router;