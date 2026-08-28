const mongoose = require("mongoose");

const Order = require("../models/Order");
const Product = require("../models/Product");

const ApiError = require("../utils/ApiError");
const {
    STATUS_MESSAGES,
    canChangeStatus,
} = require("../utils/orderStatus");

const {
    processPayment,
} = require("./payment.service");


const {

    reduceStock,

    restoreStock,

    validateCartStock,

} = require("./inventory.service");

// ==========================================
// Generate Order Number
// Example: SC-20260726-000001
// ==========================================

const generateOrderNumber = async () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const prefix = `SC-${year}${month}${day}`;

    // Find the order created today with the highest sequence number
    const latestOrder = await Order.findOne({
        orderNumber: { $regex: `^${prefix}` },
    })
        .sort({ orderNumber: -1 })
        .select("orderNumber")
        .lean();

    let sequence = 1;
    if (latestOrder && latestOrder.orderNumber) {
        const parts = latestOrder.orderNumber.split("-");
        if (parts.length === 3) {
            const lastSequence = Number(parts[2]);
            if (!isNaN(lastSequence)) {
                sequence = lastSequence + 1;
            }
        }
    }

    return `${prefix}-${String(sequence).padStart(6, "0")}`;
};



// ==========================================
// Generate Invoice Number
// Example:
// INV-20260726-000001
// ==========================================

const generateInvoiceNumber = async () => {

    const now = new Date();

    const year = now.getFullYear();

    const month = String(now.getMonth() + 1).padStart(2, "0");

    const day = String(now.getDate()).padStart(2, "0");

    const prefix = `INV-${year}${month}${day}`;

    const latestInvoice = await Order.findOne({

        invoiceNumber: {

            $regex: `^${prefix}`,

        },

    })
        .sort({
            createdAt: -1,
        })
        .select("invoiceNumber")
        .lean();

    let sequence = 1;

    if (latestInvoice) {

        const lastSequence = Number(

            latestInvoice.invoiceNumber.split("-")[2]

        );

        if (!isNaN(lastSequence)) {

            sequence = lastSequence + 1;

        }

    }

    return `${prefix}-${String(sequence).padStart(6, "0")}`;

};

// ==========================================
// Validate Products
// ==========================================



// ==========================================
// Build Product Snapshot
// ==========================================

const buildProductSnapshot = (dbProducts, cartProducts) => {
    return cartProducts.map((cartItem) => {
        const product = dbProducts.find(
            (item) => item._id.toString() === cartItem.product.toString()
        );

        if (!product) {
            throw new ApiError(404, "Product not found.");
        }

        if (product.stock < cartItem.quantity) {
            throw new ApiError(400, `${product.name} is out of stock.`);
        }

        const unitPrice =
            product.salePrice && product.salePrice > 0
                ? product.salePrice
                : product.price;

        return {
            product: product._id,
            name: product.name,
            slug: product.slug,
            sku: product.sku,
            thumbnail:
                product.thumbnail || {
                    url: "",
                    public_id: ""
                },
            color: cartItem.color || "",
            size: cartItem.size || "",
            quantity: cartItem.quantity,
            price: product.price,
            salePrice: product.salePrice || 0,
            totalPrice: unitPrice * cartItem.quantity,
        };
    });
};

// ==========================================
// Reduce Product Stock (Atomic Operation)
// ==========================================



// ==========================================
// Restore Product Stock
// Used when Order Cancelled
// ==========================================


// ==========================================
// Create Order (MongoDB Transaction Ready)
// ==========================================

const createOrder = async (userId, payload) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const {
            products,
            shipping,
            payment,
            customerNote = "",
            deliveryCharge = 0,
            discount = 0,
        } = payload;

        // 1. Validate Products
        const dbProducts = await validateCartStock(products);

        // 2. Build Product Snapshot
        const productSnapshot = buildProductSnapshot(dbProducts, products);

        // 3. Calculate Totals
        const subtotal = productSnapshot.reduce(
            (total, item) => total + item.totalPrice,
            0
        );

        const grandTotal = subtotal + Number(deliveryCharge) - Number(discount);

        if (grandTotal < 0) {
            throw new ApiError(400, "Invalid order amount.");
        }

        // 4. Generate Order Number
        const orderNumber = await generateOrderNumber();
        const invoiceNumber =
            await generateInvoiceNumber();

        // 5. Create Order Document
        const order = await Order.create(
            [
                {
                    customer: userId,

                    orderNumber,

                    invoiceNumber,

                    products: productSnapshot,

                    shipping,

                    payment: {

                        method: payment?.method || "cash-on-delivery",

                        status: "pending",

                        transactionId:
                            payment?.transactionId || "",
                    },

                    subtotal,

                    deliveryCharge,

                    discount,

                    grandTotal,

                    customerNote,

                    timeline: [
                        {
                            status: "pending",
                            message: STATUS_MESSAGES.pending,
                        },
                    ],
                },
            ],
            { session }
        );
        // 6. Reduce Stock Atomic Operation
        await reduceStock(
            session,
            productSnapshot
        );

        // 7. Commit Transaction
        // Commit Transaction
        // ==================================

        await session.commitTransaction();

        // ==================================
        // Get Saved Order
        // ==================================

        const savedOrder = await Order.findById(order[0]._id)
            .populate("customer", "name email phone")
            .populate(
                "products.product",
                "name slug thumbnail"
            );

        // ==================================
        // Process Payment
        // ==================================

        const paymentResult = await processPayment(savedOrder);

        // ==================================
        // Return
        // ==================================

        return {

            order: savedOrder,

            payment: paymentResult,

        };
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
};

// ==========================================
// Get Single Order
// ==========================================

const getOrderById = async (orderId, user) => {
    const filter = { _id: orderId };

    if (user.role !== "admin") {
        filter.customer = user._id;
    }

    const order = await Order.findOne(filter)
        .populate(
            "customer",
            "name email phone"
        )
        .populate(
            "products.product",
            "name slug thumbnail"
        )
        .lean();

    if (!order) {
        throw new ApiError(404, "Order not found.");
    }

    return order;
};

// ==========================================
// Customer Order History
// ==========================================

const getMyOrders = async (userId, query) => {
    const {
        page = 1,
        limit = 10,
        status,
        sort = "newest",
    } = query;

    const filter = { customer: userId };

    if (status) {
        filter.orderStatus = status;
    }

    const sortOption = sort === "oldest" ? { createdAt: 1 } : { createdAt: -1 };
    const skip = (Number(page) - 1) * Number(limit);

    const [orders, totalOrders] = await Promise.all([
        Order.find(filter)
            .sort(sortOption)
            .skip(skip)
            .limit(Number(limit))
            .lean(),
        Order.countDocuments(filter),
    ]);

    return {
        orders,
        pagination: {
            page: Number(page),
            limit: Number(limit),
            totalOrders,
            totalPages: Math.ceil(totalOrders / Number(limit)),
        },
    };
};

// ==========================================
// Admin Order List
// ==========================================

const getAllOrders = async (query) => {
    const {
        page = 1,
        limit = 20,
        search,
        orderStatus,
        paymentStatus,
        sort = "newest",
    } = query;

    const filter = {};

    if (search) {
        filter.$or = [
            { orderNumber: { $regex: search, $options: "i" } },
            { "shipping.fullName": { $regex: search, $options: "i" } },
            { "shipping.phone": { $regex: search, $options: "i" } },
            {
                "shipping.email": {
                    $regex: search,
                    $options: "i"
                }
            },
        ];
    }

    if (orderStatus) {
        filter.orderStatus = orderStatus;
    }

    if (paymentStatus) {
        filter["payment.status"] = paymentStatus;
    }

    let sortOption = { createdAt: -1 };
    switch (sort) {
        case "oldest":
            sortOption = { createdAt: 1 };
            break;
        case "amount-high":
            sortOption = { grandTotal: -1 };
            break;
        case "amount-low":
            sortOption = { grandTotal: 1 };
            break;
        default:
            sortOption = { createdAt: -1 };
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [orders, totalOrders] = await Promise.all([
        Order.find(filter)
            .populate(
                "customer",
                "name email phone"
            )
            .sort(sortOption)
            .skip(skip)
            .limit(Number(limit))
            .lean(),
        Order.countDocuments(filter),
    ]);

    return {
        orders,
        pagination: {
            page: Number(page),
            limit: Number(limit),
            totalOrders,
            totalPages: Math.ceil(totalOrders / Number(limit)),
        },
    };
};

// ==========================================
// Update Order Status
// ==========================================

const updateOrderStatus = async (orderId, status, adminId) => {
    const allowedStatus = [
        "pending",
        "confirmed",
        "processing",
        "packed",
        "shipped",
        "delivered",
        "cancelled",
        "returned",
    ];

    if (!allowedStatus.includes(status)) {
        throw new ApiError(400, "Invalid order status.");
    }
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const order = await Order.findById(orderId).session(session);

        if (!order) {
            throw new ApiError(404, "Order not found.");
        }

        if (!canChangeStatus(order.orderStatus, status)) {
            throw new ApiError(
                400,
                `Cannot change order status from "${order.orderStatus}" to "${status}".`
            );
        }

        if (order.orderStatus === "cancelled") {
            throw new ApiError(400, "Cancelled order cannot be updated.");
        }

        order.orderStatus = status;

        if (status === "delivered") {
            order.isDelivered = true;
            if (order.payment.method === "cash-on-delivery") {
                order.payment.status = "paid";
            }
        }

        order.timeline.push({
            status,
            message:
                STATUS_MESSAGES[status] ||
                `Order status changed to ${status}`,
            updatedBy: adminId,
            createdAt: new Date(),
        });

        await order.save({ session });
        await session.commitTransaction();

        return order;
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
};

// ==========================================
// Cancel Order
// ==========================================

const cancelOrder = async (orderId, user) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const order = await Order.findById(orderId).session(session);

        if (!order) {
            throw new ApiError(404, "Order not found.");
        }

        if (
            user.role !== "admin" &&
            order.customer.toString() !== user._id.toString()
        ) {
            throw new ApiError(403, "Access denied.");
        }

        if (order.orderStatus === "cancelled") {
            throw new ApiError(400, "Order already cancelled.");
        }

        if (order.orderStatus === "delivered") {
            throw new ApiError(400, "Delivered order cannot be cancelled.");
        }

        // Restore Stock Atomic Operation
        await restoreStock(
            session,
            order.products
        );

        order.orderStatus = "cancelled";
        order.isCancelled = true;

        order.timeline.push({
            status: "cancelled",
            message:
                STATUS_MESSAGES[status] ||
                `Order status changed to ${status}`,
            updatedBy: user._id,
            createdAt: new Date(),
        });

        await order.save({ session });
        await session.commitTransaction();

        return order;
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
};

// ==========================================
// Module Exports
// ==========================================

module.exports = {

    generateOrderNumber,

    generateInvoiceNumber,



    buildProductSnapshot,


    createOrder,

    getOrderById,

    getMyOrders,

    getAllOrders,

    updateOrderStatus,

    cancelOrder,

};