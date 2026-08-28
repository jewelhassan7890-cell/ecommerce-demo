import React, { useEffect, useState } from "react";
import axios from "axios";
import { FiTrash2, FiTag, FiRefreshCw, FiClock, FiCheck, FiX } from "react-icons/fi";

const BASE_URL = import.meta.env.VITE_API_URL || "https://ecommerce-demo-ro6m48tke-style-and-closet.vercel.app";

const AllCoupon = () => {
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleteId, setDeleteId] = useState(null);

    useEffect(() => {
        fetchAllCoupons();
    }, []);

    const fetchAllCoupons = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            const res = await axios.get(`${BASE_URL}/coupons/all`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.data.success) {
                setCoupons(res.data.data);
            }
        } catch (err) {
            console.error("Failed to fetch all coupons:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("আপনি কি নিশ্চিতভাবে এই কুপনটি মুছে ফেলতে চান?")) return;

        try {
            setDeleteId(id);
            const token = localStorage.getItem("token");
            const res = await axios.delete(`${BASE_URL}/coupons/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (res.data.success) {
                setCoupons(coupons.filter((c) => c._id !== id));
            }
        } catch (err) {
            alert(err.response?.data?.message || "মুছে ফেলতে ব্যর্থ হয়েছে।");
        } finally {
            setDeleteId(null);
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4 mb-6">
                <div>
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <FiTag className="text-indigo-600" /> সকল কুপন তালিকা
                    </h2>
                    <p className="text-xs text-gray-500 mt-1">সিস্টেমের সমস্ত কুপন পরিচালনা ও পর্যবেক্ষণ করুন</p>
                </div>
                <button
                    onClick={fetchAllCoupons}
                    className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-2 rounded-xl transition"
                >
                    <FiRefreshCw className={loading ? "animate-spin" : ""} /> রিফ্রেশ করুন
                </button>
            </div>

            {loading ? (
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="text-xs text-gray-500 mt-2">লোড হচ্ছে...</p>
                </div>
            ) : coupons.length === 0 ? (
                <div className="text-center py-12 text-gray-500 text-sm">কোনো কুপন পাওয়া যায়নি।</div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-600 uppercase tracking-wider">
                                <th className="p-3">কোড</th>
                                <th className="p-3">টাইপ</th>
                                <th className="p-3">ছাড়</th>
                                <th className="p-3">সর্বনিম্ন মূল্য</th>
                                <th className="p-3">মেয়াদ</th>
                                <th className="p-3">স্ট্যাটাস</th>
                                <th className="p-3 text-right">অ্যাকশন</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm">
                            {coupons.map((coupon) => {
                                const isExpired = new Date(coupon.expiryDate) < new Date();
                                return (
                                    <tr key={coupon._id} className="hover:bg-gray-50/50 transition">
                                        <td className="p-3 font-mono font-bold text-indigo-600">{coupon.code}</td>
                                        <td className="p-3 text-xs capitalize text-gray-600">{coupon.discountType}</td>
                                        <td className="p-3 font-semibold text-gray-800">
                                            {coupon.discountType === "percentage"
                                                ? `${coupon.discountAmount}%`
                                                : `৳${coupon.discountAmount}`}
                                        </td>
                                        <td className="p-3 text-gray-600">৳{coupon.minOrderAmount || 0}</td>
                                        <td className="p-3 text-xs text-gray-500">
                                            <div className="flex items-center gap-1">
                                                <FiClock /> {new Date(coupon.expiryDate).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="p-3">
                                            {isExpired ? (
                                                <span className="inline-flex items-center gap-1 text-xs font-semibold bg-amber-50 text-amber-600 px-2.5 py-1 rounded-full border border-amber-200">
                                                    <FiX /> মেয়াদ উত্তীর্ণ
                                                </span>
                                            ) : coupon.isActive ? (
                                                <span className="inline-flex items-center gap-1 text-xs font-semibold bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-full border border-emerald-200">
                                                    <FiCheck /> সচল (Active)
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 text-xs font-semibold bg-gray-100 text-gray-500 px-2.5 py-1 rounded-full border border-gray-200">
                                                    অকার্যকর
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-3 text-right">
                                            <button
                                                onClick={() => handleDelete(coupon._id)}
                                                disabled={deleteId === coupon._id}
                                                className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                                                title="ডিলিট করুন"
                                            >
                                                <FiTrash2 className="text-base" />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default AllCoupon;