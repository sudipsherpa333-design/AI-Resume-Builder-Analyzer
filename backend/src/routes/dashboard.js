// backend/routes/dashboard.js
import express from 'express';
import { auth } from '../middleware/auth.js';
import Resume from '../models/Resume.js';
import User from '../models/User.js';

const router = express.Router();

// Get dashboard statistics
router.get('/stats/:userId', auth, async (req, res) => {
    try {
        const { userId } = req.params;

        // Get all resumes for this user
        const resumes = await Resume.find({ userId }).lean();

        // Calculate statistics
        const totalResumes = resumes.length;
        const completedResumes = resumes.filter(r => r.status === 'completed').length;
        const inProgressResumes = resumes.filter(r => r.status === 'in-progress').length;
        const draftResumes = resumes.filter(r => r.status === 'draft').length;

        // Calculate ATS scores
        const atsScores = resumes
            .filter(r => r.analysis?.atsScore)
            .map(r => r.analysis.atsScore);
        const averageAtsScore = atsScores.length > 0
            ? Math.round(atsScores.reduce((a, b) => a + b, 0) / atsScores.length)
            : 0;

        // Calculate high and low scores
        const highScoreResumes = resumes.filter(r => r.analysis?.atsScore >= 80).length;
        const needsImprovementResumes = resumes.filter(r => r.analysis?.atsScore < 60).length;

        // Calculate views and downloads
        const totalViews = resumes.reduce((sum, r) => sum + (r.views || 0), 0);
        const totalDownloads = resumes.reduce((sum, r) => sum + (r.downloads || 0), 0);

        // Calculate completion rate
        const completionRate = totalResumes > 0
            ? Math.round((completedResumes / totalResumes) * 100)
            : 0;

        // Calculate storage usage (simplified)
        const resumeCount = resumes.length;
        const storageUsed = Math.round(resumeCount * 0.5); // 0.5MB per resume approx
        const storageLimit = 500; // MB

        // Get recent activity
        const recentActivity = await Resume.find({ userId })
            .sort({ updatedAt: -1 })
            .limit(5)
            .select('title status updatedAt')
            .lean()
            .then(resumes => resumes.map(resume => ({
                id: resume._id,
                type: 'resume_updated',
                resumeId: resume._id,
                resumeTitle: resume.title,
                timestamp: resume.updatedAt,
                user: userId
            })));

        // Count online users (simplified - in real app, use socket.io)
        const onlineUsers = await User.countDocuments({ lastActive: { $gt: new Date(Date.now() - 5 * 60 * 1000) } });

        res.json({
            success: true,
            data: {
                totalResumes,
                completedResumes,
                inProgressResumes,
                draftResumes,
                averageAtsScore,
                onlineUsers: onlineUsers || 1,
                activeSessions: 1, // This would come from socket.io
                storageUsed: `${storageUsed} MB`,
                storageLimit: `${storageLimit} MB`,
                lastSynced: new Date().toISOString(),
                recentActivity,
                totalViews,
                totalDownloads,
                highScoreResumes,
                needsImprovementResumes,
                completionRate
            }
        });
    } catch (error) {
        console.error('Dashboard stats error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch dashboard statistics'
        });
    }
});

// Get user resumes for dashboard
router.get('/resumes/:userId', auth, async (req, res) => {
    try {
        const { userId } = req.params;
        const { status, sortBy = 'updatedAt', sortOrder = 'desc', page = 1, limit = 50 } = req.query;

        // Build query
        const query = { userId };
        if (status && status !== 'all') {
            if (status === 'starred') {
                query.isStarred = true;
            } else if (status === 'primary') {
                query.isPrimary = true;
            } else if (status === 'public') {
                query.isPublic = true;
            } else {
                query.status = status;
            }
        }

        // Build sort
        const sort = {};
        if (sortBy === 'atsScore') {
            sort['analysis.atsScore'] = sortOrder === 'desc' ? -1 : 1;
        } else if (sortBy === 'title') {
            sort.title = sortOrder === 'desc' ? -1 : 1;
        } else if (sortBy === 'views') {
            sort.views = sortOrder === 'desc' ? -1 : 1;
        } else if (sortBy === 'downloads') {
            sort.downloads = sortOrder === 'desc' ? -1 : 1;
        } else if (sortBy === 'createdAt') {
            sort.createdAt = sortOrder === 'desc' ? -1 : 1;
        } else {
            sort.updatedAt = sortOrder === 'desc' ? -1 : 1;
        }

        // Pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [resumes, total] = await Promise.all([
            Resume.find(query)
                .sort(sort)
                .skip(skip)
                .limit(parseInt(limit))
                .lean(),
            Resume.countDocuments(query)
        ]);

        res.json({
            success: true,
            data: resumes,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Dashboard resumes error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch resumes'
        });
    }
});

// Get recent activity
router.get('/activity/:userId', auth, async (req, res) => {
    try {
        const { userId } = req.params;
        const { limit = 10 } = req.query;

        const resumes = await Resume.find({ userId })
            .sort({ updatedAt: -1 })
            .limit(parseInt(limit))
            .select('title status updatedAt downloads views')
            .lean();

        const activity = resumes.map(resume => {
            let type = 'resume_updated';
            let description = 'Updated';

            if (resume.status === 'draft') {
                type = 'resume_created';
                description = 'Created';
            } else if (resume.downloads > 0) {
                type = 'resume_downloaded';
                description = 'Downloaded';
            } else if (resume.views > 0) {
                type = 'resume_viewed';
                description = 'Viewed';
            }

            return {
                id: resume._id,
                type,
                resumeId: resume._id,
                resumeTitle: resume.title,
                description,
                timestamp: resume.updatedAt,
                user: userId
            };
        });

        res.json({
            success: true,
            data: activity
        });
    } catch (error) {
        console.error('Dashboard activity error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch recent activity'
        });
    }
});

// Get storage usage
router.get('/storage/:userId', auth, async (req, res) => {
    try {
        const { userId } = req.params;

        const resumeCount = await Resume.countDocuments({ userId });
        const storageUsed = Math.round(resumeCount * 0.5); // 0.5MB per resume approx
        const storageLimit = 500; // MB
        const percentage = Math.round((storageUsed / storageLimit) * 100);

        res.json({
            success: true,
            data: {
                used: `${storageUsed} MB`,
                limit: `${storageLimit} MB`,
                percentage,
                resumeCount
            }
        });
    } catch (error) {
        console.error('Dashboard storage error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch storage usage'
        });
    }
});

// Bulk export resumes
router.post('/bulk-export/:userId', auth, async (req, res) => {
    try {
        const { userId } = req.params;
        const { resumeIds, format = 'pdf' } = req.body;

        // Verify user owns these resumes
        const resumes = await Resume.find({
            _id: { $in: resumeIds },
            userId
        }).lean();

        if (resumes.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'No resumes found'
            });
        }

        // In a real implementation, you would:
        // 1. Generate PDF/Word documents for each resume
        // 2. Create a ZIP file
        // 3. Upload to cloud storage
        // 4. Return download URL

        // For now, return a mock response
        res.json({
            success: true,
            data: {
                url: `/api/exports/${Date.now()}.zip`,
                filename: `resumes_export_${Date.now()}.zip`,
                count: resumes.length,
                message: 'Export initiated. You will receive a download link shortly.'
            }
        });
    } catch (error) {
        console.error('Bulk export error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to initiate bulk export'
        });
    }
});

export default router;