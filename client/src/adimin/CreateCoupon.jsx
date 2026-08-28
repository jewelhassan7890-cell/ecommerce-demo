import React, { useState } from "react";
import axios from "axios";
import { FiPlusCircle, FiTag, FiCalendar, FiDollarSign, FiAlertCircle, FiCheckCircle } from "react-icons/fi";

const BASE_URL = import.meta.env.VITE_API_URL || "https://ecommerce-demo-ro6m48tke-style-and-closet.vercel.app";

const CreateCoupon = ({ onCouponCreated }) => {
    const [formData, setFormData] = useState({
        code: "",
        discountType: "percentage",
        discountAmount: "",
        minOrderAmount: "",
        maxDiscountAmount: "",
        expiryDate: "",
        isActive: true,
    });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === "checkbox" ? checked : value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: "", text: "" });

        try {
            const token = localStorage.getItem("token");
            const res = await axios.post(`${BASE_URL}/coupons/create`, formData, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (res.data.success) {
                setMessage({ type: "success", text: res.data.message });
                setFormData({
                    code: "",
                    discountType: "percentage",
                    discountAmount: "",
                    minOrderAmount: "",
                    maxDiscountAmount: "",
                    expiryDate: "",
                    isActive: true,
                });
                if (onCouponCreated) onCouponCreated();
            }
        } catch (err) {
            setMessage({
                type: "error",
                text: err.response?.data?.message || "কুপন তৈরি করতে সমস্যা হয়েছে।",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100 max-w-3xl mx-auto">
            <div className="flex items-center gap-3 border-b pb-4 mb-6">
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                    <FiPlusCircle className="text-2xl" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-gray-800">নতুন কুপন যোগ করুন</h2>
                    <p className="text-xs text-gray-500">গ্রাহকদের প্রমোশনাল ডিসকাউন্ট দিতে নতুন কুপন তৈরি করুন</p>
                </div>
            </div>

            {message.text && (
                <div
                    className={`p-4 rounded-xl mb-6 flex items-center gap-2 text-sm ${message.type === "success"
                        ? "bg-emerald-50 border border-emerald-200 text-emerald-700"
                        : "bg-red-50 border border-red-200 text-red-700"
                        }`}
                >
                    {message.type === "success" ? <FiCheckCircle /> : <FiAlertCircle />}
                    <span>{message.text}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">কুপন কোড (Code) *</label>
                        <div className="relative">
                            <FiTag className="absolute left-3.5 top-3.5 text-gray-400" />
                            <input
                                type="text"
                                name="code"
                                required
                                placeholder="E.g. EID2026"
                                value={formData.code}
                                onChange={handleChange}
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono font-bold uppercase focus:outline-none focus:border-indigo-600"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">ডিসকাউন্ট টাইপ *</label>
                        <select
                            name="discountType"
                            value={formData.discountType}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-indigo-600"
                        >
                            <option value="percentage">পার্সেন্টেজ (%)</option>
                            <option value="fixed">ফিক্সড অ্যামাউন্ট (৳)</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">
                            ডিসকাউন্ট পরিমাণ ({formData.discountType === "percentage" ? "%" : "৳"}) *
                        </label>
                        <div className="relative">
                            <FiDollarSign className="absolute left-3.5 top-3.5 text-gray-400" />
                            <input
                                type="number"
                                name="discountAmount"
                                required
                                min="1"
                                placeholder={formData.discountType === "percentage" ? "10" : "100"}
                                value={formData.discountAmount}
                                onChange={handleChange}
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-indigo-600"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">সর্বনিম্ন অর্ডার মূল্য (৳)</label>
                        <input
                            type="number"
                            name="minOrderAmount"
                            min="0"
                            placeholder="500"
                            value={formData.minOrderAmount}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-indigo-600"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {formData.discountType === "percentage" && (
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">সর্বোচ্চ ডিসকাউন্ট (৳)</label>
                            <input
                                type="number"
                                name="maxDiscountAmount"
                                min="0"
                                placeholder="200"
                                value={formData.maxDiscountAmount}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-indigo-600"
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">মেয়াদ উত্তীর্ণের তারিখ *</label>
                        <div className="relative">
                            <FiCalendar className="absolute left-3.5 top-3.5 text-gray-400" />
                            <input
                                type="date"
                                name="expiryDate"
                                required
                                value={formData.expiryDate}
                                onChange={handleChange}
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-indigo-600"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                    <input
                        type="checkbox"
                        id="isActive"
                        name="isActive"
                        checked={formData.isActive}
                        onChange={handleChange}
                        className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 border-gray-300"
                    />
                    <label htmlFor="isActive" className="text-sm font-medium text-gray-700 cursor-pointer">
                        তৈরির সাথেই সচল (Active) রাখুন
                    </label>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl transition flex items-center justify-center gap-2 shadow-md disabled:opacity-50 mt-4"
                >
                    {loading ? "তৈরি করা হচ্ছে..." : "কুপন তৈরি করুন"}
                </button>
            </form>
        </div>
    );
};

export default CreateCoupon;