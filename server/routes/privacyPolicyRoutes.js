const express = require("express");
const {
    getPrivacyPolicy,
    updatePrivacyPolicy,
} = require("../controllers/privacyPolicyController");

// আপনার অথেন্টিকেশন ও এডমিন মিডলওয়্যার
const authMiddleware = require("../utils/verifyToken");
const isAdmin = require("../utils/isAdmin");

const router = express.Router();

// Public Route
router.get("/", getPrivacyPolicy);

// Admin Only Route
router.put("/", authMiddleware, isAdmin, updatePrivacyPolicy);

module.exports = router;