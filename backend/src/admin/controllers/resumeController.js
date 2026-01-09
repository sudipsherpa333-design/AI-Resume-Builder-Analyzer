const ResumeService = require('../services/ResumeService');
const ExportService = require('../services/ExportService');
const LogService = require('../services/LogService');

class ResumeController {
    // Get all resumes with pagination and filters
    async getAllResumes(req, res) {
        try {
            const {
                page = 1,
                limit = 20,
                search,
                status,
                sortBy = 'createdAt',
                sortOrder = 'desc',
                userId,
                startDate,
                endDate,
                export: exportFlag
            } = req.query;

            const filters = {
                search,
                status,
                userId,
                startDate,
                endDate
            };

            // If export is requested
            if (exportFlag === 'true') {
                const resumes = await ResumeService.exportResumes(filters);
                return res.json({
                    success: true,
                    data: resumes,
                    count: resumes.length
                });
            }

            const result = await ResumeService.getAllResumes(filters, parseInt(page), parseInt(limit), sortBy, sortOrder);

            await LogService.createActionLog(req.admin._id, 'resumes_view', {
                filters,
                page,
                limit
            });

            res.json({
                success: true,
                data: result.resumes,
                pagination: result.pagination,
                stats: result.stats
            });
        } catch (error) {
            console.error('Get all resumes error:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to fetch resumes'
            });
        }
    }

    // Get resume by ID
    async getResumeById(req, res) {
        try {
            const { id } = req.params;
            const resume = await ResumeService.getResumeById(id);

            if (!resume) {
                return res.status(404).json({
                    success: false,
                    message: 'Resume not found'
                });
            }

            await LogService.createActionLog(req.admin._id, 'resume_view', {
                resumeId: id
            });

            res.json({
                success: true,
                data: resume
            });
        } catch (error) {
            console.error('Get resume error:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to fetch resume'
            });
        }
    }

    // Update resume
    async updateResume(req, res) {
        try {
            const { id } = req.params;
            const updateData = req.body;

            const resume = await ResumeService.updateResume(id, updateData, req.admin._id);

            await LogService.createActionLog(req.admin._id, 'resume_update', {
                resumeId: id,
                updates: Object.keys(updateData)
            });

            res.json({
                success: true,
                message: 'Resume updated successfully',
                data: resume
            });
        } catch (error) {
            console.error('Update resume error:', error);
            res.status(400).json({
                success: false,
                message: error.message || 'Failed to update resume'
            });
        }
    }

    // Delete resume
    async deleteResume(req, res) {
        try {
            const { id } = req.params;
            await ResumeService.deleteResume(id, req.admin._id);

            await LogService.createActionLog(req.admin._id, 'resume_delete', {
                resumeId: id
            });

            res.json({
                success: true,
                message: 'Resume deleted successfully'
            });
        } catch (error) {
            console.error('Delete resume error:', error);
            res.status(400).json({
                success: false,
                message: error.message || 'Failed to delete resume'
            });
        }
    }

    // Export resumes
    async exportResumes(req, res) {
        try {
            const { format = 'csv', ...filters } = req.query;

            const exportData = await ExportService.exportResumes(filters, format);

            // Set headers for download
            const filename = `resumes_export_${Date.now()}.${format}`;
            res.setHeader('Content-Type', format === 'excel' ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' : 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

            await LogService.createActionLog(req.admin._id, 'resumes_export', {
                format,
                filters,
                count: exportData.length || 0
            });

            res.send(exportData);
        } catch (error) {
            console.error('Export resumes error:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to export resumes'
            });
        }
    }

    // Get resume statistics
    async getResumeStats(req, res) {
        try {
            const { period = '30d' } = req.query;
            const stats = await ResumeService.getResumeStatistics(period);

            res.json({
                success: true,
                data: stats
            });
        } catch (error) {
            console.error('Get resume stats error:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to fetch resume statistics'
            });
        }
    }

    // Bulk actions (delete, update status)
    async bulkAction(req, res) {
        try {
            const { action, ids, data } = req.body;

            if (!action || !ids || !Array.isArray(ids) || ids.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Action and IDs are required'
                });
            }

            const result = await ResumeService.bulkAction(action, ids, data, req.admin._id);

            await LogService.createActionLog(req.admin._id, `resumes_bulk_${action}`, {
                ids,
                count: ids.length,
                data
            });

            res.json({
                success: true,
                message: `Bulk ${action} completed successfully`,
                data: result
            });
        } catch (error) {
            console.error('Bulk action error:', error);
            res.status(400).json({
                success: false,
                message: error.message || 'Failed to perform bulk action'
            });
        }
    }

    // Search resumes
    async searchResumes(req, res) {
        try {
            const { q, field = 'all', limit = 50 } = req.query;

            if (!q || q.trim().length < 2) {
                return res.status(400).json({
                    success: false,
                    message: 'Search query must be at least 2 characters'
                });
            }

            const results = await ResumeService.searchResumes(q, field, parseInt(limit));

            res.json({
                success: true,
                data: results,
                count: results.length
            });
        } catch (error) {
            console.error('Search resumes error:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to search resumes'
            });
        }
    }
}

module.exports = new ResumeController();