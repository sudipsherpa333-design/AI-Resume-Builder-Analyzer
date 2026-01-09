const DashboardService = require('../services/DashboardService');

class DashboardController {
    // Get dashboard statistics
    async getStats(req, res) {
        try {
            const stats = await DashboardService.getDashboardStats();

            res.json({
                success: true,
                data: stats
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    // Get analytics data
    async getAnalytics(req, res) {
        try {
            const { period = '7d', startDate, endDate } = req.query;

            const analytics = await DashboardService.getAnalytics(
                period,
                startDate,
                endDate
            );

            res.json({
                success: true,
                data: analytics
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    // Get recent activities
    async getRecentActivities(req, res) {
        try {
            const { limit = 10 } = req.query;
            const activities = await DashboardService.getRecentActivities(limit);

            res.json({
                success: true,
                data: activities
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    // Get system health
    async getSystemHealth(req, res) {
        try {
            const health = await DashboardService.getSystemHealth();

            res.json({
                success: true,
                data: health
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
}

module.exports = new DashboardController();