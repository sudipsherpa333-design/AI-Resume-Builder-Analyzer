const AuthService = require('../services/AuthService');
const AdminService = require('../services/AdminService');
const LogService = require('../services/LogService');

class AuthController {
    // Admin login
    async login(req, res) {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'Email and password are required'
                });
            }

            const result = await AuthService.adminLogin(
                email,
                password,
                req.ip,
                req.headers['user-agent']
            );

            // Check if 2FA is required
            if (result.requires2FA) {
                return res.json({
                    success: true,
                    requires2FA: true,
                    adminId: result.adminId,
                    tempToken: result.tempToken,
                    message: '2FA required'
                });
            }

            res.json({
                success: true,
                message: 'Login successful',
                data: {
                    admin: result.admin,
                    token: result.token
                }
            });
        } catch (error) {
            res.status(401).json({
                success: false,
                message: error.message
            });
        }
    }

    // Verify 2FA
    async verify2FA(req, res) {
        try {
            const { adminId, token, tempToken } = req.body;

            if (!adminId || !token || !tempToken) {
                return res.status(400).json({
                    success: false,
                    message: 'Admin ID, token, and temp token are required'
                });
            }

            const result = await AuthService.verify2FA(
                adminId,
                token,
                tempToken,
                req.ip
            );

            res.json({
                success: true,
                message: '2FA verification successful',
                data: {
                    admin: result.admin,
                    token: result.token
                }
            });
        } catch (error) {
            res.status(401).json({
                success: false,
                message: error.message
            });
        }
    }

    // Get current admin profile
    async getProfile(req, res) {
        try {
            res.json({
                success: true,
                data: req.admin
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    // Update profile
    async updateProfile(req, res) {
        try {
            const { name, avatar } = req.body;
            const updateData = {};

            if (name) updateData.name = name;
            if (avatar) updateData.avatar = avatar;

            const admin = await AdminService.updateAdmin(
                req.admin._id,
                updateData,
                req.admin
            );

            await LogService.createActionLog(req.admin._id, 'profile_update', {
                fields: Object.keys(updateData)
            });

            res.json({
                success: true,
                message: 'Profile updated successfully',
                data: admin
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    // Change password
    async changePassword(req, res) {
        try {
            const { currentPassword, newPassword } = req.body;

            if (!currentPassword || !newPassword) {
                return res.status(400).json({
                    success: false,
                    message: 'Current and new password are required'
                });
            }

            if (newPassword.length < 6) {
                return res.status(400).json({
                    success: false,
                    message: 'New password must be at least 6 characters'
                });
            }

            await AuthService.changePassword(
                req.admin._id,
                currentPassword,
                newPassword
            );

            res.json({
                success: true,
                message: 'Password changed successfully'
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    // Setup 2FA
    async setup2FA(req, res) {
        try {
            const result = await AuthService.setup2FA(req.admin._id);

            res.json({
                success: true,
                data: result
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    // Enable 2FA
    async enable2FA(req, res) {
        try {
            const { token } = req.body;

            if (!token) {
                return res.status(400).json({
                    success: false,
                    message: 'Verification token is required'
                });
            }

            const result = await AuthService.enable2FA(req.admin._id, token);

            await LogService.createActionLog(req.admin._id, '2fa_enabled', {
                success: true
            });

            res.json({
                success: true,
                message: '2FA enabled successfully',
                data: result
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    // Disable 2FA
    async disable2FA(req, res) {
        try {
            const { password } = req.body;

            if (!password) {
                return res.status(400).json({
                    success: false,
                    message: 'Password is required to disable 2FA'
                });
            }

            await AuthService.disable2FA(req.admin._id, password);

            await LogService.createActionLog(req.admin._id, '2fa_disabled', {
                success: true
            });

            res.json({
                success: true,
                message: '2FA disabled successfully'
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    // Forgot password
    async forgotPassword(req, res) {
        try {
            const { email } = req.body;

            if (!email) {
                return res.status(400).json({
                    success: false,
                    message: 'Email is required'
                });
            }

            const result = await AuthService.forgotPassword(email);

            res.json({
                success: true,
                message: result.message
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    // Reset password
    async resetPassword(req, res) {
        try {
            const { token, newPassword } = req.body;

            if (!token || !newPassword) {
                return res.status(400).json({
                    success: false,
                    message: 'Token and new password are required'
                });
            }

            if (newPassword.length < 6) {
                return res.status(400).json({
                    success: false,
                    message: 'Password must be at least 6 characters'
                });
            }

            const result = await AuthService.resetPassword(token, newPassword);

            res.json({
                success: true,
                message: result.message
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    // Logout
    async logout(req, res) {
        try {
            await LogService.createActionLog(req.admin._id, 'logout', {
                ip: req.ip,
                success: true
            });

            res.json({
                success: true,
                message: 'Logged out successfully'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
}

module.exports = new AuthController();