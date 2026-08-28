const RestockAlert = require("../models/RestockAlert");

// @desc    Create new restock alert request
// @route   POST /api/v1/restock-alerts
// @access  Public
const createRestockAlert = async (req, res) => {
    try {
        const { name, phone, dressCode } = req.body;

        if (!name || !phone || !dressCode) {
            return res.status(400).json({
                success: false,
                message: "Please fill in all required fields",
            });
        }

        // BD Phone Number Validation
        const phoneRegex = /^01[3-9]\d{8}$/;
        if (!phoneRegex.test(phone)) {
            return res.status(400).json({
                success: false,
                message: "Please provide a valid Bangladeshi mobile number",
            });
        }

        // Duplicate Check
        const existingAlert = await RestockAlert.findOne({
            phone,
            dressCode: dressCode.toUpperCase(),
        });

        if (existingAlert) {
            return res.status(400).json({
                success: false,
                message: "You have already requested an alert for this dress code!",
            });
        }

        const alert = await RestockAlert.create({
            name,
            phone,
            dressCode: dressCode.toUpperCase(),
        });

        res.status(201).json({
            success: true,
            message: "Restock alert request submitted successfully!",
            data: alert,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server Error",
            error: error.message,
        });
    }
};

// @desc    Get all restock alerts (Admin Panel)
// @route   GET /api/v1/restock-alerts
// @access  Private/Admin
const getAllRestockAlerts = async (req, res) => {
    try {
        const { status, dressCode, page = 1, limit = 10 } = req.query;
        const query = {};

        if (status) query.status = status;
        if (dressCode) query.dressCode = dressCode.toUpperCase();

        const alerts = await RestockAlert.find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(Number(limit));

        const total = await RestockAlert.countDocuments(query);

        res.status(200).json({
            success: true,
            count: alerts.length,
            total,
            page: Number(page),
            pages: Math.ceil(total / limit),
            data: alerts,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server Error",
            error: error.message,
        });
    }
};

// @desc    Update alert status
// @route   PATCH /api/v1/restock-alerts/:id/status
// @access  Private/Admin
const updateAlertStatus = async (req, res) => {
    try {
        const { status } = req.body;

        const alert = await RestockAlert.findById(req.params.id);

        if (!alert) {
            return res.status(404).json({
                success: false,
                message: "Alert request not found",
            });
        }

        alert.status = status || alert.status;
        if (status === "Notified") {
            alert.notifiedAt = new Date();
        }

        await alert.save();

        res.status(200).json({
            success: true,
            message: "Alert status updated successfully",
            data: alert,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server Error",
            error: error.message,
        });
    }
};

module.exports = {
    createRestockAlert,
    getAllRestockAlerts,
    updateAlertStatus,
};