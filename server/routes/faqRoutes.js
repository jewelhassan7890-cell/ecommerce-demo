const express = require("express");
const router = express.Router();
const {
    getActiveFaqs,
    getAllFaqsAdmin,
    createFaq,
    updateFaq,
    deleteFaq,
} = require("../controllers/faqController");

// আপনার Auth & Admin Middleware ইম্পোর্ট করুন
const authMiddleware = require("../utils/verifyToken");
const isAdmin = require("../utils/isAdmin");

// Public Route (কাস্টমারদের জন্য)
router.get("/", getActiveFaqs);

// Admin Routes (প্রটেক্টেড)
router.get("/allfaqs", authMiddleware, isAdmin, getAllFaqsAdmin);
router.post("/", authMiddleware, isAdmin, createFaq);
router.put("/:id", authMiddleware, isAdmin, updateFaq);
router.delete("/:id", authMiddleware, isAdmin, deleteFaq);

module.exports = router;