const express = require('express');
const router = express.Router();
const resumeController = require('../controllers/resumeController');
const { authenticateAdmin } = require('../middlewares/adminAuth');
const PermissionMiddleware = require('../middlewares/permission');

// All routes require authentication
router.use(authenticateAdmin);

// Get all resumes with pagination and filters
router.get('/',
    PermissionMiddleware.checkPermission('resumes.view'),
    resumeController.getAllResumes
);

// Search resumes
router.get('/search',
    PermissionMiddleware.checkPermission('resumes.view'),
    resumeController.searchResumes
);

// Get resume by ID
router.get('/:id',
    PermissionMiddleware.checkPermission('resumes.view'),
    resumeController.getResumeById
);

// Update resume
router.put('/:id',
    PermissionMiddleware.checkPermission('resumes.edit'),
    resumeController.updateResume
);

// Delete resume
router.delete('/:id',
    PermissionMiddleware.checkPermission('resumes.delete'),
    resumeController.deleteResume
);

// Export resumes
router.get('/export/data',
    PermissionMiddleware.checkPermission('resumes.export'),
    resumeController.exportResumes
);

// Get resume statistics
router.get('/stats/overview',
    PermissionMiddleware.checkPermission('resumes.view'),
    resumeController.getResumeStats
);

// Bulk actions
router.post('/bulk/action',
    PermissionMiddleware.checkPermission('resumes.manage'),
    resumeController.bulkAction
);

// Resume specific operations
router.post('/:id/notes',
    PermissionMiddleware.checkPermission('resumes.edit'),
    resumeController.addAdminNote
);

router.post('/:id/flags',
    PermissionMiddleware.checkPermission('resumes.edit'),
    resumeController.addFlag
);

router.delete('/:id/flags/:flag',
    PermissionMiddleware.checkPermission('resumes.edit'),
    resumeController.removeFlag
);

router.put('/:id/status',
    PermissionMiddleware.checkPermission('resumes.edit'),
    resumeController.updateStatus
);

router.put('/:id/feature',
    PermissionMiddleware.checkPermission('resumes.manage'),
    resumeController.toggleFeatured
);

// Resume preview (HTML/PDF)
router.get('/:id/preview',
    PermissionMiddleware.checkPermission('resumes.view'),
    resumeController.previewResume
);

// Download resume file
router.get('/:id/download',
    PermissionMiddleware.checkPermission('resumes.view'),
    resumeController.downloadResume
);

// Resume analytics
router.get('/:id/analytics',
    PermissionMiddleware.checkPermission('resumes.view'),
    resumeController.getResumeAnalytics
);

// Duplicate resume
router.post('/:id/duplicate',
    PermissionMiddleware.checkPermission('resumes.create'),
    resumeController.duplicateResume
);

// Restore deleted resume
router.post('/:id/restore',
    PermissionMiddleware.checkPermission('resumes.edit'),
    resumeController.restoreResume
);

// Permanent delete
router.delete('/:id/permanent',
    PermissionMiddleware.checkPermission('resumes.delete'),
    resumeController.permanentDelete
);

module.exports = router;