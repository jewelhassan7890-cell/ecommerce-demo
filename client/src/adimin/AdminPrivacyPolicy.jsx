import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API from "./../api/axios";

const AdminPrivacyPolicy = () => {
    const [formData, setFormData] = useState({
        companyName: "",
        supportEmail: "",
        isPublished: true,
        sections: [],
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });

    // Load Privacy Policy
    useEffect(() => {
        const fetchPolicy = async () => {
            try {
                const response = await API.get("/privacy-policy");
                if (response.data.data) {
                    setFormData(response.data.data);
                }
            } catch (error) {
                console.log(error.message)
                setMessage({ type: "error", text: "Failed to fetch privacy policy data" });
            } finally {
                setLoading(false);
            }
        };
        fetchPolicy();
    }, []);

    // Update Section Handler
    const handleSectionChange = (index, field, value) => {
        const updatedSections = [...formData.sections];
        updatedSections[index][field] = value;
        setFormData({ ...formData, sections: updatedSections });
    };

    // Bullets Change Handler (comma separated text to array)
    const handleBulletsChange = (index, value) => {
        const updatedSections = [...formData.sections];
        updatedSections[index].bullets = value.split("\n");
        setFormData({ ...formData, sections: updatedSections });
    };

    // Add New Section
    const handleAddSection = () => {
        const newSection = {
            title: "",
            content: "",
            bullets: [],
            order: formData.sections.length + 1,
        };
        setFormData({ ...formData, sections: [...formData.sections, newSection] });
    };

    // Remove Section
    const handleRemoveSection = (index) => {
        const updatedSections = formData.sections.filter((_, i) => i !== index);
        setFormData({ ...formData, sections: updatedSections });
    };

    // Submit Handler
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage({ type: "", text: "" });

        try {
            const response = await API.put("/privacy-policy", formData);
            setMessage({ type: "success", text: response.data.message });
        } catch (error) {
            setMessage({
                type: "error",
                text: error.response?.data?.message || "Failed to update Privacy Policy",
            });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="p-6 text-center text-gray-500">Loading editor...</div>;
    }

    return (
        <div className="p-3 sm:p-6 bg-gray-50 min-h-screen">
            <div className="max-w-5xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-white p-4 sm:p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Privacy Policy Editor</h1>
                        <nav className="text-xs text-gray-500 mt-1">
                            <Link to="/admin" className="hover:underline text-blue-600">Dashboard</Link> / Privacy Policy
                        </nav>
                    </div>
                </div>

                {message.text && (
                    <div
                        className={`p-4 text-sm rounded-lg border ${message.type === "success"
                            ? "bg-green-50 text-green-700 border-green-200"
                            : "bg-red-50 text-red-700 border-red-200"
                            }`}
                    >
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* General Info */}
                    <div className="bg-white p-4 sm:p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
                        <h2 className="text-base font-bold text-gray-800 border-b pb-2">Basic Settings</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">Company Name</label>
                                <input
                                    type="text"
                                    value={formData.companyName}
                                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                                    className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">Support Email</label>
                                <input
                                    type="email"
                                    value={formData.supportEmail}
                                    onChange={(e) => setFormData({ ...formData, supportEmail: e.target.value })}
                                    className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {/* Dynamic Sections */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h2 className="text-base font-bold text-gray-800">Policy Sections</h2>
                            <button
                                type="button"
                                onClick={handleAddSection}
                                className="px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 text-xs font-semibold rounded-lg border border-blue-200 transition"
                            >
                                + Add New Section
                            </button>
                        </div>

                        {formData.sections.map((section, index) => (
                            <div key={index} className="bg-white p-4 sm:p-6 rounded-xl border border-gray-200 shadow-sm space-y-3 relative">
                                <div className="flex justify-between items-center border-b pb-2">
                                    <span className="text-xs font-bold text-gray-500">Section #{index + 1}</span>
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveSection(index)}
                                        className="text-xs text-red-600 hover:underline font-medium"
                                    >
                                        Remove
                                    </button>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">Section Title</label>
                                    <input
                                        type="text"
                                        value={section.title}
                                        onChange={(e) => handleSectionChange(index, "title", e.target.value)}
                                        className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">Content</label>
                                    <textarea
                                        rows="3"
                                        value={section.content}
                                        onChange={(e) => handleSectionChange(index, "content", e.target.value)}
                                        className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                                        Bullet Points <span className="text-gray-400 font-normal">(One bullet per line)</span>
                                    </label>
                                    <textarea
                                        rows="2"
                                        value={section.bullets ? section.bullets.join("\n") : ""}
                                        onChange={(e) => handleBulletsChange(index, e.target.value)}
                                        className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    <button
                        type="submit"
                        disabled={saving}
                        className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl transition duration-200 shadow-md disabled:opacity-50"
                    >
                        {saving ? "Saving Changes..." : "Save Privacy Policy"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AdminPrivacyPolicy;