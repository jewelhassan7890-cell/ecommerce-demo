const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema(
    {
        code: {
            type: String,
            required: [true, "কুপন কোড প্রদান করা বাধ্যতামূলক"],
            unique: true,
            uppercase: true,
            trim: true,
        },
        discountType: {
            type: String,
            enum: ["percentage", "fixed"],
            required: true,
            default: "fixed",
        },
        discountAmount: {
            type: Number,
            required: [true, "ডিসকাউন্টের পরিমাণ দিন"],
            min: [0, "ডিসকাউন্ট ০ এর কম হতে পারবে না"],
        },
        minOrderAmount: {
            type: Number,
            default: 0, // সর্বনিম্ন অর্ডারের লিমিট
        },
        maxDiscountAmount: {
            type: Number,
            default: null, // পার্সেন্টেজ ডিসকাউন্টের ক্ষেত্রে সর্বোচ্চ ডিসকাউন্ট সীমা
        },
        expiryDate: {
            type: Date,
            required: [true, "কুপনের মেয়াদ শেষ হওয়ার তারিখ দিন"],
        },
        usageLimit: {
            type: Number,
            default: null, // সর্বমোট ব্যবহারের সীমা (null = আনলিমিটেড)
        },
        usageCount: {
            type: Number,
            default: 0, // এখন পর্যন্ত কতবার ব্যবহার করা হয়েছে
        },
        userLimit: {
            type: Number,
            default: 1, // প্রতি ইউজার সর্বোচ্চ কতবার ব্যবহার করতে পারবে
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Coupon", couponSchema);



