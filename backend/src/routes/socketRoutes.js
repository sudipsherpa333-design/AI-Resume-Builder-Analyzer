// backend/src/routes/socketRoutes.js
import express from 'express';
import SocketService from '../services/socketService.js';

const router = express.Router();

// GET /api/socket/stats - Get real-time statistics
router.get('/stats', (req, res) => {
    try {
        const stats = SocketService.getStats();
        res.json({
            success: true,
            message: 'Socket statistics',
            data: stats,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to get socket stats',
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// GET /api/socket/health - Socket service health check
router.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'Socket service is running',
        data: {
            connectedUsers: SocketService.connectedUsers.size,
            activeSessions: SocketService.collaborationSessions.size,
            timestamp: new Date().toISOString()
        }
    });
});

// POST /api/socket/notify - Send notification to specific user
router.post('/notify', (req, res) => {
    try {
        const { userId, event, data } = req.body;

        if (!userId || !event) {
            return res.status(400).json({
                success: false,
                error: 'userId and event are required'
            });
        }

        SocketService.notifyUser(userId, event, data);

        res.json({
            success: true,
            message: 'Notification sent',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to send notification',
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// POST /api/socket/broadcast - Broadcast to resume room
router.post('/broadcast', (req, res) => {
    try {
        const { resumeId, event, data } = req.body;

        if (!resumeId || !event) {
            return res.status(400).json({
                success: false,
                error: 'resumeId and event are required'
            });
        }

        SocketService.broadcastToResume(resumeId, event, data);

        res.json({
            success: true,
            message: 'Broadcast sent',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to broadcast',
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

export default router;