const express = require("express");
const router = express.Router();
const contactController = require("../controllers/contact.controller");

// Middlewares
const authMiddleware = require("../utils/verifyToken");
const isAdmin = require("../utils/isAdmin");
const rateLimit = require("express-rate-limit");

// Rate Limiter for public endpoint
const contactLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5,
    message: {
        success: false,
        message: "আপনি অনেকগুলো অনুরোধ পাঠিয়েছেন। ১ ঘণ্টা পর আবার চেষ্টা করুন।",
    },
});

// =========================================
// PUBLIC ROUTES
// =========================================
router.post("/", contactLimiter, contactController.submitContactForm);

// =========================================
// ADMIN ROUTES (Protected)
// =========================================
router.get("/admin/all", authMiddleware, isAdmin, contactController.getAllContactsAdmin);
router.get("/admin/:id", authMiddleware, isAdmin, contactController.getContactByIdAdmin);
router.post("/admin/:id/reply", authMiddleware, isAdmin, contactController.replyToContactAdmin);
router.patch("/admin/:id", authMiddleware, isAdmin, contactController.updateContactAdmin);
router.delete("/admin/:id", authMiddleware, isAdmin, contactController.deleteContactAdmin);

module.exports = router;