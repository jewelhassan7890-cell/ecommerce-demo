import React, { useState } from "react";
import axios from "axios";
import {
    MessageCircle,
    PhoneCall,
    MapPin,
    Mail,
    Phone,
    CheckCircle2,
    AlertCircle,
    Loader2
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const SubmitContact = () => {
    // Form State
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
    });

    // UI Status States
    const [loading, setLoading] = useState(false);
    const [statusMessage, setStatusMessage] = useState({ type: "", text: "" });

    // Handle Input Changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // Handle Form Submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatusMessage({ type: "", text: "" });

        try {
            // FIX: Template literal ব্যবহার করে API_URL সঠিকভাবে যুক্ত করা হয়েছে
            const response = await axios.post(`${API_URL}/contact`, formData);

            if (response.data.success) {
                setStatusMessage({
                    type: "success",
                    text: response.data.message || "আপনার বার্তাটি সফলভাবে পাঠানো হয়েছে। ধন্যবাদ!",
                });

                // Clear Form Fields
                setFormData({
                    fullName: "",
                    email: "",
                    phone: "",
                    subject: "",
                    message: "",
                });
            }
        } catch (error) {
            const errorMsg =
                error.response?.data?.message ||
                "সার্ভার ত্রুটি! বার্তা পাঠানো যায়নি। আবার চেষ্টা করুন।";
            setStatusMessage({
                type: "error",
                text: errorMsg,
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="bg-gray-50/50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-6xl mx-auto">

                {/* Header Section */}
                <div className="text-center mb-10">
                    <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
                        Contact Us
                    </h1>
                    <p className="mt-2 text-sm sm:text-base text-gray-500 max-w-xl mx-auto">
                        We'd love to hear from you. Contact us through Facebook, WhatsApp or send us a message using the contact form below.
                    </p>
                </div>

                {/* Main Grid Section */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                    {/* ================= LEFT COLUMN (Cards) ================= */}
                    <div className="lg:col-span-5 space-y-5">

                        {/* Facebook Card */}
                        <div className="bg-white p-6 rounded-xl border border-gray-200/80 shadow-sm">
                            <h3 className="text-base font-semibold text-slate-900">
                                Message Us on Facebook
                            </h3>
                            <p className="text-xs text-gray-500 mt-1 mb-4">
                                Click the button below to send us a message.
                            </p>
                            <a
                                href="https://m.me/stylecloset624"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 bg-[#1877F2] hover:bg-blue-600 text-white text-xs font-semibold px-4 py-2.5 rounded-md transition-colors duration-200"
                            >
                                <MessageCircle className="w-4 h-4 fill-current" />
                                Message on Messenger
                            </a>
                        </div>

                        {/* WhatsApp Card */}
                        <div className="bg-white p-6 rounded-xl border border-gray-200/80 shadow-sm">
                            <h3 className="text-base font-semibold text-slate-900">
                                Message Us on WhatsApp
                            </h3>
                            <p className="text-xs text-gray-500 mt-1 mb-4">
                                Click the button below to start a WhatsApp conversation.
                            </p>
                            <a
                                href="https://wa.me/8801301002648"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 bg-[#075E54] hover:bg-[#128C7E] text-white text-xs font-semibold px-4 py-2.5 rounded-md transition-colors duration-200"
                            >
                                <PhoneCall className="w-4 h-4" />
                                Chat on WhatsApp
                            </a>
                        </div>

                        {/* Office Address Card */}
                        <div className="bg-white p-6 rounded-xl border border-gray-200/80 shadow-sm">
                            <div className="flex items-center gap-2 text-slate-900 font-semibold text-base mb-3">
                                <MapPin className="w-4 h-4 text-red-500 flex-shrink-0" />
                                <span>Office Address</span>
                            </div>

                            <p className="text-xs text-gray-600 leading-relaxed mb-4">
                                Shop#392, Mokkah Shopping Mall, 2nd Floor 3/C, Mirpur Road, New Market, Dhaka-1205, Bangladesh
                            </p>

                            <div className="space-y-2 text-xs text-gray-600">
                                <div className="flex items-center gap-2">
                                    <Mail className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                                    <a href="mailto:stylecloset624@gmail.com" className="hover:underline text-blue-600">
                                        stylecloset624@gmail.com
                                    </a>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Phone className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                                    <a href="tel:+8801301002648" className="hover:underline">
                                        +8801301002648
                                    </a>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* ================= RIGHT COLUMN (Form) ================= */}
                    <div className="lg:col-span-7">
                        <div className="bg-white p-6 sm:p-8 rounded-xl border border-gray-200/80 shadow-sm">
                            <h2 className="text-lg font-bold text-slate-900 mb-6">
                                Get in Touch
                            </h2>

                            {/* Success / Error Message Banner */}
                            {statusMessage.text && (
                                <div
                                    className={`mb-5 p-3.5 rounded-lg text-xs font-medium flex items-center gap-2 ${statusMessage.type === "success"
                                        ? "bg-green-50 text-green-700 border border-green-200"
                                        : "bg-red-50 text-red-700 border border-red-200"
                                        }`}
                                >
                                    {statusMessage.type === "success" ? (
                                        <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                                    ) : (
                                        <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                                    )}
                                    <span>{statusMessage.text}</span>
                                </div>
                            )}

                            {/* Contact Form */}
                            <form onSubmit={handleSubmit} className="space-y-4">

                                {/* Full Name */}
                                <div>
                                    <input
                                        type="text"
                                        name="fullName"
                                        value={formData.fullName}
                                        onChange={handleChange}
                                        placeholder="Your Name"
                                        required
                                        maxLength={100}
                                        className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white border border-gray-300 rounded-lg text-slate-900 placeholder-gray-400 focus:outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800 transition-all"
                                    />
                                </div>

                                {/* Email */}
                                <div>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="Your Email"
                                        required
                                        className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white border border-gray-300 rounded-lg text-slate-900 placeholder-gray-400 focus:outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800 transition-all"
                                    />
                                </div>

                                {/* Phone Number Field */}
                                <div>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        placeholder="Your Phone Number (Optional)"
                                        className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white border border-gray-300 rounded-lg text-slate-900 placeholder-gray-400 focus:outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800 transition-all"
                                    />
                                </div>

                                {/* Subject */}
                                <div>
                                    <input
                                        type="text"
                                        name="subject"
                                        value={formData.subject}
                                        onChange={handleChange}
                                        placeholder="Subject"
                                        required
                                        maxLength={150}
                                        className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white border border-gray-300 rounded-lg text-slate-900 placeholder-gray-400 focus:outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800 transition-all"
                                    />
                                </div>

                                {/* Message */}
                                <div>
                                    <textarea
                                        name="message"
                                        rows={5}
                                        value={formData.message}
                                        onChange={handleChange}
                                        placeholder="Your Message"
                                        required
                                        maxLength={5000}
                                        className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white border border-gray-300 rounded-lg text-slate-900 placeholder-gray-400 focus:outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800 transition-all resize-none"
                                    ></textarea>
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-[#0F172A] hover:bg-slate-800 text-white font-medium text-xs sm:text-sm py-3 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            <span>Sending...</span>
                                        </>
                                    ) : (
                                        <span>Send Message</span>
                                    )}
                                </button>

                            </form>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
};

export default SubmitContact;