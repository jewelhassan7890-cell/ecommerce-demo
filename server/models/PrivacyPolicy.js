const mongoose = require("mongoose");

const sectionSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "Section title is required"],
        trim: true,
    },
    content: {
        type: String,
        required: [true, "Section content is required"],
    },
    bullets: [
        {
            type: String,
            trim: true,
        },
    ],
    order: {
        type: Number,
        default: 0,
    },
});

const privacyPolicySchema = new mongoose.Schema(
    {
        companyName: {
            type: String,
            required: true,
            default: "Style & Closet",
        },
        supportEmail: {
            type: String,
            required: true,
            default: "support@styleandcloset.com",
        },
        sections: [sectionSchema],
        isPublished: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("PrivacyPolicy", privacyPolicySchema);