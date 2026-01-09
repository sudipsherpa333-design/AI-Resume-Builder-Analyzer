const express = require('express');
const router = express.Router();
const multer = require('multer');
const TemplateController = require('../controllers/TemplateController');
const adminAuth = require('../middlewares/adminAuth');
const { permissionCheck } = require('../middlewares/roleCheck');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = 'uploads/templates/';
        require('fs').mkdirSync(uploadDir, { recursive: true });
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// All routes require admin auth
router.use(adminAuth);

// Check template management permissions
router.use(permissionCheck('templates', 'view'));

// Template routes
router.get('/', TemplateController.getAllTemplates);
router.get('/categories', TemplateController.getCategories);
router.get('/export', TemplateController.exportTemplates);
router.get('/:id', TemplateController.getTemplateById);

// Protected routes (edit/delete permissions)
router.post('/', permissionCheck('templates', 'edit'), TemplateController.createTemplate);
router.post('/import', permissionCheck('templates', 'edit'), TemplateController.importTemplates);
router.post('/bulk-update', permissionCheck('templates', 'edit'), TemplateController.bulkUpdateTemplates);
router.post('/:id/duplicate', permissionCheck('templates', 'edit'), TemplateController.duplicateTemplate);
router.post('/:id/thumbnail',
    permissionCheck('templates', 'edit'),
    upload.single('thumbnail'),
    TemplateController.uploadThumbnail
);
router.put('/:id', permissionCheck('templates', 'edit'), TemplateController.updateTemplate);
router.delete('/:id', permissionCheck('templates', 'delete'), TemplateController.deleteTemplate);

module.exports = router;