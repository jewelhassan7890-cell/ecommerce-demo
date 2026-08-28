import React, { useState, useEffect } from "react";
import axios from "axios";
import { Plus, Edit, Trash2, CheckCircle2, XCircle } from "lucide-react";

const SERVER_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const AdminFaqManager = () => {
    const [faqs, setFaqs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        question: "",
        answer: "",
        category: "General",
        isActive: true,
        order: 0,
    });

    const token = localStorage.getItem("token");

    const fetchAdminFaqs = async () => {
        try {
            const res = await axios.get(`${SERVER_URL}/faq/allfaqs`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setFaqs(res.data?.data || []);
        } catch (error) {
            console.error("Error fetching admin FAQs:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAdminFaqs();
    }, []);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === "checkbox" ? checked : value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await axios.put(`${SERVER_URL}/faq/${editingId}`, formData, {
                    headers: { Authorization: `Bearer ${token}` },
                });
            } else {
                await axios.post(`${SERVER_URL}/faq`, formData, {
                    headers: { Authorization: `Bearer ${token}` },
                });
            }
            resetForm();
            fetchAdminFaqs();
        } catch (error) {
            alert(error.response?.data?.message || "Something went wrong!");
        }
    };

    const handleEdit = (faq) => {
        setEditingId(faq._id);
        setFormData({
            question: faq.question,
            answer: faq.answer,
            category: faq.category || "General",
            isActive: faq.isActive,
            order: faq.order || 0,
        });
    };

    const handleDelete = async (id) => {
        if (!window.confirm("আপনি কি নিশ্চিত এই FAQ টি মুছে ফেলতে চান?")) return;
        try {
            await axios.delete(`${SERVER_URL}/faq/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            fetchAdminFaqs();
        } catch (error) {
            alert("Delete failed!");
        }
    };

    const resetForm = () => {
        setEditingId(null);
        setFormData({ question: "", answer: "", category: "General", isActive: true, order: 0 });
    };

    if (loading) return <div className="p-6 text-center">Loading Admin Panel...</div>;

    return (
        <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-8">
            <h1 className="text-2xl font-bold text-gray-800">FAQ Management Panel</h1>

            {/* Form Section */}
            <form onSubmit={handleSubmit} className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm space-y-4">
                <h2 className="text-lg font-semibold text-gray-700">
                    {editingId ? "FAQ এডিট করুন" : "নতুন FAQ যোগ করুন"}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">প্রশ্ন *</label>
                        <input
                            type="text"
                            name="question"
                            required
                            value={formData.question}
                            onChange={handleInputChange}
                            className="w-full border rounded-md p-2 text-sm focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">ক্যাটাগরি</label>
                        <input
                            type="text"
                            name="category"
                            value={formData.category}
                            onChange={handleInputChange}
                            className="w-full border rounded-md p-2 text-sm focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">উত্তর *</label>
                    <textarea
                        name="answer"
                        required
                        rows="3"
                        value={formData.answer}
                        onChange={handleInputChange}
                        className="w-full border rounded-md p-2 text-sm focus:ring-2 focus:ring-indigo-500"
                    ></textarea>
                </div>

                <div className="flex flex-wrap items-center gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">অর্ডার / সিরিয়াল</label>
                        <input
                            type="number"
                            name="order"
                            value={formData.order}
                            onChange={handleInputChange}
                            className="w-24 border rounded-md p-2 text-sm"
                        />
                    </div>
                    <div className="flex items-center gap-2 mt-5">
                        <input
                            type="checkbox"
                            id="isActive"
                            name="isActive"
                            checked={formData.isActive}
                            onChange={handleInputChange}
                            className="w-4 h-4 text-indigo-600 rounded"
                        />
                        <label htmlFor="isActive" className="text-sm font-medium text-gray-700">ওয়েবসাইটে দেখাবে (Active)</label>
                    </div>
                </div>

                <div className="flex gap-2 justify-end pt-2">
                    {editingId && (
                        <button type="button" onClick={resetForm} className="px-4 py-2 border rounded-md text-sm text-gray-600 hover:bg-gray-100">
                            বাতিল
                        </button>
                    )}
                    <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm flex items-center gap-1 hover:bg-indigo-700">
                        <Plus className="w-4 h-4" /> {editingId ? "আপডেট করুন" : "সেভ করুন"}
                    </button>
                </div>
            </form>

            {/* List / Table Section */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-600">
                    <thead className="bg-gray-50 border-b text-gray-700 uppercase text-xs">
                        <tr>
                            <th className="p-3">Order</th>
                            <th className="p-3">Question</th>
                            <th className="p-3">Category</th>
                            <th className="p-3">Status</th>
                            <th className="p-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {faqs.map((faq) => (
                            <tr key={faq._id} className="hover:bg-gray-50">
                                <td className="p-3 font-medium">{faq.order}</td>
                                <td className="p-3 font-medium text-gray-800">{faq.question}</td>
                                <td className="p-3">{faq.category || "General"}</td>
                                <td className="p-3">
                                    {faq.isActive ? (
                                        <span className="flex items-center gap-1 text-green-600"><CheckCircle2 className="w-4 h-4" /> Active</span>
                                    ) : (
                                        <span className="flex items-center gap-1 text-red-500"><XCircle className="w-4 h-4" /> Inactive</span>
                                    )}
                                </td>
                                <td className="p-3 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button onClick={() => handleEdit(faq)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded">
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => handleDelete(faq._id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminFaqManager;