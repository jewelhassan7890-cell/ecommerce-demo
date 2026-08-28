import React, { useEffect, useState } from "react";
import axios from "axios";
import { FiGift, FiCopy, FiCheck, FiClock, FiTag } from "react-icons/fi";

const BASE_URL = import.meta.env.VITE_API_URL || "https://ecommerce-demo-ro6m48tke-style-and-closet.vercel.app";

const PublicCoupon = ({ onApplyCoupon }) => {
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [copiedCode, setCopiedCode] = useState("");

    useEffect(() => {
        fetchPublicCoupons();
    }, []);

    const fetchPublicCoupons = async () => {
        try {
            const res = await axios.get(`${BASE_URL}/coupons/active`);
            if (res.data.success) {
                setCoupons(res.data.data);
            }
        } catch (err) {
            console.error("Failed to fetch public coupons:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = (code) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(code);
        if (onApplyCoupon) onApplyCoupon(code);
        setTimeout(() => setCopiedCode(""), 2500);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (coupons.length === 0) {
        return (
            <div className="text-center p-6 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <FiGift className="mx-auto text-3xl text-gray-400 mb-2" />
                <p className="text-gray-500 text-sm font-medium">বর্তমানে কোনো স্পেশাল অফার নেই!</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-4">
                <FiTag className="text-indigo-600 text-xl" />
                <h3 className="text-lg font-bold text-gray-800">অ্যাভেইলএবল কুপনসমূহ</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {coupons.map((coupon) => (
                    <div
                        key={coupon._id}
                        className="relative bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition flex flex-col justify-between"
                    >
                        <div>
                            <div className="flex justify-between items-start mb-2">
                                <span className="bg-indigo-600 text-white font-mono font-bold text-sm px-3 py-1 rounded-lg tracking-wider">
                                    {coupon.code}
                                </span>
                                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                    {coupon.discountType === "percentage"
                                        ? `${coupon.discountAmount}% ছাড়`
                                        : `৳${coupon.discountAmount} ছাড়`}
                                </span>
                            </div>

                            <p className="text-xs text-gray-600 mt-2">
                                সর্বনিম্ন অর্ডার মূল্য: <span className="font-semibold text-gray-800">৳{coupon.minOrderAmount || 0}</span>
                            </p>

                            {coupon.maxDiscountAmount && coupon.discountType === "percentage" && (
                                <p className="text-xs text-gray-600">
                                    সর্বোচ্চ ছাড়: <span className="font-semibold text-gray-800">৳{coupon.maxDiscountAmount}</span>
                                </p>
                            )}
                        </div>

                        <div className="mt-4 pt-3 border-t border-indigo-100/60 flex items-center justify-between text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                                <FiClock /> মেয়াদ: {new Date(coupon.expiryDate).toLocaleDateString()}
                            </span>

                            <button
                                onClick={() => handleCopy(coupon.code)}
                                className="flex items-center gap-1 bg-white hover:bg-indigo-600 text-indigo-600 hover:text-white border border-indigo-200 px-3 py-1.5 rounded-lg font-semibold text-xs transition shadow-sm"
                            >
                                {copiedCode === coupon.code ? (
                                    <>
                                        <FiCheck className="text-emerald-500" /> কপি হয়েছে
                                    </>
                                ) : (
                                    <>
                                        <FiCopy /> কপি করুন
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PublicCoupon;