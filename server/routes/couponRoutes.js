const express = require("express");
const router = express.Router();
const {
    applyCoupon,
    createCoupon,
    getPublicCoupons,
    getAllCoupons,
    deleteCoupon
} = require("../controllers/couponController");

const authMiddleware = require("../utils/verifyToken");
const isAdmin = require("../utils/isAdmin");
const optionalAuth = require("../middlewares/optionalAuth");

// কাস্টমারদের জন্য রাউটস (লগইন ও গেস্ট সবার ক্ষেত্রে প্রযোজ্য)
router.post("/apply", optionalAuth, applyCoupon);
router.get("/active", getPublicCoupons);

// অ্যাডমিনদের জন্য রাউটস
router.post("/create", authMiddleware, isAdmin, createCoupon);
router.get("/all", authMiddleware, isAdmin, getAllCoupons);
router.delete("/:id", authMiddleware, isAdmin, deleteCoupon);

module.exports = router;