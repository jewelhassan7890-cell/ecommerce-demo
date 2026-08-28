import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import {
    FiPackage,
    FiClock,
    FiCheckCircle,
    FiXCircle,
    FiTruck,
    FiChevronRight,
    FiSearch,
    FiRefreshCw,
    FiAlertCircle,
    FiPhone,
    FiHash,
    FiUserCheck,
} from "react-icons/fi";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const MyOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    // গেস্ট ইউজারের ইনপুট স্টেট
    const [guestOrderNumber, setGuestOrderNumber] = useState("");
    const [guestPhone, setGuestPhone] = useState("");
    const [phoneError, setPhoneError] = useState("");

    // ১. লগইন করা ইউজারদের জন্য অর্ডার ফেচ করা
    const fetchAuthUserOrders = async () => {
        try {
            setLoading(true);
            setError("");

            const token = localStorage.getItem("token");
            if (!token) {
                setIsLoggedIn(false);
                setLoading(false);
                return;
            }

            setIsLoggedIn(true);

            const response = await axios.get(`${BASE_URL}/orders/my-orders`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.data.success) {
                setOrders(response.data.orders || response.data.data || []);
            } else if (Array.isArray(response.data)) {
                setOrders(response.data);
            } else {
                setOrders([]);
            }
        } catch (err) {
            console.error("Fetch Auth Orders Error:", err);
            setError(err.response?.data?.message || "অর্ডার লোড করা সম্ভব হয়নি।");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAuthUserOrders();
    }, []);

    // ২. বাংলাদেশি ফোন নম্বর ভ্যালিডেশন (১১ ডিজিট)
    const validatePhone = (phone) => {
        const phoneRegex = /(^(\+8801|8801|01)[3-9]\d{8}$)/;
        return phoneRegex.test(phone);
    };

    // ৩. গেস্ট ইউজারের ইনপুট ভ্যালিডেশন এবং এপিআই কল
    const handleGuestOrderSearch = async (e) => {
        e.preventDefault();
        setError("");
        setPhoneError("");

        if (!guestOrderNumber.trim()) {
            setError("অনুগ্রহ করে সঠিক Order Number দিন।");
            return;
        }

        if (!guestPhone.trim()) {
            setPhoneError("অনুগ্রহ করে Mobile Number প্রদান করুন।");
            return;
        }

        if (!validatePhone(guestPhone.trim())) {
            setPhoneError("সঠিক মোবাইল নম্বর প্রদান করুন (যেমন: 01700000000)।");
            return;
        }

        try {
            setLoading(true);
            const response = await axios.post(`${BASE_URL}/orders/guest-track`, {
                orderNumber: guestOrderNumber.trim(),
                phone: guestPhone.trim(),
            });

            if (response.data.success) {
                const fetchedData = response.data.order || response.data.data;
                setOrders(Array.isArray(fetchedData) ? fetchedData : [fetchedData]);
            } else {
                setError(response.data.message || "কোনো অর্ডার পাওয়া যায়নি।");
                setOrders([]);
            }
        } catch (err) {
            console.error("Guest Search Error:", err);
            setError(
                err.response?.data?.message || "Order Number অথবা Phone Number মিলছে না।"
            );
            setOrders([]);
        } finally {
            setLoading(false);
        }
    };

    // স্ট্যাটাস অনুসারে কালার ও আইকন
    const getStatusBadge = (status) => {
        const lowerStatus = status?.toLowerCase();
        switch (lowerStatus) {
            case "delivered":
                return { bg: "bg-green-100 text-green-700 border-green-200", icon: <FiCheckCircle className="inline mr-1" /> };
            case "processing":
            case "pending":
                return { bg: "bg-amber-100 text-amber-700 border-amber-200", icon: <FiClock className="inline mr-1" /> };
            case "shipped":
                return { bg: "bg-blue-100 text-blue-700 border-blue-200", icon: <FiTruck className="inline mr-1" /> };
            case "cancelled":
                return { bg: "bg-red-100 text-red-700 border-red-200", icon: <FiXCircle className="inline mr-1" /> };
            default:
                return { bg: "bg-gray-100 text-gray-700 border-gray-200", icon: <FiPackage className="inline mr-1" /> };
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto space-y-6">

                {/* পেজ হেডার */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-3">
                            <FiPackage className="text-[#1b2a57]" /> My Orders & Tracking
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">
                            {isLoggedIn
                                ? "আপনার অ্যাকাউন্টের সাম্প্রতিক অর্ডারের তালিকা"
                                : "অর্ডার ট্র্যাক করতে Order Number এবং Mobile Number টাইপ করুন"}
                        </p>
                    </div>

                    {isLoggedIn && (
                        <button
                            onClick={fetchAuthUserOrders}
                            className="inline-flex items-center gap-2 text-sm font-medium text-[#1b2a57] bg-white px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition"
                        >
                            <FiRefreshCw className={loading ? "animate-spin" : ""} /> Refresh
                        </button>
                    )}
                </div>

                {/* গেস্ট ইউজার ইনপুট ফর্ম (লগইন না থাকলে এটি দেখাবে) */}
                {!isLoggedIn && (
                    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
                            <FiUserCheck className="text-[#1b2a57] text-xl" />
                            <h2 className="text-base font-semibold text-gray-800">Guest Order Tracking</h2>
                        </div>

                        <form onSubmit={handleGuestOrderSearch} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {/* Order Number Input */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    Order Number <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="e.g. ORD-1828638711"
                                        value={guestOrderNumber}
                                        onChange={(e) => setGuestOrderNumber(e.target.value)}
                                        className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1b2a57]"
                                    />
                                    <FiHash className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                </div>
                            </div>

                            {/* Phone Input */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    Mobile Number <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="e.g. 01712345678"
                                        value={guestPhone}
                                        onChange={(e) => {
                                            setGuestPhone(e.target.value);
                                            setPhoneError("");
                                        }}
                                        className={`w-full pl-9 pr-3 py-2 bg-gray-50 border rounded-lg text-sm focus:outline-none ${phoneError ? "border-red-500 bg-red-50/20" : "border-gray-200 focus:border-[#1b2a57]"
                                            }`}
                                    />
                                    <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                </div>
                                {phoneError && <p className="text-xs text-red-500 mt-1">{phoneError}</p>}
                            </div>

                            {/* Submit Button */}
                            <div className="sm:col-span-2 lg:col-span-1 flex items-end">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-[#1b2a57] text-white py-2 px-4 rounded-lg font-medium text-sm hover:bg-[#162247] transition flex justify-center items-center gap-2 disabled:opacity-50"
                                >
                                    {loading ? <FiRefreshCw className="animate-spin" /> : <><FiSearch /> Search Order</>}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Error Box */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-center gap-3 text-sm">
                        <FiAlertCircle className="text-lg flex-shrink-0" />
                        <p>{error}</p>
                    </div>
                )}

                {/* Loading Skeleton */}
                {loading && (
                    <div className="space-y-4">
                        {[1, 2].map((n) => (
                            <div key={n} className="bg-white p-6 rounded-xl border animate-pulse">
                                <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                                <div className="h-12 bg-gray-100 rounded"></div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Orders Render Section */}
                {!loading && orders.length > 0 && (
                    <div className="space-y-4">
                        {orders.map((order) => {
                            const badge = getStatusBadge(order.orderStatus || "Pending");
                            const orderProducts = order.products || order.orderItems || [];

                            return (
                                <div key={order._id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                                    <div className="bg-gray-50 p-4 border-b border-gray-100 flex justify-between items-center text-xs sm:text-sm">
                                        <div>
                                            <span className="text-gray-500 mr-1">Order No:</span>
                                            <span className="font-mono font-semibold text-gray-800">{order.orderNumber || order._id}</span>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${badge.bg}`}>
                                            {badge.icon}{order.orderStatus || "Pending"}
                                        </span>
                                    </div>

                                    <div className="p-4 divide-y divide-gray-100">
                                        {orderProducts.map((item, idx) => (
                                            <div key={idx} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                                                <div className="flex items-center gap-3">
                                                    <img
                                                        src={item.thumbnail?.url || item.image || "https://via.placeholder.com/60"}
                                                        alt={item.name}
                                                        className="w-12 h-12 object-cover rounded-lg border border-gray-200"
                                                    />
                                                    <div>
                                                        <h4 className="font-medium text-gray-800 text-xs sm:text-sm">{item.name}</h4>
                                                        <p className="text-xs text-gray-500 mt-0.5">Qty: {item.quantity || 1} × ৳{item.price}</p>
                                                    </div>
                                                </div>
                                                <p className="font-semibold text-gray-800 text-xs sm:text-sm">
                                                    ৳{(item.quantity || 1) * item.price}
                                                </p>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="bg-gray-50/50 p-4 border-t border-gray-100 flex items-center justify-between text-xs sm:text-sm">
                                        <div>
                                            <span className="text-gray-500 mr-1">Total Amount:</span>
                                            <span className="font-bold text-[#1b2a57]">৳{order.grandTotal || order.totalPrice || 0}</span>
                                        </div>
                                        <Link to={`/orderdetails/${order._id}`} className="inline-flex items-center gap-1 font-semibold text-[#1b2a57] hover:underline">
                                            View Details <FiChevronRight />
                                        </Link>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyOrders;