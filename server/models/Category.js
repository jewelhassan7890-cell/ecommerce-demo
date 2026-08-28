const mongoose = require("mongoose");

// ==========================================
// Category Schema
// ==========================================

const categorySchema = new mongoose.Schema(

    {

        // ==================================
        // Basic Information
        // ==================================

        name: {

            type: String,

            required: [true, "Category name is required."],

            trim: true,

            unique: true,

            maxlength: 100,

        },

        slug: {

            type: String,

            required: true,

            trim: true,

            lowercase: true,

            unique: true,

        },

        description: {

            type: String,

            trim: true,

            default: "",

            maxlength: 500,

        },

        // ==================================
        // Category Image
        // ==================================

        image: {

            url: {

                type: String,

                default: "",

            },

            public_id: {

                type: String,

                default: "",

            },

        },

        // ==================================
        // Parent Category
        // ==================================

        parentCategory: {

            type: mongoose.Schema.Types.ObjectId,

            ref: "Category",

            default: null,

        },

        // ==================================
        // SEO
        // ==================================

        seo: {

            metaTitle: {

                type: String,

                trim: true,

                default: "",

            },

            metaDescription: {

                type: String,

                trim: true,

                default: "",

            },

            keywords: [

                {

                    type: String,

                    trim: true,

                },

            ],

        },

        // ==================================
        // Display Order
        // ==================================

        sortOrder: {

            type: Number,

            default: 0,

        },

        // ==================================
        // Status
        // ==================================

        isActive: {

            type: Boolean,

            default: true,

            index: true,

        },

        // ==================================
        // Soft Delete
        // ==================================

        isDeleted: {

            type: Boolean,

            default: false,

            index: true,

        },

        deletedAt: {

            type: Date,

            default: null,

        },

    },

    {

        timestamps: true,

        versionKey: false,

    }

);

// ==========================================
// Indexes
// ==========================================

// Search by parent category

categorySchema.index({

    parentCategory: 1,

});

// ==========================================

module.exports = mongoose.model(

    "Category",

    categorySchema

);

