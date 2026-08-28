const express = require("express");
const router = express.Router();
const multer = require("multer");

const {
    getSiteSettings,
    updateSiteSettings,
} = require("../controllers/siteSettingController");

// Auth Middleware
const authMiddleware = require("../utils/verifyToken");
const isAdmin = require("../utils/isAdmin");

// Multer Memory Storage Configuration
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: { fileSize: 3 * 1024 * 1024 }, // Max 3MB
});

// Logo এবং Favicon একসাথে হ্যান্ডেল করার ফিল্ডস
const uploadFields = upload.fields([
    { name: "logo", maxCount: 1 },
    { name: "favicon", maxCount: 1 },
]);

// Public Route
router.get("/", getSiteSettings);

// Admin Route (Create / Update Settings & Logo)
router.post("/", authMiddleware, isAdmin, uploadFields, updateSiteSettings);

module.exports = router;