import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import {
    FiPackage,
    FiClock,
    FiCheckCircle,
    FiTruck,
    FiXCircle,
    FiMapPin,
    FiUser,
    FiPhone,
    FiMail,
    FiArrowLeft,
    FiShoppingBag
} from "react-icons/fi";

const BASE_URL = import.meta.env.VITE_API_URL || "https://ecommerce-demo-ro6m48tke-style-and-closet.vercel.app";

const OrderDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchOrderDetails = async () => {
            if (!id) return;

            try {
                setLoading(true);
                setError("");

                const token = localStorage.getItem("token");
                const headers = {};
                if (token && token !== "null" && token !== "undefined" && token.trim() !== "") {
                    headers["Authorization"] = `Bearer ${token}`;
                }

                // Fetch order details by ID from backend API
                const response = await axios.get(`${BASE_URL}/orders/${id}`, { headers });

                if (response.data?.success) {
                    setOrder(response.data.order || response.data.data);
                } else if (response.data?._id || response.data?.id) {
                    setOrder(response.data);
                } else {
                    setError("Order not found.");
                }
            } catch (err) {
                console.error("Fetch Order Details Error:", err);
                const msg = err.response?.data?.message || "Failed to load order details.";
                setError(msg);
            } finally {
                setLoading(false);
            }
        };

        fetchOrderDetails();
    }, [id]);

    // Backend Order Status Normalization Helper
    const getStatusBadge = (rawStatus = "pending") => {
        // Safe string sanitization to handle status strings like 'in_transit', 'SHIPPED', 'Pending'
        const statusKey = String(rawStatus).toLowerCase().replace(/[\s_-]+/g, "");

        const statusMap = {
            pending: { color: "bg-amber-100 text-amber-800 border-amber-300", icon: <FiClock className="w-4 h-4" />, text: "Pending" },
            processing: { color: "bg-blue-100 text-blue-800 border-blue-300", icon: <FiPackage className="w-4 h-4" />, text: "Processing" },
            shipped: { color: "bg-purple-100 text-purple-800 border-purple-300", icon: <FiTruck className="w-4 h-4" />, text: "Shipped" },
            intransit: { color: "bg-purple-100 text-purple-800 border-purple-300", icon: <FiTruck className="w-4 h-4" />, text: "In Transit" },
            delivered: { color: "bg-emerald-100 text-emerald-800 border-emerald-300", icon: <FiCheckCircle className="w-4 h-4" />, text: "Delivered" },
            completed: { color: "bg-emerald-100 text-emerald-800 border-emerald-300", icon: <FiCheckCircle className="w-4 h-4" />, text: "Completed" },
            cancelled: { color: "bg-rose-100 text-rose-800 border-rose-300", icon: <FiXCircle className="w-4 h-4" />, text: "Cancelled" },
            canceled: { color: "bg-rose-100 text-rose-800 border-rose-300", icon: <FiXCircle className="w-4 h-4" />, text: "Cancelled" },
        };

        const current = statusMap[statusKey] || {
            color: "bg-gray-100 text-gray-800 border-gray-300",
            icon: <FiClock className="w-4 h-4" />,
            text: rawStatus.charAt(0).toUpperCase() + rawStatus.slice(1)
        };

        return (
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${current.color}`}>
                {current.icon}
                {current.text}
            </span>
        );
    };

    // Loading State
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-600 font-medium text-sm">Loading order details...</p>
                </div>
            </div>
        );
    }

    // Error State
    if (error || !order) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
                    <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FiXCircle className="w-8 h-8" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Order Not Found</h2>
                    <p className="text-gray-500 text-sm mb-6">{error || "We couldn't find the order you were looking for."}</p>
                    <button
                        onClick={() => navigate("/")}
                        className="w-full py-3 bg-black text-white rounded-xl text-sm font-semibold hover:bg-gray-800 transition-all"
                    >
                        Return to Homepage
                    </button>
                </div>
            </div>
        );
    }

    // Resolving order items array across common backend schemas
    const orderItems = order.cartItems || order.products || order.items || [];

    // Resolving root status safely across varying backend models
    const activeOrderStatus = order.orderStatus || order.status || "pending";
    const activePaymentStatus = order.payment.status || order.payment.status || "unpaid";


    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto space-y-6">

                {/* Top Navigation */}
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => navigate(-1)}
                        className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-black transition-colors"
                    >
                        <FiArrowLeft className="w-4 h-4" /> Back
                    </button>

                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 text-sm font-semibold text-black hover:underline"
                    >
                        <FiShoppingBag className="w-4 h-4" /> Continue Shopping
                    </Link>
                </div>

                {/* Order Header Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                                Order #{order.orderNumber || order._id?.slice(-8).toUpperCase()}
                            </h1>
                            {getStatusBadge(activeOrderStatus)}
                        </div>
                        <p className="text-xs text-gray-500">
                            Placed on {new Date(order?.createdAt || order?.created_at || undefined).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </p>

                        {order.adminNote && (
                            <div className="flex items-start gap-2 p-3 bg-amber-50/60 border border-amber-200/80 rounded-xl text-xs sm:text-sm text-gray-700 mt-3">
                                <span className="font-semibold text-amber-800 shrink-0">Admin Note:</span>
                                <p className="text-gray-600 leading-relaxed font-normal">{order.adminNote}</p>
                            </div>
                        )}
                    </div>

                    {(!order.customer || order.isGuest) && (
                        <span className="self-start sm:self-center px-3 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded-md border border-gray-200">
                            Guest Order
                        </span>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Left Column: Items and Delivery Details */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-5 border-b border-gray-100">
                                <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                                    <FiPackage className="w-5 h-5 text-gray-500" /> Purchased Items ({orderItems.length})
                                </h2>
                            </div>

                            <div className="divide-y divide-gray-100">
                                {orderItems.map((item, index) => {
                                    const prodData = item.product || item;
                                    const itemImage = prodData.thumbnail?.url || prodData.thumbnail || item.thumbnail || "/placeholder.jpg";

                                    return (
                                        <div key={item._id || index} className="p-4 sm:p-5 flex items-center gap-4">
                                            <img
                                                src={itemImage}
                                                alt={prodData.name || "Product"}
                                                className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-xl bg-gray-50 border border-gray-100 flex-shrink-0"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-sm font-semibold text-gray-900 truncate">
                                                    {prodData.name || "Product Name"}
                                                </h3>

                                                <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                                                    {item.color && <span>Color: <strong className="text-gray-700">{item.color}</strong></span>}
                                                    {item.size && <span>Size: <strong className="text-gray-700">{item.size}</strong></span>}
                                                    {item.sku && <span>SKU: <strong className="text-gray-700">{item.sku}</strong></span>}
                                                </div>

                                                <div className="flex items-center justify-between mt-2">
                                                    <span className="text-xs text-gray-500">Qty: {item.quantity}</span>
                                                    <span className="text-sm font-bold text-gray-900">
                                                        ৳{(Number(item.price || 0) * Number(item.quantity || 1)).toLocaleString()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Shipping Address */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-4">
                            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
                                <FiMapPin className="w-5 h-5 text-gray-500" /> Delivery Address
                            </h2>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-600">
                                <div className="flex items-start gap-2.5">
                                    <FiUser className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                                    <div>
                                        <p className="text-xs text-gray-400">Recipient Name</p>
                                        <p className="font-semibold text-gray-800">
                                            {order.shipping?.fullName || order.customer?.name || "N/A"}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-2.5">
                                    <FiPhone className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                                    <div>
                                        <p className="text-xs text-gray-400">Phone Number</p>
                                        <p className="font-semibold text-gray-800">
                                            {order.shipping?.phone || order.customer?.phone || "N/A"}
                                        </p>
                                    </div>
                                </div>

                                {order.shipping?.email && (
                                    <div className="flex items-start gap-2.5 sm:col-span-2">
                                        <FiMail className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                                        <div>
                                            <p className="text-xs text-gray-400">Email Address</p>
                                            <p className="font-semibold text-gray-800">{order.shipping.email}</p>
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-start gap-2.5 sm:col-span-2">
                                    <FiMapPin className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                                    <div>
                                        <p className="text-xs text-gray-400">Full Address</p>
                                        <p className="font-medium text-gray-800">
                                            {order.shipping?.address},{order.shipping?.postalCode}{order.shipping?.area ? `${order.shipping.area}, ` : ""}{order.shipping?.city}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Payment Summary */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-4">
                            <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3">
                                Payment Summary
                            </h2>

                            <div className="space-y-2.5 text-sm">
                                <div className="flex justify-between text-gray-600">
                                    <span>Subtotal</span>
                                    <span className="font-medium text-gray-900">৳{(order.subtotal || order.totalAmount || 0).toLocaleString()}</span>
                                </div>

                                <div className="flex justify-between text-gray-600">
                                    <span>Delivery Charge</span>
                                    <span className="font-medium text-gray-900">৳{(order.deliveryCharge || 0).toLocaleString()}</span>
                                </div>

                                {order.discountAmount > 0 && (
                                    <div className="flex justify-between text-emerald-600">
                                        <span>Discount</span>
                                        <span className="font-medium">- ৳{order.discountAmount.toLocaleString()}</span>
                                    </div>
                                )}

                                <div className="pt-3 border-t border-gray-100 flex justify-between text-base font-bold text-gray-900">
                                    <span>Total Payable</span>
                                    <span className="text-lg text-black">
                                        ৳{(order.totalAmount || ((order.subtotal || 0) + (order.deliveryCharge || 0) - (order.discountAmount || 0))).toLocaleString()}
                                    </span>
                                </div>
                            </div>

                            {/* Payment Method & Payment Status */}
                            <div className="pt-4 border-t border-gray-100 space-y-2">
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-gray-500">Payment Method:</span>
                                    <span className="font-bold uppercase text-gray-800 bg-gray-100 px-2.5 py-1 rounded">
                                        {order.payment.method || "COD"}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-gray-500">Payment Status:</span>
                                    <span className={`font-bold capitalize ${String(activePaymentStatus).toLowerCase() === "paid" ? "text-emerald-600" : "text-amber-600"}`}>
                                        {activePaymentStatus}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Customer Note */}
                        {order.customerNote && (
                            <div className="bg-amber-50 rounded-2xl border border-amber-200/60 p-4">
                                <h3 className="text-xs font-bold text-amber-900 uppercase tracking-wider mb-1">Customer Note</h3>
                                <p className="text-xs text-amber-800 italic">"{order.customerNote}"</p>
                            </div>
                        )}
                    </div>

                </div>

            </div>
        </div>
    );
};

export default OrderDetails;