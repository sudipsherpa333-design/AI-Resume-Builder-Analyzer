const Template = require('../../models/Template'); // Your existing Template model
const Resume = require('../../models/Resume');
const AdminLog = require('../models/AdminLog');
const fs = require('fs').promises;
const path = require('path');

class TemplateController {
    // Get all templates
    static async getAllTemplates(req, res) {
        try {
            const {
                page = 1,
                limit = 20,
                search = '',
                category,
                isActive,
                isPremium,
                sortBy = 'createdAt',
                sortOrder = 'desc'
            } = req.query;

            // Build query
            const query = {};

            if (search) {
                query.$or = [
                    { name: { $regex: search, $options: 'i' } },
                    { description: { $regex: search, $options: 'i' } },
                    { category: { $regex: search, $options: 'i' } }
                ];
            }

            if (category) {
                query.category = category;
            }

            if (isActive !== undefined) {
                query.isActive = isActive === 'true';
            }

            if (isPremium !== undefined) {
                query.isPremium = isPremium === 'true';
            }

            // Calculate pagination
            const skip = (parseInt(page) - 1) * parseInt(limit);
            const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

            // Get templates with usage stats
            const [templates, total] = await Promise.all([
                Template.find(query)
                    .sort(sort)
                    .skip(skip)
                    .limit(parseInt(limit))
                    .lean(),
                Template.countDocuments(query)
            ]);

            // Get usage count for each template
            const templateIds = templates.map(t => t._id);
            const usageStats = await Resume.aggregate([
                { $match: { templateId: { $in: templateIds } } },
                { $group: { _id: '$templateId', count: { $sum: 1 } } }
            ]);

            const usageMap = usageStats.reduce((map, stat) => {
                map[stat._id.toString()] = stat.count;
                return map;
            }, {});

            // Add usage count to templates
            const templatesWithStats = templates.map(template => ({
                ...template,
                usageCount: usageMap[template._id.toString()] || 0
            }));

            res.json({
                success: true,
                data: {
                    templates: templatesWithStats,
                    pagination: {
                        page: parseInt(page),
                        limit: parseInt(limit),
                        total,
                        pages: Math.ceil(total / parseInt(limit))
                    }
                }
            });

        } catch (error) {
            console.error('Get templates error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch templates.'
            });
        }
    }

    // Get template by ID
    static async getTemplateById(req, res) {
        try {
            const { id } = req.params;

            const template = await Template.findById(id).lean();

            if (!template) {
                return res.status(404).json({
                    success: false,
                    message: 'Template not found.'
                });
            }

            // Get usage stats
            const usageStats = await Resume.aggregate([
                { $match: { templateId: id } },
                {
                    $group: {
                        _id: null,
                        count: { $sum: 1 },
                        totalViews: { $sum: '$views' },
                        totalDownloads: { $sum: '$downloads' }
                    }
                }
            ]);

            // Get recent resumes using this template
            const recentResumes = await Resume.find({ templateId: id })
                .populate('userId', 'name email')
                .select('title views downloads createdAt')
                .sort({ createdAt: -1 })
                .limit(5)
                .lean();

            res.json({
                success: true,
                data: {
                    template,
                    stats: usageStats[0] || { count: 0, totalViews: 0, totalDownloads: 0 },
                    recentResumes
                }
            });

        } catch (error) {
            console.error('Get template error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch template.'
            });
        }
    }

    // Create new template
    static async createTemplate(req, res) {
        try {
            const {
                name,
                description,
                category,
                thumbnail,
                previewImages,
                htmlContent,
                cssContent,
                jsContent,
                config,
                isActive = true,
                isPremium = false,
                sortOrder = 0,
                tags = []
            } = req.body;

            // Validate required fields
            if (!name || !category) {
                return res.status(400).json({
                    success: false,
                    message: 'Name and category are required.'
                });
            }

            // Check if template with same name exists
            const existingTemplate = await Template.findOne({ name });
            if (existingTemplate) {
                return res.status(400).json({
                    success: false,
                    message: 'Template with this name already exists.'
                });
            }

            // Create template
            const template = new Template({
                name,
                description,
                category,
                thumbnail,
                previewImages: previewImages || [],
                htmlContent: htmlContent || '',
                cssContent: cssContent || '',
                jsContent: jsContent || '',
                config: config || {},
                isActive,
                isPremium,
                sortOrder,
                tags,
                createdBy: req.admin._id,
                updatedBy: req.admin._id
            });

            await template.save();

            // Log action
            await AdminLog.create({
                adminId: req.admin._id,
                adminEmail: req.admin.email,
                action: 'CREATE_TEMPLATE',
                resource: 'templates',
                resourceId: template._id,
                details: { name, category },
                ipAddress: req.ip
            });

            res.status(201).json({
                success: true,
                message: 'Template created successfully.',
                data: template
            });

        } catch (error) {
            console.error('Create template error:', error);

            if (error.name === 'ValidationError') {
                return res.status(400).json({
                    success: false,
                    message: 'Validation error.',
                    errors: error.errors
                });
            }

            res.status(500).json({
                success: false,
                message: 'Failed to create template.'
            });
        }
    }

    // Update template
    static async updateTemplate(req, res) {
        try {
            const { id } = req.params;
            const updates = req.body;

            // Don't allow updating certain fields
            delete updates._id;
            delete updates.createdAt;
            delete updates.createdBy;
            delete updates.usageCount;

            // Add updated by
            updates.updatedBy = req.admin._id;
            updates.updatedAt = new Date();

            const template = await Template.findByIdAndUpdate(
                id,
                updates,
                { new: true, runValidators: true }
            );

            if (!template) {
                return res.status(404).json({
                    success: false,
                    message: 'Template not found.'
                });
            }

            // Log action
            await AdminLog.create({
                adminId: req.admin._id,
                adminEmail: req.admin.email,
                action: 'UPDATE_TEMPLATE',
                resource: 'templates',
                resourceId: id,
                details: Object.keys(updates),
                ipAddress: req.ip
            });

            res.json({
                success: true,
                message: 'Template updated successfully.',
                data: template
            });

        } catch (error) {
            console.error('Update template error:', error);

            if (error.name === 'ValidationError') {
                return res.status(400).json({
                    success: false,
                    message: 'Validation error.',
                    errors: error.errors
                });
            }

            res.status(500).json({
                success: false,
                message: 'Failed to update template.'
            });
        }
    }

    // Delete template
    static async deleteTemplate(req, res) {
        try {
            const { id } = req.params;

            // Check if template is being used
            const usageCount = await Resume.countDocuments({ templateId: id });

            if (usageCount > 0) {
                return res.status(400).json({
                    success: false,
                    message: `Cannot delete template. It is being used by ${usageCount} resumes.`
                });
            }

            const template = await Template.findByIdAndDelete(id);

            if (!template) {
                return res.status(404).json({
                    success: false,
                    message: 'Template not found.'
                });
            }

            // Log action
            await AdminLog.create({
                adminId: req.admin._id,
                adminEmail: req.admin.email,
                action: 'DELETE_TEMPLATE',
                resource: 'templates',
                resourceId: id,
                ipAddress: req.ip
            });

            res.json({
                success: true,
                message: 'Template deleted successfully.'
            });

        } catch (error) {
            console.error('Delete template error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to delete template.'
            });
        }
    }

    // Duplicate template
    static async duplicateTemplate(req, res) {
        try {
            const { id } = req.params;
            const { newName } = req.body;

            if (!newName) {
                return res.status(400).json({
                    success: false,
                    message: 'New template name is required.'
                });
            }

            // Check if new name already exists
            const existingTemplate = await Template.findOne({ name: newName });
            if (existingTemplate) {
                return res.status(400).json({
                    success: false,
                    message: 'Template with this name already exists.'
                });
            }

            const originalTemplate = await Template.findById(id);

            if (!originalTemplate) {
                return res.status(404).json({
                    success: false,
                    message: 'Template not found.'
                });
            }

            // Create duplicate
            const duplicate = new Template({
                ...originalTemplate.toObject(),
                _id: undefined,
                name: newName,
                isActive: false, // Keep duplicate inactive by default
                usageCount: 0,
                createdAt: new Date(),
                updatedAt: new Date(),
                createdBy: req.admin._id,
                updatedBy: req.admin._id
            });

            await duplicate.save();

            // Log action
            await AdminLog.create({
                adminId: req.admin._id,
                adminEmail: req.admin.email,
                action: 'DUPLICATE_TEMPLATE',
                resource: 'templates',
                resourceId: id,
                details: { originalName: originalTemplate.name, newName },
                ipAddress: req.ip
            });

            res.status(201).json({
                success: true,
                message: 'Template duplicated successfully.',
                data: duplicate
            });

        } catch (error) {
            console.error('Duplicate template error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to duplicate template.'
            });
        }
    }

    // Bulk update templates
    static async bulkUpdateTemplates(req, res) {
        try {
            const { templateIds, updates } = req.body;

            if (!templateIds || !Array.isArray(templateIds) || templateIds.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Template IDs array is required.'
                });
            }

            if (!updates || typeof updates !== 'object') {
                return res.status(400).json({
                    success: false,
                    message: 'Updates object is required.'
                });
            }

            // Don't allow updating certain fields
            delete updates._id;
            delete updates.createdAt;
            delete updates.createdBy;
            delete updates.name;

            // Add updated by and timestamp
            updates.updatedBy = req.admin._id;
            updates.updatedAt = new Date();

            const result = await Template.updateMany(
                { _id: { $in: templateIds } },
                updates
            );

            // Log action
            await AdminLog.create({
                adminId: req.admin._id,
                adminEmail: req.admin.email,
                action: 'BULK_UPDATE_TEMPLATES',
                resource: 'templates',
                details: { templateIds, updates, modifiedCount: result.modifiedCount },
                ipAddress: req.ip
            });

            res.json({
                success: true,
                message: `${result.modifiedCount} templates updated successfully.`,
                data: { modifiedCount: result.modifiedCount }
            });

        } catch (error) {
            console.error('Bulk update templates error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update templates.'
            });
        }
    }

    // Get template categories
    static async getCategories(req, res) {
        try {
            const categories = await Template.distinct('category');

            // Get count for each category
            const categoryStats = await Template.aggregate([
                { $group: { _id: '$category', count: { $sum: 1 } } },
                { $sort: { _id: 1 } }
            ]);

            // Get usage per category
            const usageStats = await Resume.aggregate([
                {
                    $lookup: {
                        from: 'templates',
                        localField: 'templateId',
                        foreignField: '_id',
                        as: 'template'
                    }
                },
                { $unwind: '$template' },
                { $group: { _id: '$template.category', count: { $sum: 1 } } }
            ]);

            const usageMap = usageStats.reduce((map, stat) => {
                map[stat._id] = stat.count;
                return map;
            }, {});

            const categoriesWithStats = categoryStats.map(stat => ({
                name: stat._id,
                templateCount: stat.count,
                usageCount: usageMap[stat._id] || 0
            }));

            res.json({
                success: true,
                data: categoriesWithStats
            });

        } catch (error) {
            console.error('Get categories error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch categories.'
            });
        }
    }

    // Upload template thumbnail
    static async uploadThumbnail(req, res) {
        try {
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: 'No file uploaded.'
                });
            }

            const { id } = req.params;

            // Validate file type
            const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
            if (!allowedTypes.includes(req.file.mimetype)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid file type. Only images are allowed.'
                });
            }

            // Validate file size (max 5MB)
            const maxSize = 5 * 1024 * 1024;
            if (req.file.size > maxSize) {
                return res.status(400).json({
                    success: false,
                    message: 'File too large. Maximum size is 5MB.'
                });
            }

            const template = await Template.findById(id);
            if (!template) {
                return res.status(404).json({
                    success: false,
                    message: 'Template not found.'
                });
            }

            // Save file path
            const thumbnailUrl = `/uploads/templates/${req.file.filename}`;
            template.thumbnail = thumbnailUrl;
            template.updatedBy = req.admin._id;
            await template.save();

            // Log action
            await AdminLog.create({
                adminId: req.admin._id,
                adminEmail: req.admin.email,
                action: 'UPLOAD_TEMPLATE_THUMBNAIL',
                resource: 'templates',
                resourceId: id,
                details: { filename: req.file.filename },
                ipAddress: req.ip
            });

            res.json({
                success: true,
                message: 'Thumbnail uploaded successfully.',
                data: { thumbnailUrl }
            });

        } catch (error) {
            console.error('Upload thumbnail error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to upload thumbnail.'
            });
        }
    }

    // Export templates
    static async exportTemplates(req, res) {
        try {
            const { format = 'json', includeContent = 'false' } = req.query;

            let templates;
            if (includeContent === 'true') {
                templates = await Template.find().lean();
            } else {
                templates = await Template.find()
                    .select('-htmlContent -cssContent -jsContent -config')
                    .lean();
            }

            if (format === 'csv') {
                // Convert to CSV
                const headers = ['ID', 'Name', 'Category', 'Is Active', 'Is Premium', 'Usage Count', 'Created At'];
                const csvRows = templates.map(template => [
                    template._id,
                    `"${template.name}"`,
                    `"${template.category}"`,
                    template.isActive ? 'Yes' : 'No',
                    template.isPremium ? 'Yes' : 'No',
                    template.usageCount || 0,
                    new Date(template.createdAt).toISOString()
                ]);

                const csv = [headers.join(','), ...csvRows.map(row => row.join(','))].join('\n');

                res.setHeader('Content-Type', 'text/csv');
                res.setHeader('Content-Disposition', 'attachment; filename=templates.csv');
                return res.send(csv);
            }

            // Default JSON response
            res.json({
                success: true,
                data: {
                    templates,
                    metadata: {
                        exportedAt: new Date().toISOString(),
                        exportedBy: req.admin.email,
                        count: templates.length
                    }
                }
            });

        } catch (error) {
            console.error('Export templates error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to export templates.'
            });
        }
    }

    // Import templates
    static async importTemplates(req, res) {
        try {
            const { templates, action = 'skip' } = req.body; // action: skip, overwrite, merge

            if (!templates || !Array.isArray(templates)) {
                return res.status(400).json({
                    success: false,
                    message: 'Templates array is required.'
                });
            }

            let imported = 0;
            let skipped = 0;
            let errors = [];

            for (const templateData of templates) {
                try {
                    // Check if template already exists
                    const existingTemplate = await Template.findOne({ name: templateData.name });

                    if (existingTemplate) {
                        if (action === 'skip') {
                            skipped++;
                            continue;
                        } else if (action === 'overwrite') {
                            // Remove existing and create new
                            await Template.findByIdAndDelete(existingTemplate._id);
                        } else if (action === 'merge') {
                            // Merge with existing
                            const merged = { ...existingTemplate.toObject(), ...templateData };
                            await Template.findByIdAndUpdate(existingTemplate._id, merged);
                            imported++;
                            continue;
                        }
                    }

                    // Create new template
                    const template = new Template({
                        ...templateData,
                        _id: undefined,
                        createdBy: req.admin._id,
                        updatedBy: req.admin._id,
                        createdAt: new Date(),
                        updatedAt: new Date()
                    });

                    await template.save();
                    imported++;

                } catch (error) {
                    errors.push({
                        name: templateData.name,
                        error: error.message
                    });
                }
            }

            // Log action
            await AdminLog.create({
                adminId: req.admin._id,
                adminEmail: req.admin.email,
                action: 'IMPORT_TEMPLATES',
                resource: 'templates',
                details: { imported, skipped, errors: errors.length },
                ipAddress: req.ip
            });

            res.json({
                success: true,
                message: `Templates imported: ${imported} imported, ${skipped} skipped, ${errors.length} errors.`,
                data: {
                    imported,
                    skipped,
                    errors
                }
            });

        } catch (error) {
            console.error('Import templates error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to import templates.'
            });
        }
    }
}

module.exports = TemplateController;