const Coupon = require("../models/Coupon");
const { validateAndCalculateCoupon } = require("../utils/couponHelper");

// ১. কুপন প্রিভিউ/অ্যাপ্লাই (Customer Checkout Page)



exports.applyCoupon = async (req, res) => {
    try {
        const { code, subtotal } = req.body;
        const userId = req.user ? req.user._id : null;

        if (subtotal === undefined || subtotal < 0) {
            return res.status(400).json({
                success: false,
                message: "সঠিক সাবটোটাল প্রদান করুন।"
            });
        }

        const result = await validateAndCalculateCoupon(code, Number(subtotal), userId);

        if (!result.isValid) {
            return res.status(400).json({
                success: false,
                message: result.error
            });
        }

        const coupon = result.coupon;
        let discount = result.discount; // Calculated discount from helper

        // E-commerce Standard Response Structure
        res.status(200).json({
            success: true,
            message: "কুপন সফলভাবে অ্যাপ্লাই হয়েছে!",
            data: {
                applied: true,
                code: coupon.code,
                discountType: coupon.discountType, // 'percentage' or 'fixed'
                discountValue: coupon.discountAmount, // e.g. 5 (%) or 100 (BDT)
                maxDiscountAmount: coupon.maxDiscountAmount || null,
                minOrderAmount: coupon.minOrderAmount || 0,
                calculatedDiscount: discount, // Final discounted amount in BDT
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "কুপন প্রসেস করতে সমস্যা হয়েছে।",
            error: error.message
        });
    }
};

// ২. একটি কুপন তৈরি করা (Admin Only)
exports.createCoupon = async (req, res) => {
    try {
        const existingCoupon = await Coupon.findOne({ code: req.body.code.trim().toUpperCase() });
        if (existingCoupon) {
            return res.status(400).json({
                success: false,
                message: "এই কোড দিয়ে ইতিমধ্যেই একটি কুপন তৈরি করা আছে।"
            });
        }

        const coupon = new Coupon({
            ...req.body,
            code: req.body.code.trim().toUpperCase()
        });

        await coupon.save();

        res.status(201).json({
            success: true,
            message: "নতুন কুপন সফলভাবে তৈরি হয়েছে!",
            data: coupon
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "কুপন তৈরি করতে সমস্যা হয়েছে।",
            error: error.message
        });
    }
};

// ৩. পাবলিকলি সচল কুপনগুলোর লিস্ট (Customers Promo Offer Drawer-এর জন্য)
exports.getPublicCoupons = async (req, res) => {
    try {
        const activeCoupons = await Coupon.find({
            isActive: true,
            expiryDate: { $gt: new Date() }
        }).select("code discountType discountAmount minOrderAmount maxDiscountAmount expiryDate");

        res.status(200).json({
            success: true,
            data: activeCoupons
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ৪. সকল কুপনের তথ্য (Admin Dashboard View)
exports.getAllCoupons = async (req, res) => {
    try {
        const coupons = await Coupon.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: coupons });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ৫. কুপন মুছে ফেলা (Admin Only)
exports.deleteCoupon = async (req, res) => {
    try {
        await Coupon.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: "কুপনটি ডিলিট করা হয়েছে।" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};