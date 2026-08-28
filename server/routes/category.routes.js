const express = require("express");
const router = express.Router();

// ==========================================
// Controller
// ==========================================
const categoryController = require("../controllers/category.controller");

// ==========================================
// Validators
// ==========================================
const {
    createCategoryValidation,
    updateCategoryValidation,
    categoryIdValidation,
    getCategoriesValidation,
} = require("../validators/category.validator");

const authMiddleware = require("../utils/verifyToken");
const isAdmin = require("../utils/isAdmin");

// ==========================================
// Admin Routes (Specific Static Routes First)
// ==========================================

// Get All Categories (Admin)
router.get(
    "/admin",
    authMiddleware,
    isAdmin,
    getCategoriesValidation,
    categoryController.getAllCategories
);

// Create Category (Admin)
router.post(
    "/admin",
    authMiddleware,
    isAdmin,
    createCategoryValidation,
    categoryController.createCategory
);

// Toggle Active / Inactive
router.patch(
    "/admin/:id/toggle",
    authMiddleware,
    isAdmin,
    categoryIdValidation,
    categoryController.toggleCategoryStatus
);

// Restore Category
router.patch(
    "/admin/:id/restore",
    authMiddleware,
    isAdmin,
    categoryIdValidation,
    categoryController.restoreCategory
);

// Update Category
router.patch(
    "/admin/:id",
    authMiddleware,
    isAdmin,
    updateCategoryValidation,
    categoryController.updateCategory
);

// Soft Delete Category
router.delete(
    "/admin/:id",
    authMiddleware,
    isAdmin,
    categoryIdValidation,
    categoryController.deleteCategory
);

// ==========================================
// Public Routes
// ==========================================

// Get Public Categories
router.get(
    "/",
    categoryController.getPublicCategories
);

// Get Single Category (Dynamic Param :id MUST be at the bottom)
router.get(
    "/:id",
    categoryIdValidation,
    categoryController.getCategoryById
);

// ==========================================

module.exports = router;

