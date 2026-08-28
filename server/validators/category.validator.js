const { body, param, query, validationResult } = require("express-validator");
const validate = require("../middlewares/validate.middleware");

// ==========================================
// 1. Create Category Validation
// ==========================================
const createCategoryValidation = [
    body("name")
        .trim()
        .notEmpty()
        .withMessage("Category name is required.")
        .isLength({ max: 100 })
        .withMessage("Category name cannot exceed 100 characters."),

    body("slug")
        .trim()
        .notEmpty()
        .withMessage("Category slug is required.")
        .isSlug()
        .withMessage("Invalid slug format. Use lowercase letters, numbers, and hyphens.")
        .toLowerCase(),

    body("description")
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage("Description cannot exceed 500 characters."),

    body("image.url")
        .optional()
        .trim()
        .isURL()
        .withMessage("Image URL must be a valid URL."),

    body("image.public_id")
        .optional()
        .trim()
        .isString()
        .withMessage("Image public_id must be a string."),

    body("parentCategory")
        .optional({ nullable: true })
        .isMongoId()
        .withMessage("Parent category must be a valid MongoDB ID."),

    body("seo.metaTitle")
        .optional()
        .trim()
        .isLength({ max: 150 })
        .withMessage("Meta title cannot exceed 150 characters."),

    body("seo.metaDescription")
        .optional()
        .trim()
        .isLength({ max: 300 })
        .withMessage("Meta description cannot exceed 300 characters."),

    body("seo.keywords")
        .optional()
        .isArray()
        .withMessage("Keywords must be an array of strings."),

    body("seo.keywords.*")
        .optional()
        .trim()
        .isString()
        .withMessage("Each keyword must be a string."),

    body("sortOrder")
        .optional()
        .isInt({ min: 0 })
        .withMessage("Sort order must be a positive integer."),

    body("isActive")
        .optional()
        .isBoolean()
        .withMessage("isActive must be a boolean value."),

    validate,
];

// ==========================================
// 2. Update Category Validation
// ==========================================
const updateCategoryValidation = [
    param("id")
        .isMongoId()
        .withMessage("Invalid Category Mongo ID format."),

    body("name")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("Category name cannot be empty.")
        .isLength({ max: 100 })
        .withMessage("Category name cannot exceed 100 characters."),

    body("slug")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("Category slug cannot be empty.")
        .isSlug()
        .withMessage("Invalid slug format.")
        .toLowerCase(),

    body("description")
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage("Description cannot exceed 500 characters."),

    body("parentCategory")
        .optional({ nullable: true })
        .isMongoId()
        .withMessage("Parent category must be a valid MongoDB ID."),

    body("sortOrder")
        .optional()
        .isInt({ min: 0 })
        .withMessage("Sort order must be a positive integer."),

    body("isActive")
        .optional()
        .isBoolean()
        .withMessage("isActive must be a boolean value."),

    validate,
];

// ==========================================
// 3. Category ID Param Validation
// ==========================================
const categoryIdValidation = [
    param("id")
        .isMongoId()
        .withMessage("Invalid Category Mongo ID format."),

    validate,
];

// ==========================================
// 4. Get Categories Query Validation (Admin Search/Filter)
// ==========================================
const getCategoriesValidation = [
    query("page")
        .optional({ checkFalsy: true })
        .isInt({ min: 1 })
        .withMessage("Page must be a positive integer"),

    query("limit")
        .optional({ checkFalsy: true })
        .isInt({ min: 1, max: 100 })
        .withMessage("Limit must be between 1 and 100"),

    query("search")
        .optional({ checkFalsy: true })
        .isString()
        .trim(),

    query("isActive")
        .optional({ checkFalsy: true })
        .isIn(["true", "false"])
        .withMessage("isActive must be true or false"),

    query("sort")
        .optional({ checkFalsy: true })
        .isIn(["newest", "oldest", "a-z", "z-a"])
        .withMessage("Invalid sort parameter."),

    validate,
];

// ==========================================
// Module Exports
// ==========================================
module.exports = {
    createCategoryValidation,
    updateCategoryValidation,
    categoryIdValidation,
    getCategoriesValidation,
};