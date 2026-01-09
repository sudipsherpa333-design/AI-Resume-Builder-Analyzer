const Resume = require('../models/Resume');
const User = require('../../api/models/User');
const mongoose = require('mongoose');

class ResumeService {
    // Get all resumes with pagination and filters
    static async getAllResumes(filters = {}, page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc') {
        try {
            const query = {};

            // Apply filters
            if (filters.search) {
                query.$or = [
                    { title: { $regex: filters.search, $options: 'i' } },
                    { 'personalInfo.fullName': { $regex: filters.search, $options: 'i' } },
                    { 'personalInfo.email': { $regex: filters.search, $options: 'i' } },
                    { slug: { $regex: filters.search, $options: 'i' } }
                ];
            }

            if (filters.status) {
                query.status = filters.status;
            } else {
                // Exclude deleted resumes by default
                query.status = { $ne: 'deleted' };
            }

            if (filters.userId) {
                query.user = filters.userId;
            }

            if (filters.template) {
                query.template = filters.template;
            }

            if (filters.isFeatured !== undefined) {
                query.isFeatured = filters.isFeatured === 'true';
            }

            if (filters.isPublic !== undefined) {
                query.isPublic = filters.isPublic === 'true';
            }

            if (filters.startDate || filters.endDate) {
                query.createdAt = {};
                if (filters.startDate) {
                    query.createdAt.$gte = new Date(filters.startDate);
                }
                if (filters.endDate) {
                    const endDate = new Date(filters.endDate);
                    endDate.setHours(23, 59, 59, 999);
                    query.createdAt.$lte = endDate;
                }
            }

            if (filters.flags && filters.flags.length > 0) {
                query.flags = { $in: filters.flags };
            }

            // Calculate skip for pagination
            const skip = (page - 1) * limit;

            // Determine sort order
            const sortOptions = {};
            sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

            // Execute query with pagination
            const [resumes, total] = await Promise.all([
                Resume.find(query)
                    .populate('user', 'name email')
                    .sort(sortOptions)
                    .skip(skip)
                    .limit(limit)
                    .lean(),
                Resume.countDocuments(query)
            ]);

            // Format resumes for response
            const formattedResumes = resumes.map(resume => ({
                id: resume._id,
                title: resume.title,
                slug: resume.slug,
                user: resume.user ? {
                    id: resume.user._id,
                    name: resume.user.name,
                    email: resume.user.email
                } : {
                    id: null,
                    name: resume.userName,
                    email: resume.userEmail
                },
                personalInfo: resume.personalInfo,
                status: resume.status,
                template: resume.template,
                isPublic: resume.isPublic,
                isFeatured: resume.isFeatured,
                views: resume.views,
                downloads: resume.downloads,
                completionPercentage: resume.completionPercentage,
                flags: resume.flags || [],
                adminNotes: resume.adminNotes || [],
                fileUrl: resume.fileUrl,
                fileFormat: resume.fileFormat,
                fileSize: resume.fileSize,
                createdAt: resume.createdAt,
                updatedAt: resume.updatedAt
            }));

            // Get statistics for the filtered results
            const stats = await this.getResumeStatisticsForQuery(query);

            return {
                resumes: formattedResumes,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                },
                stats
            };
        } catch (error) {
            console.error('Get all resumes error:', error);
            throw error;
        }
    }

    // Get resume by ID
    static async getResumeById(id) {
        try {
            const resume = await Resume.findById(id)
                .populate('user', 'name email phone')
                .populate('adminNotes.admin', 'name email')
                .lean();

            if (!resume) {
                return null;
            }

            // Format response
            return {
                id: resume._id,
                title: resume.title,
                slug: resume.slug,
                user: resume.user ? {
                    id: resume.user._id,
                    name: resume.user.name,
                    email: resume.user.email,
                    phone: resume.user.phone
                } : {
                    id: null,
                    name: resume.userName,
                    email: resume.userEmail
                },
                personalInfo: resume.personalInfo,
                education: resume.education || [],
                experience: resume.experience || [],
                skills: resume.skills || [],
                projects: resume.projects || [],
                certifications: resume.certifications || [],
                languages: resume.languages || [],
                template: resume.template,
                theme: resume.theme,
                font: resume.font,
                fontSize: resume.fontSize,
                colorScheme: resume.colorScheme,
                status: resume.status,
                isPublic: resume.isPublic,
                isFeatured: resume.isFeatured,
                views: resume.views,
                downloads: resume.downloads,
                lastViewed: resume.lastViewed,
                lastDownloaded: resume.lastDownloaded,
                completionPercentage: resume.completionPercentage,
                sectionsCompleted: resume.sectionsCompleted || [],
                timeSpent: resume.timeSpent,
                lastEdited: resume.lastEdited,
                adminNotes: resume.adminNotes || [],
                flags: resume.flags || [],
                fileUrl: resume.fileUrl,
                fileFormat: resume.fileFormat,
                fileSize: resume.fileSize,
                thumbnailUrl: resume.thumbnailUrl,
                metaTitle: resume.metaTitle,
                metaDescription: resume.metaDescription,
                keywords: resume.keywords || [],
                shareUrl: resume.shareUrl,
                shareCount: resume.shareCount,
                version: resume.version,
                previousVersions: resume.previousVersions || [],
                createdAt: resume.createdAt,
                updatedAt: resume.updatedAt,
                publishedAt: resume.publishedAt,
                archivedAt: resume.archivedAt
            };
        } catch (error) {
            console.error('Get resume by ID error:', error);
            throw error;
        }
    }

    // Update resume
    static async updateResume(id, updateData, adminId) {
        try {
            const resume = await Resume.findById(id);

            if (!resume) {
                throw new Error('Resume not found');
            }

            // Track changes for versioning
            const changes = [];
            const previousData = {};

            Object.keys(updateData).forEach(key => {
                if (resume[key] !== updateData[key]) {
                    changes.push(key);
                    previousData[key] = resume[key];
                    resume[key] = updateData[key];
                }
            });

            // If there are changes, create a version
            if (changes.length > 0) {
                // Save current content as previous version
                const versionData = {
                    content: {
                        personalInfo: resume.personalInfo,
                        education: resume.education,
                        experience: resume.experience,
                        skills: resume.skills,
                        projects: resume.projects,
                        certifications: resume.certifications,
                        languages: resume.languages
                    },
                    version: resume.version,
                    savedAt: new Date(),
                    changes: changes.join(', ')
                };

                resume.previousVersions.push(versionData);
                resume.version += 1;
                resume.updatedByAdmin = adminId;
                resume.lastEdited = new Date();
            }

            await resume.save();

            return resume.toAdminResponse();
        } catch (error) {
            console.error('Update resume error:', error);
            throw error;
        }
    }

    // Delete resume (soft delete)
    static async deleteResume(id, adminId) {
        try {
            const resume = await Resume.findById(id);

            if (!resume) {
                throw new Error('Resume not found');
            }

            if (resume.status === 'deleted') {
                throw new Error('Resume is already deleted');
            }

            // Soft delete
            resume.status = 'deleted';
            resume.deletedAt = new Date();
            resume.deletedByAdmin = adminId;

            await resume.save();

            return { success: true, message: 'Resume deleted successfully' };
        } catch (error) {
            console.error('Delete resume error:', error);
            throw error;
        }
    }

    // Permanent delete
    static async permanentDelete(id, adminId) {
        try {
            const resume = await Resume.findById(id);

            if (!resume) {
                throw new Error('Resume not found');
            }

            // Check if already soft deleted
            if (resume.status !== 'deleted') {
                throw new Error('Resume must be soft deleted before permanent deletion');
            }

            // Store info for logging before deletion
            const resumeInfo = {
                id: resume._id,
                title: resume.title,
                user: resume.user
            };

            // Permanent delete
            await Resume.findByIdAndDelete(id);

            return {
                success: true,
                message: 'Resume permanently deleted',
                deletedResume: resumeInfo
            };
        } catch (error) {
            console.error('Permanent delete error:', error);
            throw error;
        }
    }

    // Restore deleted resume
    static async restoreResume(id, adminId) {
        try {
            const resume = await Resume.findById(id);

            if (!resume) {
                throw new Error('Resume not found');
            }

            if (resume.status !== 'deleted') {
                throw new Error('Only deleted resumes can be restored');
            }

            // Restore to draft status
            resume.status = 'draft';
            resume.deletedAt = null;
            resume.deletedByAdmin = null;
            resume.updatedByAdmin = adminId;

            await resume.save();

            return resume.toAdminResponse();
        } catch (error) {
            console.error('Restore resume error:', error);
            throw error;
        }
    }

    // Export resumes (for download)
    static async exportResumes(filters = {}) {
        try {
            const query = {};

            // Apply filters (same as getAllResumes)
            if (filters.status) {
                query.status = filters.status;
            } else {
                query.status = { $ne: 'deleted' };
            }

            if (filters.startDate || filters.endDate) {
                query.createdAt = {};
                if (filters.startDate) {
                    query.createdAt.$gte = new Date(filters.startDate);
                }
                if (filters.endDate) {
                    const endDate = new Date(filters.endDate);
                    endDate.setHours(23, 59, 59, 999);
                    query.createdAt.$lte = endDate;
                }
            }

            const resumes = await Resume.find(query)
                .populate('user', 'name email')
                .lean();

            // Format for export
            return resumes.map(resume => ({
                'Resume ID': resume._id,
                'Title': resume.title,
                'User Name': resume.user?.name || resume.userName,
                'User Email': resume.user?.email || resume.userEmail,
                'Full Name': resume.personalInfo?.fullName || '',
                'Email': resume.personalInfo?.email || '',
                'Phone': resume.personalInfo?.phone || '',
                'Status': resume.status,
                'Template': resume.template,
                'Is Public': resume.isPublic ? 'Yes' : 'No',
                'Is Featured': resume.isFeatured ? 'Yes' : 'No',
                'Views': resume.views,
                'Downloads': resume.downloads,
                'Completion %': resume.completionPercentage,
                'Created At': resume.createdAt.toISOString(),
                'Updated At': resume.updatedAt.toISOString(),
                'Education Count': resume.education?.length || 0,
                'Experience Count': resume.experience?.length || 0,
                'Skills Count': resume.skills?.length || 0,
                'File Format': resume.fileFormat,
                'File Size': resume.fileSize ? `${(resume.fileSize / 1024).toFixed(2)} KB` : 'N/A'
            }));
        } catch (error) {
            console.error('Export resumes error:', error);
            throw error;
        }
    }

    // Get resume statistics
    static async getResumeStatistics(period = '30d') {
        try {
            const endDate = new Date();
            const startDate = new Date();

            switch (period) {
                case '7d':
                    startDate.setDate(endDate.getDate() - 7);
                    break;
                case '30d':
                    startDate.setDate(endDate.getDate() - 30);
                    break;
                case '90d':
                    startDate.setDate(endDate.getDate() - 90);
                    break;
                case '1y':
                    startDate.setFullYear(endDate.getFullYear() - 1);
                    break;
                default:
                    startDate.setDate(endDate.getDate() - 30);
            }

            const [
                totalStats,
                dailyStats,
                templateStats,
                statusStats,
                completionStats
            ] = await Promise.all([
                this.getTotalResumeStats(startDate, endDate),
                this.getDailyResumeStats(startDate, endDate),
                this.getTemplateStats(startDate, endDate),
                this.getStatusStats(startDate, endDate),
                this.getCompletionStats(startDate, endDate)
            ]);

            return {
                period: `${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`,
                total: totalStats,
                daily: dailyStats,
                byTemplate: templateStats,
                byStatus: statusStats,
                completion: completionStats
            };
        } catch (error) {
            console.error('Resume statistics error:', error);
            throw error;
        }
    }

    // Get statistics for a query
    static async getResumeStatisticsForQuery(query) {
        try {
            const stats = await Resume.aggregate([
                { $match: query },
                {
                    $facet: {
                        total: [{ $count: 'count' }],
                        byStatus: [
                            { $group: { _id: '$status', count: { $sum: 1 } } }
                        ],
                        byTemplate: [
                            { $group: { _id: '$template', count: { $sum: 1 } } }
                        ],
                        avgCompletion: [
                            { $group: { _id: null, avg: { $avg: '$completionPercentage' } } }
                        ],
                        totalViews: [
                            { $group: { _id: null, total: { $sum: '$views' } } }
                        ],
                        totalDownloads: [
                            { $group: { _id: null, total: { $sum: '$downloads' } } }
                        ]
                    }
                }
            ]);

            const result = stats[0] || {};

            return {
                total: result.total?.[0]?.count || 0,
                byStatus: result.byStatus?.reduce((acc, item) => {
                    acc[item._id] = item.count;
                    return acc;
                }, {}) || {},
                byTemplate: result.byTemplate?.reduce((acc, item) => {
                    acc[item._id] = item.count;
                    return acc;
                }, {}) || {},
                avgCompletion: Math.round(result.avgCompletion?.[0]?.avg || 0),
                totalViews: result.totalViews?.[0]?.total || 0,
                totalDownloads: result.totalDownloads?.[0]?.total || 0
            };
        } catch (error) {
            console.error('Query statistics error:', error);
            throw error;
        }
    }

    // Get total resume statistics
    static async getTotalResumeStats(startDate, endDate) {
        const stats = await Resume.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate, $lte: endDate },
                    status: { $ne: 'deleted' }
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: 1 },
                    published: { $sum: { $cond: [{ $eq: ['$status', 'published'] }, 1, 0] } },
                    drafts: { $sum: { $cond: [{ $eq: ['$status', 'draft'] }, 1, 0] } },
                    archived: { $sum: { $cond: [{ $eq: ['$status', 'archived'] }, 1, 0] } },
                    public: { $sum: { $cond: [{ $eq: ['$isPublic', true] }, 1, 0] } },
                    featured: { $sum: { $cond: [{ $eq: ['$isFeatured', true] }, 1, 0] } },
                    totalViews: { $sum: '$views' },
                    totalDownloads: { $sum: '$downloads' },
                    avgCompletion: { $avg: '$completionPercentage' }
                }
            }
        ]);

        return stats[0] || {
            total: 0,
            published: 0,
            drafts: 0,
            archived: 0,
            public: 0,
            featured: 0,
            totalViews: 0,
            totalDownloads: 0,
            avgCompletion: 0
        };
    }

    // Get daily resume statistics
    static async getDailyResumeStats(startDate, endDate) {
        const stats = await Resume.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate, $lte: endDate },
                    status: { $ne: 'deleted' }
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
                    },
                    count: { $sum: 1 },
                    views: { $sum: '$views' },
                    downloads: { $sum: '$downloads' }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        return stats;
    }

    // Get template statistics
    static async getTemplateStats(startDate, endDate) {
        const stats = await Resume.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate, $lte: endDate },
                    status: { $ne: 'deleted' }
                }
            },
            {
                $group: {
                    _id: '$template',
                    count: { $sum: 1 },
                    avgCompletion: { $avg: '$completionPercentage' },
                    avgViews: { $avg: '$views' }
                }
            },
            { $sort: { count: -1 } }
        ]);

        return stats;
    }

    // Get status statistics
    static async getStatusStats(startDate, endDate) {
        const stats = await Resume.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate, $lte: endDate }
                }
            },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                    avgCompletion: { $avg: '$completionPercentage' }
                }
            }
        ]);

        return stats.reduce((acc, item) => {
            acc[item._id] = {
                count: item.count,
                avgCompletion: Math.round(item.avgCompletion || 0)
            };
            return acc;
        }, {});
    }

    // Get completion statistics
    static async getCompletionStats(startDate, endDate) {
        const stats = await Resume.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate, $lte: endDate },
                    status: { $ne: 'deleted' }
                }
            },
            {
                $bucket: {
                    groupBy: '$completionPercentage',
                    boundaries: [0, 25, 50, 75, 100],
                    default: 'other',
                    output: {
                        count: { $sum: 1 },
                        resumes: { $push: { title: '$title', id: '$_id' } }
                    }
                }
            }
        ]);

        return stats;
    }

    // Bulk actions
    static async bulkAction(action, ids, data, adminId) {
        try {
            if (!action || !ids || !Array.isArray(ids) || ids.length === 0) {
                throw new Error('Action and IDs are required');
            }

            let result;

            switch (action) {
                case 'delete':
                    result = await this.bulkDelete(ids, adminId);
                    break;

                case 'update_status':
                    if (!data || !data.status) {
                        throw new Error('Status is required for update_status action');
                    }
                    result = await this.bulkUpdateStatus(ids, data.status, adminId);
                    break;

                case 'update_featured':
                    if (!data || data.isFeatured === undefined) {
                        throw new Error('isFeatured is required for update_featured action');
                    }
                    result = await this.bulkUpdateFeatured(ids, data.isFeatured, adminId);
                    break;

                case 'update_public':
                    if (!data || data.isPublic === undefined) {
                        throw new Error('isPublic is required for update_public action');
                    }
                    result = await this.bulkUpdatePublic(ids, data.isPublic, adminId);
                    break;

                case 'add_flag':
                    if (!data || !data.flag) {
                        throw new Error('Flag is required for add_flag action');
                    }
                    result = await this.bulkAddFlag(ids, data.flag, adminId);
                    break;

                case 'remove_flag':
                    if (!data || !data.flag) {
                        throw new Error('Flag is required for remove_flag action');
                    }
                    result = await this.bulkRemoveFlag(ids, data.flag, adminId);
                    break;

                default:
                    throw new Error(`Unknown bulk action: ${action}`);
            }

            return result;
        } catch (error) {
            console.error('Bulk action error:', error);
            throw error;
        }
    }

    // Bulk delete
    static async bulkDelete(ids, adminId) {
        const result = await Resume.updateMany(
            { _id: { $in: ids } },
            {
                $set: {
                    status: 'deleted',
                    deletedAt: new Date(),
                    deletedByAdmin: adminId
                }
            }
        );

        return {
            action: 'delete',
            processed: ids.length,
            modified: result.modifiedCount,
            message: `${result.modifiedCount} resumes marked as deleted`
        };
    }

    // Bulk update status
    static async bulkUpdateStatus(ids, status, adminId) {
        const result = await Resume.updateMany(
            { _id: { $in: ids } },
            {
                $set: {
                    status: status,
                    updatedByAdmin: adminId,
                    lastEdited: new Date()
                },
                $unset: {
                    deletedAt: 1,
                    deletedByAdmin: 1
                }
            }
        );

        // Set publishedAt if status is published
        if (status === 'published') {
            await Resume.updateMany(
                { _id: { $in: ids }, publishedAt: { $exists: false } },
                { $set: { publishedAt: new Date() } }
            );
        }

        return {
            action: 'update_status',
            processed: ids.length,
            modified: result.modifiedCount,
            newStatus: status,
            message: `${result.modifiedCount} resumes updated to ${status} status`
        };
    }

    // Bulk update featured
    static async bulkUpdateFeatured(ids, isFeatured, adminId) {
        const result = await Resume.updateMany(
            { _id: { $in: ids } },
            {
                $set: {
                    isFeatured: isFeatured,
                    updatedByAdmin: adminId
                }
            }
        );

        return {
            action: 'update_featured',
            processed: ids.length,
            modified: result.modifiedCount,
            isFeatured: isFeatured,
            message: `${result.modifiedCount} resumes ${isFeatured ? 'featured' : 'unfeatured'}`
        };
    }

    // Bulk update public
    static async bulkUpdatePublic(ids, isPublic, adminId) {
        const result = await Resume.updateMany(
            { _id: { $in: ids } },
            {
                $set: {
                    isPublic: isPublic,
                    updatedByAdmin: adminId
                }
            }
        );

        return {
            action: 'update_public',
            processed: ids.length,
            modified: result.modifiedCount,
            isPublic: isPublic,
            message: `${result.modifiedCount} resumes ${isPublic ? 'made public' : 'made private'}`
        };
    }

    // Bulk add flag
    static async bulkAddFlag(ids, flag, adminId) {
        const result = await Resume.updateMany(
            { _id: { $in: ids } },
            {
                $addToSet: { flags: flag },
                $set: { updatedByAdmin: adminId }
            }
        );

        return {
            action: 'add_flag',
            processed: ids.length,
            modified: result.modifiedCount,
            flag: flag,
            message: `Added '${flag}' flag to ${result.modifiedCount} resumes`
        };
    }

    // Bulk remove flag
    static async bulkRemoveFlag(ids, flag, adminId) {
        const result = await Resume.updateMany(
            { _id: { $in: ids } },
            {
                $pull: { flags: flag },
                $set: { updatedByAdmin: adminId }
            }
        );

        return {
            action: 'remove_flag',
            processed: ids.length,
            modified: result.modifiedCount,
            flag: flag,
            message: `Removed '${flag}' flag from ${result.modifiedCount} resumes`
        };
    }

    // Search resumes
    static async searchResumes(query, field = 'all', limit = 50) {
        try {
            const searchQuery = query.trim();

            if (searchQuery.length < 2) {
                return [];
            }

            let searchConditions;

            switch (field) {
                case 'title':
                    searchConditions = { title: { $regex: searchQuery, $options: 'i' } };
                    break;

                case 'user':
                    searchConditions = {
                        $or: [
                            { 'userName': { $regex: searchQuery, $options: 'i' } },
                            { 'userEmail': { $regex: searchQuery, $options: 'i' } },
                            { 'personalInfo.fullName': { $regex: searchQuery, $options: 'i' } },
                            { 'personalInfo.email': { $regex: searchQuery, $options: 'i' } }
                        ]
                    };
                    break;

                case 'skills':
                    searchConditions = { 'skills.name': { $regex: searchQuery, $options: 'i' } };
                    break;

                case 'all':
                default:
                    searchConditions = {
                        $or: [
                            { title: { $regex: searchQuery, $options: 'i' } },
                            { slug: { $regex: searchQuery, $options: 'i' } },
                            { 'userName': { $regex: searchQuery, $options: 'i' } },
                            { 'userEmail': { $regex: searchQuery, $options: 'i' } },
                            { 'personalInfo.fullName': { $regex: searchQuery, $options: 'i' } },
                            { 'personalInfo.email': { $regex: searchQuery, $options: 'i' } },
                            { 'personalInfo.phone': { $regex: searchQuery, $options: 'i' } },
                            { 'skills.name': { $regex: searchQuery, $options: 'i' } },
                            { 'education.institution': { $regex: searchQuery, $options: 'i' } },
                            { 'experience.company': { $regex: searchQuery, $options: 'i' } }
                        ]
                    };
            }

            // Exclude deleted resumes
            searchConditions.status = { $ne: 'deleted' };

            const resumes = await Resume.find(searchConditions)
                .populate('user', 'name email')
                .limit(limit)
                .lean();

            return resumes.map(resume => ({
                id: resume._id,
                title: resume.title,
                user: resume.user ? {
                    name: resume.user.name,
                    email: resume.user.email
                } : {
                    name: resume.userName,
                    email: resume.userEmail
                },
                status: resume.status,
                template: resume.template,
                completionPercentage: resume.completionPercentage,
                createdAt: resume.createdAt,
                updatedAt: resume.updatedAt
            }));
        } catch (error) {
            console.error('Search resumes error:', error);
            throw error;
        }
    }

    // Add admin note to resume
    static async addAdminNote(resumeId, adminId, note) {
        try {
            const resume = await Resume.findById(resumeId);

            if (!resume) {
                throw new Error('Resume not found');
            }

            await resume.addAdminNote(adminId, note);

            return {
                success: true,
                message: 'Note added successfully',
                note: {
                    admin: adminId,
                    note: note.trim(),
                    createdAt: new Date()
                }
            };
        } catch (error) {
            console.error('Add admin note error:', error);
            throw error;
        }
    }

    // Add flag to resume
    static async addFlag(resumeId, flag) {
        try {
            const resume = await Resume.findById(resumeId);

            if (!resume) {
                throw new Error('Resume not found');
            }

            await resume.addFlag(flag);

            return {
                success: true,
                message: `Flag '${flag}' added successfully`,
                flags: resume.flags
            };
        } catch (error) {
            console.error('Add flag error:', error);
            throw error;
        }
    }

    // Remove flag from resume
    static async removeFlag(resumeId, flag) {
        try {
            const resume = await Resume.findById(resumeId);

            if (!resume) {
                throw new Error('Resume not found');
            }

            await resume.removeFlag(flag);

            return {
                success: true,
                message: `Flag '${flag}' removed successfully`,
                flags: resume.flags
            };
        } catch (error) {
            console.error('Remove flag error:', error);
            throw error;
        }
    }

    // Update resume status
    static async updateStatus(resumeId, status, adminId) {
        try {
            const resume = await Resume.findById(resumeId);

            if (!resume) {
                throw new Error('Resume not found');
            }

            resume.status = status;
            resume.updatedByAdmin = adminId;
            resume.lastEdited = new Date();

            // Set publishedAt if publishing
            if (status === 'published' && !resume.publishedAt) {
                resume.publishedAt = new Date();
            }

            // Clear deleted info if restoring
            if (status !== 'deleted') {
                resume.deletedAt = undefined;
                resume.deletedByAdmin = undefined;
            }

            await resume.save();

            return {
                success: true,
                message: `Resume status updated to ${status}`,
                resume: resume.toAdminResponse()
            };
        } catch (error) {
            console.error('Update status error:', error);
            throw error;
        }
    }

    // Toggle featured status
    static async toggleFeatured(resumeId, adminId) {
        try {
            const resume = await Resume.findById(resumeId);

            if (!resume) {
                throw new Error('Resume not found');
            }

            resume.isFeatured = !resume.isFeatured;
            resume.updatedByAdmin = adminId;

            await resume.save();

            return {
                success: true,
                message: `Resume ${resume.isFeatured ? 'featured' : 'unfeatured'}`,
                isFeatured: resume.isFeatured,
                resume: resume.toAdminResponse()
            };
        } catch (error) {
            console.error('Toggle featured error:', error);
            throw error;
        }
    }

    // Preview resume (get HTML/PDF content)
    static async previewResume(resumeId, format = 'html') {
        try {
            const resume = await Resume.findById(resumeId)
                .populate('user', 'name email')
                .lean();

            if (!resume) {
                throw new Error('Resume not found');
            }

            // This would generate the resume content based on template
            // For now, return the resume data
            return {
                resume,
                format,
                previewUrl: resume.fileUrl || null,
                generatedAt: new Date()
            };
        } catch (error) {
            console.error('Preview resume error:', error);
            throw error;
        }
    }

    // Get resume analytics
    static async getResumeAnalytics(resumeId) {
        try {
            const resume = await Resume.findById(resumeId)
                .select('views downloads lastViewed lastDownloaded createdAt')
                .lean();

            if (!resume) {
                throw new Error('Resume not found');
            }

            // Get daily views for last 30 days
            const dailyStats = await this.getResumeDailyStats(resumeId);

            return {
                resumeId,
                views: resume.views,
                downloads: resume.downloads,
                lastViewed: resume.lastViewed,
                lastDownloaded: resume.lastDownloaded,
                createdAt: resume.createdAt,
                dailyStats,
                avgViewsPerDay: dailyStats.length > 0 ?
                    dailyStats.reduce((sum, day) => sum + day.views, 0) / dailyStats.length : 0,
                avgDownloadsPerDay: dailyStats.length > 0 ?
                    dailyStats.reduce((sum, day) => sum + day.downloads, 0) / dailyStats.length : 0
            };
        } catch (error) {
            console.error('Resume analytics error:', error);
            throw error;
        }
    }

    // Get resume daily stats
    static async getResumeDailyStats(resumeId, days = 30) {
        // This would require a separate analytics collection
        // For now, return empty array
        return [];
    }

    // Duplicate resume
    static async duplicateResume(resumeId, adminId) {
        try {
            const resume = await Resume.findById(resumeId).lean();

            if (!resume) {
                throw new Error('Resume not found');
            }

            // Remove _id and other fields
            delete resume._id;
            delete resume.createdAt;
            delete resume.updatedAt;
            delete resume.__v;

            // Update title and slug
            const newTitle = `${resume.title} (Copy)`;
            const newSlug = `${resume.slug}-copy-${Date.now()}`;

            // Create new resume
            const newResume = new Resume({
                ...resume,
                title: newTitle,
                slug: newSlug,
                status: 'draft',
                isPublic: false,
                isFeatured: false,
                views: 0,
                downloads: 0,
                createdByAdmin: adminId,
                previousVersions: []
            });

            await newResume.save();

            return {
                success: true,
                message: 'Resume duplicated successfully',
                newResume: newResume.toAdminResponse()
            };
        } catch (error) {
            console.error('Duplicate resume error:', error);
            throw error;
        }
    }
}

module.exports = ResumeService;