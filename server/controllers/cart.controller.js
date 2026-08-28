const Cart = require("../models/Cart"); // আপনার মডেলের পাথ
const Product = require("../models/Product"); // প্রোডাক্ট মডেল

// ==========================================
// Helper Function: Cart Summary Recalculator
// ==========================================
const calculateCartTotals = (cart) => {
    let totalItems = 0;
    let subtotal = 0;

    // ১. প্রতিটি আইটেমের টোটাল ও সাবটোটাল হিসাব
    cart.items.forEach((item) => {
        item.totalPrice = item.unitPrice * item.quantity;
        subtotal += item.totalPrice;
        totalItems += item.quantity;
    });

    cart.subtotal = subtotal;
    cart.totalItems = totalItems;

    // ২. কুপন ডিসকাউন্ট হিসাব
    let discountAmount = 0;
    if (cart.coupon && cart.coupon.code) {
        if (cart.coupon.discountType === "percentage") {
            discountAmount = (subtotal * cart.coupon.discountValue) / 100;
        } else if (cart.coupon.discountType === "fixed") {
            discountAmount = cart.coupon.discountValue;
        }
    }

    // ডিসকাউন্ট সাবটোটালের চেয়ে বেশি হতে পারবে না
    cart.discount = Math.min(discountAmount, subtotal);
    cart.grandTotal = Math.max(0, subtotal - cart.discount);

    return cart;
};

// ==========================================
// 1. Get User Cart
// GET /api/v1/cart
// ==========================================
exports.getCart = async (req, res) => {
    try {
        const userId = req.user._id; // Auth Middleware থেকে প্রাপ্ত

        let cart = await Cart.findOne({ customer: userId, isDeleted: false });

        if (!cart) {
            cart = await Cart.create({ customer: userId, items: [] });
        }

        res.status(200).json({
            success: true,
            data: cart,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ==========================================
// 2. Add Item to Cart
// POST /api/v1/cart/add
// ==========================================
exports.addToCart = async (req, res) => {
    try {
        const userId = req.user._id;
        const { productId, quantity = 1, color = "", size = "" } = req.body;

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        let cart = await Cart.findOne({ customer: userId, isDeleted: false });
        if (!cart) {
            cart = new Cart({ customer: userId, items: [] });
        }

        // ইউনিট প্রাইজ নির্ধারণ (সেল প্রাইস থাকলে তা প্রাধান্য পাবে)
        const unitPrice = product.salePrice > 0 ? product.salePrice : product.price;

        // ভ্যারিয়েন্ট (Color + Size) ম্যাচ করে কি না তা চেক
        const existingItemIndex = cart.items.findIndex(
            (item) =>
                item.product.toString() === productId &&
                item.color === color &&
                item.size === size
        );

        if (existingItemIndex > -1) {
            // যদি আইটেম আগে থেকেই কার্টে থাকে, পরিমাণ বাড়িয়ে দেওয়া
            cart.items[existingItemIndex].quantity += Number(quantity);
        } else {
            // নতুন আইটেম কার্টে যোগ করা (Snapshot Data সহ)
            cart.items.push({
                product: product._id,
                name: product.name,
                slug: product.slug,
                sku: product.sku || "N/A",
                thumbnail: product.thumbnail,
                color,
                size,
                quantity: Number(quantity),
                price: product.price,
                salePrice: product.salePrice || 0,
                unitPrice,
                totalPrice: unitPrice * Number(quantity),
            });
        }

        // টোটাল রিক্যালকুলেট করে সেভ
        calculateCartTotals(cart);
        await cart.save();

        res.status(200).json({
            success: true,
            message: "Item added to cart successfully",
            data: cart,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ==========================================
// 3. Update Cart Item Quantity
// PATCH /api/v1/cart/item/:itemId
// ==========================================
exports.updateCartItemQuantity = async (req, res) => {
    try {
        const userId = req.user._id;
        const { itemId } = req.params;
        const { quantity } = req.body;

        if (quantity < 1) {
            return res.status(400).json({ success: false, message: "Quantity must be at least 1" });
        }

        const cart = await Cart.findOne({ customer: userId, isDeleted: false });
        if (!cart) {
            return res.status(404).json({ success: false, message: "Cart not found" });
        }

        const item = cart.items.id(itemId);
        if (!item) {
            return res.status(404).json({ success: false, message: "Cart item not found" });
        }

        item.quantity = Number(quantity);

        calculateCartTotals(cart);
        await cart.save();

        res.status(200).json({
            success: true,
            message: "Cart updated successfully",
            data: cart,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ==========================================
// 4. Remove Item from Cart
// DELETE /api/v1/cart/item/:itemId
// ==========================================
exports.removeCartItem = async (req, res) => {
    try {
        const userId = req.user._id;
        const { itemId } = req.params;

        const cart = await Cart.findOne({ customer: userId, isDeleted: false });
        if (!cart) {
            return res.status(404).json({ success: false, message: "Cart not found" });
        }

        cart.items = cart.items.filter((item) => item._id.toString() !== itemId);

        calculateCartTotals(cart);
        await cart.save();

        res.status(200).json({
            success: true,
            message: "Item removed from cart",
            data: cart,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ==========================================
// 5. Clear Entire Cart
// DELETE /api/v1/cart/clear
// ==========================================
exports.clearCart = async (req, res) => {
    try {
        const userId = req.user._id;

        const cart = await Cart.findOne({ customer: userId, isDeleted: false });
        if (cart) {
            cart.items = [];
            cart.coupon = { code: "", discountType: "", discountValue: 0 };
            calculateCartTotals(cart);
            await cart.save();
        }

        res.status(200).json({
            success: true,
            message: "Cart cleared successfully",
            data: cart,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


