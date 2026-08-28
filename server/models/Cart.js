const mongoose = require("mongoose");

// ==========================================
// Cart Item Schema
// ==========================================

const cartItemSchema = new mongoose.Schema(
    {
        // ==========================================
        // Product
        // ==========================================

        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true,
        },

        // ==========================================
        // Product Snapshot
        // ==========================================

        name: {
            type: String,
            required: true,
            trim: true,
        },

        slug: {
            type: String,
            required: true,
            trim: true,
        },

        sku: {
            type: String,
            required: true,
            trim: true,
        },

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

        // ==========================================
        // Variant
        // ==========================================

        color: {
            type: String,
            default: "",
            trim: true,
        },

        size: {
            type: String,
            default: "",
            trim: true,
        },

        // ==========================================
        // Quantity
        // ==========================================

        quantity: {
            type: Number,
            required: true,
            min: 1,
            default: 1,
        },

        // ==========================================
        // Price Snapshot
        // ==========================================

        price: {
            type: Number,
            required: true,
            min: 0,
        },

        salePrice: {
            type: Number,
            default: 0,
            min: 0,
        },

        unitPrice: {
            type: Number,
            required: true,
            min: 0,
        },

        totalPrice: {
            type: Number,
            required: true,
            min: 0,
        },
    },
    {
        _id: true,
    }
);

// ==========================================
// Cart Schema
// ==========================================

const cartSchema = new mongoose.Schema(
    {
        // ==========================================
        // Customer
        // ==========================================

        customer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
        },

        // ==========================================
        // Cart Items
        // ==========================================

        items: [cartItemSchema],

        // ==========================================
        // Cart Summary
        // ==========================================

        totalItems: {
            type: Number,
            default: 0,
            min: 0,
        },

        subtotal: {
            type: Number,
            default: 0,
            min: 0,
        },

        discount: {
            type: Number,
            default: 0,
            min: 0,
        },

        grandTotal: {
            type: Number,
            default: 0,
            min: 0,
        },

        // ==========================================
        // Coupon
        // ==========================================

        coupon: {
            code: {
                type: String,
                default: "",
            },

            discountType: {
                type: String,
                enum: ["percentage", "fixed", ""],
                default: "",
            },

            discountValue: {
                type: Number,
                default: 0,
            },
        },

        // ==========================================
        // Soft Delete
        // ==========================================

        isDeleted: {
            type: Boolean,
            default: false,
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



cartSchema.index({
    updatedAt: -1,
});

// ==========================================
// Export
// ==========================================

module.exports = mongoose.model("Cart", cartSchema);




