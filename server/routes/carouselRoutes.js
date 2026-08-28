const express = require('express');
const router = express.Router();
const {
    createCarousel,
    getPublicCarousels,
    deleteCarousel,
} = require('../controllers/carouselController');

const { upload } = require('../config/reviewcloudinary');

const authMiddleware = require("../utils/verifyToken");
const isAdmin = require("../utils/isAdmin");

// Public Route (ক্যারোসলে ছবি দেখানোর জন্য)
router.get('/', getPublicCarousels);

// Admin Routes (ছবি আপলোড ও ডিলিটের জন্য)
router.post('/', authMiddleware, isAdmin, upload.single('image'), createCarousel);
router.delete('/:id', authMiddleware, isAdmin, deleteCarousel);

module.exports = router;