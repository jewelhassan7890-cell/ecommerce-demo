
const categoryService = require("../services/category.service");

// ======================================================
// Create Category
// Admin
// ======================================================

const createCategory = async (req, res, next) => {

    try {

        const category = await categoryService.createCategory(

            req.body

        );

        return res.status(201).json({

            success: true,

            message: "Category created successfully.",

            data: category,

        });

    } catch (error) {

        next(error);

    }

};

// ======================================================
// Get Single Category
// ======================================================

const getCategoryById = async (req, res, next) => {

    try {

        const category = await categoryService.getCategoryById(

            req.params.id

        );

        return res.status(200).json({

            success: true,

            data: category,

        });

    } catch (error) {

        next(error);

    }

};

// ======================================================
// Get Public Categories
// ======================================================

const getPublicCategories = async (req, res, next) => {

    try {

        const categories = await categoryService.getPublicCategories();

        return res.status(200).json({

            success: true,

            total: categories.length,

            data: categories,

        });

    } catch (error) {

        next(error);

    }

};

// ======================================================
// Get All Categories (Admin)
// ======================================================

const getAllCategories = async (req, res, next) => {

    try {

        const result = await categoryService.getAllCategories(

            req.query

        );

        return res.status(200).json({

            success: true,

            ...result,

        });

    } catch (error) {

        next(error);

    }

};

// ======================================================
// Update Category
// ======================================================

const updateCategory = async (req, res, next) => {

    try {

        const category = await categoryService.updateCategory(

            req.params.id,

            req.body

        );

        return res.status(200).json({

            success: true,

            message: "Category updated successfully.",

            data: category,

        });

    } catch (error) {

        next(error);

    }

};

// ======================================================
// Toggle Category Status
// ======================================================

const toggleCategoryStatus = async (req, res, next) => {

    try {

        const category = await categoryService.toggleCategoryStatus(

            req.params.id

        );

        return res.status(200).json({

            success: true,

            message: `Category ${category.isActive

                    ? "activated"

                    : "deactivated"

                } successfully.`,

            data: category,

        });

    } catch (error) {

        next(error);

    }

};

// ======================================================
// Soft Delete Category
// ======================================================

const deleteCategory = async (req, res, next) => {

    try {

        const result = await categoryService.deleteCategory(

            req.params.id

        );

        return res.status(200).json({

            success: true,

            ...result,

        });

    } catch (error) {

        next(error);

    }

};

// ======================================================
// Restore Category
// ======================================================

const restoreCategory = async (req, res, next) => {

    try {

        const category = await categoryService.restoreCategory(

            req.params.id

        );

        return res.status(200).json({

            success: true,

            message: "Category restored successfully.",

            data: category,

        });

    } catch (error) {

        next(error);

    }

};

// ======================================================
// Module Exports
// ======================================================

module.exports = {

    createCategory,

    getCategoryById,

    getPublicCategories,

    getAllCategories,

    updateCategory,

    toggleCategoryStatus,

    deleteCategory,

    restoreCategory,

};

