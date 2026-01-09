// src/routes/resumeRoutes.js
import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import Resume from '../models/Resume.js';
import mongoose from 'mongoose';

const router = express.Router();

// Async handler wrapper
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

// Apply auth middleware to all resume routes
router.use(authMiddleware);

// @route   POST /api/resumes
// @desc    Create new resume
// @access  Private
router.post('/', asyncHandler(async (req, res) => {
    const {
        title,
        template = 'modern',
        data = {},
        isPublic = false,
        settings = {}
    } = req.body;

    // Validate required fields
    if (!title) {
        return res.status(400).json({
            success: false,
            error: 'Title is required'
        });
    }

    // Create new resume
    const resumeData = {
        user: req.user._id,
        title,
        template,
        data: {
            personalInfo: data.personalInfo || {},
            summary: data.summary || '',
            experience: data.experience || [],
            education: data.education || [],
            skills: data.skills || [],
            projects: data.projects || [],
            certifications: data.certifications || [],
            languages: data.languages || []
        },
        isPublic,
        settings: {
            fontSize: 'medium',
            colorScheme: 'blue',
            margin: 'normal',
            ...settings
        },
        analysis: {
            score: 0,
            strengths: [],
            improvements: [],
            suggestions: [],
            lastAnalyzed: null
        }
    };

    const resume = await Resume.create(resumeData);

    // Update user's resume count
    await req.user.updateResumeCount();

    res.status(201).json({
        success: true,
        message: 'Resume created successfully',
        data: resume
    });
}));

// @route   GET /api/resumes
// @desc    Get all resumes for a user
// @access  Private
router.get('/', asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, sort = '-updatedAt', search = '' } = req.query;

    const query = { user: req.user._id };

    // Add search filter if provided
    if (search) {
        query.title = { $regex: search, $options: 'i' };
    }

    const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        sort,
        select: '-data -analysis' // Exclude heavy fields for list view
    };

    const resumes = await Resume.paginate(query, options);

    res.json({
        success: true,
        data: {
            resumes: resumes.docs,
            total: resumes.totalDocs,
            pages: resumes.totalPages,
            page: resumes.page,
            limit: resumes.limit
        }
    });
}));

// @route   GET /api/resumes/:id
// @desc    Get single resume by ID
// @access  Private
router.get('/:id', asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
            success: false,
            error: 'Invalid resume ID'
        });
    }

    const resume = await Resume.findOne({
        _id: id,
        user: req.user._id
    });

    if (!resume) {
        return res.status(404).json({
            success: false,
            error: 'Resume not found'
        });
    }

    res.json({
        success: true,
        data: resume
    });
}));

// @route   PUT /api/resumes/:id
// @desc    Update resume
// @access  Private
router.put('/:id', asyncHandler(async (req, res) => {
    const { id } = req.params;
    const {
        title,
        data,
        template,
        isPublic,
        settings,
        status = 'draft'
    } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
            success: false,
            error: 'Invalid resume ID'
        });
    }

    // Find resume
    const resume = await Resume.findOne({
        _id: id,
        user: req.user._id
    });

    if (!resume) {
        return res.status(404).json({
            success: false,
            error: 'Resume not found'
        });
    }

    // Update fields
    const updateData = {};

    if (title !== undefined) updateData.title = title;
    if (template !== undefined) updateData.template = template;
    if (isPublic !== undefined) updateData.isPublic = isPublic;
    if (status !== undefined) updateData.status = status;

    // Handle nested updates for data
    if (data) {
        updateData.data = {
            ...resume.data,
            ...data
        };
    }

    // Handle nested updates for settings
    if (settings) {
        updateData.settings = {
            ...resume.settings,
            ...settings
        };
    }

    // Update the resume
    const updatedResume = await Resume.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true, runValidators: true }
    );

    res.json({
        success: true,
        message: 'Resume updated successfully',
        data: updatedResume
    });
}));

// @route   DELETE /api/resumes/:id
// @desc    Delete resume
// @access  Private
router.delete('/:id', asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
            success: false,
            error: 'Invalid resume ID'
        });
    }

    const resume = await Resume.findOneAndDelete({
        _id: id,
        user: req.user._id
    });

    if (!resume) {
        return res.status(404).json({
            success: false,
            error: 'Resume not found'
        });
    }

    // Update user's resume count
    await req.user.updateResumeCount();

    res.json({
        success: true,
        message: 'Resume deleted successfully',
        data: { id }
    });
}));

// @route   POST /api/resumes/:id/duplicate
// @desc    Duplicate resume
// @access  Private
router.post('/:id/duplicate', asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
            success: false,
            error: 'Invalid resume ID'
        });
    }

    const original = await Resume.findOne({
        _id: id,
        user: req.user._id
    });

    if (!original) {
        return res.status(404).json({
            success: false,
            error: 'Resume not found'
        });
    }

    // Create duplicate
    const duplicateData = {
        ...original.toObject(),
        _id: new mongoose.Types.ObjectId(),
        title: `${original.title} (Copy)`,
        isPublic: false,
        createdAt: new Date(),
        updatedAt: new Date()
    };

    delete duplicateData.createdAt;
    delete duplicateData.updatedAt;

    const duplicate = await Resume.create(duplicateData);

    // Update user's resume count
    await req.user.updateResumeCount();

    res.status(201).json({
        success: true,
        message: 'Resume duplicated successfully',
        data: duplicate
    });
}));

// @route   POST /api/resumes/:id/analyze
// @desc    Analyze resume
// @access  Private
router.post('/:id/analyze', asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
            success: false,
            error: 'Invalid resume ID'
        });
    }

    const resume = await Resume.findOne({
        _id: id,
        user: req.user._id
    });

    if (!resume) {
        return res.status(404).json({
            success: false,
            error: 'Resume not found'
        });
    }

    // Calculate ATS score
    let atsScore = 0;
    const data = resume.data;

    // Check personal info
    if (data.personalInfo?.firstName && data.personalInfo?.lastName) atsScore += 10;
    if (data.personalInfo?.email) atsScore += 10;
    if (data.personalInfo?.phone) atsScore += 5;

    // Check summary
    if (data.summary && data.summary.length > 100) atsScore += 15;

    // Check experience
    if (data.experience && data.experience.length > 0) atsScore += 20;

    // Check education
    if (data.education && data.education.length > 0) atsScore += 15;

    // Check skills
    if (data.skills && data.skills.length >= 5) atsScore += 15;

    // Check projects
    if (data.projects && data.projects.length > 0) atsScore += 10;

    // Total score
    atsScore = Math.min(atsScore, 100);

    // Generate analysis
    const analysis = {
        score: atsScore,
        atsScore: atsScore,
        strengths: [
            data.personalInfo?.firstName && data.personalInfo?.lastName ? 'Complete name' : null,
            data.personalInfo?.email ? 'Email provided' : null,
            data.summary && data.summary.length > 100 ? 'Good summary length' : null,
            data.experience && data.experience.length > 0 ? 'Experience included' : null,
            data.education && data.education.length > 0 ? 'Education included' : null,
            data.skills && data.skills.length >= 5 ? 'Good skills coverage' : null
        ].filter(Boolean),
        improvements: [
            !data.summary || data.summary.length < 100 ? 'Add more detail to summary' : null,
            !data.experience || data.experience.length === 0 ? 'Add work experience' : null,
            !data.education || data.education.length === 0 ? 'Add education details' : null,
            !data.skills || data.skills.length < 5 ? 'Add more skills (aim for 5+)' : null,
            !data.projects || data.projects.length === 0 ? 'Consider adding projects' : null
        ].filter(Boolean),
        suggestions: [
            'Use action verbs in experience descriptions',
            'Quantify achievements with numbers',
            'Include relevant keywords for your industry',
            'Keep summary concise but impactful',
            'Proofread for spelling and grammar'
        ],
        lastAnalyzed: new Date()
    };

    // Update resume with analysis
    resume.analysis = analysis;
    resume.analyzedAt = new Date();
    await resume.save();

    res.json({
        success: true,
        message: 'Resume analyzed successfully',
        data: {
            resume: resume,
            analysis: analysis
        }
    });
}));

// @route   GET /api/resumes/public/:id
// @desc    Get public resume by ID
// @access  Public
router.get('/public/:id', asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
            success: false,
            error: 'Invalid resume ID'
        });
    }

    const resume = await Resume.findOne({
        _id: id,
        isPublic: true
    }).select('-analysis -settings'); // Exclude private data

    if (!resume) {
        return res.status(404).json({
            success: false,
            error: 'Public resume not found'
        });
    }

    res.json({
        success: true,
        data: resume
    });
}));

// @route   POST /api/resumes/auto-save
// @desc    Auto-save resume
// @access  Private
router.post('/auto-save', asyncHandler(async (req, res) => {
    const { resumeData, resumeId, title = 'Auto-saved Resume' } = req.body;

    let resume;

    if (resumeId && mongoose.Types.ObjectId.isValid(resumeId)) {
        // Update existing resume
        resume = await Resume.findOneAndUpdate(
            { _id: resumeId, user: req.user._id },
            {
                'data': resumeData,
                title: title || 'Auto-saved Resume',
                status: 'auto-saved',
                updatedAt: new Date()
            },
            { new: true, upsert: false }
        );
    }

    if (!resume) {
        // Create new auto-saved resume
        resume = await Resume.create({
            user: req.user._id,
            title: title || 'Auto-saved Resume',
            data: resumeData,
            status: 'auto-saved',
            isPublic: false,
            template: 'modern'
        });

        // Update user's resume count
        await req.user.updateResumeCount();
    }

    res.json({
        success: true,
        message: 'Resume auto-saved successfully',
        data: {
            resumeId: resume._id,
            title: resume.title,
            updatedAt: resume.updatedAt
        }
    });
}));

// @route   GET /api/resumes/stats
// @desc    Get resume statistics for user
// @access  Private
router.get('/stats', asyncHandler(async (req, res) => {
    const stats = await Resume.aggregate([
        { $match: { user: req.user._id } },
        {
            $group: {
                _id: null,
                total: { $sum: 1 },
                public: { $sum: { $cond: ['$isPublic', 1, 0] } },
                completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
                drafts: { $sum: { $cond: [{ $eq: ['$status', 'draft'] }, 1, 0] } },
                avgScore: { $avg: '$analysis.score' },
                lastUpdated: { $max: '$updatedAt' }
            }
        }
    ]);

    const defaultStats = {
        total: 0,
        public: 0,
        completed: 0,
        drafts: 0,
        avgScore: 0,
        lastUpdated: null
    };

    res.json({
        success: true,
        data: stats[0] || defaultStats
    });
}));

// Error handling middleware
router.use((err, req, res, next) => {
    console.error('Resume routes error:', err);

    if (err.name === 'ValidationError') {
        return res.status(400).json({
            success: false,
            error: 'Validation error',
            message: Object.values(err.errors).map(e => e.message).join(', ')
        });
    }

    if (err.name === 'CastError') {
        return res.status(400).json({
            success: false,
            error: 'Invalid ID format'
        });
    }

    res.status(500).json({
        success: false,
        error: 'Server error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
});

export default router;