const ResumeService = require('../services/ResumeService.js');

// Create a new resume
const createResume = async (req, res) => {
    try {
        console.log('📥 Create resume request for user:', req.user?.id);
        console.log('Request body:', req.body);

        if (!req.user || !req.user.id) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            });
        }

        const { title, sections, template, status } = req.body;

        const resumeData = {
            title: title?.trim(),
            sections: sections || {},
            template: template || 'modern',
            status: status || 'draft'
        };

        console.log('📝 Creating resume with data:', resumeData);

        // Use ResumeService to create resume
        const result = await ResumeService.createResume(resumeData, req.user.id);

        if (!result.success) {
            return res.status(400).json(result);
        }

        res.status(201).json({
            success: true,
            message: 'Resume created successfully',
            data: result.data
        });

    } catch (error) {
        console.error('❌ Error in createResume controller:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create resume',
            message: error.message
        });
    }
};

// Get all resumes for user
const getUserResumes = async (req, res) => {
    try {
        console.log('📥 Getting resumes for user:', req.user?.id);

        if (!req.user || !req.user.id) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            });
        }

        const result = await ResumeService.getUserResumes(req.user.id);

        if (!result.success) {
            return res.status(400).json(result);
        }

        res.json({
            success: true,
            count: result.count,
            data: result.data
        });

    } catch (error) {
        console.error('❌ Error in getUserResumes controller:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get resumes',
            message: error.message
        });
    }
};

// Get single resume
const getResume = async (req, res) => {
    try {
        console.log('📥 Getting resume:', req.params.id, 'for user:', req.user?.id);

        if (!req.user || !req.user.id) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            });
        }

        const { id } = req.params;

        const result = await ResumeService.getResumeById(id, req.user.id);

        if (!result.success) {
            return res.status(404).json(result);
        }

        res.json({
            success: true,
            data: result.data
        });

    } catch (error) {
        console.error('❌ Error in getResume controller:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get resume',
            message: error.message
        });
    }
};

// Update resume
const updateResume = async (req, res) => {
    try {
        console.log('📥 Updating resume:', req.params.id, 'for user:', req.user?.id);

        if (!req.user || !req.user.id) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            });
        }

        const { id } = req.params;
        const updateData = req.body;

        const result = await ResumeService.updateResume(id, req.user.id, updateData);

        if (!result.success) {
            return res.status(400).json(result);
        }

        res.json({
            success: true,
            message: 'Resume updated successfully',
            data: result.data
        });

    } catch (error) {
        console.error('❌ Error in updateResume controller:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update resume',
            message: error.message
        });
    }
};

// Delete resume
const deleteResume = async (req, res) => {
    try {
        console.log('📥 Deleting resume:', req.params.id, 'for user:', req.user?.id);

        if (!req.user || !req.user.id) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            });
        }

        const { id } = req.params;

        const result = await ResumeService.deleteResume(id, req.user.id);

        if (!result.success) {
            return res.status(400).json(result);
        }

        res.json({
            success: true,
            message: 'Resume deleted successfully'
        });

    } catch (error) {
        console.error('❌ Error in deleteResume controller:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete resume',
            message: error.message
        });
    }
};

// Test route
const testRoute = (req, res) => {
    res.json({
        success: true,
        message: 'Resume API is working!',
        endpoints: {
            getResumes: 'GET /api/resumes',
            createResume: 'POST /api/resumes',
            getResume: 'GET /api/resumes/:id',
            updateResume: 'PUT /api/resumes/:id',
            deleteResume: 'DELETE /api/resumes/:id'
        },
        timestamp: new Date().toISOString()
    });
};

module.exports = {
    createResume,
    getUserResumes,
    getResume,
    updateResume,
    deleteResume,
    testRoute
};