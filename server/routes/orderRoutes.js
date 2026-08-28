const express = require("express");
const router = express.Router();

const optionalAuth = require("../middlewares/optionalAuth");
const authMiddleware = require("../utils/verifyToken");
const isAdmin = require("../utils/isAdmin");

const {
    createOrder,
    getOrderById,
    getMyOrders,
    trackGuestOrder,
    getAllOrdersAdmin,
    updateOrderStatusAdmin,
    deleteOrderAdmin,
} = require("../controllers/orderController");

// ==========================================
// Public & User Routes
// ==========================================
router.post("/", optionalAuth, createOrder);
router.get("/my-orders", optionalAuth, getMyOrders);
router.post("/guest-track", trackGuestOrder);

// ==========================================
// Admin Only Routes
// ==========================================
router.get("/admin/all", authMiddleware, isAdmin, getAllOrdersAdmin);
router.patch("/admin/:id/status", authMiddleware, isAdmin, updateOrderStatusAdmin);
router.delete("/admin/:id", authMiddleware, isAdmin, deleteOrderAdmin);

// ==========================================
// Dynamic ID Route (Always keep this at bottom)
// ==========================================
router.get("/:id", getOrderById);

module.exports = router;