
const Category = require("../models/Category");
const ApiError = require("../utils/ApiError");

// ======================================================
// Create Category
// Admin
// ======================================================

const createCategory = async (payload) => {

    // ==========================================
    // Check Duplicate Name
    // ==========================================

    const exists = await Category.findOne({

        $or: [

            {

                name: payload.name,

            },

            {

                slug: payload.slug,

            },

        ],

        isDeleted: false,

    });

    if (exists) {

        throw new ApiError(

            409,

            "Category already exists."

        );

    }

    // ==========================================
    // Create Category
    // ==========================================

    const category = await Category.create({

        ...payload,

    });

    return category;

};

// ======================================================
// Get Single Category
// Public / Admin
// ======================================================

const getCategoryById = async (categoryId) => {

    const category = await Category.findOne({

        _id: categoryId,

        isDeleted: false,

    })

        .populate(

            "parentCategory",

            "name slug"

        )

        .lean();

    if (!category) {

        throw new ApiError(

            404,

            "Category not found."

        );

    }

    return category;

};

// ======================================================
// Get Public Categories
// ======================================================

const getPublicCategories = async () => {

    const categories = await Category.find({

        isActive: true,

        isDeleted: false,

    })

        .populate(

            "parentCategory",

            "name slug"

        )

        .sort({

            sortOrder: 1,

            name: 1,

        })

        .lean();

    return categories;

};




// ======================================================
// Get All Categories (Admin)
// Search + Filter + Pagination
// ======================================================

// const getAllCategories = async (query) => {

//     const {

//         page = 1,

//         limit = 10,

//         search,

//         isActive,

//         sort = "newest",

//     } = query;

//     // ==========================================
//     // Filter
//     // ==========================================

//     const filter = {

//         isDeleted: false,

//     };

//     // ==========================================
//     // Search
//     // ==========================================

//     if (search) {

//         filter.$or = [

//             {

//                 name: {

//                     $regex: search,

//                     $options: "i",

//                 },

//             },

//             {

//                 slug: {

//                     $regex: search,

//                     $options: "i",

//                 },

//             },

//             {

//                 description: {

//                     $regex: search,

//                     $options: "i",

//                 },

//             },

//         ];

//     }

//     // ==========================================
//     // Active Filter
//     // ==========================================

//     if (isActive !== undefined) {

//         filter.isActive =

//             isActive === "true";

//     }

//     // ==========================================
//     // Sorting
//     // ==========================================

//     let sortOption = {

//         createdAt: -1,

//     };

//     switch (sort) {

//         case "oldest":

//             sortOption = {

//                 createdAt: 1,

//             };

//             break;

//         case "a-z":

//             sortOption = {

//                 name: 1,

//             };

//             break;

//         case "z-a":

//             sortOption = {

//                 name: -1,

//             };

//             break;

//         default:

//             sortOption = {

//                 createdAt: -1,

//             };

//     }

//     // ==========================================
//     // Pagination
//     // ==========================================

//     const currentPage = Number(page);

//     const perPage = Number(limit);

//     const skip =

//         (currentPage - 1) * perPage;

//     // ==========================================
//     // Database Query
//     // ==========================================

//     const [

//         categories,

//         totalCategories,

//     ] = await Promise.all([

//         Category.find(filter)

//             .populate(

//                 "parentCategory",

//                 "name slug"

//             )

//             .sort(sortOption)

//             .skip(skip)

//             .limit(perPage)

//             .lean(),

//         Category.countDocuments(filter),

//     ]);

//     // ==========================================
//     // Response
//     // ==========================================

//     return {

//         categories,

//         pagination: {

//             page: currentPage,

//             limit: perPage,

//             totalCategories,

//             totalPages: Math.ceil(

//                 totalCategories / perPage

//             ),

//         },

//     };

// };



// category.service.js


const getAllCategories = async (queryParams) => {
    // Query parameters রিসিভ করা এবং Default value সেট করা
    const page = parseInt(queryParams.page, 10) || 1;
    const limit = parseInt(queryParams.limit, 10) || 10;
    const search = queryParams.search ? queryParams.search.trim() : "";

    const skip = (page - 1) * limit;

    // Filter Object তৈরি
    const filter = {};

    // search খালি না থাকলে তবেই $regex ফিল্টার যোগ হবে
    if (search !== "") {
        filter.name = { $regex: search, $options: "i" };
    }

    // Database Query Execution
    const categories = await Category.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    const total = await Category.countDocuments(filter);

    return {
        data: categories,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    };
};



// ======================================================
// Update Category
// Admin
// ======================================================

const updateCategory = async (
    categoryId,
    payload
) => {

    const category = await Category.findOne({

        _id: categoryId,

        isDeleted: false,

    });

    if (!category) {

        throw new ApiError(

            404,

            "Category not found."

        );

    }

    // ==========================================
    // Duplicate Check
    // ==========================================

    if (payload.name || payload.slug) {

        const exists = await Category.findOne({

            _id: {

                $ne: categoryId,

            },

            isDeleted: false,

            $or: [

                {

                    name: payload.name,

                },

                {

                    slug: payload.slug,

                },

            ],

        });

        if (exists) {

            throw new ApiError(

                409,

                "Category name or slug already exists."

            );

        }

    }

    Object.assign(

        category,

        payload

    );

    await category.save();

    return category;

};

// ======================================================
// Toggle Active
// Admin
// ======================================================

const toggleCategoryStatus = async (
    categoryId
) => {

    const category = await Category.findOne({

        _id: categoryId,

        isDeleted: false,

    });

    if (!category) {

        throw new ApiError(

            404,

            "Category not found."

        );

    }

    category.isActive = !category.isActive;

    await category.save();

    return category;

};

// ======================================================
// Soft Delete
// Admin
// ======================================================

const deleteCategory = async (
    categoryId
) => {

    const category = await Category.findOne({

        _id: categoryId,

        isDeleted: false,

    });

    if (!category) {

        throw new ApiError(

            404,

            "Category not found."

        );

    }

    category.isDeleted = true;

    category.deletedAt = new Date();

    await category.save();

    return {

        message:

            "Category deleted successfully.",

    };

};

// ======================================================
// Restore Category
// Admin
// ======================================================

const restoreCategory = async (
    categoryId
) => {

    const category = await Category.findOne({

        _id: categoryId,

        isDeleted: true,

    });

    if (!category) {

        throw new ApiError(

            404,

            "Category not found."

        );

    }

    category.isDeleted = false;

    category.deletedAt = null;

    await category.save();

    return category;

};

// ======================================================
// Module Exports
// ======================================================

module.exports = {

    // ==========================================
    // Part 3.1
    // ==========================================

    createCategory,

    getCategoryById,

    getPublicCategories,

    // ==========================================
    // Part 3.2
    // ==========================================

    getAllCategories,

    // ==========================================
    // Part 3.3
    // ==========================================

    updateCategory,

    toggleCategoryStatus,

    deleteCategory,

    restoreCategory,

};











