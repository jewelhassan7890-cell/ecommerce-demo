const Faq = require("../models/Faq");

// @desc    Get all active FAQs (Public for Frontend UI)
// @route   GET /api/v1/faqs
// @access  Public
const getActiveFaqs = async (req, res) => {
    try {
        const faqs = await Faq.find({ isActive: true }).sort({ order: 1, createdAt: -1 });
        res.status(200).json({
            success: true,
            count: faqs.length,
            data: faqs,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};

// @desc    Get all FAQs including inactive ones (Admin Dashboard)
// @route   GET /api/v1/faqs/admin
// @access  Private/Admin
const getAllFaqsAdmin = async (req, res) => {
    try {
        const faqs = await Faq.find().sort({ order: 1, createdAt: -1 });
        res.status(200).json({
            success: true,
            count: faqs.length,
            data: faqs,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};

// @desc    Create a new FAQ
// @route   POST /api/v1/faqs
// @access  Private/Admin
const createFaq = async (req, res) => {
    try {
        const { question, answer, category, isActive, order } = req.body;

        if (!question || !answer) {
            return res.status(400).json({ success: false, message: "Please provide question and answer" });
        }

        const faq = await Faq.create({
            question,
            answer,
            category,
            isActive,
            order,
        });

        res.status(201).json({
            success: true,
            message: "FAQ created successfully",
            data: faq,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};

// @desc    Update a FAQ
// @route   PUT /api/v1/faqs/:id
// @access  Private/Admin
const updateFaq = async (req, res) => {
    try {
        const faq = await Faq.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });

        if (!faq) {
            return res.status(404).json({ success: false, message: "FAQ not found" });
        }

        res.status(200).json({
            success: true,
            message: "FAQ updated successfully",
            data: faq,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};

// @desc    Delete a FAQ
// @route   DELETE /api/v1/faqs/:id
// @access  Private/Admin
const deleteFaq = async (req, res) => {
    try {
        const faq = await Faq.findByIdAndDelete(req.params.id);

        if (!faq) {
            return res.status(404).json({ success: false, message: "FAQ not found" });
        }

        res.status(200).json({
            success: true,
            message: "FAQ deleted successfully",
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};

module.exports = {
    getActiveFaqs,
    getAllFaqsAdmin,
    createFaq,
    updateFaq,
    deleteFaq,
};