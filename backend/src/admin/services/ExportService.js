const { Parser } = require('json2csv');
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
const Resume = require('../models/Resume');
const User = require('../../api/models/User');
const AdminLog = require('../models/AdminLog');
const LogService = require('./LogService');

class ExportService {
    // Export resumes to various formats
    static async exportResumes(filters = {}, format = 'csv') {
        try {
            // Fetch resumes based on filters
            const resumes = await Resume.find(filters)
                .populate('user', 'name email')
                .lean();

            if (resumes.length === 0) {
                throw new Error('No resumes found matching the criteria');
            }

            // Format data for export
            const formattedData = resumes.map(resume => ({
                'Resume ID': resume._id,
                'Title': resume.title,
                'User Name': resume.user?.name || resume.userName,
                'User Email': resume.user?.email || resume.userEmail,
                'Status': resume.status,
                'Template': resume.template,
                'Created At': resume.createdAt.toISOString(),
                'Updated At': resume.updatedAt.toISOString(),
                'Views': resume.views,
                'Downloads': resume.downloads,
                'Completion %': resume.completionPercentage,
                'Is Public': resume.isPublic,
                'Is Featured': resume.isFeatured,
                'File Format': resume.fileFormat,
                'File Size': resume.fileSize ? `${(resume.fileSize / 1024).toFixed(2)} KB` : 'N/A'
            }));

            switch (format.toLowerCase()) {
                case 'csv':
                    return this.exportToCSV(formattedData, 'resumes');

                case 'excel':
                    return this.exportToExcel(formattedData, 'resumes');

                case 'json':
                    return this.exportToJSON(formattedData, 'resumes');

                case 'pdf':
                    return await this.exportToPDF(formattedData, 'resumes');

                default:
                    throw new Error(`Unsupported export format: ${format}`);
            }
        } catch (error) {
            console.error('Export resumes error:', error);
            throw error;
        }
    }

    // Export users to various formats
    static async exportUsers(filters = {}, format = 'csv') {
        try {
            // Fetch users based on filters
            const users = await User.find(filters)
                .select('-password -resetPasswordToken -resetPasswordExpires')
                .lean();

            if (users.length === 0) {
                throw new Error('No users found matching the criteria');
            }

            // Format data for export
            const formattedData = users.map(user => ({
                'User ID': user._id,
                'Name': user.name,
                'Email': user.email,
                'Status': user.status || 'active',
                'Role': user.role || 'user',
                'Created At': user.createdAt.toISOString(),
                'Updated At': user.updatedAt.toISOString(),
                'Last Login': user.lastLogin ? user.lastLogin.toISOString() : 'Never',
                'Email Verified': user.isEmailVerified || false,
                'Resume Count': user.resumeCount || 0,
                'Subscription': user.subscription || 'free'
            }));

            switch (format.toLowerCase()) {
                case 'csv':
                    return this.exportToCSV(formattedData, 'users');

                case 'excel':
                    return this.exportToExcel(formattedData, 'users');

                case 'json':
                    return this.exportToJSON(formattedData, 'users');

                default:
                    throw new Error(`Unsupported export format: ${format}`);
            }
        } catch (error) {
            console.error('Export users error:', error);
            throw error;
        }
    }

    // Export logs to various formats
    static async exportLogs(filters = {}, format = 'csv') {
        try {
            // Fetch logs based on filters
            const logs = await AdminLog.find(filters)
                .populate('admin', 'name email role')
                .sort({ timestamp: -1 })
                .lean();

            if (logs.length === 0) {
                throw new Error('No logs found matching the criteria');
            }

            // Format data for export
            const formattedData = logs.map(log => ({
                'Log ID': log._id,
                'Timestamp': log.timestamp.toISOString(),
                'Action': log.action,
                'Module': log.module || 'N/A',
                'Admin Name': log.admin?.name || 'System',
                'Admin Email': log.admin?.email || 'N/A',
                'Admin Role': log.admin?.role || 'N/A',
                'IP Address': log.ipAddress || 'N/A',
                'User Agent': log.userAgent || 'N/A',
                'Success': log.success ? 'Yes' : 'No',
                'Error Message': log.errorMessage || 'N/A',
                'Details': JSON.stringify(log.details || {})
            }));

            switch (format.toLowerCase()) {
                case 'csv':
                    return this.exportToCSV(formattedData, 'logs');

                case 'excel':
                    return this.exportToExcel(formattedData, 'logs');

                case 'json':
                    return this.exportToJSON(formattedData, 'logs');

                default:
                    throw new Error(`Unsupported export format: ${format}`);
            }
        } catch (error) {
            console.error('Export logs error:', error);
            throw error;
        }
    }

    // Export analytics data
    static async exportAnalytics(analyticsData, format = 'csv', reportName = 'analytics') {
        try {
            if (!analyticsData || analyticsData.length === 0) {
                throw new Error('No analytics data to export');
            }

            switch (format.toLowerCase()) {
                case 'csv':
                    return this.exportToCSV(analyticsData, reportName);

                case 'excel':
                    return this.exportToExcel(analyticsData, reportName);

                case 'json':
                    return this.exportToJSON(analyticsData, reportName);

                default:
                    throw new Error(`Unsupported export format: ${format}`);
            }
        } catch (error) {
            console.error('Export analytics error:', error);
            throw error;
        }
    }

    // Export to CSV
    static exportToCSV(data, filename) {
        try {
            const parser = new Parser();
            const csv = parser.parse(data);
            return csv;
        } catch (error) {
            console.error('CSV export error:', error);
            throw error;
        }
    }

    // Export to Excel
    static async exportToExcel(data, filename) {
        try {
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet(filename);

            // Add headers
            if (data.length > 0) {
                const headers = Object.keys(data[0]);
                worksheet.addRow(headers);

                // Style headers
                worksheet.getRow(1).eachCell((cell) => {
                    cell.font = { bold: true };
                    cell.fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: 'FFE0E0E0' }
                    };
                    cell.border = {
                        top: { style: 'thin' },
                        left: { style: 'thin' },
                        bottom: { style: 'thin' },
                        right: { style: 'thin' }
                    };
                });
            }

            // Add data rows
            data.forEach(item => {
                const row = Object.values(item);
                worksheet.addRow(row);
            });

            // Auto-fit columns
            worksheet.columns.forEach(column => {
                let maxLength = 0;
                column.eachCell({ includeEmpty: true }, cell => {
                    const columnLength = cell.value ? cell.value.toString().length : 10;
                    if (columnLength > maxLength) {
                        maxLength = columnLength;
                    }
                });
                column.width = Math.min(maxLength + 2, 50);
            });

            // Generate buffer
            const buffer = await workbook.xlsx.writeBuffer();
            return buffer;
        } catch (error) {
            console.error('Excel export error:', error);
            throw error;
        }
    }

    // Export to JSON
    static exportToJSON(data, filename) {
        try {
            return JSON.stringify(data, null, 2);
        } catch (error) {
            console.error('JSON export error:', error);
            throw error;
        }
    }

    // Export to PDF
    static async exportToPDF(data, filename) {
        return new Promise((resolve, reject) => {
            try {
                const doc = new PDFDocument({ margin: 50 });
                const chunks = [];

                doc.on('data', chunk => chunks.push(chunk));
                doc.on('end', () => resolve(Buffer.concat(chunks)));
                doc.on('error', reject);

                // Add title
                doc.fontSize(20).text(`${filename.toUpperCase()} REPORT`, { align: 'center' });
                doc.moveDown();

                // Add generation date
                doc.fontSize(10).text(`Generated: ${new Date().toLocaleString()}`, { align: 'right' });
                doc.moveDown(2);

                // Add table headers
                if (data.length > 0) {
                    const headers = Object.keys(data[0]);
                    let yPosition = doc.y;

                    // Draw header background
                    doc.rect(50, yPosition, 500, 20).fill('#f0f0f0');

                    // Add header text
                    doc.fontSize(12).font('Helvetica-Bold');
                    let xPosition = 55;
                    headers.forEach((header, index) => {
                        doc.text(header, xPosition, yPosition + 5);
                        xPosition += 100; // Adjust column width as needed
                    });

                    doc.moveDown();
                    yPosition += 30;

                    // Add data rows
                    doc.fontSize(10).font('Helvetica');
                    data.forEach((row, rowIndex) => {
                        if (yPosition > 700) { // New page if near bottom
                            doc.addPage();
                            yPosition = 50;
                        }

                        xPosition = 55;
                        headers.forEach(header => {
                            const value = row[header] !== undefined ? String(row[header]) : '';
                            doc.text(value.substring(0, 30), xPosition, yPosition); // Limit text length
                            xPosition += 100;
                        });

                        yPosition += 20;
                    });
                }

                doc.end();
            } catch (error) {
                reject(error);
            }
        });
    }

    // Export to ZIP (multiple files)
    static async exportToZip(files, zipFilename = 'export.zip') {
        return new Promise((resolve, reject) => {
            try {
                const archive = archiver('zip', { zlib: { level: 9 } });
                const chunks = [];

                archive.on('data', chunk => chunks.push(chunk));
                archive.on('end', () => resolve(Buffer.concat(chunks)));
                archive.on('error', reject);

                // Add files to archive
                files.forEach(file => {
                    if (file.content && file.filename) {
                        archive.append(file.content, { name: file.filename });
                    }
                });

                archive.finalize();
            } catch (error) {
                reject(error);
            }
        });
    }

    // Export statistics report
    static async exportStatisticsReport(period = '30d', format = 'excel') {
        try {
            // Get statistics data
            const stats = await this.getStatisticsData(period);

            // Format for export
            const exportData = this.formatStatisticsForExport(stats);

            // Export based on format
            switch (format.toLowerCase()) {
                case 'excel':
                    return this.exportStatisticsToExcel(exportData, `stats_${period}`);

                case 'pdf':
                    return this.exportStatisticsToPDF(exportData, `stats_${period}`);

                default:
                    return this.exportToJSON(exportData, `stats_${period}`);
            }
        } catch (error) {
            console.error('Statistics report export error:', error);
            throw error;
        }
    }

    // Get comprehensive statistics data
    static async getStatisticsData(period) {
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
            userStats,
            resumeStats,
            activityStats,
            systemStats
        ] = await Promise.all([
            this.getUserStatistics(startDate, endDate),
            this.getResumeStatistics(startDate, endDate),
            this.getActivityStatistics(startDate, endDate),
            this.getSystemStatistics()
        ]);

        return {
            period: `${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`,
            generated: new Date().toISOString(),
            userStats,
            resumeStats,
            activityStats,
            systemStats
        };
    }

    // Get user statistics
    static async getUserStatistics(startDate, endDate) {
        const userStats = await User.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate, $lte: endDate }
                }
            },
            {
                $facet: {
                    dailyRegistrations: [
                        {
                            $group: {
                                _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                                count: { $sum: 1 }
                            }
                        },
                        { $sort: { _id: 1 } }
                    ],
                    bySource: [
                        {
                            $group: {
                                _id: '$source',
                                count: { $sum: 1 }
                            }
                        }
                    ],
                    byStatus: [
                        {
                            $group: {
                                _id: '$status',
                                count: { $sum: 1 }
                            }
                        }
                    ]
                }
            }
        ]);

        return userStats[0] || {};
    }

    // Get resume statistics
    static async getResumeStatistics(startDate, endDate) {
        const resumeStats = await Resume.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate, $lte: endDate }
                }
            },
            {
                $facet: {
                    dailyCreations: [
                        {
                            $group: {
                                _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                                count: { $sum: 1 }
                            }
                        },
                        { $sort: { _id: 1 } }
                    ],
                    byTemplate: [
                        {
                            $group: {
                                _id: '$template',
                                count: { $sum: 1 },
                                avgCompletion: { $avg: '$completionPercentage' }
                            }
                        }
                    ],
                    byStatus: [
                        {
                            $group: {
                                _id: '$status',
                                count: { $sum: 1 }
                            }
                        }
                    ],
                    viewsAndDownloads: [
                        {
                            $group: {
                                _id: null,
                                totalViews: { $sum: '$views' },
                                totalDownloads: { $sum: '$downloads' },
                                avgViews: { $avg: '$views' },
                                avgDownloads: { $avg: '$downloads' }
                            }
                        }
                    ]
                }
            }
        ]);

        return resumeStats[0] || {};
    }

    // Get activity statistics
    static async getActivityStatistics(startDate, endDate) {
        const activityStats = await AdminLog.aggregate([
            {
                $match: {
                    timestamp: { $gte: startDate, $lte: endDate }
                }
            },
            {
                $facet: {
                    dailyActivities: [
                        {
                            $group: {
                                _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
                                count: { $sum: 1 },
                                successCount: { $sum: { $cond: [{ $eq: ['$success', true] }, 1, 0] } }
                            }
                        },
                        { $sort: { _id: 1 } }
                    ],
                    byAction: [
                        {
                            $group: {
                                _id: '$action',
                                count: { $sum: 1 }
                            }
                        },
                        { $sort: { count: -1 } },
                        { $limit: 10 }
                    ],
                    byAdmin: [
                        {
                            $group: {
                                _id: '$admin',
                                count: { $sum: 1 }
                            }
                        },
                        { $sort: { count: -1 } },
                        { $limit: 10 }
                    ],
                    successRate: [
                        {
                            $group: {
                                _id: null,
                                total: { $sum: 1 },
                                success: { $sum: { $cond: [{ $eq: ['$success', true] }, 1, 0] } }
                            }
                        }
                    ]
                }
            }
        ]);

        return activityStats[0] || {};
    }

    // Get system statistics
    static async getSystemStatistics() {
        const collections = await mongoose.connection.db.listCollections().toArray();
        let totalSize = 0;
        let totalDocuments = 0;

        for (const collection of collections) {
            const stats = await mongoose.connection.db.collection(collection.name).stats();
            totalSize += stats.size;
            totalDocuments += stats.count;
        }

        return {
            database: {
                totalCollections: collections.length,
                totalSize: `${(totalSize / 1024 / 1024).toFixed(2)} MB`,
                totalDocuments
            },
            server: {
                uptime: process.uptime(),
                memory: process.memoryUsage(),
                nodeVersion: process.version,
                platform: process.platform
            }
        };
    }

    // Format statistics for export
    static formatStatisticsForExport(stats) {
        const exportData = [];

        // Summary sheet
        exportData.push({
            sheet: 'Summary',
            data: [
                ['STATISTICS REPORT', ''],
                ['Period', stats.period],
                ['Generated', stats.generated],
                ['', ''],
                ['USER STATISTICS', ''],
                ['Total Registrations (Period)', stats.userStats.dailyRegistrations?.reduce((sum, day) => sum + day.count, 0) || 0],
                ['', ''],
                ['RESUME STATISTICS', ''],
                ['Total Resumes Created (Period)', stats.resumeStats.dailyCreations?.reduce((sum, day) => sum + day.count, 0) || 0],
                ['Total Views', stats.resumeStats.viewsAndDownloads?.[0]?.totalViews || 0],
                ['Total Downloads', stats.resumeStats.viewsAndDownloads?.[0]?.totalDownloads || 0],
                ['', ''],
                ['ACTIVITY STATISTICS', ''],
                ['Total Admin Activities', stats.activityStats.dailyActivities?.reduce((sum, day) => sum + day.count, 0) || 0],
                ['Success Rate', stats.activityStats.successRate?.[0] ?
                    `${((stats.activityStats.successRate[0].success / stats.activityStats.successRate[0].total) * 100).toFixed(2)}%` : '0%']
            ]
        });

        // User registrations sheet
        if (stats.userStats.dailyRegistrations) {
            exportData.push({
                sheet: 'User Registrations',
                headers: ['Date', 'Registrations'],
                data: stats.userStats.dailyRegistrations.map(day => [day._id, day.count])
            });
        }

        // Resume creations sheet
        if (stats.resumeStats.dailyCreations) {
            exportData.push({
                sheet: 'Resume Creations',
                headers: ['Date', 'Resumes Created'],
                data: stats.resumeStats.dailyCreations.map(day => [day._id, day.count])
            });
        }

        // Template usage sheet
        if (stats.resumeStats.byTemplate) {
            exportData.push({
                sheet: 'Template Usage',
                headers: ['Template', 'Count', 'Avg Completion %'],
                data: stats.resumeStats.byTemplate.map(template => [
                    template._id,
                    template.count,
                    Math.round(template.avgCompletion || 0)
                ])
            });
        }

        // Admin activities sheet
        if (stats.activityStats.byAction) {
            exportData.push({
                sheet: 'Admin Activities',
                headers: ['Action', 'Count'],
                data: stats.activityStats.byAction.map(action => [action._id, action.count])
            });
        }

        return exportData;
    }

    // Export statistics to Excel with multiple sheets
    static async exportStatisticsToExcel(data, filename) {
        try {
            const workbook = new ExcelJS.Workbook();

            data.forEach(sheetData => {
                const worksheet = workbook.addWorksheet(sheetData.sheet);

                if (sheetData.headers) {
                    worksheet.addRow(sheetData.headers);
                    worksheet.getRow(1).eachCell(cell => {
                        cell.font = { bold: true };
                        cell.fill = {
                            type: 'pattern',
                            pattern: 'solid',
                            fgColor: { argb: 'FFE0E0E0' }
                        };
                    });
                }

                sheetData.data.forEach(rowData => {
                    worksheet.addRow(rowData);
                });

                // Auto-fit columns
                worksheet.columns.forEach(column => {
                    let maxLength = 0;
                    column.eachCell({ includeEmpty: true }, cell => {
                        const columnLength = cell.value ? cell.value.toString().length : 10;
                        if (columnLength > maxLength) {
                            maxLength = columnLength;
                        }
                    });
                    column.width = Math.min(maxLength + 2, 50);
                });
            });

            const buffer = await workbook.xlsx.writeBuffer();
            return buffer;
        } catch (error) {
            console.error('Statistics Excel export error:', error);
            throw error;
        }
    }

    // Export statistics to PDF
    static async exportStatisticsToPDF(data, filename) {
        return new Promise((resolve, reject) => {
            try {
                const doc = new PDFDocument({ margin: 50 });
                const chunks = [];

                doc.on('data', chunk => chunks.push(chunk));
                doc.on('end', () => resolve(Buffer.concat(chunks)));
                doc.on('error', reject);

                // Add title
                doc.fontSize(20).text('STATISTICS REPORT', { align: 'center' });
                doc.moveDown();

                data.forEach(section => {
                    doc.fontSize(16).text(section.sheet, { underline: true });
                    doc.moveDown();

                    if (section.headers) {
                        // Draw table
                        let yPosition = doc.y;
                        const colWidth = 200;

                        // Headers
                        doc.font('Helvetica-Bold');
                        section.headers.forEach((header, index) => {
                            doc.text(header, 50 + (index * colWidth), yPosition);
                        });

                        yPosition += 20;
                        doc.moveTo(50, yPosition).lineTo(50 + (section.headers.length * colWidth), yPosition).stroke();
                        yPosition += 10;

                        // Data
                        doc.font('Helvetica');
                        section.data.forEach(row => {
                            if (yPosition > 700) {
                                doc.addPage();
                                yPosition = 50;
                            }

                            row.forEach((cell, index) => {
                                doc.text(String(cell), 50 + (index * colWidth), yPosition);
                            });

                            yPosition += 20;
                        });
                    } else {
                        // Simple data
                        section.data.forEach(row => {
                            doc.fontSize(12).text(`${row[0]}: ${row[1]}`);
                        });
                    }

                    doc.moveDown(2);
                });

                doc.end();
            } catch (error) {
                reject(error);
            }
        });
    }

    // Generate export filename
    static generateFilename(baseName, format, timestamp = null) {
        const date = timestamp || new Date();
        const dateStr = date.toISOString().split('T')[0];
        const timeStr = date.toTimeString().split(' ')[0].replace(/:/g, '-');

        return `${baseName}_${dateStr}_${timeStr}.${format}`;
    }

    // Cleanup old export files
    static async cleanupOldExports(days = 7) {
        try {
            const exportsDir = path.join(__dirname, '../../exports');

            if (!fs.existsSync(exportsDir)) {
                return { deleted: 0, message: 'Exports directory does not exist' };
            }

            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - days);

            const files = fs.readdirSync(exportsDir);
            let deletedCount = 0;

            for (const file of files) {
                const filePath = path.join(exportsDir, file);
                const stats = fs.statSync(filePath);

                if (stats.mtime < cutoffDate) {
                    fs.unlinkSync(filePath);
                    deletedCount++;
                }
            }

            return {
                deleted: deletedCount,
                message: `Cleaned up ${deletedCount} old export files`
            };
        } catch (error) {
            console.error('Cleanup exports error:', error);
            throw error;
        }
    }
}

module.exports = ExportService;