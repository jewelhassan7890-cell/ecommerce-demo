const express = require("express");
const router = express.Router();
const multer = require("multer");

const {
    registerUser,
    loginUser,
    googleAuth,
    getProfile,
} = require("../controllers/auth.controller");
const authMiddleware = require("../utils/verifyToken");


// Memory Storage Configuration for Multer
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: { fileSize: 3 * 1024 * 1024 }, // 3MB Max File Size
});

// Public Routes
router.post("/register", upload.single("profilePic"), registerUser);
router.post("/login", loginUser);
router.post("/google", googleAuth);

// Protected Route
router.get("/profile", authMiddleware, getProfile);

module.exports = router;