const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateAdmin } = require('../middlewares/adminAuth');

// Public routes (no authentication required)
router.post('/login', authController.login);
router.post('/verify-2fa', authController.verify2FA);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.post('/refresh-token', authController.refreshToken);

// Protected routes (require authentication)
router.use(authenticateAdmin);

// Profile management
router.get('/profile', authController.getProfile);
router.put('/profile', authController.updateProfile);
router.post('/change-password', authController.changePassword);
router.post('/logout', authController.logout);

// 2FA management
router.get('/2fa/setup', authController.setup2FA);
router.post('/2fa/enable', authController.enable2FA);
router.post('/2fa/disable', authController.disable2FA);
router.post('/2fa/verify', authController.verify2FASetup);
router.get('/2fa/backup-codes', authController.getBackupCodes);
router.post('/2fa/generate-backup-codes', authController.generateBackupCodes);

// Session management
router.get('/sessions', authController.getActiveSessions);
router.delete('/sessions/:sessionId', authController.revokeSession);

// Security settings
router.get('/security-settings', authController.getSecuritySettings);
router.put('/security-settings', authController.updateSecuritySettings);

// Activity logs (personal)
router.get('/activity-logs', authController.getPersonalActivityLogs);

module.exports = router;