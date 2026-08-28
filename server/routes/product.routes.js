const express = require("express");
const router = express.Router();

// Controllers & Middlewares
const productController = require("../controllers/product.controller");
const upload = require("../middlewares/multer.middleware");
const authMiddleware = require("../utils/verifyToken");
const isAdmin = require("../utils/isAdmin");

// Validators
const {
    createProductValidation,
    updateProductValidation,
    validate, // 👈 ভ্যালিডেশন এরর হ্যান্ডেল করার মিডলওয়্যার (যেমন: express-validator result handler)
} = require("../validators/product.validator");

// ==========================================
// Multer Image Upload Configuration
// ==========================================
const cpUpload = upload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "gallery", maxCount: 8 },
]);

// ==========================================
// 🌐 Public Routes
// ==========================================

// Get list of products with filters, search, pagination
router.get("/", productController.getProducts);

// Dynamic fetching by ID or Slug
router.get("/:identifier", productController.getProduct);


// ==========================================
// 🔒 Admin Routes
// ==========================================

// 1. Create Product
router.post(
    "/",
    authMiddleware,
    isAdmin,
    cpUpload,                   // ১. আগে ফাইল প্রসেস হবে
    createProductValidation,    // ২. তারপর ভ্যালিডেশন রুলস চেক হবে
    validate,                   // ৩. এরর থাকলে রেসপন্স ফেরত পাঠাবে
    productController.createProduct
);

// 2. Update Product
router.put(
    "/:id",
    authMiddleware,
    isAdmin,
    cpUpload,
    updateProductValidation,
    validate,
    productController.updateProduct
);

// 3. Delete Product
router.delete(
    "/:id",
    authMiddleware,
    isAdmin,
    productController.deleteProduct
);

// 4. Share Product Photo to Facebook Page (NEW)
router.put(
    "/:id/share-facebook-photo",
    authMiddleware,
    isAdmin,
    productController.shareToFacebookPhoto
);

router.put(
    "/:id/share-facebook-reel",
    authMiddleware,
    isAdmin,
    productController.shareToFacebookReel
);


module.exports = router;