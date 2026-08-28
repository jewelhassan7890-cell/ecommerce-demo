const Coupon = require("../models/Coupon");
const ApiError = require("../utils/ApiError");

// ======================================================
// Create Coupon
// Admin
// ======================================================

const createCoupon = async (payload) => {
    // ==========================================
    // Check Duplicate Coupon Code
    // ==========================================

    const exists = await Coupon.findOne({
        code: payload.code.toUpperCase(),
    });

    if (exists) {
        throw new ApiError(409, "Coupon code already exists.");
    }

    // ==========================================
    // Create Coupon
    // ==========================================

    const coupon = await Coupon.create({
        ...payload,
        code: payload.code.toUpperCase(),
    });

    return coupon;
};

// ======================================================
// Get Single Coupon
// ======================================================

const getCouponById = async (couponId) => {
    const coupon = await Coupon.findOne({
        _id: couponId,
        isDeleted: false,
    });

    if (!coupon) {
        throw new ApiError(404, "Coupon not found.");
    }

    return coupon;
};

// ======================================================
// Get All Coupons
// Admin
// ======================================================

const getAllCoupons = async (query) => {
    const {
        page = 1,
        limit = 10,
        search,
        status,
        sort = "newest",
    } = query;

    const filter = {
        isDeleted: false,
    };

    // ==========================================
    // Search
    // ==========================================

    if (search) {
        filter.$or = [
            {
                code: {
                    $regex: search,
                    $options: "i",
                },
            },
            {
                name: {
                    $regex: search,
                    $options: "i",
                },
            },
        ];
    }

    // ==========================================
    // Status Filter
    // ==========================================

    if (status === "active") {
        filter.isActive = true;
    }

    if (status === "inactive") {
        filter.isActive = false;
    }

    // ==========================================
    // Sorting
    // ==========================================

    let sortOption = {
        createdAt: -1,
    };

    if (sort === "oldest") {
        sortOption = {
            createdAt: 1,
        };
    }

    if (sort === "expiry") {
        sortOption = {
            expiresAt: 1,
        };
    }

    // ==========================================
    // Pagination
    // ==========================================

    const currentPage = Number(page);
    const perPage = Number(limit);
    const skip = (currentPage - 1) * perPage;

    const [coupons, totalCoupons] = await Promise.all([
        Coupon.find(filter)
            .sort(sortOption)
            .skip(skip)
            .limit(perPage)
            .lean(),

        Coupon.countDocuments(filter),
    ]);

    return {
        coupons,

        pagination: {
            page: currentPage,
            limit: perPage,
            totalCoupons,
            totalPages: Math.ceil(totalCoupons / perPage),
        },
    };
};





// ======================================================
// Apply Coupon
// Customer
// ======================================================

const applyCoupon = async (userId, payload) => {

    const {
        code,
        orderAmount,
    } = payload;

    const coupon = await Coupon.findOne({
        code: code.toUpperCase(),
        isDeleted: false,
    });

    if (!coupon) {
        throw new ApiError(404, "Coupon not found.");
    }

    const result = await validateCoupon(
        coupon,
        userId,
        Number(orderAmount)
    );

    return result;

};

// ======================================================
// Validate Coupon
// ======================================================

const validateCoupon = async (
    coupon,
    userId,
    orderAmount
) => {

    // ==========================================
    // Active
    // ==========================================

    if (!coupon.isActive) {
        throw new ApiError(
            400,
            "Coupon is inactive."
        );
    }

    // ==========================================
    // Date Validation
    // ==========================================

    const now = new Date();

    if (coupon.startDate && now < coupon.startDate) {
        throw new ApiError(
            400,
            "Coupon is not active yet."
        );
    }

    if (coupon.expiryDate && now > coupon.expiryDate) {
        throw new ApiError(
            400,
            "Coupon has expired."
        );
    }

    // ==========================================
    // Usage Limit
    // ==========================================

    if (
        coupon.usageLimit > 0 &&
        coupon.usedCount >= coupon.usageLimit
    ) {
        throw new ApiError(
            400,
            "Coupon usage limit exceeded."
        );
    }

    // ==========================================
    // Minimum Order
    // ==========================================

    if (
        orderAmount <
        coupon.minimumOrderAmount
    ) {
        throw new ApiError(
            400,
            `Minimum order amount is ${coupon.minimumOrderAmount}.`
        );
    }

    // ==========================================
    // Customer Restriction
    // ==========================================

    if (
        coupon.allowedUsers.length &&
        !coupon.allowedUsers.some(
            (id) => id.toString() === userId.toString()
        )
    ) {
        throw new ApiError(
            403,
            "You are not eligible for this coupon."
        );
    }

    if (
        coupon.excludedUsers.length &&
        coupon.excludedUsers.some(
            (id) => id.toString() === userId.toString()
        )
    ) {
        throw new ApiError(
            403,
            "You cannot use this coupon."
        );
    }

    // ==========================================
    // Discount
    // ==========================================

    const discount = calculateDiscount(
        coupon,
        orderAmount
    );

    return {

        valid: true,

        coupon: {

            _id: coupon._id,

            code: coupon.code,

            name: coupon.name,

            discountType:
                coupon.discountType,

            discountValue:
                coupon.discountValue,

        },

        orderAmount,

        discount,

        payableAmount:
            orderAmount - discount,

    };

};

// ======================================================
// Calculate Discount
// ======================================================

const calculateDiscount = (
    coupon,
    orderAmount
) => {

    let discount = 0;

    // ==========================================
    // Percentage
    // ==========================================

    if (
        coupon.discountType ===
        "percentage"
    ) {

        discount =
            (orderAmount *
                coupon.discountValue) /
            100;

        if (
            coupon.maximumDiscount > 0 &&
            discount >
            coupon.maximumDiscount
        ) {

            discount =
                coupon.maximumDiscount;

        }

    }

    // ==========================================
    // Fixed
    // ==========================================

    if (
        coupon.discountType ===
        "fixed"
    ) {

        discount =
            coupon.discountValue;

    }

    // ==========================================
    // Never Greater Than Order Amount
    // ==========================================

    if (discount > orderAmount) {
        discount = orderAmount;
    }

    return Number(discount.toFixed(2));

};



// ======================================================
// Update Coupon
// Admin
// ======================================================

const updateCoupon = async (couponId, payload) => {

    const coupon = await Coupon.findOne({
        _id: couponId,
        isDeleted: false,
    });

    if (!coupon) {
        throw new ApiError(404, "Coupon not found.");
    }

    // Coupon Code cannot be duplicated

    if (
        payload.code &&
        payload.code.toUpperCase() !== coupon.code
    ) {

        const exists = await Coupon.findOne({
            code: payload.code.toUpperCase(),
            isDeleted: false,
            _id: { $ne: couponId },
        });

        if (exists) {
            throw new ApiError(
                409,
                "Coupon code already exists."
            );
        }

        coupon.code = payload.code.toUpperCase();
    }

    // Basic Information

    if (payload.description !== undefined) {
        coupon.description = payload.description;
    }

    if (payload.discountType) {
        coupon.discountType = payload.discountType;
    }

    if (payload.discountValue !== undefined) {
        coupon.discountValue = payload.discountValue;
    }

    if (payload.minimumPurchase !== undefined) {
        coupon.minimumPurchase = payload.minimumPurchase;
    }

    if (payload.maximumDiscount !== undefined) {
        coupon.maximumDiscount = payload.maximumDiscount;
    }

    if (payload.usageLimit !== undefined) {
        coupon.usageLimit = payload.usageLimit;
    }

    if (payload.startDate) {
        coupon.startDate = payload.startDate;
    }

    if (payload.expiryDate) {
        coupon.expiryDate = payload.expiryDate;
    }

    if (payload.isActive !== undefined) {
        coupon.isActive = payload.isActive;
    }

    await coupon.save();

    return coupon;
};

// ======================================================
// Soft Delete Coupon
// ======================================================

const deleteCoupon = async (couponId) => {

    const coupon = await Coupon.findOne({
        _id: couponId,
        isDeleted: false,
    });

    if (!coupon) {
        throw new ApiError(
            404,
            "Coupon not found."
        );
    }

    coupon.isDeleted = true;
    coupon.deletedAt = new Date();

    await coupon.save();

    return {
        message: "Coupon deleted successfully.",
    };
};

// ======================================================
// Restore Coupon
// ======================================================

const restoreCoupon = async (couponId) => {

    const coupon = await Coupon.findOne({
        _id: couponId,
        isDeleted: true,
    });

    if (!coupon) {
        throw new ApiError(
            404,
            "Coupon not found."
        );
    }

    coupon.isDeleted = false;
    coupon.deletedAt = null;

    await coupon.save();

    return coupon;
};

// ======================================================
// Module Exports
// ======================================================

module.exports = {

    // Part 3.1
    createCoupon,
    getCouponById,
    getAllCoupons,

    // Part 3.2
    applyCoupon,
    validateCoupon,
    calculateDiscount,

    // Part 3.3
    updateCoupon,
    deleteCoupon,
    restoreCoupon,

};

// ======================================================
// Module Exports
// ======================================================

