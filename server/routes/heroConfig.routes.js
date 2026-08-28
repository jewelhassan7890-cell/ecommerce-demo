const express = require('express');
const router = express.Router();

const { getHeroConfig, updateHeroConfig } = require('../controllers/heroConfig.controller');
const authMiddleware = require('../utils/verifyToken');
const isAdmin = require('../utils/isAdmin');
const upload = require('../middlewares/multer.middleware');

// Public Route
router.get('/', getHeroConfig);

// Admin Route (Single File Upload Middleware: field name `image`)
router.post(
    '/admin',
    authMiddleware,
    isAdmin,
    upload.single('image'),
    updateHeroConfig
);

module.exports = router;