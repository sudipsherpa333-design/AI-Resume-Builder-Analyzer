import express from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Simple JWT functions (replace with your actual jwtToken.js)
const generateAuthTokens = (user) => {
  const accessToken = jwt.sign(
    {
      userId: user._id,
      email: user.email,
      role: user.role
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '30d' }
  );

  const refreshToken = jwt.sign(
    {
      userId: user._id,
      type: 'refresh'
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  return { accessToken, refreshToken };
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
};

const generateToken = (userId) => {
  return jwt.sign(
    { userId, type: 'access' },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
};

// Simple User model (replace with your actual User model)
const createDemoUser = async () => {
  // This is a placeholder. Replace with actual User model
  return {
    _id: 'demo-user-id',
    name: 'Demo User',
    email: 'demo@resumebuilder.com',
    password: 'hashed-password',
    avatar: null,
    role: 'user',
    isVerified: true,
    isActive: true,
    isSuspended: false,
    preferences: {},
    profile: {},
    stats: {}
  };
};

const findUserByEmail = async (email) => {
  // Placeholder - replace with actual database query
  if (email === 'demo@resumebuilder.com') {
    return createDemoUser();
  }
  return null;
};

const createUser = async (userData) => {
  // Placeholder - replace with actual user creation
  return {
    ...userData,
    _id: 'new-user-id',
    isVerified: false,
    isActive: true,
    role: 'user',
    avatar: null,
    preferences: {},
    profile: {},
    stats: {}
  };
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Simple validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password'
      });
    }

    // Check if user exists
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Create user
    const user = await createUser({
      name,
      email,
      password // Note: In real app, hash this password
    });

    // Generate tokens
    const { accessToken, refreshToken } = generateAuthTokens(user);

    res.status(201).json({
      success: true,
      message: 'Registration successful!',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          role: user.role,
          isVerified: user.isVerified
        },
        tokens: {
          accessToken,
          refreshToken
        }
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Simple validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Check if user exists
    const user = await findUserByEmail(email);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if account is active
    if (!user.isActive || user.isSuspended) {
      return res.status(401).json({
        success: false,
        message: 'Account is suspended or inactive'
      });
    }

    // Check password (simple demo - in real app, use bcrypt)
    if (password !== 'password123' && user.email !== 'demo@resumebuilder.com') {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateAuthTokens(user);

    res.json({
      success: true,
      message: 'Login successful!',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          role: user.role,
          isVerified: user.isVerified,
          preferences: user.preferences
        },
        tokens: {
          accessToken,
          refreshToken
        }
      }
    });

  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
});

// @desc    Google OAuth login
// @route   GET /api/auth/google
// @access  Public
router.get('/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false
  })
);

// @desc    Google OAuth callback
// @route   GET /api/auth/google/callback
// @access  Public
router.get('/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/login',
    session: false
  }),
  (req, res) => {
    try {
      // Generate token for Google user
      const token = jwt.sign(
        {
          userId: req.user.id || 'google-user-id',
          email: req.user.email,
          source: 'google'
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE || '30d' }
      );

      // Redirect to frontend with tokens
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      res.redirect(`${frontendUrl}/auth/callback?token=${token}`);
    } catch (error) {
      console.error('Google callback error:', error);
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=oauth_failed`);
    }
  }
);

// @desc    Refresh token
// @route   POST /api/auth/refresh-token
// @access  Public
router.post('/refresh-token', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token required'
      });
    }

    // Verify refresh token
    const decoded = verifyToken(refreshToken);
    if (!decoded || decoded.type !== 'refresh') {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }

    // Find user (demo - replace with actual DB query)
    const user = {
      _id: decoded.userId || decoded.userId,
      email: 'user@example.com',
      role: 'user'
    };

    // Generate new access token
    const newAccessToken = generateToken(user._id);

    res.json({
      success: true,
      data: {
        accessToken: newAccessToken
      }
    });

  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during token refresh'
    });
  }
});

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
router.post('/logout', async (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
router.get('/me', async (req, res) => {
  try {
    // Get token from header
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    // Verify token
    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }

    // Find user (demo - replace with actual DB query)
    const user = {
      _id: decoded.userId || 'demo-user-id',
      name: 'Demo User',
      email: 'user@example.com',
      avatar: null,
      role: 'user',
      isVerified: true,
      preferences: {},
      profile: {},
      stats: { resumeCount: 3 }
    };

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          role: user.role,
          isVerified: user.isVerified,
          preferences: user.preferences,
          profile: user.profile,
          stats: user.stats
        }
      }
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Demo login endpoint (for testing)
router.post('/demo-login', async (req, res) => {
  try {
    // Create demo user
    const demoUser = {
      _id: 'demo-user-id',
      name: 'Demo User',
      email: 'demo@resumebuilder.com',
      password: 'password123',
      isVerified: true,
      isOAuth: false,
      avatar: null,
      role: 'user',
      preferences: {},
      profile: {},
      stats: {}
    };

    // Generate tokens
    const { accessToken, refreshToken } = generateAuthTokens(demoUser);

    res.json({
      success: true,
      message: 'Demo login successful!',
      data: {
        user: {
          id: demoUser._id,
          name: demoUser.name,
          email: demoUser.email,
          avatar: demoUser.avatar,
          role: demoUser.role,
          isVerified: demoUser.isVerified
        },
        tokens: {
          accessToken,
          refreshToken
        }
      }
    });

  } catch (error) {
    console.error('Demo login error:', error);
    res.status(500).json({
      success: false,
      message: 'Demo login failed'
    });
  }
});

export default router;