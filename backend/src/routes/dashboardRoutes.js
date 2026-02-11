// backend/routes/dashboardRoutes.js - USING ACTUAL RESUME DATA
import express from 'express';
import Resume from '../models/Resume.js'; // Import your Resume model

const router = express.Router();

// Authentication middleware (same as before)
const authenticate = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');

        if (!token) {
            if (process.env.NODE_ENV === 'development') {
                req.user = {
                    _id: 'demo-user-123',
                    id: 'demo-user-123',
                    email: 'demo@example.com'
                };
                return next();
            }
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        // For development, accept any token
        if (process.env.NODE_ENV === 'development') {
            req.user = {
                _id: 'demo-user-123',
                id: 'demo-user-123',
                email: 'demo@example.com'
            };
        } else {
            // Production JWT verification
            const jwt = require('jsonwebtoken');
            const decoded = jwt.verify(
                token,
                process.env.JWT_SECRET || 'your-jwt-secret-key-change-this'
            );
            req.user = {
                _id: decoded.userId || decoded.id,
                id: decoded.userId || decoded.id,
                email: decoded.email
            };
        }

        next();
    } catch (error) {
        console.error('Authentication error:', error);
        res.status(401).json({
            success: false,
            message: 'Invalid token'
        });
    }
};

// GET /api/dashboard/stats - Get REAL stats from database
router.get('/stats', authenticate, async (req, res) => {
    try {
        console.log('📊 Fetching REAL dashboard stats for user:', req.user._id);

        // 1. Get resumes from ACTUAL database
        const resumes = await Resume.find({ user: req.user._id }).lean();
        console.log(`✅ Found ${resumes.length} actual resumes in database`);

        // 2. Calculate REAL statistics
        const totalResumes = resumes.length;
        const completedResumes = resumes.filter(r =>
            r.status === 'completed' || r.status === 'published'
        ).length;

        const draftResumes = resumes.filter(r => r.status === 'draft').length;
        const publishedResumes = resumes.filter(r => r.status === 'published').length;

        // 3. Calculate REAL ATS scores
        const resumesWithScore = resumes.filter(r => r.analysis?.atsScore !== undefined);
        const averageAtsScore = resumesWithScore.length > 0
            ? Math.round(resumesWithScore.reduce((sum, r) => sum + (r.analysis.atsScore || 0), 0) / resumesWithScore.length)
            : 0;

        // 4. Calculate REAL template usage
        const templatesUsed = {};
        resumes.forEach(resume => {
            const template = resume.templateSettings?.templateName || resume.template || 'modern';
            templatesUsed[template] = (templatesUsed[template] || 0) + 1;
        });

        // 5. Get REAL recent activity
        const recentActivity = resumes
            .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
            .slice(0, 5)
            .map(resume => ({
                id: resume._id,
                action: getActionForResume(resume),
                resume: resume.title,
                time: formatTimeAgo(resume.updatedAt || resume.createdAt),
                type: resume.status,
                score: resume.analysis?.atsScore || 0
            }));

        // 6. Calculate REAL storage (estimate based on resume size)
        const estimatedSizeKB = resumes.reduce((total, resume) => {
            // Estimate each resume as JSON string
            const resumeJSON = JSON.stringify(resume);
            return total + Math.ceil(resumeJSON.length / 1024);
        }, 0);

        const storageUsed = estimatedSizeKB < 1024
            ? `${estimatedSizeKB} KB`
            : `${(estimatedSizeKB / 1024).toFixed(1)} MB`;

        // 7. Calculate REAL performance metrics
        const highScoreResumes = resumes.filter(r => r.analysis?.atsScore >= 80).length;
        const needsImprovementResumes = resumes.filter(r =>
            r.analysis?.atsScore < 60 && r.analysis?.atsScore > 0
        ).length;

        const completionRate = totalResumes > 0
            ? Math.round((completedResumes / totalResumes) * 100)
            : 0;

        // 8. Calculate REAL progress averages
        const avgProgress = totalResumes > 0
            ? Math.round(resumes.reduce((sum, r) => sum + (r.progress || 0), 0) / totalResumes)
            : 0;

        // 9. Get most used template
        const templateEntries = Object.entries(templatesUsed);
        const mostUsedTemplate = templateEntries.length > 0
            ? templateEntries.sort(([, a], [, b]) => b - a)[0]
            : ['modern', 0];

        // 10. Calculate REAL views and downloads
        const totalViews = resumes.reduce((sum, r) => sum + (r.views || 0), 0);
        const totalDownloads = resumes.reduce((sum, r) => sum + (r.downloads || 0), 0);

        const stats = {
            // Resume counts
            totalResumes,
            completedResumes,
            draftResumes,
            publishedResumes,
            inProgressResumes: resumes.filter(r => r.status === 'in-progress').length,

            // Quality metrics
            averageAtsScore,
            avgProgress,
            highScoreResumes,
            needsImprovementResumes,
            completionRate,

            // Template analytics
            templatesUsed,
            mostUsedTemplate: mostUsedTemplate[0],
            mostUsedTemplateCount: mostUsedTemplate[1],

            // Storage
            storageUsed,
            storageLimit: '500 MB',
            storagePercentage: Math.min(Math.round((estimatedSizeKB / (500 * 1024)) * 100), 100),

            // Activity
            recentActivity,
            totalViews,
            totalDownloads,
            lastUpdated: resumes.length > 0
                ? new Date(Math.max(...resumes.map(r => new Date(r.updatedAt))))
                : new Date(),

            // System
            lastSynced: new Date().toISOString(),
            performanceTrend: getPerformanceTrend(resumes),
            onlineUsers: 1,
            activeSessions: 1,

            // Additional metrics
            avgExperienceYears: calculateAvgExperienceYears(resumes),
            totalSkills: resumes.reduce((sum, r) => sum + (r.skills?.length || 0), 0),
            totalProjects: resumes.reduce((sum, r) => sum + (r.projects?.length || 0), 0),
            avgResumeCompleteness: avgProgress
        };

        console.log('📊 REAL Stats calculated:', {
            totalResumes,
            completedResumes,
            draftResumes,
            averageAtsScore,
            avgProgress
        });

        res.json({
            success: true,
            data: stats,
            message: 'Dashboard statistics retrieved from database'
        });

    } catch (error) {
        console.error('❌ Dashboard stats error:', error);

        // Fallback to database stats method if available
        try {
            // Use the static method from your Resume model
            const stats = await Resume.getDashboardStats(req.user._id);
            res.json({
                success: true,
                data: stats,
                message: 'Dashboard statistics (fallback method)'
            });
        } catch (fallbackError) {
            res.status(500).json({
                success: false,
                message: 'Failed to fetch dashboard statistics',
                error: error.message
            });
        }
    }
});

// Helper functions
function getActionForResume(resume) {
    switch (resume.status) {
        case 'published':
            return 'Resume published';
        case 'completed':
            return 'Resume completed';
        case 'in-progress':
            return 'Resume updated';
        default:
            return 'Draft saved';
    }
}

function formatTimeAgo(date) {
    const now = new Date();
    const past = new Date(date);
    const diffMs = now - past;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
        return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
        return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else if (diffDays < 7) {
        return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    } else {
        return past.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
}

function getPerformanceTrend(resumes) {
    if (resumes.length < 2) return 'stable';

    // Get last 5 resumes sorted by creation date
    const recentResumes = resumes
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);

    const scores = recentResumes
        .filter(r => r.analysis?.atsScore)
        .map(r => r.analysis.atsScore);

    if (scores.length < 2) return 'stable';

    // Simple trend calculation
    const firstScore = scores[scores.length - 1];
    const lastScore = scores[0];

    if (lastScore > firstScore + 10) return 'improving';
    if (lastScore < firstScore - 10) return 'declining';
    return 'stable';
}

function calculateAvgExperienceYears(resumes) {
    const experiences = resumes.flatMap(r => r.experience || []);
    if (experiences.length === 0) return 0;

    let totalMonths = 0;
    experiences.forEach(exp => {
        const start = new Date(exp.startDate);
        const end = exp.current ? new Date() : new Date(exp.endDate);
        const months = (end.getFullYear() - start.getFullYear()) * 12 +
            (end.getMonth() - start.getMonth());
        totalMonths += Math.max(0, months);
    });

    return Math.round((totalMonths / 12) * 10) / 10; // Round to 1 decimal
}

export default router;