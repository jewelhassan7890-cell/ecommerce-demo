const express = require("express");
const {
    createRestockAlert,
    getAllRestockAlerts,
    updateAlertStatus,
} = require("../controllers/restockAlertController");
const authMiddleware = require("../utils/verifyToken");
const isAdmin = require("../utils/isAdmin");

const router = express.Router();

// Public route for customers
router.post("/", createRestockAlert);

// Protected routes for admin
router.get("/", authMiddleware, isAdmin, getAllRestockAlerts);
router.patch("/:id/status", authMiddleware, isAdmin, updateAlertStatus);

module.exports = router;
