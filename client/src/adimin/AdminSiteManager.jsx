import React, { useState, useEffect } from "react";
import axios from "axios";
import { Upload, Save, Image as ImageIcon, CheckCircle } from "lucide-react";

const SERVER_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const AdminSiteManager = () => {
    const [siteName, setSiteName] = useState("Style & Closet");
    const [tagline, setTagline] = useState("EVERGREEN FOREVER");
    const [logoFile, setLogoFile] = useState(null);
    const [faviconFile, setFaviconFile] = useState(null);

    const [logoPreview, setLogoPreview] = useState(null);
    const [faviconPreview, setFaviconPreview] = useState(null);

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const token = localStorage.getItem("token");

    // বর্তমান সাইট সেটিংস লোড করা
    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await axios.get(`${SERVER_URL}/site`);
                if (res.data?.success && res.data?.data) {
                    const data = res.data.data;
                    setSiteName(data.siteName || "");
                    setTagline(data.tagline || "");
                    if (data.logo?.url) setLogoPreview(data.logo.url);
                    if (data.favicon?.url) setFaviconPreview(data.favicon.url);
                }
            } catch (error) {
                console.error("Error loading settings:", error);
            }
        };
        fetchSettings();
    }, []);

    // ফাইল সিলেকশন ও প্রিভিউ হ্যান্ডলার
    const handleFileChange = (e, setFile, setPreview) => {
        const file = e.target.files[0];
        if (file) {
            setFile(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    // ফর্ম সাবমিট (FormData handling for Multer)
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");

        try {
            const formData = new FormData();
            formData.append("siteName", siteName);
            formData.append("tagline", tagline);

            if (logoFile) formData.append("logo", logoFile);
            if (faviconFile) formData.append("favicon", faviconFile);

            const res = await axios.post(`${SERVER_URL}/site`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (res.data?.success) {
                setMessage("ব্র্যান্ড সেটিংস সফলভাবে আপডেট হয়েছে!");
                setLogoFile(null);
                setFaviconFile(null);
            }
        } catch (error) {
            console.error("Update error:", error);
            alert(error.response?.data?.message || "সেটিংস আপডেট করতে সমস্যা হয়েছে!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-4 sm:p-6 my-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 bg-gray-50 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-800">Site & Brand Management</h2>
                    <p className="text-sm text-gray-500 mt-1">
                        এখান থেকে ওয়েবসাইট লোগো, ট্যাগলাইন এবং ব্রাউজার ফেভিকন পরিবর্তন করতে পারবেন।
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {message && (
                        <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg flex items-center gap-2 text-sm">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                            {message}
                        </div>
                    )}

                    {/* Text Inputs */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">সাইটের নাম</label>
                            <input
                                type="text"
                                value={siteName}
                                onChange={(e) => setSiteName(e.target.value)}
                                placeholder="Style & Closet"
                                required
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">ট্যাগলাইন</label>
                            <input
                                type="text"
                                value={tagline}
                                onChange={(e) => setTagline(e.target.value)}
                                placeholder="EVERGREEN FOREVER"
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                            />
                        </div>
                    </div>

                    {/* File Upload Inputs */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
                        {/* Logo Upload */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">ব্র্যান্ড লোগো (PNG/JPG)</label>
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:bg-gray-50 transition relative">
                                {logoPreview ? (
                                    <img src={logoPreview} alt="Logo Preview" className="h-16 mx-auto object-contain mb-2" />
                                ) : (
                                    <ImageIcon className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleFileChange(e, setLogoFile, setLogoPreview)}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                                <span className="text-xs text-indigo-600 font-medium flex items-center justify-center gap-1">
                                    <Upload className="w-3.5 h-3.5" /> লোগো নির্বাচন করুন
                                </span>
                            </div>
                        </div>

                        {/* Favicon Upload */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">ফেভিকন Icon (Small Square)</label>
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:bg-gray-50 transition relative">
                                {faviconPreview ? (
                                    <img src={faviconPreview} alt="Favicon Preview" className="h-12 w-12 mx-auto object-contain mb-2" />
                                ) : (
                                    <ImageIcon className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleFileChange(e, setFaviconFile, setFaviconPreview)}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                                <span className="text-xs text-indigo-600 font-medium flex items-center justify-center gap-1">
                                    <Upload className="w-3.5 h-3.5" /> ফেভিকন নির্বাচন করুন
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-6 py-2.5 rounded-lg text-sm flex items-center gap-2 shadow-sm disabled:opacity-50 transition"
                        >
                            <Save className="w-4 h-4" />
                            {loading ? "আপলোড হচ্ছে..." : "সেটিংস সেভ করুন"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminSiteManager;