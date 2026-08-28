import React, { useState } from "react";
import API from "../api/axios";

const RestockAlertForm = ({ defaultDressCode = "" }) => {
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        dressCode: defaultDressCode,
    });

    const [loading, setLoading] = useState(false);
    const [feedback, setFeedback] = useState({ type: "", message: "" });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setFeedback({ type: "", message: "" });

        try {
            const response = await API.post("/restock", formData);
            setFeedback({ type: "success", message: response.data.message });
            setFormData({ name: "", phone: "", dressCode: "" });
        } catch (error) {
            setFeedback({
                type: "error",
                message: error.response?.data?.message || "Something went wrong. Please try again.",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md mx-auto p-4 sm:p-6 bg-white rounded-2xl shadow-xl border border-gray-100">
            <div className="text-center mb-5 sm:mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Customer Request</h2>
                <p className="text-xs sm:text-sm text-gray-600 mt-1 leading-relaxed">
                    আপনার পছন্দের ড্রেসটি রিস্টক হলেই আমরা আপনাকে মেসেজ/কল দিয়ে জানাব!
                </p>
            </div>

            {feedback.message && (
                <div
                    className={`p-3 mb-4 text-xs sm:text-sm rounded-lg border transition-all ${feedback.type === "success"
                        ? "bg-green-50 text-green-700 border-green-200"
                        : "bg-red-50 text-red-700 border-red-200"
                        }`}
                >
                    {feedback.message}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Your Name
                    </label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="e.g. Rohima Begum"
                        required
                        className="w-full px-3.5 py-2 sm:py-2.5 text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                    />
                </div>

                <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Mobile Number
                    </label>
                    <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="01700000000"
                        required
                        className="w-full px-3.5 py-2 sm:py-2.5 text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                    />
                </div>

                <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Dress Code <span className="text-gray-400 font-normal">(e.g. SKU-YTZ7RB)</span>
                    </label>
                    <input
                        type="text"
                        name="dressCode"
                        value={formData.dressCode}
                        onChange={handleChange}
                        placeholder="SKU-YTZ7RB"
                        required
                        className="w-full px-3.5 py-2 sm:py-2.5 text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none uppercase transition"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 sm:py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-lg transition duration-200 shadow-md disabled:opacity-50 active:scale-[0.98]"
                >
                    {loading ? "Submitting..." : "Submit"}
                </button>
            </form>
        </div>
    );
};

export default RestockAlertForm;