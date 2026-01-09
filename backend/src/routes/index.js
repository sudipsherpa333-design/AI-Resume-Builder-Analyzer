// src/routes/index.js - UPDATED VERSION
import express from 'express';
const router = express.Router();

// Import route modules
import authRoutes from './authRoutes.js';
import userRoutes from './userRoutes.js';
import resumeRoutes from './resumeRoutes.js';
import aiRoutes from '../ai/routes/aiRoutes.js';

// Health check
router.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        service: 'AI Resume Builder API',
        version: '2.0.0',
        environment: process.env.NODE_ENV || 'development'
    });
});

// API documentation endpoint
router.get('/docs', (req, res) => {
    res.json({
        message: 'AI Resume Builder API Documentation',
        version: '2.0.0',
        baseURL: process.env.BACKEND_URL || 'http://localhost:5001',
        endpoints: {
            auth: {
                login: 'POST /api/auth/login',
                register: 'POST /api/auth/register',
                logout: 'POST /api/auth/logout',
                google: 'GET /api/auth/google',
                me: 'GET /api/auth/me',
                demoLogin: 'POST /api/auth/demo-login'
            },
            users: {
                profile: 'GET /api/users/profile',
                updateProfile: 'PUT /api/users/profile',
                changePassword: 'PUT /api/users/change-password',
                stats: 'GET /api/users/stats'
            },
            resumes: {
                list: 'GET /api/resumes',
                create: 'POST /api/resumes',
                get: 'GET /api/resumes/:id',
                update: 'PUT /api/resumes/:id',
                delete: 'DELETE /api/resumes/:id',
                analyze: 'POST /api/resumes/:id/analyze'
            },
            ai: {
                health: 'GET /api/ai/health',
                status: 'GET /api/ai/status',
                capabilities: 'GET /api/ai/capabilities',
                analyze: 'POST /api/ai/analyze',
                enhance: 'POST /api/ai/enhance',
                summary: 'POST /api/ai/summary',
                atsCheck: 'POST /api/ai/ats-check',
                demoAnalyze: 'POST /api/ai/demo-analyze'
            }
        }
    });
});

// Welcome endpoint
router.get('/', (req, res) => {
    res.json({
        message: '🚀 Welcome to AI Resume Builder API',
        version: '2.0.0',
        description: 'AI-powered resume building and analysis platform',
        environment: process.env.NODE_ENV || 'development',
        endpoints: {
            documentation: '/api/docs',
            health: '/api/health',
            admin: '/admin',
            ai: '/api/ai/capabilities'
        },
        quickStart: {
            '1': 'Try demo login: POST /api/auth/demo-login',
            '2': 'Test AI analysis: POST /api/ai/demo-analyze',
            '3': 'Check API health: GET /api/health',
            '4': 'View all endpoints: GET /api/docs'
        }
    });
});

// Mount routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/resumes', resumeRoutes);
router.use('/ai', aiRoutes);

// 404 for undefined API routes
router.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: `API endpoint ${req.originalUrl} not found`,
        availableEndpoints: {
            documentation: '/api/docs',
            health: '/api/health',
            auth: '/api/auth',
            users: '/api/users',
            resumes: '/api/resumes',
            ai: '/api/ai',
            admin: '/admin'
        }
    });
});

export default router;