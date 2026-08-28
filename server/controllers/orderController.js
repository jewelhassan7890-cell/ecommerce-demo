// const mongoose = require("mongoose");
// const Order = require("../models/Order");
// const Product = require("../models/Product");
// const Coupon = require("../models/Coupon");

// /**
//  * Unique Order / Invoice Number Generators
//  */
// const generateOrderNumber = () => {
//     const prefix = "ORD";
//     const randomDigits = Math.floor(100000 + Math.random() * 900000);
//     return `${prefix}-${Date.now().toString().slice(-4)}${randomDigits}`;
// };

// const generateInvoiceNumber = () => {
//     const prefix = "INV";
//     const randomDigits = Math.floor(100000 + Math.random() * 900000);
//     return `${prefix}-${Date.now().toString().slice(-4)}${randomDigits}`;
// };

// /**
//  * @desc    Create new Order (Guest & Registered User with Stock & Coupon handling)
//  * @route   POST /api/orders
//  * @access  Public / Optional Auth
//  */

// exports.createOrder = async (req, res) => {
//     try {
//         const {
//             cartItems,
//             shippingAddress,
//             paymentMethod,
//             deliveryCharge = 60,
//             couponCode,
//             customerNote,
//         } = req.body;

//         // ১. কার্ট আইটেম ও শিফিং ডাটা ভ্যালিডেশন
//         if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Your cart is empty.",
//             });
//         }

//         if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.phone || !shippingAddress.address || !shippingAddress.city) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Please provide all required shipping details (Name, Phone, Address, City).",
//             });
//         }

//         const validatedItems = [];
//         let subtotal = 0;

//         // ২. প্রতিটি প্রোডাক্ট ডাটাবেজে চেক করা ও স্টক ভ্যালিডেশন
//         for (const item of cartItems) {
//             const productId = item.product || item._id;

//             if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
//                 return res.status(400).json({
//                     success: false,
//                     message: `Invalid Product ID format: "${productId}".`,
//                 });
//             }

//             const dbProduct = await Product.findById(productId);

//             if (!dbProduct) {
//                 return res.status(404).json({
//                     success: false,
//                     message: `Product not found with ID: ${productId}`,
//                 });
//             }

//             // স্টক চেক
//             if (dbProduct.stock < item.quantity) {
//                 return res.status(400).json({
//                     success: false,
//                     message: `Insufficient stock for "${dbProduct.name}". Available stock: ${dbProduct.stock}`,
//                 });
//             }

//             const itemPrice = dbProduct.salePrice || dbProduct.price;
//             const itemTotalPrice = itemPrice * item.quantity;
//             subtotal += itemTotalPrice;

//             // Product Snapshot Schema এর সঠিক ফর্ম্যাটে আইটেম পুশ করা
//             validatedItems.push({
//                 product: dbProduct._id,
//                 name: dbProduct.name,
//                 slug: dbProduct.slug || "",
//                 sku: dbProduct.sku || item.sku || "N/A",
//                 thumbnail: {
//                     url: dbProduct.thumbnail?.url || (typeof item.thumbnail === "string" ? item.thumbnail : item.thumbnail?.url) || "",
//                     public_id: dbProduct.thumbnail?.public_id || "",
//                 },
//                 color: item.color || "",
//                 size: item.size || "",
//                 quantity: Number(item.quantity),
//                 price: Number(itemPrice),
//                 salePrice: dbProduct.salePrice || null,
//                 totalPrice: Number(itemTotalPrice),
//             });
//         }

//         // ৩. কুপন ডিসকাউন্ট প্রসেসিং
//         // ৩. কুপন ডিসকাউন্ট প্রসেসিং (সংশোধিত লজিক)
//         let discount = 0;
//         if (couponCode) {
//             // ৩.১ Database থেকে কুপনটি কোড দিয়ে আগে খুজে বের করা
//             const validCoupon = await Coupon.findOne({
//                 code: couponCode.trim().toUpperCase(),
//                 isActive: true,
//             });

//             if (!validCoupon) {
//                 return res.status(400).json({
//                     success: false,
//                     message: "Invalid or inactive coupon code.",
//                 });
//             }

//             // ৩.২ মেয়াদের তারিখ চেক করা (expirationDate / expiryDate / validUntil যেকোনো একটি সমর্থন করবে)
//             const expiry = validCoupon.expirationDate || validCoupon.expiryDate || validCoupon.validUntil;
//             if (expiry && new Date(expiry) < new Date()) {
//                 return res.status(400).json({
//                     success: false,
//                     message: "Coupon code has expired.",
//                 });
//             }

//             // ৩.৩ সর্বনিম্ন কেনাকাটা শর্ত চেক করা (minPurchase / minOrderAmount)
//             const minAmount = validCoupon.minPurchase || validCoupon.minOrderAmount || 0;
//             if (minAmount > 0 && subtotal < minAmount) {
//                 return res.status(400).json({
//                     success: false,
//                     message: `Minimum purchase requirement for coupon "${couponCode}" is ৳${minAmount}.`,
//                 });
//             }

//             // ৩.৪ ইউজারের ব্যবহার লিমিট চেক করা (লগইন করা ইউজারদের জন্য)
//             if (req.user && validCoupon.userLimit) {
//                 const userUsageCount = await Order.countDocuments({
//                     customer: req.user._id,
//                     couponCode: validCoupon.code,
//                 });

//                 if (userUsageCount >= validCoupon.userLimit) {
//                     return res.status(400).json({
//                         success: false,
//                         message: "You have already reached the maximum usage limit for this coupon.",
//                     });
//                 }
//             }

//             // ৩.৫ ডিসকাউন্ট হিসাব করা
//             if (validCoupon.discountType === "percentage") {
//                 discount = (subtotal * validCoupon.discountAmount) / 100;
//                 if (validCoupon.maxDiscount && discount > validCoupon.maxDiscount) {
//                     discount = validCoupon.maxDiscount;
//                 }
//             } else {
//                 discount = validCoupon.discountAmount;
//             }
//         }

//         const charge = Number(deliveryCharge) >= 0 ? Number(deliveryCharge) : 60;
//         const grandTotal = Math.max(0, subtotal + charge - discount);

//         // ৪. কাস্টমার আইডি নির্ধারণ (Auth User নাকি Guest User)
//         const userId = req.user ? req.user._id : null;
//         const isGuest = !userId;

//         // ৫. নতুন অর্ডার তৈরি
//         const newOrder = await Order.create({
//             customer: userId,
//             isGuest,
//             orderNumber: generateOrderNumber(),
//             invoiceNumber: generateInvoiceNumber(),
//             products: validatedItems,
//             shipping: shippingAddress,
//             payment: {
//                 method: paymentMethod || "cash-on-delivery",
//                 status: "pending",
//             },
//             subtotal,
//             deliveryCharge: charge,
//             discount,
//             couponCode: couponCode || "",
//             grandTotal,
//             customerNote: customerNote || "",
//             orderStatus: "pending",
//         });

//         // ৬. স্টক কমিয়ে দেওয়া (Stock Reduction)
//         for (const item of validatedItems) {
//             await Product.findByIdAndUpdate(item.product, {
//                 $inc: { stock: -item.quantity },
//             });
//         }

//         return res.status(201).json({
//             success: true,
//             message: "Order placed successfully!",
//             order: newOrder,
//         });
//     } catch (error) {
//         console.error("Create Order Error:", error);
//         return res.status(500).json({
//             success: false,
//             message: error.message || "Server error occurred while creating order.",
//         });
//     }
// };






// /**
//  * @desc    Get order details by ID
//  * @route   GET /api/orders/:id
//  * @access  Public / Private
//  */
// exports.getOrderById = async (req, res) => {
//     try {
//         if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Invalid Order ID format.",
//             });
//         }

//         const order = await Order.findById(req.params.id)
//             .populate("customer", "name email phone")
//             .populate("products.product", "name thumbnail price stock");

//         if (!order) {
//             return res.status(404).json({
//                 success: false,
//                 message: "Order not found.",
//             });
//         }

//         res.status(200).json({
//             success: true,
//             order,
//         });
//     } catch (error) {
//         res.status(500).json({
//             success: false,
//             message: "Server Error",
//             error: error.message,
//         });
//     }
// };

// /**
//  * @desc    Get logged in user orders
//  * @route   GET /api/orders/my-orders
//  * @access  Private
//  */
// exports.getMyOrders = async (req, res) => {
//     try {
//         if (!req.user) {
//             return res.status(401).json({
//                 success: false,
//                 message: "Unauthorized access.",
//             });
//         }

//         const orders = await Order.find({ customer: req.user._id }).sort({ createdAt: -1 });

//         res.status(200).json({
//             success: true,
//             count: orders.length,
//             orders,
//         });
//     } catch (error) {
//         res.status(500).json({
//             success: false,
//             message: "Server Error",
//             error: error.message,
//         });
//     }
// };

// // POST: /api/v1/orders/guest-track

// exports.trackGuestOrder = async (req, res) => {
//     try {
//         const { orderNumber, phone } = req.body;

//         // ১. ইনপুট ভ্যালিডেশন
//         if (!orderNumber || !phone) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Order Number এবং Phone Number উভয়ই প্রদান করা বাধ্যতামূলক।",
//             });
//         }

//         // ২. স্পেস বা অতিরিক্ত ক্যারেক্টার রিমুভ করা
//         const cleanOrderNumber = String(orderNumber).trim();
//         const cleanPhone = String(phone).trim();

//         // ৩. MongoDB Query Construction
//         // আপনার স্কিমা অনুযায়ী: shipping.phone এবং orderNumber / invoiceNumber মেলানো হবে
//         const query = {
//             $and: [
//                 {
//                     $or: [
//                         { orderNumber: cleanOrderNumber },
//                         { invoiceNumber: cleanOrderNumber },
//                         ...(cleanOrderNumber.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: cleanOrderNumber }] : [])
//                     ]
//                 },
//                 {
//                     $or: [
//                         { "shipping.phone": cleanPhone },   // আপনার Schema-এর মূল ফোন ফিল্ড
//                         { phone: cleanPhone },               // সেফটির জন্য
//                         { "shippingAddress.phone": cleanPhone }
//                     ]
//                 }
//             ]
//         };

//         const order = await Order.findOne(query);

//         // ৪. যদি অর্ডার পাওয়া না যায়
//         if (!order) {
//             return res.status(404).json({
//                 success: false,
//                 message: "প্রদত্ত Order Number এবং Phone Number অনুযায়ী কোনো অর্ডার পাওয়া যায়নি।",
//             });
//         }

//         // ৫. সফলভাবে অর্ডার পাওয়া গেলে
//         return res.status(200).json({
//             success: true,
//             order,
//         });

//     } catch (error) {
//         console.error("Guest Track Error:", error);
//         return res.status(500).json({
//             success: false,
//             message: error.message,
//         });
//     }
// };

// // ==========================================
// // ADMIN CONTROLLERS
// // ==========================================

// /**
//  * @desc    Get all orders for Admin (With Filters, Pagination & Search)
//  * @route   GET /api/orders/admin/all
//  * @access  Private / Admin
//  */
// exports.getAllOrdersAdmin = async (req, res) => {
//     try {
//         const {
//             page = 1,
//             limit = 10,
//             status,
//             paymentStatus,
//             search,
//             sortBy = "createdAt",
//             sortOrder = "desc",
//         } = req.query;

//         let query = {};

//         if (status) {
//             query.orderStatus = status;
//         }

//         if (paymentStatus) {
//             query["payment.status"] = paymentStatus;
//         }

//         if (search) {
//             query.$or = [
//                 { orderNumber: { $regex: search, $options: "i" } },
//                 { invoiceNumber: { $regex: search, $options: "i" } },
//                 { "shipping.fullName": { $regex: search, $options: "i" } },
//                 { "shipping.phone": { $regex: search, $options: "i" } },
//             ];
//         }

//         const pageNumber = Number(page);
//         const limitNumber = Number(limit);
//         const skip = (pageNumber - 1) * limitNumber;

//         const sortOptions = {};
//         sortOptions[sortBy] = sortOrder === "asc" ? 1 : -1;

//         const orders = await Order.find(query)
//             .populate("customer", "name email phone")
//             .sort(sortOptions)
//             .skip(skip)
//             .limit(limitNumber);

//         const totalOrders = await Order.countDocuments(query);
//         const totalPages = Math.ceil(totalOrders / limitNumber) || 1;

//         res.status(200).json({
//             success: true,
//             pagination: {
//                 totalOrders,
//                 totalPages,
//                 currentPage: pageNumber,
//                 limit: limitNumber,
//                 hasNextPage: pageNumber < totalPages,
//                 hasPrevPage: pageNumber > 1,
//             },
//             count: orders.length,
//             orders,
//         });
//     } catch (error) {
//         res.status(500).json({
//             success: false,
//             message: "Failed to fetch orders.",
//             error: error.message,
//         });
//     }
// };

// /**
//  * @desc    Update Order Status & Payment Status (Admin Only)
//  * @route   PATCH /api/orders/admin/:id/status
//  * @access  Private / Admin
//  */
// exports.updateOrderStatusAdmin = async (req, res) => {
//     try {
//         const { orderStatus, paymentStatus, adminNote, message } = req.body;

//         const order = await Order.findById(req.params.id);

//         if (!order) {
//             return res.status(404).json({
//                 success: false,
//                 message: "Order not found.",
//             });
//         }

//         const validStatuses = [
//             "pending",
//             "confirmed",
//             "processing",
//             "packed",
//             "shipped",
//             "delivered",
//             "cancelled",
//             "returned",
//         ];

//         if (orderStatus && !validStatuses.includes(orderStatus)) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Invalid order status value provided.",
//             });
//         }

//         // যদি পূর্বে Cancelled/Returned না থাকে এবং এখন Cancelled/Returned করা হয়, তবে স্টক ফেরত দেওয়া
//         const isCancellingOrReturning =
//             (orderStatus === "cancelled" || orderStatus === "returned") &&
//             order.orderStatus !== "cancelled" &&
//             order.orderStatus !== "returned";

//         if (isCancellingOrReturning) {
//             for (const item of order.products) {
//                 await Product.findByIdAndUpdate(item.product, {
//                     $inc: { stock: item.quantity },
//                 });
//             }
//         }

//         if (orderStatus) {
//             order.orderStatus = orderStatus;

//             if (orderStatus === "cancelled") {
//                 order.isCancelled = true;
//             }
//             if (orderStatus === "delivered") {
//                 order.isDelivered = true;
//                 order.payment.status = "paid"; // Delivered হলে অটোমেটিক Paid সেট হবে
//             }
//         }

//         if (paymentStatus) {
//             order.payment.status = paymentStatus;
//         }

//         if (adminNote) {
//             order.adminNote = adminNote;
//         }

//         // টাইমলাইন এন্ট্রি
//         order.timeline.push({
//             status: orderStatus || order.orderStatus,
//             message: message || `Order status updated to ${orderStatus || order.orderStatus}`,
//             updatedBy: req.user?._id || null,
//         });

//         const updatedOrder = await order.save();

//         res.status(200).json({
//             success: true,
//             message: "Order status updated successfully.",
//             order: updatedOrder,
//         });
//     } catch (error) {
//         res.status(500).json({
//             success: false,
//             message: "Failed to update order status.",
//             error: error.message,
//         });
//     }
// };

// /**
//  * @desc    Delete Order (Admin Only)
//  * @route   DELETE /api/orders/admin/:id
//  * @access  Private / Admin
//  */
// exports.deleteOrderAdmin = async (req, res) => {
//     try {
//         const order = await Order.findById(req.params.id);

//         if (!order) {
//             return res.status(404).json({
//                 success: false,
//                 message: "Order not found.",
//             });
//         }

//         // অর্ডার ডিলিট করার আগে যদি তা ডেলভার্ড বা ক্যানসেলড না হয়ে থাকে, তবে স্টক রিঅ্যাসাইন/ব্যাক করা
//         if (order.orderStatus !== "delivered" && order.orderStatus !== "cancelled") {
//             for (const item of order.products) {
//                 await Product.findByIdAndUpdate(item.product, {
//                     $inc: { stock: item.quantity },
//                 });
//             }
//         }

//         await order.deleteOne();

//         res.status(200).json({
//             success: true,
//             message: "Order deleted successfully from database.",
//         });
//     } catch (error) {
//         res.status(500).json({
//             success: false,
//             message: "Failed to delete order.",
//             error: error.message,
//         });
//     }
// };





const mongoose = require("mongoose");
const Order = require("../models/Order");
const Product = require("../models/Product");
const Coupon = require("../models/Coupon");

/**
 * Unique Order / Invoice Number Generators
 */
const generateOrderNumber = () => {
    const prefix = "ORD";
    const randomDigits = Math.floor(100000 + Math.random() * 900000);
    return `${prefix}-${Date.now().toString().slice(-4)}${randomDigits}`;
};

const generateInvoiceNumber = () => {
    const prefix = "INV";
    const randomDigits = Math.floor(100000 + Math.random() * 900000);
    return `${prefix}-${Date.now().toString().slice(-4)}${randomDigits}`;
};

/**
 * @desc    Create new Order (Guest & Registered User with Stock & Coupon handling)
 * @route   POST /api/orders
 * @access  Public / Optional Auth
 */

exports.createOrder = async (req, res) => {
    try {
        const {
            cartItems,
            shippingAddress,
            paymentMethod,
            deliveryCharge = 60,
            couponCode,
            customerNote,
        } = req.body;

        // ১. কার্ট আইটেম ও শিফিং ডাটা ভ্যালিডেশন
        if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Your cart is empty.",
            });
        }

        if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.phone || !shippingAddress.address || !shippingAddress.city) {
            return res.status(400).json({
                success: false,
                message: "Please provide all required shipping details (Name, Phone, Address, City).",
            });
        }

        const validatedItems = [];
        let subtotal = 0;

        // ২. প্রতিটি প্রোডাক্ট ডাটাবেজে চেক করা ও স্টক ভ্যালিডেশন
        for (const item of cartItems) {
            const productId = item.product || item._id;

            if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
                return res.status(400).json({
                    success: false,
                    message: `Invalid Product ID format: "${productId}".`,
                });
            }

            const dbProduct = await Product.findById(productId);

            if (!dbProduct) {
                return res.status(404).json({
                    success: false,
                    message: `Product not found with ID: ${productId}`,
                });
            }

            // স্টক চেক
            if (dbProduct.stock < item.quantity) {
                return res.status(400).json({
                    success: false,
                    message: `Insufficient stock for "${dbProduct.name}". Available stock: ${dbProduct.stock}`,
                });
            }

            const itemPrice = dbProduct.salePrice || dbProduct.price;
            const itemTotalPrice = itemPrice * item.quantity;
            subtotal += itemTotalPrice;

            // Product Snapshot Schema এর সঠিক ফর্ম্যাটে আইটেম পুশ করা (gallery সহ)
            validatedItems.push({
                product: dbProduct._id,
                name: dbProduct.name,
                slug: dbProduct.slug || "",
                sku: dbProduct.sku || item.sku || "N/A",
                thumbnail: {
                    url: dbProduct.thumbnail?.url || (typeof item.thumbnail === "string" ? item.thumbnail : item.thumbnail?.url) || "",
                    public_id: dbProduct.thumbnail?.public_id || "",
                },
                gallery: dbProduct.gallery && Array.isArray(dbProduct.gallery)
                    ? dbProduct.gallery.map((img) => ({
                        url: img.url || (typeof img === "string" ? img : ""),
                        public_id: img.public_id || "",
                    }))
                    : Array.isArray(item.gallery)
                        ? item.gallery.map((img) => ({
                            url: img.url || (typeof img === "string" ? img : ""),
                            public_id: img.public_id || "",
                        }))
                        : [],
                color: item.color || "",
                size: item.size || "",
                quantity: Number(item.quantity),
                price: Number(itemPrice),
                salePrice: dbProduct.salePrice || null,
                totalPrice: Number(itemTotalPrice),
            });
        }

        // ৩. কুপন ডিসকাউন্ট প্রসেসিং
        let discount = 0;
        if (couponCode) {
            // ৩.১ Database থেকে কুপনটি কোড দিয়ে আগে খুজে বের করা
            const validCoupon = await Coupon.findOne({
                code: couponCode.trim().toUpperCase(),
                isActive: true,
            });

            if (!validCoupon) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid or inactive coupon code.",
                });
            }

            // ৩.২ মেয়াদের তারিখ চেক করা (expirationDate / expiryDate / validUntil যেকোনো একটি সমর্থন করবে)
            const expiry = validCoupon.expirationDate || validCoupon.expiryDate || validCoupon.validUntil;
            if (expiry && new Date(expiry) < new Date()) {
                return res.status(400).json({
                    success: false,
                    message: "Coupon code has expired.",
                });
            }

            // ৩.৩ সর্বনিম্ন কেনাকাটা শর্ত চেক করা (minPurchase / minOrderAmount)
            const minAmount = validCoupon.minPurchase || validCoupon.minOrderAmount || 0;
            if (minAmount > 0 && subtotal < minAmount) {
                return res.status(400).json({
                    success: false,
                    message: `Minimum purchase requirement for coupon "${couponCode}" is ৳${minAmount}.`,
                });
            }

            // ৩.৪ ইউজারের ব্যবহার লিমিট চেক করা (লগইন করা ইউজারদের জন্য)
            if (req.user && validCoupon.userLimit) {
                const userUsageCount = await Order.countDocuments({
                    customer: req.user._id,
                    couponCode: validCoupon.code,
                });

                if (userUsageCount >= validCoupon.userLimit) {
                    return res.status(400).json({
                        success: false,
                        message: "You have already reached the maximum usage limit for this coupon.",
                    });
                }
            }

            // ৩.৫ ডিসকাউন্ট হিসাব করা
            if (validCoupon.discountType === "percentage") {
                discount = (subtotal * validCoupon.discountAmount) / 100;
                if (validCoupon.maxDiscount && discount > validCoupon.maxDiscount) {
                    discount = validCoupon.maxDiscount;
                }
            } else {
                discount = validCoupon.discountAmount;
            }
        }

        const charge = Number(deliveryCharge) >= 0 ? Number(deliveryCharge) : 60;
        const grandTotal = Math.max(0, subtotal + charge - discount);

        // ৪. কাস্টমার আইডি নির্ধারণ (Auth User নাকি Guest User)
        const userId = req.user ? req.user._id : null;
        const isGuest = !userId;

        // ৫. নতুন অর্ডার তৈরি
        const newOrder = await Order.create({
            customer: userId,
            isGuest,
            orderNumber: generateOrderNumber(),
            invoiceNumber: generateInvoiceNumber(),
            products: validatedItems,
            shipping: shippingAddress,
            payment: {
                method: paymentMethod || "cash-on-delivery",
                status: "pending",
            },
            subtotal,
            deliveryCharge: charge,
            discount,
            couponCode: couponCode || "",
            grandTotal,
            customerNote: customerNote || "",
            orderStatus: "pending",
        });

        // ৬. স্টক কমিয়ে দেওয়া (Stock Reduction)
        for (const item of validatedItems) {
            await Product.findByIdAndUpdate(item.product, {
                $inc: { stock: -item.quantity },
            });
        }

        return res.status(201).json({
            success: true,
            message: "Order placed successfully!",
            order: newOrder,
        });
    } catch (error) {
        console.error("Create Order Error:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Server error occurred while creating order.",
        });
    }
};

/**
 * @desc    Get order details by ID
 * @route   GET /api/orders/:id
 * @access  Public / Private
 */
exports.getOrderById = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid Order ID format.",
            });
        }

        const order = await Order.findById(req.params.id)
            .populate("customer", "name email phone")
            .populate("products.product", "name thumbnail gallery price stock");

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found.",
            });
        }

        res.status(200).json({
            success: true,
            order,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server Error",
            error: error.message,
        });
    }
};

/**
 * @desc    Get logged in user orders
 * @route   GET /api/orders/my-orders
 * @access  Private
 */
exports.getMyOrders = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized access.",
            });
        }

        const orders = await Order.find({ customer: req.user._id }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: orders.length,
            orders,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server Error",
            error: error.message,
        });
    }
};

// POST: /api/v1/orders/guest-track

exports.trackGuestOrder = async (req, res) => {
    try {
        const { orderNumber, phone } = req.body;

        // ১. ইনপুট ভ্যালিডেশন
        if (!orderNumber || !phone) {
            return res.status(400).json({
                success: false,
                message: "Order Number এবং Phone Number উভয়ই প্রদান করা বাধ্যতামূলক।",
            });
        }

        // ২. স্পেস বা অতিরিক্ত ক্যারেক্টার রিমুভ করা
        const cleanOrderNumber = String(orderNumber).trim();
        const cleanPhone = String(phone).trim();

        // ৩. MongoDB Query Construction
        const query = {
            $and: [
                {
                    $or: [
                        { orderNumber: cleanOrderNumber },
                        { invoiceNumber: cleanOrderNumber },
                        ...(cleanOrderNumber.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: cleanOrderNumber }] : [])
                    ]
                },
                {
                    $or: [
                        { "shipping.phone": cleanPhone },
                        { phone: cleanPhone },
                        { "shippingAddress.phone": cleanPhone }
                    ]
                }
            ]
        };

        const order = await Order.findOne(query);

        // ৪. যদি অর্ডার পাওয়া না যায়
        if (!order) {
            return res.status(404).json({
                success: false,
                message: "প্রদত্ত Order Number এবং Phone Number অনুযায়ী কোনো অর্ডার পাওয়া যায়নি।",
            });
        }

        // ৫. সফলভাবে অর্ডার পাওয়া গেলে
        return res.status(200).json({
            success: true,
            order,
        });

    } catch (error) {
        console.error("Guest Track Error:", error);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// ==========================================
// ADMIN CONTROLLERS
// ==========================================

/**
 * @desc    Get all orders for Admin (With Filters, Pagination & Search)
 * @route   GET /api/orders/admin/all
 * @access  Private / Admin
 */
exports.getAllOrdersAdmin = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            status,
            paymentStatus,
            search,
            sortBy = "createdAt",
            sortOrder = "desc",
        } = req.query;

        let query = {};

        if (status) {
            query.orderStatus = status;
        }

        if (paymentStatus) {
            query["payment.status"] = paymentStatus;
        }

        if (search) {
            query.$or = [
                { orderNumber: { $regex: search, $options: "i" } },
                { invoiceNumber: { $regex: search, $options: "i" } },
                { "shipping.fullName": { $regex: search, $options: "i" } },
                { "shipping.phone": { $regex: search, $options: "i" } },
            ];
        }

        const pageNumber = Number(page);
        const limitNumber = Number(limit);
        const skip = (pageNumber - 1) * limitNumber;

        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === "asc" ? 1 : -1;

        const orders = await Order.find(query)
            .populate("customer", "name email phone")
            .sort(sortOptions)
            .skip(skip)
            .limit(limitNumber);

        const totalOrders = await Order.countDocuments(query);
        const totalPages = Math.ceil(totalOrders / limitNumber) || 1;

        res.status(200).json({
            success: true,
            pagination: {
                totalOrders,
                totalPages,
                currentPage: pageNumber,
                limit: limitNumber,
                hasNextPage: pageNumber < totalPages,
                hasPrevPage: pageNumber > 1,
            },
            count: orders.length,
            orders,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch orders.",
            error: error.message,
        });
    }
};

/**
 * @desc    Update Order Status & Payment Status (Admin Only)
 * @route   PATCH /api/orders/admin/:id/status
 * @access  Private / Admin
 */
exports.updateOrderStatusAdmin = async (req, res) => {
    try {
        const { orderStatus, paymentStatus, adminNote, message } = req.body;

        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found.",
            });
        }

        const validStatuses = [
            "pending",
            "confirmed",
            "processing",
            "packed",
            "shipped",
            "delivered",
            "cancelled",
            "returned",
        ];

        if (orderStatus && !validStatuses.includes(orderStatus)) {
            return res.status(400).json({
                success: false,
                message: "Invalid order status value provided.",
            });
        }

        // যদি পূর্বে Cancelled/Returned না থাকে এবং এখন Cancelled/Returned করা হয়, তবে স্টক ফেরত দেওয়া
        const isCancellingOrReturning =
            (orderStatus === "cancelled" || orderStatus === "returned") &&
            order.orderStatus !== "cancelled" &&
            order.orderStatus !== "returned";

        if (isCancellingOrReturning) {
            for (const item of order.products) {
                await Product.findByIdAndUpdate(item.product, {
                    $inc: { stock: item.quantity },
                });
            }
        }

        if (orderStatus) {
            order.orderStatus = orderStatus;

            if (orderStatus === "cancelled") {
                order.isCancelled = true;
            }
            if (orderStatus === "delivered") {
                order.isDelivered = true;
                order.payment.status = "paid"; // Delivered হলে অটোমেটিক Paid সেট হবে
            }
        }

        if (paymentStatus) {
            order.payment.status = paymentStatus;
        }

        if (adminNote) {
            order.adminNote = adminNote;
        }

        // টাইমলাইন এন্ট্রি
        order.timeline.push({
            status: orderStatus || order.orderStatus,
            message: message || `Order status updated to ${orderStatus || order.orderStatus}`,
            updatedBy: req.user?._id || null,
        });

        const updatedOrder = await order.save();

        res.status(200).json({
            success: true,
            message: "Order status updated successfully.",
            order: updatedOrder,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to update order status.",
            error: error.message,
        });
    }
};

/**
 * @desc    Delete Order (Admin Only)
 * @route   DELETE /api/orders/admin/:id
 * @access  Private / Admin
 */
exports.deleteOrderAdmin = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found.",
            });
        }

        // অর্ডার ডিলিট করার আগে যদি তা ডেলভার্ড বা ক্যানসেলড না হয়ে থাকে, তবে স্টক রিঅ্যাসাইন/ব্যাক করা
        if (order.orderStatus !== "delivered" && order.orderStatus !== "cancelled") {
            for (const item of order.products) {
                await Product.findByIdAndUpdate(item.product, {
                    $inc: { stock: item.quantity },
                });
            }
        }

        await order.deleteOne();

        res.status(200).json({
            success: true,
            message: "Order deleted successfully from database.",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to delete order.",
            error: error.message,
        });
    }
};