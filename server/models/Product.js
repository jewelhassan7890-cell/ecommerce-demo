const mongoose = require("mongoose");

// ==========================================
// Product Schema
// ==========================================

const productSchema = new mongoose.Schema(
    {
        // ==================================
        // Basic Information
        // ==================================

        name: {
            type: String,
            required: [true, "Product name is required."],
            trim: true,
            maxlength: 200,
        },

        slug: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },

        sku: {
            type: String,
            required: true,
            unique: true,
            uppercase: true,
            trim: true,
        },

        shortDescription: {
            type: String,
            default: "",
            trim: true,
            maxlength: 500,
        },

        description: {
            type: String,
            default: "",
            trim: true,
        },

        // ==================================
        // Category
        // ==================================

        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            required: true,
        },

        // ==================================
        // Pricing
        // ==================================

        price: {
            type: Number,
            required: true,
            min: 0,
        },

        salePrice: {
            type: Number,
            default: null,
            min: 0,
        },

        currency: {
            type: String,
            default: "BDT",
        },

        // ==================================
        // Inventory
        // ==================================

        stock: {
            type: Number,
            default: 0,
            min: 0,
        },

        stockStatus: {
            type: String,
            enum: [
                "in-stock",
                "out-of-stock",
                "pre-order",
            ],
            default: "in-stock",
        },

        // ==================================
        // Thumbnail
        // ==================================

        thumbnail: {
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
        // Product Gallery
        // ==================================

        gallery: [
            {
                url: {
                    type: String,
                    default: "",
                },

                public_id: {
                    type: String,
                    default: "",
                },
            },
        ],

        // ==================================
        // Facebook Embed & Social Media Integration (NEW)
        // ==================================

        facebookEmbed: {
            // ফেসবুক রিলস / ভিডিও লিংক অথবা iframe কোড
            reelUrl: {
                type: String,
                default: "",
                trim: true,
            },

            // ফেসবুক ইমেজ পোস্টের ডিরেক্ট লিংক বা Embed URL
            photoPostUrl: {
                type: String,
                default: "",
                trim: true,
            },

            // Graph API দিয়ে অটো-পোস্ট করা হলে তার ID ট্র্যাকিং
            fbPostId: {
                type: String,
                default: null,
            },

            fbReelId: {
                type: String,
                default: null,
            },

            lastFbPostAt: {
                type: Date,
                default: null,
            },
        },

        // ==================================
        // Variants
        // ==================================

        colors: [
            {
                type: String,
                trim: true,
                required: true

            },
        ],

        sizes: [
            {
                type: String,
                trim: true,
            },
        ],

        // ==================================
        // Shipping
        // ==================================

        shipping: {
            weight: {
                type: Number,
                default: 0,
            },

            freeShipping: {
                type: Boolean,
                default: false,
            },
        },

        // ==================================
        // SEO
        // ==================================

        seo: {
            metaTitle: {
                type: String,
                default: "",
                trim: true,
            },

            metaDescription: {
                type: String,
                default: "",
                trim: true,
            },

            keywords: [
                {
                    type: String,
                    trim: true,
                },
            ],
        },

        // ==================================
        // Status
        // ==================================

        isFeatured: {
            type: Boolean,
            default: false,
        },

        isNewArrival: {
            type: Boolean,
            default: false,
        },

        isOnSale: {
            type: Boolean,
            default: false,
        },

        isActive: {
            type: Boolean,
            default: true,
        },

        isDeleted: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,

        versionKey: false,

        toJSON: {
            virtuals: true,
        },

        toObject: {
            virtuals: true,
        },
    }
);

// ==========================================
// Virtual Discount Percentage
// ==========================================

productSchema.virtual("discountPercentage").get(function () {
    if (!this.salePrice || this.salePrice >= this.price) {
        return 0;
    }

    return Math.round(
        ((this.price - this.salePrice) / this.price) * 100
    );
});

// ==========================================
// MongoDB Indexes
// ==========================================

// Category Filter
productSchema.index({
    category: 1,
});

// Product Status
productSchema.index({
    isActive: 1,
    isDeleted: 1,
});

// Price Filter
productSchema.index({
    price: 1,
});

// Stock Filter
productSchema.index({
    stockStatus: 1,
});

// Newest Products
productSchema.index({
    createdAt: -1,
});

// Text Search
productSchema.index({
    name: "text",
    shortDescription: "text",
});

// ==========================================

module.exports = mongoose.model(
    "Product",
    productSchema
);