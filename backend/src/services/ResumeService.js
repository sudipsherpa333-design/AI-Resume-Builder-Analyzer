// backend/services/resumeService.js - PRODUCTION BACKEND SERVICE
import Resume from '../models/Resume.js';
import User from '../models/User.js';
import mongoose from 'mongoose';
import { generateResumeAnalysis } from './analysisService.js';
import { generateResumePreview } from './previewService.js';
import { exportResumeToPDF, exportResumeToJSON } from './exportService.js';

class ResumeService {
    constructor() {
        this.RESUME_LIMITS = {
            FREE: 10,
            PREMIUM: 100,
            ENTERPRISE: 1000
        };
    }

    // ✅ Get user's plan limit
    async getUserResumeLimit(userId) {
        try {
            const user = await User.findById(userId).select('plan');
            const plan = user?.plan?.type || 'free';
            return this.RESUME_LIMITS[plan.toUpperCase()] || this.RESUME_LIMITS.FREE;
        } catch (error) {
            return this.RESUME_LIMITS.FREE;
        }
    }

    // ✅ Get user's resume count
    async getUserResumeCount(userId) {
        return await Resume.countDocuments({ user: userId });
    }

    // ✅ Check if user can create more resumes
    async canCreateResume(userId) {
        const [limit, count] = await Promise.all([
            this.getUserResumeLimit(userId),
            this.getUserResumeCount(userId)
        ]);
        return count < limit;
    }

    // ✅ Get all resumes for user with filters
    async getUserResumes(userId, options = {}) {
        const {
            page = 1,
            limit = 20,
            sort = '-updatedAt',
            status,
            search,
            template,
            isPublic
        } = options;

        // Build query
        const query = { user: userId };

        if (status) query.status = status;
        if (template) query.template = template;
        if (isPublic !== undefined) query.isPublic = isPublic;

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { 'data.personalInfo.fullName': { $regex: search, $options: 'i' } },
                { 'data.summary': { $regex: search, $options: 'i' } },
                { 'data.skills': { $regex: search, $options: 'i' } }
            ];
        }

        // Calculate pagination
        const skip = (page - 1) * limit;

        // Get total count
        const total = await Resume.countDocuments(query);

        // Get resumes
        const resumes = await Resume.find(query)
            .select('-__v')
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .lean();

        // Calculate completeness for each resume
        const resumesWithStats = resumes.map(resume => ({
            ...resume,
            stats: this.calculateResumeStats(resume)
        }));

        return {
            data: resumesWithStats,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            }
        };
    }

    // ✅ Get single resume
    async getResume(userId, resumeId) {
        if (!mongoose.Types.ObjectId.isValid(resumeId)) {
            throw new Error('Invalid resume ID');
        }

        const resume = await Resume.findOne({
            _id: resumeId,
            user: userId
        }).select('-__v').lean();

        if (!resume) {
            throw new Error('Resume not found');
        }

        // Add stats
        return {
            ...resume,
            stats: this.calculateResumeStats(resume)
        };
    }

    // ✅ Create new resume
    async createResume(userId, resumeData) {
        // Check resume limit
        const canCreate = await this.canCreateResume(userId);
        if (!canCreate) {
            const limit = await this.getUserResumeLimit(userId);
            throw new Error(`Resume limit reached (${limit}). Please upgrade your plan.`);
        }

        // Validate required fields
        if (!resumeData.title || !resumeData.title.trim()) {
            throw new Error('Resume title is required');
        }

        // Create resume
        const resume = new Resume({
            user: userId,
            title: resumeData.title.trim(),
            template: resumeData.template || 'modern',
            data: {
                personalInfo: resumeData.data?.personalInfo || {},
                summary: resumeData.data?.summary || '',
                experience: resumeData.data?.experience || [],
                education: resumeData.data?.education || [],
                skills: resumeData.data?.skills || [],
                projects: resumeData.data?.projects || [],
                certifications: resumeData.data?.certifications || [],
                languages: resumeData.data?.languages || [],
                references: resumeData.data?.references || []
            },
            status: 'draft',
            isPublic: false,
            settings: resumeData.settings || {
                fontSize: 'medium',
                colorScheme: 'blue',
                margin: 'normal'
            },
            version: 1
        });

        await resume.save();

        // Update user stats
        await User.findByIdAndUpdate(userId, {
            $inc: { 'stats.resumeCount': 1 },
            $set: { 'stats.lastResumeCreated': new Date() }
        });

        return resume.toObject();
    }

    // ✅ Update resume
    async updateResume(userId, resumeId, updateData) {
        if (!mongoose.Types.ObjectId.isValid(resumeId)) {
            throw new Error('Invalid resume ID');
        }

        // Find resume
        const resume = await Resume.findOne({
            _id: resumeId,
            user: userId
        });

        if (!resume) {
            throw new Error('Resume not found');
        }

        // Check for version conflict
        if (updateData.version && updateData.version !== resume.version) {
            throw new Error('Version conflict. Please refresh and try again.');
        }

        // Update fields
        if (updateData.title !== undefined) {
            resume.title = updateData.title.trim();
        }

        if (updateData.template !== undefined) {
            resume.template = updateData.template;
        }

        if (updateData.status !== undefined) {
            resume.status = updateData.status;
        }

        if (updateData.isPublic !== undefined) {
            resume.isPublic = updateData.isPublic;
        }

        if (updateData.data !== undefined) {
            // Merge data instead of replacing
            resume.data = {
                ...resume.data,
                ...updateData.data
            };
        }

        if (updateData.settings !== undefined) {
            resume.settings = {
                ...resume.settings,
                ...updateData.settings
            };
        }

        // Increment version
        resume.version = (resume.version || 1) + 1;
        resume.updatedAt = new Date();

        await resume.save();

        return resume.toObject();
    }

    // ✅ Delete resume
    async deleteResume(userId, resumeId) {
        if (!mongoose.Types.ObjectId.isValid(resumeId)) {
            throw new Error('Invalid resume ID');
        }

        const result = await Resume.findOneAndDelete({
            _id: resumeId,
            user: userId
        });

        if (!result) {
            throw new Error('Resume not found');
        }

        // Update user stats
        await User.findByIdAndUpdate(userId, {
            $inc: { 'stats.resumeCount': -1 }
        });

        return { id: resumeId };
    }

    // ✅ Duplicate resume
    async duplicateResume(userId, resumeId) {
        // Check resume limit
        const canCreate = await this.canCreateResume(userId);
        if (!canCreate) {
            const limit = await this.getUserResumeLimit(userId);
            throw new Error(`Resume limit reached (${limit}). Please upgrade your plan.`);
        }

        const original = await Resume.findOne({
            _id: resumeId,
            user: userId
        });

        if (!original) {
            throw new Error('Resume not found');
        }

        // Create duplicate
        const duplicate = new Resume({
            ...original.toObject(),
            _id: new mongoose.Types.ObjectId(),
            title: `${original.title} (Copy)`,
            status: 'draft',
            isPublic: false,
            createdAt: new Date(),
            updatedAt: new Date(),
            version: 1
        });

        await duplicate.save();

        // Update user stats
        await User.findByIdAndUpdate(userId, {
            $inc: { 'stats.resumeCount': 1 }
        });

        return duplicate.toObject();
    }

    // ✅ Analyze resume
    async analyzeResume(userId, resumeId) {
        const resume = await this.getResume(userId, resumeId);
        const analysis = await generateResumeAnalysis(resume);

        // Save analysis to resume
        await Resume.findByIdAndUpdate(resumeId, {
            analysis,
            analyzedAt: new Date()
        });

        return { resume, analysis };
    }

    // ✅ Export resume
    async exportResume(userId, resumeId, format = 'pdf', options = {}) {
        const resume = await this.getResume(userId, resumeId);

        let exportData;
        switch (format.toLowerCase()) {
            case 'pdf':
                exportData = await exportResumeToPDF(resume, options);
                break;
            case 'json':
                exportData = exportResumeToJSON(resume, options);
                break;
            default:
                throw new Error(`Unsupported export format: ${format}`);
        }

        // Increment download count
        await Resume.findByIdAndUpdate(resumeId, {
            $inc: { downloads: 1 }
        });

        return exportData;
    }

    // ✅ Generate preview
    async generatePreview(userId, resumeId, template = 'modern') {
        const resume = await this.getResume(userId, resumeId);
        return await generateResumePreview(resume, template);
    }

    // ✅ Get resume statistics
    async getResumeStats(userId) {
        const stats = await Resume.aggregate([
            { $match: { user: new mongoose.Types.ObjectId(userId) } },
            {
                $group: {
                    _id: null,
                    total: { $sum: 1 },
                    published: { $sum: { $cond: [{ $eq: ['$status', 'published'] }, 1, 0] } },
                    drafts: { $sum: { $cond: [{ $eq: ['$status', 'draft'] }, 1, 0] } },
                    public: { $sum: { $cond: ['$isPublic', 1, 0] } },
                    avgScore: { $avg: '$analysis.score' },
                    totalViews: { $sum: '$views' },
                    totalDownloads: { $sum: '$downloads' },
                    lastUpdated: { $max: '$updatedAt' }
                }
            }
        ]);

        return stats[0] || {
            total: 0,
            published: 0,
            drafts: 0,
            public: 0,
            avgScore: 0,
            totalViews: 0,
            totalDownloads: 0,
            lastUpdated: null
        };
    }

    // ✅ Calculate resume completeness stats
    calculateResumeStats(resume) {
        const data = resume.data || {};
        let completeness = 0;
        const sections = {};

        // Personal Info (25%)
        const personalInfoScore = this.calculatePersonalInfoScore(data.personalInfo);
        completeness += personalInfoScore * 0.25;
        sections.personalInfo = personalInfoScore;

        // Summary (15%)
        const summaryScore = data.summary?.length > 100 ? 100 : (data.summary?.length || 0);
        completeness += summaryScore * 0.15;
        sections.summary = summaryScore;

        // Experience (25%)
        const experienceScore = data.experience?.length > 0 ? 100 : 0;
        completeness += experienceScore * 0.25;
        sections.experience = experienceScore;

        // Education (15%)
        const educationScore = data.education?.length > 0 ? 100 : 0;
        completeness += educationScore * 0.15;
        sections.education = educationScore;

        // Skills (20%)
        const skillsScore = data.skills?.length > 2 ? 100 : (data.skills?.length || 0) * 33;
        completeness += skillsScore * 0.20;
        sections.skills = skillsScore;

        return {
            completeness: Math.min(Math.round(completeness), 100),
            sections
        };
    }

    // ✅ Calculate personal info score
    calculatePersonalInfoScore(personalInfo = {}) {
        let score = 0;
        if (personalInfo.fullName) score += 25;
        if (personalInfo.email) score += 25;
        if (personalInfo.phone) score += 20;
        if (personalInfo.location) score += 15;
        if (personalInfo.jobTitle) score += 15;
        return Math.min(score, 100);
    }

    // ✅ Search resumes
    async searchResumes(userId, query, options = {}) {
        const {
            page = 1,
            limit = 20,
            sort = '-updatedAt'
        } = options;

        const searchQuery = {
            user: userId,
            $text: { $search: query }
        };

        const skip = (page - 1) * limit;

        const [resumes, total] = await Promise.all([
            Resume.find(searchQuery)
                .select('-__v')
                .sort(sort)
                .skip(skip)
                .limit(limit)
                .lean(),
            Resume.countDocuments(searchQuery)
        ]);

        return {
            data: resumes,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            }
        };
    }

    // ✅ Get recently viewed resumes
    async getRecentResumes(userId, limit = 5) {
        const resumes = await Resume.find({ user: userId })
            .select('title template status updatedAt views')
            .sort({ 'metadata.lastViewed': -1 })
            .limit(limit)
            .lean();

        return resumes;
    }

    // ✅ Bulk operations (for admin/sync)
    async bulkUpdateResumes(userId, updates) {
        const bulkOps = updates.map(update => ({
            updateOne: {
                filter: { _id: update.id, user: userId },
                update: { $set: update.data }
            }
        }));

        const result = await Resume.bulkWrite(bulkOps);
        return result;
    }
}

export default new ResumeService();