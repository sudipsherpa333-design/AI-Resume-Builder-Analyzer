// src/controllers/userController.js

// First, define asyncHandler if not imported
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

// Define custom error classes
class ValidationError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ValidationError';
        this.statusCode = 400;
    }
}

class ConflictError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ConflictError';
        this.statusCode = 409;
    }
}

class AuthenticationError extends Error {
    constructor(message) {
        super(message);
        this.name = 'AuthenticationError';
        this.statusCode = 401;
    }
}

class NotFoundError extends Error {
    constructor(message) {
        super(message);
        this.name = 'NotFoundError';
        this.statusCode = 404;
    }
}

// Import other dependencies
import User from '../models/User.js';
import { generateToken } from '../utils/jwtToken.js';

// User registration
export const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    // Validation check
    if (!name || !email || !password) {
        throw new ValidationError('All fields are required');
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new ConflictError('User already exists with this email');
    }

    // Create user
    const user = await User.create({ name, email, password });

    // Generate JWT token
    const token = generateToken(user._id, user.role);

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
            user: userResponse,
            token
        }
    });
});

// User login
export const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        throw new ValidationError('Email and password are required');
    }

    // Find user by email with password
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
        throw new AuthenticationError('Invalid email or password');
    }

    // Check if account is locked
    if (user.lockUntil && user.lockUntil > Date.now()) {
        const lockTime = Math.ceil((user.lockUntil - Date.now()) / (60 * 1000));
        throw new AuthenticationError(`Account is locked. Try again in ${lockTime} minutes.`);
    }

    // Check password
    const isPasswordValid = await user.matchPassword(password);

    if (!isPasswordValid) {
        throw new AuthenticationError('Invalid email or password');
    }

    // Update last login
    user.lastLogin = new Date();
    user.stats.loginCount = (user.stats.loginCount || 0) + 1;
    await user.save();

    // Generate JWT token
    const token = generateToken(user._id, user.role);

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
            user: userResponse,
            token
        }
    });
});

// Logout user
export const logoutUser = asyncHandler(async (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Logged out successfully'
    });
});

// Get user profile
export const getUserProfile = asyncHandler(async (req, res) => {
    // User is attached to req by protect middleware
    if (!req.user) {
        throw new AuthenticationError('User not authenticated');
    }

    const user = await User.findById(req.user._id);

    if (!user) {
        throw new NotFoundError('User not found');
    }

    res.status(200).json({
        success: true,
        data: { user }
    });
});

// Update user profile
export const updateUserProfile = asyncHandler(async (req, res) => {
    if (!req.user) {
        throw new AuthenticationError('User not authenticated');
    }

    const updates = {};
    const allowedFields = ['name', 'phone', 'profile', 'avatar'];

    // Only allow updates to specific fields
    allowedFields.forEach((field) => {
        if (req.body[field] !== undefined) {
            updates[field] = req.body[field];
        }
    });

    const user = await User.findByIdAndUpdate(
        req.user._id,
        updates,
        {
            new: true, // Return updated document
            runValidators: true // Run model validators
        }
    );

    if (!user) {
        throw new NotFoundError('User not found');
    }

    res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: { user }
    });
});

// Change password
export const changePassword = asyncHandler(async (req, res) => {
    if (!req.user) {
        throw new AuthenticationError('User not authenticated');
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        throw new ValidationError('Both current and new passwords are required');
    }

    const user = await User.findById(req.user._id).select('+password');

    if (!user) {
        throw new NotFoundError('User not found');
    }

    // Check current password
    const isCurrentPasswordValid = await user.matchPassword(currentPassword);

    if (!isCurrentPasswordValid) {
        throw new AuthenticationError('Current password is incorrect');
    }

    // Check if new password is different
    const isSamePassword = await user.matchPassword(newPassword);

    if (isSamePassword) {
        throw new ValidationError('New password must be different from current password');
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.status(200).json({
        success: true,
        message: 'Password changed successfully'
    });
});

// Update user preferences
export const updateUserPreferences = asyncHandler(async (req, res) => {
    if (!req.user) {
        throw new AuthenticationError('User not authenticated');
    }

    const preferences = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
        throw new NotFoundError('User not found');
    }

    // Merge preferences
    user.preferences = {
        ...user.preferences,
        ...preferences
    };

    await user.save();

    res.status(200).json({
        success: true,
        message: 'Preferences updated successfully',
        data: { preferences: user.preferences }
    });
});

// Upload avatar
export const uploadAvatar = asyncHandler(async (req, res) => {
    if (!req.user) {
        throw new AuthenticationError('User not authenticated');
    }

    const user = await User.findById(req.user._id);

    if (!user) {
        throw new NotFoundError('User not found');
    }

    // Check if avatar is provided
    if (!req.body.avatarUrl && (!req.file || !req.file.filename)) {
        throw new ValidationError('No avatar provided');
    }

    // If file was uploaded
    if (req.file && req.file.filename) {
        user.avatar = `/uploads/${req.file.filename}`;
    }
    // If avatar URL is provided
    else if (req.body.avatarUrl) {
        user.avatar = req.body.avatarUrl;
    }

    await user.save();

    res.status(200).json({
        success: true,
        message: 'Avatar updated successfully',
        data: { avatar: user.avatar }
    });
});

// Delete account
export const deleteAccount = asyncHandler(async (req, res) => {
    if (!req.user) {
        throw new AuthenticationError('User not authenticated');
    }

    const user = await User.findById(req.user._id);

    if (!user) {
        throw new NotFoundError('User not found');
    }

    // Soft delete: mark as deleted
    user.isDeleted = true;
    user.isActive = false;
    user.deletedAt = new Date();

    await user.save();

    res.status(200).json({
        success: true,
        message: 'Account deleted successfully'
    });
});

// Get user statistics
export const getUserStats = asyncHandler(async (req, res) => {
    if (!req.user) {
        throw new AuthenticationError('User not authenticated');
    }

    const user = await User.findById(req.user._id);

    if (!user) {
        throw new NotFoundError('User not found');
    }

    res.status(200).json({
        success: true,
        data: {
            stats: user.stats || {},
            resumeCount: user.stats?.resumeCount || 0,
            loginCount: user.stats?.loginCount || 0,
            lastActivity: user.stats?.lastActivity || user.lastLogin
        }
    });
});

// Forgot password (basic implementation)
export const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;

    if (!email) {
        throw new ValidationError('Email is required');
    }

    const user = await User.findOne({ email });

    if (!user) {
        // Don't reveal if user exists for security
        return res.status(200).json({
            success: true,
            message: 'If an account exists with this email, a reset link will be sent'
        });
    }

    // Generate reset token
    const resetToken = user.generatePasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // In a real app, you would send an email here
    // For now, just return the token (in development only)
    const resetUrl = `${req.protocol}://${req.get('host')}/api/auth/reset-password/${resetToken}`;

    res.status(200).json({
        success: true,
        message: 'Password reset email sent',
        // Only show in development
        ...(process.env.NODE_ENV === 'development' && { resetUrl })
    });
});

// Reset password
export const resetPassword = asyncHandler(async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;

    if (!password) {
        throw new ValidationError('Password is required');
    }

    // Hash the token to compare with stored hash
    const crypto = await import('crypto');
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
        throw new AuthenticationError('Invalid or expired reset token');
    }

    // Set new password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({
        success: true,
        message: 'Password reset successfully'
    });
});