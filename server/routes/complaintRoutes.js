const express = require("express");
const router = express.Router();
const {
    submitComplaint,
    getAllComplaints,
    updateComplaintStatus,
    deleteComplaint,
} = require("../controllers/complaintController");

const upload = require("../middlewares/uploadMiddleware");
const authMiddleware = require("../utils/verifyToken");
const isAdmin = require("../utils/isAdmin");

// Public Route (ইউজার ফাইল/স্ক্রিনশট সহ ফরম জমা দেবে)
router.post("/", upload.single("attachment"), submitComplaint);

// Admin Routes (এডমিন প্যানেলের জন্য)
router.get("/", authMiddleware, isAdmin, getAllComplaints);
router.patch("/:id", authMiddleware, isAdmin, updateComplaintStatus);
router.delete("/:id", authMiddleware, isAdmin, deleteComplaint);

module.exports = router;