const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema(
    {
        fullName: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100,
        },

        email: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
        },

        phone: {
            type: String,
            trim: true,
            default: "",
        },

        subject: {
            type: String,
            required: true,
            trim: true,
            maxlength: 150,
        },

        message: {
            type: String,
            required: true,
            trim: true,
            maxlength: 5000,
        },

        status: {
            type: String,
            enum: [
                "new",
                "read",
                "replied",
                "closed",
            ],
            default: "new",
        },

        isRead: {
            type: Boolean,
            default: false,
        },

        replied: {
            type: Boolean,
            default: false,
        },

        repliedAt: {
            type: Date,
            default: null,
        },

        adminReply: {
            type: String,
            default: "",
            trim: true,
        },

        adminNote: {
            type: String,
            default: "",
            trim: true,
        },

        isDeleted: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

// =====================================
// Indexes
// =====================================

contactSchema.index({ email: 1 });

contactSchema.index({ status: 1 });

contactSchema.index({ createdAt: -1 });

contactSchema.index({ isDeleted: 1 });

// =====================================

module.exports = mongoose.model(
    "Contact",
    contactSchema
);