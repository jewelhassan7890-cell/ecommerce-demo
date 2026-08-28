const express = require("express");

const authMiddleware = require("../utils/verifyToken");
const isAdmin = require("../utils/isAdmin");
const { getAllUsers, getSingleUser, deleteUser, toggleAdmin } = require("../controllers/user.controller");


const router = express.Router();

// ✅ Protect routes with authMiddleware
router.get("/allusers", authMiddleware, isAdmin, getAllUsers);
router.get("/single/:id", authMiddleware, getSingleUser);
router.delete("/delete/:id", authMiddleware, isAdmin, deleteUser);
router.patch("/toggle-admin/:id", authMiddleware, isAdmin, toggleAdmin);

module.exports = router;
