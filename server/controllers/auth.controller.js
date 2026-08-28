const User = require("../models/auth");
const generateToken = require("../utils/generateToken");
const { uploadToCloudinary } = require("../config/cloudinaryUpload");

// @desc    Register a new user
// @route   POST /api/v1/auth/register
// @access  Public
const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: "User already exists with this email" });
        }

        // ১. ডিফল্ট প্রোফাইল পিকচার ডাটা
        let profilePicData = {
            url: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
            public_id: null,
        };

        // ২. যদি ফাইল আপলোড করা হয়ে থাকে তবে Cloudinary-তে পাঠানো হবে
        if (req.file) {
            const uploadedImage = await uploadToCloudinary(req.file.buffer);
            profilePicData = {
                url: uploadedImage.secure_url || uploadedImage.url,
                public_id: uploadedImage.public_id,
            };
        }

        // ৩. ইউজার ডাটাবেজে তৈরি করা (profilePicData পাস করা হয়েছে)
        const user = await User.create({
            name,
            email,
            password,
            profilePic: profilePicData
        });

        res.status(201).json({
            success: true,
            message: "Registration successful",
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                isAdmin: user.isAdmin,
                profilePic: user.profilePic,
                token: generateToken(user._id),
            },
        });
    } catch (error) {
        console.error("Register Error:", error);
        res.status(500).json({ message: "Server error during registration", error: error.message });
    }
};

// @desc    Authenticate user & get token
// @route   POST /api/v1/auth/login
// @access  Public
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        if (user.isGoogleAccount && !user.password) {
            return res.status(400).json({
                message: "This account was created using Google. Please log in with Google.",
            });
        }

        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        res.status(200).json({
            success: true,
            message: "Login successful",
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                isAdmin: user.isAdmin,
                profilePic: user.profilePic,
                token: generateToken(user._id),
            },
        });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: "Server error during login" });
    }
};

// @desc    Google OAuth Sign-In / Sign-Up
// @route   POST /api/v1/auth/google
// @access  Public
const googleAuth = async (req, res) => {
    try {
        const { name, email, googlePhotoUrl } = req.body;

        if (!email) {
            return res.status(400).json({ message: "Email is required from Google response" });
        }

        let user = await User.findOne({ email });

        if (!user) {
            // নতুন ইউজার তৈরি
            user = await User.create({
                name: name || "Google User",
                email,
                isGoogleAccount: true,
                profilePic: {
                    url: googlePhotoUrl || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
                    public_id: null,
                },
            });
        }

        res.status(200).json({
            success: true,
            message: "Google login successful",
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                isAdmin: user.isAdmin,
                profilePic: user.profilePic,
                token: generateToken(user._id),
            },
        });
    } catch (error) {
        console.error("Google Auth Error:", error);
        res.status(500).json({ message: "Server error during Google auth" });
    }
};

// @desc    Get user profile
// @route   GET /api/v1/auth/profile
// @access  Private
const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({
            success: true,
            data: user,
        });
    } catch (error) {
        console.error("Get Profile Error:", error);
        res.status(500).json({ message: "Server error fetching profile" });
    }
};

module.exports = {
    registerUser,
    loginUser,
    googleAuth,
    getProfile,
};