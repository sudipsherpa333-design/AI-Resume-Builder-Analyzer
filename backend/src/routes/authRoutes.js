// backend/routes/authRoutes.js - COMPLETE AUTHENTICATION ROUTES
import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { body, validationResult } from 'express-validator';
import nodemailer from 'nodemailer';

const router = express.Router();

// ======================
// CONFIGURATION & CONSTANTS
// ======================
const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret-key-change-this-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key-change-this';
const BCRYPT_SALT_ROUNDS = 10;
const PASSWORD_RESET_EXPIRY = 3600000; // 1 hour in milliseconds

// ======================
// MOCK DATABASE (Replace with MongoDB)
// ======================
const users = [
  {
    _id: 'demo-user-123',
    id: 'demo-user-123',
    email: 'demo@example.com',
    password: '$2a$10$N9qo8uLOickgx2ZMRZoMy.MrqK3a7Z7Jc6W5QYJg5q.6p6Y5Y5Y5Y', // Hash for 'demo123'
    name: 'Demo User',
    avatar: 'https://ui-avatars.com/api/?name=Demo+User&background=3b82f6&color=fff',
    role: 'user',
    plan: 'free',
    aiCredits: 150,
    isVerified: true,
    isActive: true,
    preferences: {
      theme: 'light',
      autoSave: true,
      emailNotifications: true,
      aiSuggestions: true,
      language: 'en'
    },
    profile: {
      phone: '',
      location: '',
      website: '',
      linkedin: '',
      github: '',
      bio: ''
    },
    stats: {
      loginCount: 1,
      resumeCount: 0,
      aiUsageCount: 0,
      exportCount: 0
    },
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    lastLogin: new Date().toISOString(),
    refreshTokens: []
  }
];

const passwordResetTokens = [];

// ======================
// UTILITY FUNCTIONS
// ======================
const generateTokens = (userId, email, name, role) => {
  const accessToken = jwt.sign(
    { userId, email, name, role },
    JWT_SECRET,
    { expiresIn: '15m' }
  );

  const refreshToken = jwt.sign(
    { userId, email },
    JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );

  return { accessToken, refreshToken };
};

const validateRequest = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  };
};

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access token required'
    });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }

    req.user = user;
    next();
  });
};

const sendEmail = async (to, subject, html) => {
  // Mock email function - replace with real email service
  console.log(`[EMAIL] To: ${to}, Subject: ${subject}`);
  console.log(`[EMAIL HTML]: ${html.substring(0, 100)}...`);
  return true;
};

// ======================
// AUTHENTICATION ROUTES
// ======================

// POST /api/auth/login
router.post('/login',
  validateRequest([
    body('email').isEmail().withMessage('Please provide a valid email address'),
    body('password').notEmpty().withMessage('Password is required')
  ]),
  async (req, res) => {
    try {
      const { email, password } = req.body;

      // Find user
      const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      // Check if account is active
      if (!user.isActive) {
        return res.status(403).json({
          success: false,
          message: 'Account is deactivated. Please contact support.'
        });
      }

      // Check password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      // Generate tokens
      const { accessToken, refreshToken } = generateTokens(
        user._id,
        user.email,
        user.name,
        user.role
      );

      // Update user stats
      user.lastLogin = new Date().toISOString();
      user.stats.loginCount = (user.stats.loginCount || 0) + 1;
      user.refreshTokens = user.refreshTokens || [];
      user.refreshTokens.push(refreshToken);

      // Keep only last 5 refresh tokens
      if (user.refreshTokens.length > 5) {
        user.refreshTokens = user.refreshTokens.slice(-5);
      }

      // Remove sensitive data from response
      const { password: pwd, refreshTokens: rt, ...userResponse } = user;

      res.json({
        success: true,
        message: 'Login successful',
        accessToken,
        refreshToken,
        user: userResponse,
        expiresIn: 900 // 15 minutes in seconds
      });

    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { error: error.message })
      });
    }
  }
);

// POST /api/auth/register
router.post('/register',
  validateRequest([
    body('email').isEmail().withMessage('Please provide a valid email address'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
    body('name')
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('Name must be between 2 and 50 characters'),
    body('confirmPassword')
      .custom((value, { req }) => value === req.body.password)
      .withMessage('Passwords do not match')
  ]),
  async (req, res) => {
    try {
      const { email, password, name, phone, acceptTerms } = req.body;

      // Check terms acceptance
      if (acceptTerms !== true) {
        return res.status(400).json({
          success: false,
          message: 'You must accept the terms and conditions'
        });
      }

      // Check if user already exists
      const existingUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'User already exists with this email address'
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

      // Generate verification token
      const verificationToken = crypto.randomBytes(32).toString('hex');
      const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      // Create new user
      const newUser = {
        _id: `user-${Date.now()}`,
        id: `user-${Date.now()}`,
        email,
        password: hashedPassword,
        name,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=3b82f6&color=fff`,
        role: 'user',
        plan: 'free',
        aiCredits: 50,
        isVerified: false,
        isActive: true,
        verificationToken,
        verificationExpires,
        preferences: {
          theme: 'light',
          autoSave: true,
          emailNotifications: true,
          aiSuggestions: true,
          language: 'en'
        },
        profile: {
          phone: phone || '',
          location: '',
          website: '',
          linkedin: '',
          github: '',
          bio: ''
        },
        stats: {
          loginCount: 0,
          resumeCount: 0,
          aiUsageCount: 0,
          exportCount: 0
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastLogin: null,
        refreshTokens: []
      };

      // Add to database
      users.push(newUser);

      // Generate tokens
      const { accessToken, refreshToken } = generateTokens(
        newUser._id,
        newUser.email,
        newUser.name,
        newUser.role
      );

      // Store refresh token
      newUser.refreshTokens.push(refreshToken);

      // Send verification email
      const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${verificationToken}`;
      await sendEmail(
        email,
        'Verify your email address',
        `
        <h1>Welcome to ResumeBuilder!</h1>
        <p>Please verify your email address by clicking the link below:</p>
        <a href="${verificationUrl}" style="background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
          Verify Email Address
        </a>
        <p>This link will expire in 24 hours.</p>
        <p>If you didn't create an account, you can safely ignore this email.</p>
        `
      );

      // Remove sensitive data from response
      const { password: pwd, verificationToken: vt, verificationExpires: ve, refreshTokens: rt, ...userResponse } = newUser;

      res.status(201).json({
        success: true,
        message: 'Registration successful! Please check your email to verify your account.',
        accessToken,
        refreshToken,
        user: userResponse,
        expiresIn: 900
      });

    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create account',
        ...(process.env.NODE_ENV === 'development' && { error: error.message })
      });
    }
  }
);

// POST /api/auth/refresh-token
router.post('/refresh-token', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token required'
      });
    }

    // Verify refresh token
    jwt.verify(refreshToken, JWT_REFRESH_SECRET, async (err, decoded) => {
      if (err) {
        return res.status(403).json({
          success: false,
          message: 'Invalid refresh token'
        });
      }

      // Find user
      const user = users.find(u => u._id === decoded.userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Check if refresh token is valid
      if (!user.refreshTokens || !user.refreshTokens.includes(refreshToken)) {
        return res.status(403).json({
          success: false,
          message: 'Invalid refresh token'
        });
      }

      // Generate new tokens
      const { accessToken: newAccessToken, refreshToken: newRefreshToken } = generateTokens(
        user._id,
        user.email,
        user.name,
        user.role
      );

      // Update refresh tokens
      user.refreshTokens = user.refreshTokens.filter(token => token !== refreshToken);
      user.refreshTokens.push(newRefreshToken);

      // Keep only last 5 refresh tokens
      if (user.refreshTokens.length > 5) {
        user.refreshTokens = user.refreshTokens.slice(-5);
      }

      res.json({
        success: true,
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        expiresIn: 900
      });
    });

  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// GET /api/auth/verify
router.get('/verify', authenticateToken, async (req, res) => {
  try {
    const user = users.find(u => u._id === req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    // Remove sensitive data
    const { password: pwd, refreshTokens: rt, ...userResponse } = user;

    res.json({
      success: true,
      user: userResponse
    });

  } catch (error) {
    console.error('Verify error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// POST /api/auth/logout
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    const { refreshToken } = req.body;
    const user = users.find(u => u._id === req.user.userId);

    if (user && refreshToken) {
      // Remove the specific refresh token
      user.refreshTokens = user.refreshTokens.filter(token => token !== refreshToken);
    }

    res.json({
      success: true,
      message: 'Logged out successfully'
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// POST /api/auth/logout-all
router.post('/logout-all', authenticateToken, async (req, res) => {
  try {
    const user = users.find(u => u._id === req.user.userId);

    if (user) {
      // Clear all refresh tokens
      user.refreshTokens = [];
    }

    res.json({
      success: true,
      message: 'Logged out from all devices'
    });

  } catch (error) {
    console.error('Logout all error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// POST /api/auth/forgot-password
router.post('/forgot-password',
  validateRequest([
    body('email').isEmail().withMessage('Please provide a valid email address')
  ]),
  async (req, res) => {
    try {
      const { email } = req.body;

      const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

      if (!user) {
        // Return success even if user doesn't exist (for security)
        return res.json({
          success: true,
          message: 'If an account exists with this email, you will receive password reset instructions'
        });
      }

      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetExpires = new Date(Date.now() + PASSWORD_RESET_EXPIRY);

      // Store reset token
      passwordResetTokens.push({
        userId: user._id,
        token: resetToken,
        expires: resetExpires,
        used: false
      });

      // Clean up old tokens
      const now = new Date();
      const index = passwordResetTokens.findIndex(t => t.expires < now || t.used);
      if (index !== -1) {
        passwordResetTokens.splice(index, 1);
      }

      // Send reset email
      const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;
      await sendEmail(
        email,
        'Reset Your Password',
        `
        <h1>Password Reset Request</h1>
        <p>You requested to reset your password. Click the link below to create a new password:</p>
        <a href="${resetUrl}" style="background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
          Reset Password
        </a>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request a password reset, you can safely ignore this email.</p>
        `
      );

      res.json({
        success: true,
        message: 'Password reset instructions sent to your email'
      });

    } catch (error) {
      console.error('Forgot password error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to process password reset request'
      });
    }
  }
);

// POST /api/auth/reset-password
router.post('/reset-password',
  validateRequest([
    body('token').notEmpty().withMessage('Reset token is required'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
    body('confirmPassword')
      .custom((value, { req }) => value === req.body.password)
      .withMessage('Passwords do not match')
  ]),
  async (req, res) => {
    try {
      const { token, password } = req.body;

      // Find reset token
      const resetToken = passwordResetTokens.find(t =>
        t.token === token &&
        !t.used &&
        t.expires > new Date()
      );

      if (!resetToken) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or expired reset token'
        });
      }

      // Find user
      const user = users.find(u => u._id === resetToken.userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

      // Update user password
      user.password = hashedPassword;
      user.updatedAt = new Date().toISOString();

      // Mark token as used
      resetToken.used = true;

      // Clear all refresh tokens (force logout from all devices)
      user.refreshTokens = [];

      // Send confirmation email
      await sendEmail(
        user.email,
        'Password Changed Successfully',
        `
        <h1>Password Changed</h1>
        <p>Your password has been successfully changed.</p>
        <p>If you didn't make this change, please contact our support team immediately.</p>
        <p>For security reasons, you have been logged out of all devices.</p>
        `
      );

      res.json({
        success: true,
        message: 'Password reset successful. You can now login with your new password.'
      });

    } catch (error) {
      console.error('Reset password error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to reset password'
      });
    }
  }
);

// POST /api/auth/change-password
router.post('/change-password',
  authenticateToken,
  validateRequest([
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword')
      .isLength({ min: 8 })
      .withMessage('New password must be at least 8 characters')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('New password must contain at least one uppercase letter, one lowercase letter, and one number'),
    body('confirmPassword')
      .custom((value, { req }) => value === req.body.newPassword)
      .withMessage('Passwords do not match')
  ]),
  async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      const user = users.find(u => u._id === req.user.userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        return res.status(400).json({
          success: false,
          message: 'Current password is incorrect'
        });
      }

      // Check if new password is different
      const isSamePassword = await bcrypt.compare(newPassword, user.password);
      if (isSamePassword) {
        return res.status(400).json({
          success: false,
          message: 'New password must be different from current password'
        });
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, BCRYPT_SALT_ROUNDS);

      // Update password
      user.password = hashedPassword;
      user.updatedAt = new Date().toISOString();

      // Clear all refresh tokens (force logout from all devices)
      user.refreshTokens = [];

      // Send confirmation email
      await sendEmail(
        user.email,
        'Password Changed Successfully',
        `
        <h1>Password Changed</h1>
        <p>Your password has been successfully changed.</p>
        <p>If you didn't make this change, please contact our support team immediately.</p>
        <p>For security reasons, you have been logged out of all devices.</p>
        `
      );

      res.json({
        success: true,
        message: 'Password changed successfully. You have been logged out from all devices.'
      });

    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to change password'
      });
    }
  }
);

// GET /api/auth/verify-email/:token
router.get('/verify-email/:token', async (req, res) => {
  try {
    const { token } = req.params;

    const user = users.find(u =>
      u.verificationToken === token &&
      u.verificationExpires > new Date() &&
      !u.isVerified
    );

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification token'
      });
    }

    // Verify email
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationExpires = undefined;
    user.updatedAt = new Date().toISOString();

    // Send welcome email
    await sendEmail(
      user.email,
      'Email Verified Successfully',
      `
      <h1>Welcome to ResumeBuilder!</h1>
      <p>Your email has been successfully verified.</p>
      <p>You now have full access to all features of ResumeBuilder.</p>
      <p>Get started by creating your first resume!</p>
      `
    );

    res.json({
      success: true,
      message: 'Email verified successfully'
    });

  } catch (error) {
    console.error('Verify email error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify email'
    });
  }
});

// POST /api/auth/resend-verification
router.post('/resend-verification',
  validateRequest([
    body('email').isEmail().withMessage('Please provide a valid email address')
  ]),
  async (req, res) => {
    try {
      const { email } = req.body;

      const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      if (user.isVerified) {
        return res.status(400).json({
          success: false,
          message: 'Email is already verified'
        });
      }

      // Generate new verification token
      const verificationToken = crypto.randomBytes(32).toString('hex');
      const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      // Update user
      user.verificationToken = verificationToken;
      user.verificationExpires = verificationExpires;

      // Send verification email
      const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${verificationToken}`;
      await sendEmail(
        email,
        'Verify your email address',
        `
        <h1>Verify Your Email Address</h1>
        <p>Please verify your email address by clicking the link below:</p>
        <a href="${verificationUrl}" style="background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
          Verify Email Address
        </a>
        <p>This link will expire in 24 hours.</p>
        `
      );

      res.json({
        success: true,
        message: 'Verification email sent successfully'
      });

    } catch (error) {
      console.error('Resend verification error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to resend verification email'
      });
    }
  }
);

// GET /api/auth/me
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = users.find(u => u._id === req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Remove sensitive data
    const { password: pwd, refreshTokens: rt, verificationToken: vt, ...userResponse } = user;

    res.json({
      success: true,
      user: userResponse
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// PUT /api/auth/profile
router.put('/profile',
  authenticateToken,
  validateRequest([
    body('name')
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('Name must be between 2 and 50 characters'),
    body('profile.phone')
      .optional()
      .isMobilePhone()
      .withMessage('Please provide a valid phone number'),
    body('profile.website')
      .optional()
      .isURL()
      .withMessage('Please provide a valid URL'),
    body('profile.bio')
      .optional()
      .isLength({ max: 500 })
      .withMessage('Bio must be less than 500 characters')
  ]),
  async (req, res) => {
    try {
      const user = users.find(u => u._id === req.user.userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Update user data
      const updates = req.body;
      Object.keys(updates).forEach(key => {
        if (key === 'profile' && updates.profile) {
          user.profile = { ...user.profile, ...updates.profile };
        } else if (key === 'preferences' && updates.preferences) {
          user.preferences = { ...user.preferences, ...updates.preferences };
        } else if (key !== 'password' && key !== 'email') {
          user[key] = updates[key];
        }
      });

      user.updatedAt = new Date().toISOString();

      // Remove sensitive data
      const { password: pwd, refreshTokens: rt, verificationToken: vt, ...userResponse } = user;

      res.json({
        success: true,
        message: 'Profile updated successfully',
        user: userResponse
      });

    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update profile'
      });
    }
  }
);

// ======================
// TEST ROUTES (Development only)
// ======================
if (process.env.NODE_ENV === 'development') {
  // GET /api/auth/test-users
  router.get('/test-users', (req, res) => {
    const safeUsers = users.map(user => {
      const { password, refreshTokens, verificationToken, ...safeUser } = user;
      return safeUser;
    });

    res.json({
      success: true,
      users: safeUsers
    });
  });

  // GET /api/auth/test-tokens
  router.get('/test-tokens', (req, res) => {
    res.json({
      success: true,
      passwordResetTokens
    });
  });
}

export default router;