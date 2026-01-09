const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const Admin = require('../models/Admin');
const AdminService = require('./AdminService');
const LogService = require('./LogService');
const EmailService = require('../../api/services/EmailService');

class AuthService {
    // Admin login
    static async adminLogin(email, password, ipAddress, userAgent) {
        try {
            // Find admin
            const admin = await Admin.findOne({ email: email.toLowerCase() });

            if (!admin) {
                await LogService.createActionLog(null, 'login_attempt', {
                    email,
                    ip: ipAddress,
                    success: false,
                    reason: 'Admin not found'
                });
                throw new Error('Invalid credentials');
            }

            // Check if account is active
            if (!admin.isActive) {
                await LogService.createActionLog(admin._id, 'login_attempt', {
                    ip: ipAddress,
                    success: false,
                    reason: 'Account deactivated'
                });
                throw new Error('Account is deactivated. Please contact administrator.');
            }

            // Verify password
            const isValidPassword = await admin.comparePassword(password);
            if (!isValidPassword) {
                await LogService.createActionLog(admin._id, 'login_attempt', {
                    ip: ipAddress,
                    success: false,
                    reason: 'Invalid password'
                });
                throw new Error('Invalid credentials');
            }

            // Check if 2FA is enabled
            if (admin.twoFactorEnabled) {
                return {
                    requires2FA: true,
                    adminId: admin._id,
                    tempToken: this.generateTempToken(admin._id)
                };
            }

            // Generate JWT token
            const token = this.generateToken(admin);

            // Update last login
            admin.lastLogin = new Date();
            admin.lastLoginIp = ipAddress;
            await admin.save();

            // Log successful login
            await LogService.createActionLog(admin._id, 'login', {
                ip: ipAddress,
                userAgent,
                success: true
            });

            // Remove sensitive data
            admin.password = undefined;
            admin.twoFactorSecret = undefined;

            return {
                admin,
                token
            };
        } catch (error) {
            throw error;
        }
    }

    // Verify 2FA
    static async verify2FA(adminId, token, tempToken, ipAddress) {
        try {
            // Verify temp token
            const decoded = jwt.verify(tempToken, process.env.ADMIN_JWT_SECRET);
            if (decoded.id !== adminId || decoded.type !== '2fa_temp') {
                throw new Error('Invalid temporary token');
            }

            const admin = await Admin.findById(adminId);
            if (!admin) {
                throw new Error('Admin not found');
            }

            // Verify 2FA token
            const verified = speakeasy.totp.verify({
                secret: admin.twoFactorSecret,
                encoding: 'base32',
                token,
                window: 1
            });

            if (!verified) {
                await LogService.createActionLog(adminId, '2fa_attempt', {
                    ip: ipAddress,
                    success: false
                });
                throw new Error('Invalid 2FA code');
            }

            // Generate final token
            const finalToken = this.generateToken(admin);

            // Update last login
            admin.lastLogin = new Date();
            admin.lastLoginIp = ipAddress;
            await admin.save();

            // Log successful 2FA verification
            await LogService.createActionLog(adminId, '2fa_success', {
                ip: ipAddress,
                success: true
            });

            // Remove sensitive data
            admin.password = undefined;
            admin.twoFactorSecret = undefined;

            return {
                admin,
                token: finalToken
            };
        } catch (error) {
            throw error;
        }
    }

    // Setup 2FA
    static async setup2FA(adminId) {
        try {
            const admin = await Admin.findById(adminId);
            if (!admin) {
                throw new Error('Admin not found');
            }

            // Generate secret
            const secret = speakeasy.generateSecret({
                name: `ResumeBuilder Admin (${admin.email})`
            });

            // Generate QR code
            const qrCode = await QRCode.toDataURL(secret.otpauth_url);

            // Temporarily store secret (not saved yet)
            admin.twoFactorSecret = secret.base32;

            return {
                secret: secret.base32,
                qrCode,
                otpauth_url: secret.otpauth_url
            };
        } catch (error) {
            throw error;
        }
    }

    // Enable 2FA
    static async enable2FA(adminId, token) {
        try {
            const admin = await Admin.findById(adminId);
            if (!admin) {
                throw new Error('Admin not found');
            }

            if (!admin.twoFactorSecret) {
                throw new Error('2FA not setup. Please setup first.');
            }

            // Verify token
            const verified = speakeasy.totp.verify({
                secret: admin.twoFactorSecret,
                encoding: 'base32',
                token,
                window: 1
            });

            if (!verified) {
                throw new Error('Invalid verification code');
            }

            // Enable 2FA
            admin.twoFactorEnabled = true;
            await admin.save();

            // Generate backup codes
            const backupCodes = Array.from({ length: 8 }, () =>
                crypto.randomBytes(4).toString('hex').toUpperCase()
            );

            return {
                success: true,
                backupCodes
            };
        } catch (error) {
            throw error;
        }
    }

    // Disable 2FA
    static async disable2FA(adminId, password) {
        try {
            const admin = await Admin.findById(adminId);
            if (!admin) {
                throw new Error('Admin not found');
            }

            // Verify password
            const isValidPassword = await admin.comparePassword(password);
            if (!isValidPassword) {
                throw new Error('Invalid password');
            }

            // Disable 2FA
            admin.twoFactorEnabled = false;
            admin.twoFactorSecret = undefined;
            await admin.save();

            return { success: true };
        } catch (error) {
            throw error;
        }
    }

    // Forgot password
    static async forgotPassword(email) {
        try {
            const admin = await Admin.findOne({ email: email.toLowerCase() });
            if (!admin) {
                // Don't reveal that email doesn't exist for security
                return { message: 'If an account exists, a reset email will be sent' };
            }

            if (!admin.isActive) {
                throw new Error('Account is deactivated');
            }

            // Generate reset token
            const resetToken = admin.generateResetToken();
            await admin.save();

            // Send reset email
            const resetUrl = `${process.env.ADMIN_URL}/reset-password/${resetToken}`;

            await EmailService.sendPasswordResetEmail(
                admin.email,
                admin.name,
                resetUrl
            );

            await LogService.createActionLog(admin._id, 'password_reset_request', {
                success: true
            });

            return { message: 'Password reset email sent' };
        } catch (error) {
            throw error;
        }
    }

    // Reset password
    static async resetPassword(token, newPassword) {
        try {
            const admin = await Admin.findOne({
                resetPasswordToken: token,
                resetPasswordExpires: { $gt: Date.now() }
            });

            if (!admin) {
                throw new Error('Invalid or expired reset token');
            }

            // Update password
            admin.password = newPassword;
            admin.resetPasswordToken = undefined;
            admin.resetPasswordExpires = undefined;
            admin.passwordChangedAt = Date.now();
            await admin.save();

            await LogService.createActionLog(admin._id, 'password_reset', {
                success: true
            });

            // Send confirmation email
            await EmailService.sendPasswordChangedEmail(
                admin.email,
                admin.name
            );

            return { success: true, message: 'Password reset successful' };
        } catch (error) {
            throw error;
        }
    }

    // Change password
    static async changePassword(adminId, currentPassword, newPassword) {
        try {
            const admin = await Admin.findById(adminId);
            if (!admin) {
                throw new Error('Admin not found');
            }

            // Verify current password
            const isValidPassword = await admin.comparePassword(currentPassword);
            if (!isValidPassword) {
                throw new Error('Current password is incorrect');
            }

            // Update password
            admin.password = newPassword;
            admin.passwordChangedAt = Date.now();
            await admin.save();

            await LogService.createActionLog(adminId, 'password_change', {
                success: true
            });

            // Send notification email
            await EmailService.sendPasswordChangedEmail(
                admin.email,
                admin.name
            );

            return { success: true, message: 'Password changed successfully' };
        } catch (error) {
            throw error;
        }
    }

    // Generate JWT token
    static generateToken(admin) {
        return jwt.sign(
            {
                id: admin._id,
                email: admin.email,
                role: admin.role,
                permissions: admin.permissions
            },
            process.env.ADMIN_JWT_SECRET,
            { expiresIn: process.env.ADMIN_JWT_EXPIRES_IN || '8h' }
        );
    }

    // Generate temporary token for 2FA
    static generateTempToken(adminId) {
        return jwt.sign(
            {
                id: adminId,
                type: '2fa_temp'
            },
            process.env.ADMIN_JWT_SECRET,
            { expiresIn: '5m' }
        );
    }

    // Verify token
    static verifyToken(token) {
        return jwt.verify(token, process.env.ADMIN_JWT_SECRET);
    }
}

module.exports = AuthService;