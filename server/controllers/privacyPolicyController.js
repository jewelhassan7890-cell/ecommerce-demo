const PrivacyPolicy = require("../models/PrivacyPolicy");

// @desc    Get Privacy Policy
// @route   GET /api/v1/privacy-policy
// @access  Public
const getPrivacyPolicy = async (req, res) => {
    try {
        let policy = await PrivacyPolicy.findOne({ isPublished: true });

        // ডাটাবেজে ডাটা না থাকলে প্রথমবার ডিফল্ট ডাটা ক্রিয়েট করবে
        if (!policy) {
            policy = await PrivacyPolicy.create({
                companyName: "Style & Closet",
                supportEmail: "info@styleandcloset.com",
                sections: [
                    {
                        order: 1,
                        title: "Information We Collect",
                        content: "When you visit our website or order products, we collect essential information:",
                        bullets: [
                            "Personal identifiers (Name, Mobile Number, Shipping Address)",
                            "Account credentials and OAuth login tokens",
                            "Order history and payment confirmation details",
                        ],
                    },
                    {
                        order: 2,
                        title: "How We Use Your Information",
                        content: "We use the collected information exclusively to:",
                        bullets: [
                            "Process and deliver your order through courier services",
                            "Provide order tracking and customer support updates",
                            "Notify you about restock alerts and updates",
                        ],
                    },
                    {
                        order: 3,
                        title: "Data Security & Protection",
                        content:
                            "We implement strict encryption and security protocols to prevent unauthorized access or disclosure of your personal information.",
                        bullets: [],
                    },
                ],
            });
        }

        // Order অনুযায়ী সেকশন সর্ট করা
        policy.sections.sort((a, b) => a.order - b.order);

        res.status(200).json({
            success: true,
            data: policy,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server Error",
            error: error.message,
        });
    }
};

// @desc    Update or Create Privacy Policy
// @route   PUT /api/v1/privacy-policy
// @access  Private/Admin
const updatePrivacyPolicy = async (req, res) => {
    try {
        const { companyName, supportEmail, sections, isPublished } = req.body;

        let policy = await PrivacyPolicy.findOne();

        if (policy) {
            policy.companyName = companyName || policy.companyName;
            policy.supportEmail = supportEmail || policy.supportEmail;
            policy.sections = sections || policy.sections;
            policy.isPublished = isPublished !== undefined ? isPublished : policy.isPublished;

            await policy.save();
        } else {
            policy = await PrivacyPolicy.create({
                companyName,
                supportEmail,
                sections,
                isPublished,
            });
        }

        res.status(200).json({
            success: true,
            message: "Privacy Policy updated successfully",
            data: policy,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: "Failed to update Privacy Policy",
            error: error.message,
        });
    }
};

module.exports = {
    getPrivacyPolicy,
    updatePrivacyPolicy,
};