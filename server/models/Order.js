const mongoose = require("mongoose");

// ==========================================
// Product Snapshot Schema
// ==========================================
const productSnapshotSchema = new mongoose.Schema(
    {
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true,
        },
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
            default: "",
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
        color: {
            type: String,

            trim: true,
            required: true
        },
        size: {
            type: String,
            default: "",
            trim: true,
        },
        quantity: {
            type: Number,
            required: true,
            min: 1,
        },
        price: {
            type: Number,
            required: true,
            min: 0,
        },
        salePrice: {
            type: Number,
            default: null,
        },
        totalPrice: {
            type: Number,
            required: true,
            min: 0,
        },
    },
    {
        _id: false,
    }
);

// ==========================================
// Shipping Address Schema
// ==========================================
const shippingSchema = new mongoose.Schema(
    {
        fullName: {
            type: String,
            required: true,
            trim: true,
        },
        phone: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            default: "",
            trim: true,
            lowercase: true,
        },
        address: {
            type: String,
            required: true,
            trim: true,
        },
        area: {
            type: String,
            default: "",
            trim: true,
        },
        city: {
            type: String,
            required: true,
            trim: true,
        },
        postalCode: {
            type: String,
            default: "",
            trim: true,
        },
        country: {
            type: String,
            default: "Bangladesh",
        },
    },
    {
        _id: false,
    }
);

// ==========================================
// Timeline Schema
// ==========================================
const timelineSchema = new mongoose.Schema(
    {
        status: {
            type: String,
            required: true,
        },
        message: {
            type: String,
            default: "",
        },
        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
        createdAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        _id: false,
    }
);

// ==========================================
// Main Order Schema
// ==========================================
const orderSchema = new mongoose.Schema(
    {
        customer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: false,
            default: null,
        },
        isGuest: {
            type: Boolean,
            default: false,
        },
        orderNumber: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        invoiceNumber: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        products: {
            type: [productSnapshotSchema],
            required: true,
            validate: {
                validator: (value) => Array.isArray(value) && value.length > 0,
                message: "At least one product is required.",
            },
        },
        shipping: {
            type: shippingSchema,
            required: true,
        },
        payment: {
            method: {
                type: String,
                enum: [
                    "cash-on-delivery",
                    "bkash",
                    "nagad",
                    "sslcommerz",
                    "stripe",
                ],
                default: "cash-on-delivery",
            },
            status: {
                type: String,
                enum: [
                    "pending",
                    "paid",
                    "failed",
                    "refunded",
                ],
                default: "pending",
            },
            transactionId: {
                type: String,
                default: "",
            },
        },
        subtotal: {
            type: Number,
            required: true,
            min: 0,
        },
        deliveryCharge: {
            type: Number,
            default: 0,
        },
        discount: {
            type: Number,
            default: 0,
        },
        couponCode: {
            type: String,
            default: "",
            trim: true,
        },
        grandTotal: {
            type: Number,
            required: true,
            min: 0,
        },
        orderStatus: {
            type: String,
            enum: [
                "pending",
                "confirmed",
                "processing",
                "packed",
                "shipped",
                "delivered",
                "cancelled",
                "returned",
            ],
            default: "pending",
        },
        customerNote: {
            type: String,
            default: "",
            trim: true,
        },
        adminNote: {
            type: String,
            default: "",
            trim: true,
        },
        timeline: {
            type: [timelineSchema],
            default: [
                {
                    status: "pending",
                    message: "Order has been placed.",
                },
            ],
        },
        isCancelled: {
            type: Boolean,
            default: false,
        },
        isDelivered: {
            type: Boolean,
            default: false,
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
orderSchema.index({ customer: 1 });
// orderSchema.index({ orderNumber: 1 });
// orderSchema.index({ invoiceNumber: 1 });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ "payment.status": 1 });
orderSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Order", orderSchema);







// const mongoose = require("mongoose");

// // ==========================================
// // Product Snapshot Schema
// // ==========================================
// const productSnapshotSchema = new mongoose.Schema(
//     {
//         product: {
//             type: mongoose.Schema.Types.ObjectId,
//             ref: "Product",
//             required: true,
//         },
//         name: {
//             type: String,
//             required: true,
//             trim: true,
//         },
//         slug: {
//             type: String,
//             required: true,
//             trim: true,
//         },
//         sku: {
//             type: String,
//             default: "",
//             trim: true,
//         },
//         thumbnail: {
//             url: {
//                 type: String,
//                 default: "",
//             },
//             public_id: {
//                 type: String,
//                 default: "",
//             },
//         },
//         gallery: [
//             {
//                 url: {
//                     type: String,
//                     default: "",
//                 },
//                 public_id: {
//                     type: String,
//                     default: "",
//                 },
//             },
//         ],
//         color: {
//             type: String,
//             default: "",
//             trim: true,
//         },
//         size: {
//             type: String,
//             default: "",
//             trim: true,
//         },
//         quantity: {
//             type: Number,
//             required: true,
//             min: 1,
//         },
//         price: {
//             type: Number,
//             required: true,
//             min: 0,
//         },
//         salePrice: {
//             type: Number,
//             default: null,
//         },
//         totalPrice: {
//             type: Number,
//             required: true,
//             min: 0,
//         },
//     },
//     {
//         _id: false,
//     }
// );

// // ==========================================
// // Shipping Address Schema
// // ==========================================
// const shippingSchema = new mongoose.Schema(
//     {
//         fullName: {
//             type: String,
//             required: true,
//             trim: true,
//         },
//         phone: {
//             type: String,
//             required: true,
//             trim: true,
//         },
//         email: {
//             type: String,
//             default: "",
//             trim: true,
//             lowercase: true,
//         },
//         address: {
//             type: String,
//             required: true,
//             trim: true,
//         },
//         area: {
//             type: String,
//             default: "",
//             trim: true,
//         },
//         city: {
//             type: String,
//             required: true,
//             trim: true,
//         },
//         postalCode: {
//             type: String,
//             default: "",
//             trim: true,
//         },
//         country: {
//             type: String,
//             default: "Bangladesh",
//         },
//     },
//     {
//         _id: false,
//     }
// );

// // ==========================================
// // Timeline Schema
// // ==========================================
// const timelineSchema = new mongoose.Schema(
//     {
//         status: {
//             type: String,
//             required: true,
//         },
//         message: {
//             type: String,
//             default: "",
//         },
//         updatedBy: {
//             type: mongoose.Schema.Types.ObjectId,
//             ref: "User",
//             default: null,
//         },
//         createdAt: {
//             type: Date,
//             default: Date.now,
//         },
//     },
//     {
//         _id: false,
//     }
// );

// // ==========================================
// // Main Order Schema
// // ==========================================
// const orderSchema = new mongoose.Schema(
//     {
//         customer: {
//             type: mongoose.Schema.Types.ObjectId,
//             ref: "User",
//             required: false,
//             default: null,
//         },
//         isGuest: {
//             type: Boolean,
//             default: false,
//         },
//         orderNumber: {
//             type: String,
//             required: true,
//             unique: true,
//             trim: true,
//         },
//         invoiceNumber: {
//             type: String,
//             required: true,
//             unique: true,
//             trim: true,
//         },
//         products: {
//             type: [productSnapshotSchema],
//             required: true,
//             validate: {
//                 validator: (value) => Array.isArray(value) && value.length > 0,
//                 message: "At least one product is required.",
//             },
//         },
//         shipping: {
//             type: shippingSchema,
//             required: true,
//         },
//         payment: {
//             method: {
//                 type: String,
//                 enum: [
//                     "cash-on-delivery",
//                     "bkash",
//                     "nagad",
//                     "sslcommerz",
//                     "stripe",
//                 ],
//                 default: "cash-on-delivery",
//             },
//             status: {
//                 type: String,
//                 enum: [
//                     "pending",
//                     "paid",
//                     "failed",
//                     "refunded",
//                 ],
//                 default: "pending",
//             },
//             transactionId: {
//                 type: String,
//                 default: "",
//             },
//         },
//         subtotal: {
//             type: Number,
//             required: true,
//             min: 0,
//         },
//         deliveryCharge: {
//             type: Number,
//             default: 0,
//         },
//         discount: {
//             type: Number,
//             default: 0,
//         },
//         couponCode: {
//             type: String,
//             default: "",
//             trim: true,
//         },
//         grandTotal: {
//             type: Number,
//             required: true,
//             min: 0,
//         },
//         orderStatus: {
//             type: String,
//             enum: [
//                 "pending",
//                 "confirmed",
//                 "processing",
//                 "packed",
//                 "shipped",
//                 "delivered",
//                 "cancelled",
//                 "returned",
//             ],
//             default: "pending",
//         },
//         customerNote: {
//             type: String,
//             default: "",
//             trim: true,
//         },
//         adminNote: {
//             type: String,
//             default: "",
//             trim: true,
//         },
//         timeline: {
//             type: [timelineSchema],
//             default: [
//                 {
//                     status: "pending",
//                     message: "Order has been placed.",
//                 },
//             ],
//         },
//         isCancelled: {
//             type: Boolean,
//             default: false,
//         },
//         isDelivered: {
//             type: Boolean,
//             default: false,
//         },
//     },
//     {
//         timestamps: true,
//         versionKey: false,
//     }
// );

// // ==========================================
// // Indexes
// // ==========================================
// orderSchema.index({ customer: 1 });
// // orderSchema.index({ orderNumber: 1 });
// // orderSchema.index({ invoiceNumber: 1 });
// orderSchema.index({ orderStatus: 1 });
// orderSchema.index({ "payment.status": 1 });
// orderSchema.index({ createdAt: -1 });

// module.exports = mongoose.model("Order", orderSchema);