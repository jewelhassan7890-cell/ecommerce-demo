import React, { useState } from "react";
import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const Complaint = () => {
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        message: "",
    });
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState({ type: "", message: "" });

    // ইনপুট হ্যান্ডলার
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // ফাইল হ্যান্ডলার
    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    // ফর্ম সাবমিট হ্যান্ডলার
    const handleSubmit = async (e) => {
        e.preventDefault();
        setAlert({ type: "", message: "" });

        // ভ্যালিডেশন
        if (!formData.name || !formData.phone || !formData.message) {
            setAlert({
                type: "error",
                message: "অনুগ্রহ করে নাম, মোবাইল নম্বর এবং অভিযোগের বিবরণ পূরণ করুন।",
            });
            return;
        }

        setLoading(true);

        try {
            // ব্যাকএন্ডের upload.single("attachment") অনুযায়ী FormData তৈরি
            const submissionData = new FormData();
            submissionData.append("name", formData.name);
            submissionData.append("phone", formData.phone);
            submissionData.append("message", formData.message);
            if (file) {
                submissionData.append("attachment", file);
            }

            // API Call
            // ২. API Call ফিক্সড কোড
            const response = await axios.post(
                `${API_URL}/complaints`,
                submissionData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            if (response.data.success) {
                setAlert({
                    type: "success",
                    message: response.data.message || "আপনার অভিযোগটি সফলভাবে জমা নেওয়া হয়েছে।",
                });
                // ফর্ম রিসেট
                setFormData({ name: "", phone: "", message: "" });
                setFile(null);
                e.target.reset();
            }
        } catch (error) {
            console.error("Submit Error:", error);
            setAlert({
                type: "error",
                message:
                    error.response?.data?.message ||
                    "অভিযোগ জমা দিতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 py-8 px-4 sm:px-6 flex justify-center items-center font-sans">
            <div className="w-full max-w-2xl bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
                {/* Header Title */}
                <div className="bg-blue-600 px-6 py-4 text-white">
                    <h1 className="text-xl sm:text-2xl font-bold tracking-wide">
                        অভিযোগ ও পরামর্শ
                    </h1>
                </div>

                <div className="p-4 sm:p-6 space-y-6">
                    {/* Info Notice Banner */}
                    <div className="bg-sky-100 border border-sky-200 text-sky-800 rounded-lg p-3 sm:p-4 text-xs sm:text-sm leading-relaxed flex items-start gap-2.5">
                        <span className="text-sky-600 text-base sm:text-lg mt-0.5">ℹ️</span>
                        <p>
                            আমাদের কাছে প্রত্যাশিত সেবা না পাওয়ায় প্রথমেই আন্তরিকভাবে দুঃখ প্রকাশ করছি। অনুগ্রহ করে নিচের ফর্মের মাধ্যমে আপনার অভিযোগ জানান।
                        </p>
                    </div>

                    {/* Response Message Alert */}
                    {alert.message && (
                        <div
                            className={`p-3.5 rounded-lg text-sm font-medium ${alert.type === "success"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-rose-50 text-rose-700 border border-rose-200"
                                }`}
                        >
                            {alert.message}
                        </div>
                    )}

                    {/* Complaint Form */}
                    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                        {/* 1. Name */}
                        <div>
                            <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                                <span className="text-blue-600">👤</span> আপনার নাম
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Your Full Name"
                                className="w-full px-3.5 py-2.5 text-sm rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all placeholder:text-slate-400"
                            />
                        </div>

                        {/* 2. Mobile Number */}
                        <div>
                            <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                                <span className="text-blue-600">📞</span> মোবাইল নাম্বার
                            </label>
                            <input
                                type="text"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="Your Mobile Number"
                                className="w-full px-3.5 py-2.5 text-sm rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all placeholder:text-slate-400"
                            />
                            <p className="text-[11px] sm:text-xs text-slate-500 mt-1">
                                অর্ডার নিয়ে অভিযোগ থাকলে যে নাম্বার থেকে অর্ডার করেছিলেন সেই নাম্বার দিবেন প্লিজ
                            </p>
                        </div>

                        {/* 3. Message */}
                        <div>
                            <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                                <span className="text-blue-600">💬</span> অভিযোগের বিস্তারিত
                            </label>
                            <textarea
                                name="message"
                                rows="4"
                                value={formData.message}
                                onChange={handleChange}
                                placeholder="Please describe your issue in detail"
                                className="w-full px-3.5 py-2.5 text-sm rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all placeholder:text-slate-400 resize-y"
                            ></textarea>
                        </div>

                        {/* 4. Screenshot / Attachment Upload */}
                        <div>
                            <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                                <span className="text-blue-600">🖼️</span> স্ক্রিনশট (অপশনাল)
                            </label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="w-full text-xs sm:text-sm text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 cursor-pointer border border-slate-300 rounded-md p-1"
                            />
                            <p className="text-[11px] sm:text-xs text-slate-500 mt-1">
                                অভিযোগ সম্পর্কিত স্ক্রিনশট থাকলে আপলোড করুন
                            </p>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 sm:py-3 px-4 rounded-lg transition-all duration-200 shadow-sm hover:shadow flex items-center justify-center gap-2 text-sm sm:text-base disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <span>প্রসেসিং হচ্ছে...</span>
                            ) : (
                                <>
                                    <span>✈️</span>
                                    <span>অভিযোগ জমা দিন</span>
                                </>
                            )}
                        </button>
                    </form>

                    {/* Footnote Notice */}
                    <div className="pt-2 text-center border-t border-slate-100">
                        <p className="text-[11px] sm:text-xs text-slate-500 flex items-center justify-center gap-1">
                            <span>⏰</span> আমাদের ৩-৪ কার্যদিবস সময় দিবেন প্লিজ। এই সময়ের মধ্যেই আমরা আপনার অভিযোগ সমাধানের কাজ করব।
                        </p>
                    </div>

                    {/* Quick Contact Options */}
                    <div className="pt-2 text-center space-y-2">
                        <p className="text-xs text-slate-500 font-medium">অন্য মাধ্যমে যোগাযোগ করুন</p>
                        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
                            <a
                                href="tel:01301002648"
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-sky-400 text-sky-600 text-xs font-medium hover:bg-sky-50 transition-colors"
                            >
                                <span>📞</span> কল করুন
                            </a>
                            <a
                                href="https://wa.me/8801301002648"
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-emerald-400 text-emerald-600 text-xs font-medium hover:bg-emerald-50 transition-colors"
                            >
                                <span>💬</span> হোয়াটসঅ্যাপ
                            </a>
                            <a
                                href="https://m.me/stylecloset624"
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-blue-400 text-blue-600 text-xs font-medium hover:bg-blue-50 transition-colors"
                            >
                                <span>✉️</span> মেসেঞ্জার
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Complaint;