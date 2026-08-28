const Coupon = require("../models/Coupon");
const Order = require("../models/Order");

/**
 * Optional Coupon Validator & Calculator
 */
const validateAndCalculateCoupon = async (couponCode, subtotal, userId = null) => {
    // কুপন কোড না দিলে সরাসরি ডিসকাউন্ট ০ করে দেবে (Optional handling)
    if (!couponCode || couponCode.trim() === "") {
        return { isValid: true, coupon: null, discount: 0 };
    }

    const coupon = await Coupon.findOne({
        code: couponCode.trim().toUpperCase(),
        isActive: true,
    });

    if (!coupon) {
        return { isValid: false, discount: 0, error: "অবৈধ বা অকার্যকর কুপন কোড।" };
    }

    // ১. মেয়াদ চেক
    if (new Date(coupon.expiryDate) < new Date()) {
        return { isValid: false, discount: 0, error: "এই কুপনটির মেয়াদ শেষ হয়ে গেছে।" };
    }

    // ২. সার্বিক ব্যবহারের সীমা (Global Usage Limit) চেক
    if (coupon.usageLimit !== null && coupon.usageCount >= coupon.usageLimit) {
        return { isValid: false, discount: 0, error: "কুপনটির সর্বমোট ব্যবহারের সীমা শেষ।" };
    }

    // ৩. সর্বনিম্ন অর্ডারের পরিমাণ চেক
    if (subtotal < coupon.minOrderAmount) {
        return {
            isValid: false,
            discount: 0,
            error: `এই কুপনটি ব্যবহার করতে সর্বনিম্ন ৳${coupon.minOrderAmount} টাকার অর্ডার প্রয়োজন।`,
        };
    }

    // ৪. ইউজার প্রতি লিমিট চেক (লগইন ইউজার হলে)
    if (userId) {
        const userUsageCount = await Order.countDocuments({
            customer: userId,
            "coupon.code": coupon.code,
            orderStatus: { $ne: "cancelled" }
        });

        if (userUsageCount >= coupon.userLimit) {
            return {
                isValid: false,
                discount: 0,
                error: `আপনি ইতিমধ্যেই এই কুপনটি সর্বোচ্চ সীমায় (${coupon.userLimit} বার) ব্যবহার করে ফেলেছেন।`,
            };
        }
    }

    // ৫. ডিসকাউন্ট হিসাব করা
    let calculatedDiscount = 0;

    if (coupon.discountType === "percentage") {
        calculatedDiscount = (subtotal * coupon.discountAmount) / 100;
        if (coupon.maxDiscountAmount && calculatedDiscount > coupon.maxDiscountAmount) {
            calculatedDiscount = coupon.maxDiscountAmount;
        }
    } else if (coupon.discountType === "fixed") {
        calculatedDiscount = coupon.discountAmount;
    }

    // সাবটোটালের বেশি ছাড় প্রতিরোধ
    if (calculatedDiscount > subtotal) {
        calculatedDiscount = subtotal;
    }

    return {
        isValid: true,
        coupon,
        discount: Math.round(calculatedDiscount),
    };
};

module.exports = { validateAndCalculateCoupon };