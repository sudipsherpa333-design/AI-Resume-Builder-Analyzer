import User from '../models/User.js';
import { generateToken, getCookieOptions } from '../utils/jwtUtils.js';
import { OAuth2Client } from 'google-auth-library';
import crypto from 'crypto';

// Initialize Google OAuth client
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Debug helper
const logAuth = (action, data) => {
  console.log(`🔐 [Auth:${action}]`, data);
};

// ==================== FIXED: REGISTER USER ====================
// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
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
      isVerified: true, // Auto-verify for now to simplify
      isActive: true,
      role: 'user',
      avatar: '', // Will use default
      preferences: {
        emailNotifications: true,
        language: 'en',
        theme: 'light',
        autoSave: true,
        aiSuggestions: true,
        defaultTemplate: 'modern'
      }
    });

    logAuth('REGISTER_SUCCESS', { userId: user._id, email: user.email });

    // Generate token
    const token = generateToken(user._id);

    // Set cookie
    res.cookie('token', token, getCookieOptions());

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        isVerified: user.isVerified,
        isActive: user.isActive
      }
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
};

// ==================== FIXED: LOGIN USER ====================
// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const authUser = async (req, res) => {
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
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password +loginAttempts +lockUntil');
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

    // Check if account is locked
    if (user.isLocked) {
      logAuth('LOGIN_LOCKED', 'Account is locked');
      return res.status(401).json({
        success: false,
        message: 'Account is temporarily locked. Try again later.'
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
        message: 'Invalid email or password',
        loginAttempts: user.loginAttempts,
        remainingAttempts: 5 - user.loginAttempts
      });
    }

    logAuth('LOGIN_SUCCESS', { userId: user._id, email: user.email });

    // Generate token
    const token = generateToken(user._id);
    logAuth('LOGIN_TOKEN', 'Token generated');

    // Set cookie
    res.cookie('token', token, getCookieOptions());

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
      preferences: user.preferences
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
};

// ==================== ADDED: VERIFY TOKEN ====================
// @desc    Verify token
// @route   GET /api/auth/verify
// @access  Private
export const verifyToken = async (req, res) => {
  try {
    logAuth('VERIFY', { userId: req.user._id });

    const user = await User.findById(req.user._id);

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
    res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
};

// ==================== ADDED: HEALTH CHECK ====================
// @desc    Health check
// @route   GET /api/auth/health
// @access  Public
export const healthCheck = async (req, res) => {
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
};

// ==================== ADDED: CHANGE PASSWORD ====================
// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    logAuth('CHANGE_PASSWORD', { userId: req.user._id });

    const user = await User.findById(req.user._id).select('+password');

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
};

// ==================== KEEP EXISTING METHODS (with improvements) ====================

// @desc    Google OAuth
// @route   POST /api/auth/google
// @access  Public
export const googleAuth = async (req, res) => {
  try {
    const { token } = req.body;

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
    const { sub: googleId, email, name, picture } = payload;

    logAuth('GOOGLE_AUTH', { email, name });

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
        emailVerifiedAt: new Date(),
        isActive: true,
        role: 'user',
        preferences: {
          emailNotifications: true,
          language: 'en',
          theme: 'light',
          autoSave: true,
          aiSuggestions: true,
          defaultTemplate: 'modern'
        }
      });
      logAuth('GOOGLE_CREATE', 'New user created');
    } else {
      // Update existing user
      user.googleId = googleId;
      user.avatar = picture || user.avatar;
      user.lastLogin = new Date();
      user.isOAuth = true;
      user.isVerified = true;
      user.emailVerifiedAt = user.emailVerifiedAt || new Date();
      user.usage.loginCount = (user.usage?.loginCount || 0) + 1;
      logAuth('GOOGLE_UPDATE', 'Existing user updated');
      await user.save();
    }

    // Generate token
    const jwtToken = generateToken(user._id);

    // Set cookie
    res.cookie('token', jwtToken, getCookieOptions());

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
      preferences: user.preferences
    };

    res.json({
      success: true,
      message: 'Google authentication successful',
      token: jwtToken,
      user: userResponse
    });
  } catch (error) {
    logAuth('GOOGLE_ERROR', error.message);
    res.status(401).json({
      success: false,
      message: 'Google authentication failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Invalid Google token'
    });
  }
};

// @desc    Demo login
// @route   POST /api/auth/demo
// @access  Public
export const demoLogin = async (req, res) => {
  try {
    logAuth('DEMO_LOGIN', 'Demo login requested');

    // Create or find demo user
    let user = await User.findOne({ email: 'demo@example.com' });

    if (!user) {
      user = await User.create({
        name: 'Demo User',
        email: 'demo@example.com',
        password: 'demopassword123',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=demo',
        isVerified: true,
        emailVerifiedAt: new Date(),
        isActive: true,
        role: 'user',
        preferences: {
          emailNotifications: false,
          language: 'en',
          theme: 'light',
          autoSave: true,
          aiSuggestions: true,
          defaultTemplate: 'modern'
        }
      });
      logAuth('DEMO_CREATE', 'Demo user created');
    }

    // Generate token
    const token = generateToken(user._id);

    // Set cookie
    res.cookie('token', token, getCookieOptions());

    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      role: user.role,
      isVerified: user.isVerified,
      plan: 'pro', // Demo users get pro features
      aiCredits: 999,
      preferences: user.preferences
    };

    logAuth('DEMO_SUCCESS', 'Demo login successful');

    res.json({
      success: true,
      message: 'Demo login successful',
      token,
      user: userResponse
    });
  } catch (error) {
    logAuth('DEMO_ERROR', error.message);
    res.status(500).json({
      success: false,
      message: 'Error with demo login',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Don't send sensitive data
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
        loginCount: user.usage?.loginCount || 0
      },
      createdAt: user.createdAt,
      lastLogin: user.lastLogin
    };

    res.json({
      success: true,
      user: userResponse
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting profile',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateUserProfile = async (req, res) => {
  try {
    const { name, avatar, phone, profile, preferences } = req.body;

    const user = await User.findById(req.user._id);

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
    await user.addActivity({
      type: 'profile_updated',
      description: 'Profile information updated',
      metadata: { fields: Object.keys(req.body) }
    });

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
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating profile',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
export const logoutUser = async (req, res) => {
  try {
    logAuth('LOGOUT', { userId: req.user._id });

    // Clear token cookie
    res.clearCookie('token');
    res.clearCookie('connect.sid');

    logAuth('LOGOUT_SUCCESS', 'User logged out');

    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    logAuth('LOGOUT_ERROR', error.message);
    res.status(500).json({
      success: false,
      message: 'Error logging out',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    logAuth('FORGOT_PASSWORD', { email });

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      logAuth('FORGOT_PASSWORD_NOT_FOUND', 'User not found');
      return res.status(404).json({
        success: false,
        message: 'User not found'
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
    // For now, log it (remove in production)
    if (process.env.NODE_ENV === 'development') {
      console.log('📧 Password Reset Token:', resetToken);
      console.log('🔗 Reset URL:', `${req.protocol}://${req.get('host')}/reset-password/${resetToken}`);
    }

    res.json({
      success: true,
      message: 'Password reset email sent',
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
};

// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
export const resetPassword = async (req, res) => {
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
    const jwtToken = generateToken(user._id);

    // Set cookie
    res.cookie('token', jwtToken, getCookieOptions());

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
};