// const { body, validationResult } = require("express-validator");

// // ভ্যালিডেশন এরর হ্যান্ডলার মিডলওয়্যার
// const validate = (req, res, next) => {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//         return res.status(400).json({
//             success: false,
//             errors: errors.array().map((err) => ({
//                 field: err.path,
//                 message: err.msg,
//             })),
//         });
//     }
//     next();
// };

// // ==========================================
// // Create Product Validation
// // ==========================================
// exports.createProductValidation = [
//     body("name")
//         .notEmpty()
//         .withMessage("Product name is required.")
//         .isLength({ max: 200 })
//         .withMessage("Name cannot exceed 200 characters."),

//     body("category")
//         .notEmpty()
//         .withMessage("Category ID is required.")
//         .isMongoId()
//         .withMessage("Invalid Category ID format."),

//     body("price")
//         .notEmpty()
//         .withMessage("Price is required.")
//         .isFloat({ min: 0 })
//         .withMessage("Price must be a positive number."),

//     body("salePrice")
//         .optional({ nullable: true })
//         .isFloat({ min: 0 })
//         .withMessage("Sale price must be a positive number.")
//         .custom((value, { req }) => {
//             if (value && Number(value) >= Number(req.body.price)) {
//                 throw new Error("Sale price must be less than regular price.");
//             }
//             return true;
//         }),

//     body("stock")
//         .optional()
//         .isInt({ min: 0 })
//         .withMessage("Stock must be an integer (0 or more)."),

//     body("stockStatus")
//         .optional()
//         .isIn(["in-stock", "out-of-stock", "pre-order"])
//         .withMessage("Invalid stock status value."),

//     validate,
// ];

// // ==========================================
// // Update Product Validation
// // ==========================================
// exports.updateProductValidation = [
//     body("name")
//         .optional()
//         .isLength({ max: 200 })
//         .withMessage("Name cannot exceed 200 characters."),

//     body("category")
//         .optional()
//         .isMongoId()
//         .withMessage("Invalid Category ID format."),

//     body("price")
//         .optional()
//         .isFloat({ min: 0 })
//         .withMessage("Price must be a positive number."),

//     body("salePrice")
//         .optional({ nullable: true })
//         .isFloat({ min: 0 })
//         .withMessage("Sale price must be a positive number."),

//     body("stock")
//         .optional()
//         .isInt({ min: 0 })
//         .withMessage("Stock must be an integer."),

//     body("stockStatus")
//         .optional()
//         .isIn(["in-stock", "out-of-stock", "pre-order"])
//         .withMessage("Invalid stock status value."),

//     validate,
// ];



const { validationResult } = require("express-validator");

// 1. Validation Error Handling Middleware
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array().map((err) => ({
                field: err.path,
                message: err.msg,
            })),
        });
    }
    next();
};

// 2. Rules
const createProductValidation = [
    // আপনার তৈরি করা express-validator এর নিয়মসমূহ এখানে থাকবে
];

const updateProductValidation = [
    // আপনার তৈরি করা express-validator এর নিয়মসমূহ এখানে থাকবে
];

// ⚠️ নিশ্চিত করুন এগুলো সঠিকভাবে Export করা হয়েছে!
module.exports = {
    validate,
    createProductValidation,
    updateProductValidation,
};