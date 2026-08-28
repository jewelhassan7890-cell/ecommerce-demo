const User = require("../models/auth");
const cloudinary = require("../config/cloudinary");
const fs = require("fs");
const path = require("path");

// 👉 সব ইউজার দেখানো
const getAllUsers = async (req, res) => {
    try {
        // check admin
        if (!req.user.isAdmin) {
            return res.status(403).json({ message: "Only admins can view all users!" });
        }

        const users = await User.find().select("-password");
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// 👉 নির্দিষ্ট একজন ইউজার
const getSingleUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found!" });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};


const deleteUser = async (req, res) => {
    try {
        // ১. লগইন করা ইউজার admin কিনা চেক
        if (!req.user.isAdmin) {
            return res.status(403).json({ message: "Only admins can delete users!" });
        }

        // ২. ডিলিট করার আগে ইউজার ডাটাবেজে আছে কিনা খুঁজে বের করা
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: "User not found!" });
        }

        // ৩. Cloudinary থেকে প্রোফাইল পিকচার ডিলিট করা (যদি public_id থাকে)
        if (user.profilePic && user.profilePic.public_id) {
            try {
                await cloudinary.uploader.destroy(user.profilePic.public_id);
            } catch (cloudErr) {
                console.error("Cloudinary Image Delete Error:", cloudErr);
                // ছবির ডিলিটে সমস্যা হলেও ইউজারের ডাটা মুছে ফেলার প্রক্রিয়া যেন আটকে না যায়
            }
        }

        // ৪. MongoDB ডাটাবেজ থেকে ইউজার ডিলিট করা
        await User.findByIdAndDelete(req.params.id);

        res.status(200).json({ message: "User and profile image deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};





// ✅ Toggle Admin
const toggleAdmin = async (req, res) => {
    const userId = req.params.id;
    const { isAdmin } = req.body;

    try {
        // user খুঁজে পাওয়া
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Update isAdmin field
        user.isAdmin = isAdmin;
        await user.save();

        res.status(200).json({
            message: `User admin status updated successfully`,
            user,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};



module.exports = {
    getAllUsers,
    getSingleUser,
    deleteUser,
    toggleAdmin,

};
