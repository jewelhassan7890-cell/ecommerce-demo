const mongoose = require("mongoose");

const faqSchema = new mongoose.Schema(
    {
        question: {
            type: String,
            required: [true, "Question is required"],
            trim: true,
        },
        answer: {
            type: String,
            required: [true, "Answer is required"],
            trim: true,
        },
        category: {
            type: String,
            default: "General", // e.g., Shipping, Payment, Return
            trim: true,
        },
        isActive: {
            type: Boolean,
            default: true, // ওয়েবসাইট বা ফ্রন্টএন্ডে দেখাবে কি না
        },
        order: {
            type: Number,
            default: 0, // কোন প্রশ্নের পর কোনটা দেখাবে তা কন্ট্রোল করার জন্য
        },
    },
    {
        timestamps: true, // createdAt and updatedAt auto gen
    }
);

module.exports = mongoose.model("Faq", faqSchema);