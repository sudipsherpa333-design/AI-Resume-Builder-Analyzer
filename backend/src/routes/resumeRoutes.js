// backend/routes/resumeRoutes.js - UPDATED WITH SERVICE LAYER
import express from 'express';
import resumeService from '../services/resumeService.js';
import { authMiddleware, rateLimiter } from '../middleware/auth.js';
import { validateResumeData } from '../middleware/validation.js';

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// ✅ GET all resumes
router.get('/', rateLimiter, async (req, res) => {
    try {
        const result = await resumeService.getUserResumes(req.user._id, req.query);

        res.json({
            success: true,
            ...result
        });
    } catch (error) {
        console.error('Get resumes error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch resumes'
        });
    }
});

// ✅ GET single resume
router.get('/:id', async (req, res) => {
    try {
        const resume = await resumeService.getResume(req.user._id, req.params.id);

        res.json({
            success: true,
            data: resume
        });
    } catch (error) {
        if (error.message.includes('not found') || error.message.includes('Invalid')) {
            return res.status(404).json({
                success: false,
                error: error.message
            });
        }

        console.error('Get resume error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch resume'
        });
    }
});

// ✅ CREATE new resume
router.post('/', validateResumeData, async (req, res) => {
    try {
        const resume = await resumeService.createResume(req.user._id, req.body);

        res.status(201).json({
            success: true,
            message: 'Resume created successfully',
            data: resume
        });
    } catch (error) {
        if (error.message.includes('limit reached')) {
            return res.status(403).json({
                success: false,
                error: error.message
            });
        }

        if (error.message.includes('title is required')) {
            return res.status(400).json({
                success: false,
                error: error.message
            });
        }

        console.error('Create resume error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create resume'
        });
    }
});

// ✅ UPDATE resume
router.put('/:id', async (req, res) => {
    try {
        const resume = await resumeService.updateResume(
            req.user._id,
            req.params.id,
            req.body
        );

        res.json({
            success: true,
            message: 'Resume updated successfully',
            data: resume
        });
    } catch (error) {
        if (error.message.includes('not found') || error.message.includes('Invalid')) {
            return res.status(404).json({
                success: false,
                error: error.message
            });
        }

        if (error.message.includes('Version conflict')) {
            return res.status(409).json({
                success: false,
                error: error.message
            });
        }

        console.error('Update resume error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update resume'
        });
    }
});

// ✅ DELETE resume
router.delete('/:id', async (req, res) => {
    try {
        const result = await resumeService.deleteResume(req.user._id, req.params.id);

        res.json({
            success: true,
            message: 'Resume deleted successfully',
            data: result
        });
    } catch (error) {
        if (error.message.includes('not found') || error.message.includes('Invalid')) {
            return res.status(404).json({
                success: false,
                error: error.message
            });
        }

        console.error('Delete resume error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete resume'
        });
    }
});

// ✅ DUPLICATE resume
router.post('/:id/duplicate', async (req, res) => {
    try {
        const duplicate = await resumeService.duplicateResume(req.user._id, req.params.id);

        res.status(201).json({
            success: true,
            message: 'Resume duplicated successfully',
            data: duplicate
        });
    } catch (error) {
        if (error.message.includes('limit reached')) {
            return res.status(403).json({
                success: false,
                error: error.message
            });
        }

        if (error.message.includes('not found')) {
            return res.status(404).json({
                success: false,
                error: error.message
            });
        }

        console.error('Duplicate resume error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to duplicate resume'
        });
    }
});

// ✅ ANALYZE resume
router.post('/:id/analyze', async (req, res) => {
    try {
        const result = await resumeService.analyzeResume(req.user._id, req.params.id);

        res.json({
            success: true,
            message: 'Resume analyzed successfully',
            data: result
        });
    } catch (error) {
        if (error.message.includes('not found')) {
            return res.status(404).json({
                success: false,
                error: error.message
            });
        }

        console.error('Analyze resume error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to analyze resume'
        });
    }
});

// ✅ EXPORT resume
router.post('/:id/export', async (req, res) => {
    try {
        const { format = 'pdf', options = {} } = req.body;

        const result = await resumeService.exportResume(
            req.user._id,
            req.params.id,
            format,
            options
        );

        if (format === 'pdf') {
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
            res.send(result.data);
        } else {
            res.json({
                success: true,
                message: 'Resume exported successfully',
                data: result
            });
        }
    } catch (error) {
        if (error.message.includes('not found')) {
            return res.status(404).json({
                success: false,
                error: error.message
            });
        }

        console.error('Export resume error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to export resume'
        });
    }
});

// ✅ GET resume statistics
router.get('/stats/summary', async (req, res) => {
    try {
        const stats = await resumeService.getResumeStats(req.user._id);

        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get resume statistics'
        });
    }
});

// ✅ SEARCH resumes
router.get('/search', async (req, res) => {
    try {
        const { q, ...options } = req.query;

        if (!q || q.trim().length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Search query is required'
            });
        }

        const result = await resumeService.searchResumes(req.user._id, q, options);

        res.json({
            success: true,
            ...result
        });
    } catch (error) {
        console.error('Search resumes error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to search resumes'
        });
    }
});

// ✅ GET recent resumes
router.get('/recent', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 5;
        const resumes = await resumeService.getRecentResumes(req.user._id, limit);

        res.json({
            success: true,
            data: resumes
        });
    } catch (error) {
        console.error('Get recent resumes error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get recent resumes'
        });
    }
});

export default router;