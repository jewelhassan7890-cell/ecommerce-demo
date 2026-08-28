const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
    {
        profilePic: {
            url: {
                type: String,
                default: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
            },
            public_id: {
                type: String,
                default: null, // Cloudinary-র ইমেজ ডিলিট করার জন্য প্রয়োজন
            },
        },
        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true,
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            trim: true,
            match: [
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                "Please enter a valid email address",
            ],
        },
        password: {
            type: String,
            required: function () {
                // গুগল দিয়ে সাইন আপ করলে পাসওয়ার্ড বাধ্যতামূলক নয়
                return !this.isGoogleAccount;
            },
        },
        isAdmin: {
            type: Boolean,
            default: false,
        },
        isGoogleAccount: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

// পাসওয়ার্ড হ্যাশ করার Pre-save Middleware
userSchema.pre("save", async function () {
    if (!this.isModified("password") || !this.password) {
        return;
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// পাসওয়ার্ড ম্যাচ করার কাস্টম মেথড
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);
module.exports = User;