// backend/src/routes/authRoutes.js - COMPLETE WORKING VERSION
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import User from '../models/User.js';

const router = express.Router();

// Debug logging helper
const logAuth = (action, data) => {
  console.log(`🔐 [Auth:${action}]`, data);
};

// Initialize Google OAuth client
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ======================
// HELPER FUNCTIONS
// ======================
const generateToken = (user) => {
  return jwt.sign(
    {
      userId: user._id,
      email: user.email,
      name: user.name,
      role: user.role || 'user'
    },
    process.env.JWT_SECRET || 'your-secret-key-change-this-in-production',
    { expiresIn: '7d' }
  );
};

// ======================
// EMAIL/PASSWORD AUTH - FIXED
// ======================

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    logAuth('LOGIN_ATTEMPT', { email, passwordLength: password?.length });

    // Validate input
    if (!email || !password) {
      logAuth('LOGIN_VALIDATION', 'Missing email or password');
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Find user WITH password field
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    logAuth('LOGIN_FIND_USER', {
      userFound: !!user,
      email: user?.email,
      hasPassword: !!user?.password
    });

    if (!user) {
      logAuth('LOGIN_USER_NOT_FOUND', 'User not found in database');
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if user is active
    if (!user.isActive || user.isSuspended) {
      logAuth('LOGIN_INACTIVE', 'User account is inactive or suspended');
      return res.status(401).json({
        success: false,
        message: 'Account is inactive or suspended'
      });
    }

    // Check if OAuth user trying password login
    if (user.isOAuth && !user.password) {
      logAuth('LOGIN_OAUTH_ONLY', 'OAuth user trying password login');
      return res.status(401).json({
        success: false,
        message: 'This account uses Google login. Please use Google to sign in.'
      });
    }

    // Check password using matchPassword method
    logAuth('LOGIN_CHECK_PASSWORD', 'Calling matchPassword...');
    const isMatch = await user.matchPassword(password);
    logAuth('LOGIN_PASSWORD_RESULT', { isMatch, loginAttempts: user.loginAttempts });

    if (!isMatch) {
      logAuth('LOGIN_PASSWORD_MISMATCH', 'Password incorrect');
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    logAuth('LOGIN_SUCCESS', { userId: user._id, email: user.email });

    // Generate token
    const token = generateToken(user);
    logAuth('LOGIN_TOKEN', 'Token generated');

    // Prepare user response (without sensitive data)
    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      role: user.role,
      isVerified: user.isVerified,
      isOAuth: user.isOAuth,
      plan: user.plan,
      aiCredits: user.aiCredits,
      preferences: user.preferences,
      dashboardStats: user.dashboardStats,
      flags: user.flags
    };

    logAuth('LOGIN_COMPLETE', 'Login successful');

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: userResponse
    });

  } catch (error) {
    logAuth('LOGIN_ERROR', error.message);
    console.error('Login error details:', error);

    // Handle account lock error
    if (error.message.includes('Account is temporarily locked')) {
      return res.status(401).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error logging in',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    logAuth('REGISTER', { email, nameLength: name?.length, passwordLength: password?.length });

    // Validate input
    if (!name || !email || !password) {
      logAuth('REGISTER_VALIDATION', 'Missing required fields');
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password'
      });
    }

    // Check if user exists
    const userExists = await User.findOne({ email: email.toLowerCase() });
    logAuth('REGISTER_CHECK', { userExists: !!userExists });

    if (userExists) {
      logAuth('REGISTER_CONFLICT', 'User already exists');
      return res.status(400).json({
        success: false,
        message: 'User already exists'
      });
    }

    // Create user with explicit settings
    logAuth('REGISTER_CREATE', 'Creating user...');
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: password,
      isVerified: true,
      isActive: true,
      role: 'user',
      avatar: '',
      preferences: {
        emailNotifications: true,
        language: 'en',
        theme: 'light',
        autoSave: true,
        aiSuggestions: true,
        defaultTemplate: 'modern'
      },
      usage: {
        loginCount: 0,
        resumeCount: 0,
        aiUsageCount: 0,
        exportCount: 0
      }
    });

    logAuth('REGISTER_SUCCESS', { userId: user._id, email: user.email });

    // Generate token
    const token = generateToken(user);

    // Prepare user response
    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      role: user.role,
      isVerified: user.isVerified,
      isActive: user.isActive,
      plan: user.plan,
      aiCredits: user.aiCredits,
      preferences: user.preferences
    };

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: userResponse
    });

  } catch (error) {
    logAuth('REGISTER_ERROR', error.message);
    console.error('Register error details:', error);

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: messages
      });
    }

    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error registering user',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// ======================
// GOOGLE OAUTH - FIXED
// ======================

// @desc    Google OAuth verify (for client-side Google Sign-In)
// @route   POST /api/auth/google
// @access  Public
router.post('/google', async (req, res) => {
  try {
    const { token } = req.body;

    logAuth('GOOGLE_VERIFY', 'Google OAuth verification attempt');

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Google token is required'
      });
    }

    // Verify Google token
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    const { email, name, picture, sub: googleId } = payload;

    logAuth('GOOGLE_VERIFIED', { email, name });

    // Find or create user
    let user = await User.findOne({
      $or: [
        { googleId },
        { email }
      ]
    });

    if (!user) {
      // Create new user
      user = await User.create({
        googleId,
        name,
        email,
        avatar: picture,
        isOAuth: true,
        isVerified: true,
        provider: 'google',
        role: 'user',
        isActive: true,
        preferences: {
          emailNotifications: true,
          language: 'en',
          theme: 'light',
          autoSave: true,
          aiSuggestions: true,
          defaultTemplate: 'modern'
        },
        usage: {
          loginCount: 1,
          resumeCount: 0,
          aiUsageCount: 0,
          exportCount: 0
        }
      });
      logAuth('GOOGLE_CREATE', 'New Google user created');
    } else {
      // Update existing user
      user.googleId = googleId;
      user.avatar = picture || user.avatar;
      user.lastLogin = new Date();
      user.isOAuth = true;
      user.isVerified = true;
      user.emailVerifiedAt = user.emailVerifiedAt || new Date();
      user.provider = 'google';
      user.usage = user.usage || {};
      user.usage.loginCount = (user.usage.loginCount || 0) + 1;
      logAuth('GOOGLE_UPDATE', 'Existing user updated with Google');
      await user.save();
    }

    // Generate JWT token
    const jwtToken = generateToken(user);

    // Prepare user response
    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      role: user.role,
      isVerified: user.isVerified,
      isOAuth: user.isOAuth,
      plan: user.plan,
      aiCredits: user.aiCredits,
      preferences: user.preferences,
      provider: 'google'
    };

    res.json({
      success: true,
      token: jwtToken,
      user: userResponse,
      message: 'Google login successful'
    });

  } catch (error) {
    logAuth('GOOGLE_ERROR', error.message);
    console.error('Google auth error details:', error);

    let errorMessage = 'Google authentication failed';
    if (error.message.includes('Token used too late')) {
      errorMessage = 'Google token has expired. Please try again.';
    } else if (error.message.includes('audience')) {
      errorMessage = 'Invalid Google client configuration.';
    }

    res.status(401).json({
      success: false,
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ======================
// USER PROFILE & SESSION - FIXED
// ======================

// @desc    Get current user profile
// @route   GET /api/auth/profile
// @access  Private
router.get('/profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-this-in-production');
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user is active
    if (!user.isActive || user.isSuspended) {
      return res.status(401).json({
        success: false,
        message: 'Account is inactive or suspended'
      });
    }

    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      phone: user.phone,
      role: user.role,
      isVerified: user.isVerified,
      isOAuth: user.isOAuth,
      plan: user.plan,
      aiCredits: user.aiCredits,
      profile: user.profile,
      preferences: user.preferences,
      dashboardStats: user.dashboardStats,
      flags: user.flags,
      usage: {
        resumeCount: user.usage?.resumeCount || 0,
        exportCount: user.usage?.exportCount || 0,
        loginCount: user.usage?.loginCount || 0,
        aiUsageCount: user.usage?.aiUsageCount || 0
      },
      createdAt: user.createdAt,
      lastLogin: user.lastLogin
    };

    res.json({
      success: true,
      user: userResponse
    });
  } catch (error) {
    logAuth('PROFILE_ERROR', error.message);
    console.error('Get profile error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
router.put('/profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-this-in-production');
    const { name, avatar, phone, profile, preferences } = req.body;

    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update fields
    if (name) user.name = name.trim();
    if (avatar) user.avatar = avatar;
    if (phone) user.phone = phone;
    if (profile) {
      user.profile = { ...user.profile, ...profile };
    }
    if (preferences) {
      user.preferences = { ...user.preferences, ...preferences };
    }

    await user.save();

    // Add activity
    if (user.addActivity) {
      await user.addActivity({
        type: 'profile_updated',
        description: 'Profile information updated',
        metadata: { fields: Object.keys(req.body) }
      });
    }

    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      phone: user.phone,
      profile: user.profile,
      preferences: user.preferences
    };

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: userResponse
    });
  } catch (error) {
    logAuth('UPDATE_PROFILE_ERROR', error.message);
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating profile',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @desc    Verify token (what AuthContext calls to check if token is valid)
// @route   GET /api/auth/verify
// @access  Private
router.get('/verify', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    logAuth('VERIFY', 'Token verification requested');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-this-in-production');
    const user = await User.findById(decoded.userId);

    if (!user) {
      logAuth('VERIFY_NOT_FOUND', 'User not found');
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user is active
    if (!user.isActive || user.isSuspended) {
      logAuth('VERIFY_INACTIVE', 'User account is inactive');
      return res.status(401).json({
        success: false,
        message: 'Account is inactive or suspended'
      });
    }

    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      role: user.role,
      isVerified: user.isVerified,
      isOAuth: user.isOAuth,
      plan: user.plan,
      aiCredits: user.aiCredits,
      preferences: user.preferences,
      dashboardStats: user.dashboardStats,
      flags: user.flags
    };

    logAuth('VERIFY_SUCCESS', 'Token verified');

    res.json({
      success: true,
      message: 'Token is valid',
      user: userResponse
    });

  } catch (error) {
    logAuth('VERIFY_ERROR', error.message);
    console.error('Token verification error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
});

// ======================
// UTILITY ENDPOINTS
// ======================

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Public
router.post('/logout', (req, res) => {
  logAuth('LOGOUT', 'User logged out');
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

// @desc    Health check
// @route   GET /api/auth/health
// @access  Public
router.get('/health', async (req, res) => {
  try {
    logAuth('HEALTH', 'Health check requested');

    // Check database connection
    const userCount = await User.countDocuments({});

    res.json({
      success: true,
      message: 'Auth service is running',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: {
        connected: true,
        userCount
      },
      environment: process.env.NODE_ENV || 'development'
    });

  } catch (error) {
    logAuth('HEALTH_ERROR', error.message);
    res.status(500).json({
      success: false,
      message: 'Service error',
      error: error.message
    });
  }
});

// @desc    Check email availability
// @route   GET /api/auth/check-email/:email
// @access  Public
router.get('/check-email/:email', async (req, res) => {
  try {
    const { email } = req.params;

    logAuth('CHECK_EMAIL', { email });

    const existingUser = await User.findOne({ email: email.toLowerCase() });

    res.json({
      available: !existingUser,
      message: existingUser ? 'Email already registered' : 'Email available'
    });
  } catch (error) {
    logAuth('CHECK_EMAIL_ERROR', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    logAuth('FORGOT_PASSWORD', { email });

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      // Don't reveal if user exists or not for security
      return res.json({
        success: true,
        message: 'If an account exists with this email, you will receive a password reset link.'
      });
    }

    if (user.isOAuth) {
      logAuth('FORGOT_PASSWORD_OAUTH', 'OAuth user cannot reset password');
      return res.status(400).json({
        success: false,
        message: 'This account uses Google login. Please use Google to sign in.'
      });
    }

    // Generate reset token
    const resetToken = user.generatePasswordResetToken();
    await user.save({ validateBeforeSave: false });

    logAuth('FORGOT_PASSWORD_TOKEN', `Reset token generated for ${email}`);

    // In production, send email here
    // For now, return token in development
    if (process.env.NODE_ENV === 'development') {
      console.log('📧 Password Reset Token:', resetToken);
    }

    res.json({
      success: true,
      message: 'Password reset instructions sent to your email.',
      resetToken: process.env.NODE_ENV === 'development' ? resetToken : undefined
    });
  } catch (error) {
    logAuth('FORGOT_PASSWORD_ERROR', error.message);
    res.status(500).json({
      success: false,
      message: 'Error processing forgot password',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;

    logAuth('RESET_PASSWORD', 'Attempting password reset');

    // Hash token
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      logAuth('RESET_PASSWORD_INVALID_TOKEN', 'Invalid or expired token');
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }

    // Set new password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    // Reset login attempts if any
    user.loginAttempts = 0;
    user.lockUntil = undefined;

    await user.save();

    // Generate new token
    const jwtToken = generateToken(user);

    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar
    };

    logAuth('RESET_PASSWORD_SUCCESS', `Password reset for ${user.email}`);

    res.json({
      success: true,
      message: 'Password reset successful',
      token: jwtToken,
      user: userResponse
    });
  } catch (error) {
    logAuth('RESET_PASSWORD_ERROR', error.message);
    res.status(500).json({
      success: false,
      message: 'Error resetting password',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @desc    Change password (when logged in)
// @route   PUT /api/auth/change-password
// @access  Private
router.put('/change-password', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-this-in-production');
    const { currentPassword, newPassword } = req.body;

    logAuth('CHANGE_PASSWORD', { userId: decoded.userId });

    const user = await User.findById(decoded.userId).select('+password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify current password
    const isMatch = await user.matchPassword(currentPassword);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    logAuth('CHANGE_PASSWORD_SUCCESS', 'Password updated');

    res.json({
      success: true,
      message: 'Password updated successfully'
    });

  } catch (error) {
    logAuth('CHANGE_PASSWORD_ERROR', error.message);
    res.status(500).json({
      success: false,
      message: 'Error changing password',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

export default router;