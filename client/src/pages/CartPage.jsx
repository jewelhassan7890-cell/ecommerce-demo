import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    Trash2,
    Plus,
    Minus,
    ShoppingBag,
    ArrowLeft,
    ShieldCheck,
    Truck,
    Tag
} from "lucide-react";
import { useCart } from "../context/CartContext"; // সঠিক পাথ দিন

function CartPage() {
    const navigate = useNavigate();
    const { cart, loading, updateQuantity, removeFromCart, clearCart } = useCart();
    const [updatingItemId, setUpdatingItemId] = useState(null);

    // পরিমাণ (Quantity) পরিবর্তন
    const handleQuantityChange = async (itemId, currentQty, change) => {
        const newQty = currentQty + change;
        if (newQty < 1 || updatingItemId === itemId) return;

        try {
            setUpdatingItemId(itemId);
            await updateQuantity(itemId, newQty);
        } finally {
            setUpdatingItemId(null);
        }
    };

    // আইটেম রিমুভ করা
    const handleRemoveItem = async (itemId) => {
        if (updatingItemId === itemId) return;
        try {
            setUpdatingItemId(itemId);
            await removeFromCart(itemId);
        } finally {
            setUpdatingItemId(null);
        }
    };

    // কার্ট ক্লিয়ার করা
    const handleClearCart = async () => {
        if (!window.confirm("Are you sure you want to clear your cart?")) return;
        await clearCart();
    };

    // লোডিং স্টেট
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex justify-center items-center p-4">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
            </div>
        );
    }

    // থাম্বনেইল, গ্যালারি কিংবা প্রপস থেকে ছবি নিরাপদে বের করার হেলপার ফাংশন
    const getItemImageUrl = (item) => {
        if (!item) return "/placeholder.jpg";

        // ১. সরাসরি ইমেজ বা থাম্বনেইল অবজেক্ট চেক
        if (typeof item.image === "string" && item.image) return item.image;
        if (item.thumbnail?.url) return item.thumbnail.url;
        if (typeof item.thumbnail === "string" && item.thumbnail) return item.thumbnail;

        // ২. ব্যাকএন্ড Populated Product Data চেক
        const prod = item.productData || item.product;
        if (prod && typeof prod === "object") {
            if (prod.thumbnail?.url) return prod.thumbnail.url;
            if (typeof prod.thumbnail === "string") return prod.thumbnail;
            if (Array.isArray(prod.gallery) && prod.gallery.length > 0) {
                const gItem = prod.gallery[0];
                return typeof gItem === "string" ? gItem : gItem?.url || "";
            }
        }

        // ৩. সরাসরি Gallery Check
        if (Array.isArray(item.gallery) && item.gallery.length > 0) {
            const gItem = item.gallery[0];
            return typeof gItem === "string" ? gItem : gItem?.url || "";
        }

        return "/placeholder.jpg";
    };


    const items = cart?.items || [];
    const isEmpty = items.length === 0;

    // const handleProceedToCheckout = () => {
    //     if (isEmpty) return;

    //     // ১. কার্টের আইটেমগুলোকে স্ট্রাকচার করে নেওয়া
    //     const checkoutItems = items.map((item) => ({
    //         _id: item._id || item.product?._id || item.id,
    //         product: item.product?._id || item.product || item._id,
    //         name: item.name || item.product?.name,
    //         quantity: item.quantity,
    //         color: item.color || "",
    //         size: item.size || "",
    //         price: item.price || item.unitPrice,
    //         salePrice: item.salePrice || item.unitPrice || item.price,
    //         sku: item.sku || "N/A",
    //         thumbnail: item.thumbnail?.url || item.thumbnail || "/placeholder.jpg"
    //     }));

    //     // ২. LocalStorage-এ আইটেম সেভ রাখা যাতে Checkout পেজে পাওয়া যায়
    //     localStorage.setItem("cartItems", JSON.stringify(checkoutItems));

    //     // ৩. সরাসরি Checkout পেজে পাঠানো (লগইন এবং গেস্ট উভয়ই যেতে পারবে)
    //     navigate("/checkout");
    // };


    const handleProceedToCheckout = () => {
        if (isEmpty) return;

        // ১. প্রফেশনাল উপায়ে কার্ট আইটেম স্ট্রাকচারিং
        const checkoutItems = items.map((item) => {
            const prod = item.productData || (typeof item.product === "object" ? item.product : null);

            return {
                _id: item._id || prod?._id || item.cartItemId,
                product: prod?._id || item.product || item._id,
                name: item.name || prod?.name || "Product",
                quantity: Number(item.quantity) || 1,
                color: item.color || "",
                size: item.size || "",
                price: Number(item.price) || Number(prod?.price) || Number(item.unitPrice) || 0,
                salePrice: Number(item.salePrice) || Number(prod?.salePrice) || Number(item.unitPrice) || 0,
                sku: item.sku || prod?.sku || "N/A",
                // সকল ইমেজের সোর্স থেকে সেফলি ইমেজ ইউআরএল প্রসেস করা
                thumbnail: getItemImageUrl(item),
                gallery: item.gallery || prod?.gallery || []
            };
        });

        // ২. LocalStorage-এ চেকআউট আইটেম সেভ করা
        localStorage.setItem("cartItems", JSON.stringify(checkoutItems));

        // ৩. Checkout পেজে রিডাইরেক্ট করা
        navigate("/checkout");
    };

    return (
        <div className="bg-gray-50 min-h-screen py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">

                {/* Header & Title */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4 border-gray-200">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 flex items-center gap-2">
                            <ShoppingBag className="w-7 h-7 text-black" />
                            Shopping Cart
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">
                            {cart?.totalItems || 0} {cart?.totalItems === 1 ? "item" : "items"} in your cart
                        </p>
                    </div>

                    {!isEmpty && (
                        <button
                            onClick={handleClearCart}
                            className="text-xs sm:text-sm text-red-600 hover:text-red-800 font-semibold flex items-center gap-1 self-start sm:self-auto transition-colors"
                        >
                            <Trash2 className="w-4 h-4" /> Clear Shopping Cart
                        </button>
                    )}
                </div>

                {/* Empty Cart View */}
                {isEmpty ? (
                    <div className="bg-white border border-gray-200 rounded-2xl p-10 sm:p-16 text-center shadow-sm max-w-lg mx-auto space-y-4 my-10">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto text-gray-400">
                            <ShoppingBag className="w-10 h-10" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900">Your cart is empty</h2>
                        <p className="text-sm text-gray-500">
                            Looks like you haven't added anything to your cart yet.
                        </p>
                        <Link
                            to="/"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white text-sm font-semibold rounded-xl hover:bg-gray-800 transition-all shadow-md"
                        >
                            <ArrowLeft className="w-4 h-4" /> Continue Shopping
                        </Link>
                    </div>
                ) : (
                    /* Main Cart Content Grid */
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                        {/* Cart Items List */}
                        <div className="lg:col-span-8 space-y-4">
                            {items.map((item) => {
                                const isUpdating = updatingItemId === item._id;

                                return (
                                    <div
                                        key={item._id}
                                        className={`bg-white border border-gray-200 rounded-2xl p-4 sm:p-5 shadow-sm transition-all flex flex-col sm:flex-row gap-4 sm:items-center justify-between ${isUpdating ? "opacity-60" : ""
                                            }`}
                                    >
                                        {/* Product Image & Info */}
                                        <div className="flex gap-4 items-center">
                                            {/* <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-50 rounded-xl overflow-hidden border border-gray-100 shrink-0">
                                                <img
                                                    src={item.thumbnail?.url || item.thumbnail || "/placeholder.jpg"}
                                                    alt={item.name}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        e.target.onerror = null;
                                                        e.target.src = "https://via.placeholder.com/150?text=No+Image";
                                                    }}
                                                />
                                            </div> */}

                                            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-50 rounded-xl overflow-hidden border border-gray-100 shrink-0">
                                                <img
                                                    src={getItemImageUrl(item)}
                                                    alt={item.name || item.product?.name || "Product Image"}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        e.target.onerror = null;
                                                        e.target.src = "https://via.placeholder.com/150?text=No+Image";
                                                    }}
                                                />
                                            </div>

                                            <div className="space-y-1">
                                                <Link
                                                    to={`/product/${item.slug || item.product?.slug}`}
                                                    className="font-bold text-gray-900 hover:text-blue-600 line-clamp-1 transition-colors text-base sm:text-lg"
                                                >
                                                    {item.name || item.product?.name}
                                                </Link>

                                                {/* Variant Info */}
                                                {(item.color || item.size) && (
                                                    <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                                                        {item.color && (
                                                            <span className="bg-gray-100 px-2 py-0.5 rounded">
                                                                Color: <strong>{item.color}</strong>
                                                            </span>
                                                        )}
                                                        {item.size && (
                                                            <span className="bg-gray-100 px-2 py-0.5 rounded">
                                                                Size: <strong>{item.size}</strong>
                                                            </span>
                                                        )}
                                                    </div>
                                                )}

                                                <p className="text-xs text-gray-400">SKU: {item.sku || "N/A"}</p>

                                                {/* Price Display */}
                                                <div className="flex items-baseline gap-2 pt-1">
                                                    <span className="text-base font-extrabold text-gray-900">
                                                        ৳{(item.unitPrice || item.price)?.toLocaleString()}
                                                    </span>
                                                    {item.salePrice > 0 && item.price > item.salePrice && (
                                                        <span className="text-xs text-gray-400 line-through">
                                                            ৳{item.price?.toLocaleString()}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Actions: Quantity Controls & Total */}
                                        <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 pt-3 sm:pt-0 border-gray-100">

                                            {/* Quantity Counter */}
                                            <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden bg-gray-50">
                                                <button
                                                    onClick={() => handleQuantityChange(item._id, item.quantity, -1)}
                                                    disabled={item.quantity <= 1 || isUpdating}
                                                    className="p-2 text-gray-600 hover:bg-gray-200 disabled:opacity-30 transition-colors cursor-pointer disabled:cursor-not-allowed"
                                                >
                                                    <Minus className="w-3.5 h-3.5" />
                                                </button>
                                                <span className="w-8 text-center text-sm font-bold text-gray-900 select-none">
                                                    {item.quantity}
                                                </span>
                                                <button
                                                    onClick={() => handleQuantityChange(item._id, item.quantity, 1)}
                                                    disabled={isUpdating}
                                                    className="p-2 text-gray-600 hover:bg-gray-200 disabled:opacity-30 transition-colors cursor-pointer disabled:cursor-not-allowed"
                                                >
                                                    <Plus className="w-3.5 h-3.5" />
                                                </button>
                                            </div>

                                            {/* Total Price for this Item */}
                                            <div className="text-right">
                                                <span className="text-xs text-gray-400 block sm:hidden">Total:</span>
                                                <span className="text-base font-extrabold text-gray-900">
                                                    ৳{(item.totalPrice || (item.unitPrice * item.quantity))?.toLocaleString()}
                                                </span>
                                            </div>

                                            {/* Remove Item Button */}
                                            <button
                                                onClick={() => handleRemoveItem(item._id)}
                                                disabled={isUpdating}
                                                className="text-gray-400 hover:text-red-600 p-1 rounded-lg hover:bg-red-50 disabled:opacity-30 transition-colors cursor-pointer disabled:cursor-not-allowed"
                                                title="Remove Item"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}

                            <div className="pt-2">
                                <Link
                                    to="/"
                                    className="inline-flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-black transition-colors"
                                >
                                    <ArrowLeft className="w-4 h-4" /> Continue Shopping
                                </Link>
                            </div>
                        </div>

                        {/* Order Summary Sidebar */}
                        <div className="lg:col-span-4">
                            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-6 sticky top-6">
                                <h3 className="text-lg font-bold text-gray-900 border-b pb-3 border-gray-100">
                                    Order Summary
                                </h3>

                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between text-gray-600">
                                        <span>Subtotal ({cart?.totalItems || 0} items)</span>
                                        <span className="font-semibold text-gray-900">৳{cart?.subtotal?.toLocaleString() || 0}</span>
                                    </div>

                                    {cart?.discount > 0 && (
                                        <div className="flex justify-between text-green-600 font-medium">
                                            <span className="flex items-center gap-1">
                                                <Tag className="w-3.5 h-3.5" /> Coupon Discount
                                            </span>
                                            <span>-৳{cart?.discount?.toLocaleString()}</span>
                                        </div>
                                    )}

                                    <div className="flex justify-between text-gray-600">
                                        <span>Estimated Shipping</span>
                                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded font-medium">Calculated at Checkout</span>
                                    </div>

                                    <div className="border-t pt-3 flex justify-between items-baseline border-gray-100">
                                        <span className="text-base font-bold text-gray-900">Grand Total</span>
                                        <span className="text-2xl font-black text-gray-900">
                                            ৳{cart?.grandTotal?.toLocaleString() || 0}
                                        </span>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={handleProceedToCheckout}
                                    disabled={isEmpty}
                                    className="w-full py-3.5 bg-black text-white text-sm font-bold rounded-xl hover:bg-gray-800 active:scale-95 transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                >
                                    Proceed to Checkout
                                </button>

                                <div className="border-t pt-4 border-gray-100 space-y-2.5 text-xs text-gray-500">
                                    <div className="flex items-center gap-2">
                                        <ShieldCheck className="w-4 h-4 text-green-600 shrink-0" />
                                        <span>100% Safe & Secure Checkout</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Truck className="w-4 h-4 text-blue-600 shrink-0" />
                                        <span>Fast & Reliable Home Delivery</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                )}
            </div>
        </div>
    );
}

export default CartPage;

