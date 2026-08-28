const ApiError = require("../utils/ApiError");

// ==========================================
// Cash On Delivery
// ==========================================

const createCashOnDeliveryPayment = async (order) => {

    return {

        success: true,

        gateway: "cash-on-delivery",

        paymentStatus: "pending",

        paymentUrl: null,

        transactionId: null,

        message: "Cash on Delivery selected.",

    };

};

// ==========================================
// bKash
// ==========================================

const createBkashPayment = async (order) => {

    // TODO:
    // Integrate Official bKash Checkout API

    return {

        success: true,

        gateway: "bkash",

        paymentStatus: "pending",

        paymentUrl: "",

        transactionId: null,

        message: "bKash integration is ready.",

    };

};

// ==========================================
// Nagad
// ==========================================

const createNagadPayment = async (order) => {

    // TODO:
    // Integrate Official Nagad API

    return {

        success: true,

        gateway: "nagad",

        paymentStatus: "pending",

        paymentUrl: "",

        transactionId: null,

        message: "Nagad integration is ready.",

    };

};

// ==========================================
// SSLCommerz
// ==========================================

const createSSLCommerzPayment = async (order) => {

    // TODO:
    // Integrate SSLCommerz API

    return {

        success: true,

        gateway: "sslcommerz",

        paymentStatus: "pending",

        paymentUrl: "",

        transactionId: null,

        message: "SSLCommerz integration is ready.",

    };

};

// ==========================================
// Stripe
// ==========================================

const createStripePayment = async (order) => {

    // TODO:
    // Integrate Stripe Checkout Session

    return {

        success: true,

        gateway: "stripe",

        paymentStatus: "pending",

        paymentUrl: "",

        transactionId: null,

        message: "Stripe integration is ready.",

    };

};

// ==========================================
// Process Payment
// ==========================================

const processPayment = async (order) => {

    if (!order) {

        throw new ApiError(

            404,

            "Order not found."

        );

    }

    switch (order.payment.method) {

        case "cash-on-delivery":

            return await createCashOnDeliveryPayment(order);

        case "bkash":

            return await createBkashPayment(order);

        case "nagad":

            return await createNagadPayment(order);

        case "sslcommerz":

            return await createSSLCommerzPayment(order);

        case "stripe":

            return await createStripePayment(order);

        default:

            throw new ApiError(

                400,

                "Invalid payment method."

            );

    }

};

// ==========================================
// Verify Payment (Future)
// ==========================================

const verifyPayment = async (

    gateway,

    transactionId

) => {

    return {

        success: true,

        gateway,

        transactionId,

        paymentStatus: "paid",

        verified: true,

    };

};

// ==========================================
// Refund Payment (Future)
// ==========================================

const refundPayment = async (

    gateway,

    transactionId

) => {

    return {

        success: true,

        gateway,

        transactionId,

        refundStatus: "success",

    };

};

// ==========================================

module.exports = {

    processPayment,

    verifyPayment,

    refundPayment,

    createCashOnDeliveryPayment,

    createBkashPayment,

    createNagadPayment,

    createSSLCommerzPayment,

    createStripePayment,

};