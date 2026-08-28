import React, { useEffect, useState } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const AdminComplaints = () => {
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedImage, setSelectedImage] = useState(null);
    const [updatingId, setUpdatingId] = useState(null);

    // 📌 Pagination States
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalComplaints, setTotalComplaints] = useState(0);
    const limit = 6; // প্রতি পেজে ৬টি ডাটা

    // ১. পেজিনেশনসহ অভিযোগ লোড করা
    const fetchComplaints = async (page) => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            const res = await axios.get(`${API_URL}/complaints?page=${page}&limit=${limit}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (res.data.success) {
                setComplaints(res.data.data);
                setTotalPages(res.data.totalPages);
                setTotalComplaints(res.data.totalComplaints);
                setCurrentPage(res.data.currentPage);
            }
        } catch (err) {
            setError(err.response?.data?.message || "অভিযোগের তালিকা আনতে ব্যর্থ হয়েছে।");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchComplaints(currentPage);
    }, [currentPage]);

    // পেজ পরিবর্তনের হ্যান্ডলার
    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    // ২. স্ট্যাটাস আপডেট
    const handleStatusUpdate = async (id, newStatus, currentNotes) => {
        try {
            setUpdatingId(id);
            const token = localStorage.getItem("token");
            const res = await axios.patch(
                `${API_URL}/complaints/${id}`,
                { status: newStatus, notes: currentNotes },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (res.data.success) {
                setComplaints((prev) =>
                    prev.map((item) => (item._id === id ? res.data.data : item))
                );
            }
        } catch (err) {
            alert(err.response?.data?.message || "আপডেট করতে সমস্যা হয়েছে।");
        } finally {
            setUpdatingId(null);
        }
    };

    const handleNotesChange = (id, value) => {
        setComplaints((prev) =>
            prev.map((item) => (item._id === id ? { ...item, notes: value } : item))
        );
    };

    // ৩. ডিলিট এবং রিলোড
    const handleDelete = async (id) => {
        if (!window.confirm("আপনি কি নিশ্চিত যে এই অভিযোগটি মুছে ফেলতে চান?")) return;

        try {
            const token = localStorage.getItem("token");
            const res = await axios.delete(`${API_URL}/complaints/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (res.data.success) {
                fetchComplaints(currentPage); // ডিলিটের পর ডাটা রিফ্রেশ
            }
        } catch (err) {
            alert(err.response?.data?.message || "ডিলিট করতে সমস্যা হয়েছে।");
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case "Pending":
                return "bg-amber-100 text-amber-800 border-amber-300";
            case "In Progress":
                return "bg-blue-100 text-blue-800 border-blue-300";
            case "Resolved":
                return "bg-emerald-100 text-emerald-800 border-emerald-300";
            case "Rejected":
                return "bg-rose-100 text-rose-800 border-rose-300";
            default:
                return "bg-slate-100 text-slate-800 border-slate-300";
        }
    };

    return (
        <div className="p-4 sm:p-6 bg-slate-50 min-h-screen font-sans">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-slate-800">
                        অভিযোগ ও পরামর্শ ইনবক্স
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                        গ্রাহকদের সকল অভিযোগ পরিচালনা করুন (পেজ {currentPage} / {totalPages})
                    </p>
                </div>
                <div className="bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm text-xs sm:text-sm font-semibold text-slate-700">
                    সর্বমোট অভিযোগ: <span className="text-blue-600 font-bold">{totalComplaints}</span> টি
                </div>
            </div>

            {loading && (
                <div className="text-center py-12 text-slate-500 text-sm font-medium">
                    ডাটা লোড হচ্ছে...
                </div>
            )}

            {error && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-lg text-sm mb-6">
                    {error}
                </div>
            )}

            {!loading && complaints.length > 0 && (
                <>
                    {/* Table */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-600 text-xs uppercase tracking-wider">
                                        <th className="py-3.5 px-4 font-semibold">গ্রাহকের তথ্য</th>
                                        <th className="py-3.5 px-4 font-semibold">অভিযোগের বিষয়</th>
                                        <th className="py-3.5 px-4 font-semibold">স্ক্রিনশট</th>
                                        <th className="py-3.5 px-4 font-semibold">স্ট্যাটাস</th>
                                        <th className="py-3.5 px-4 font-semibold">এডমিন নোট</th>
                                        <th className="py-3.5 px-4 font-semibold text-center">অ্যাকশন</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 text-sm text-slate-700">
                                    {complaints.map((item) => (
                                        <tr key={item._id} className="hover:bg-slate-50/80 transition-colors">
                                            <td className="py-4 px-4 whitespace-nowrap">
                                                <div className="font-semibold text-slate-800">{item.name}</div>
                                                <a
                                                    href={`tel:${item.phone}`}
                                                    className="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-0.5"
                                                >
                                                    📞 {item.phone}
                                                </a>
                                                <div className="text-[11px] text-slate-400 mt-1">
                                                    {new Date(item.createdAt).toLocaleString("bn-BD")}
                                                </div>
                                            </td>

                                            <td className="py-4 px-4 min-w-[220px]">
                                                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                                                    {item.message}
                                                </p>
                                            </td>

                                            <td className="py-4 px-4 whitespace-nowrap">
                                                {item.attachment?.url ? (
                                                    <button
                                                        onClick={() => setSelectedImage(item.attachment.url)}
                                                        className="group relative inline-block overflow-hidden rounded-md border border-slate-200"
                                                    >
                                                        <img
                                                            src={item.attachment.url}
                                                            alt="Attachment"
                                                            className="w-12 h-12 object-cover group-hover:scale-105 transition-transform"
                                                        />
                                                    </button>
                                                ) : (
                                                    <span className="text-xs text-slate-400 italic">নেই</span>
                                                )}
                                            </td>

                                            <td className="py-4 px-4 whitespace-nowrap">
                                                <select
                                                    value={item.status}
                                                    disabled={updatingId === item._id}
                                                    onChange={(e) =>
                                                        handleStatusUpdate(item._id, e.target.value, item.notes)
                                                    }
                                                    className={`text-xs font-semibold px-2.5 py-1.5 rounded-full border outline-none cursor-pointer ${getStatusBadge(
                                                        item.status
                                                    )}`}
                                                >
                                                    <option value="Pending">Pending</option>
                                                    <option value="In Progress">In Progress</option>
                                                    <option value="Resolved">Resolved</option>
                                                    <option value="Rejected">Rejected</option>
                                                </select>
                                            </td>

                                            <td className="py-4 px-4 min-w-[180px]">
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="text"
                                                        value={item.notes || ""}
                                                        placeholder="নোট লিখুন..."
                                                        onChange={(e) => handleNotesChange(item._id, e.target.value)}
                                                        className="w-full text-xs px-2.5 py-1.5 rounded border border-slate-300 focus:outline-none focus:border-blue-500"
                                                    />
                                                    <button
                                                        onClick={() =>
                                                            handleStatusUpdate(item._id, item.status, item.notes)
                                                        }
                                                        title="সেভ করুন"
                                                        className="bg-slate-800 text-white text-xs px-2 py-1.5 rounded hover:bg-slate-700"
                                                    >
                                                        💾
                                                    </button>
                                                </div>
                                            </td>

                                            <td className="py-4 px-4 whitespace-nowrap text-center">
                                                <button
                                                    onClick={() => handleDelete(item._id)}
                                                    className="text-rose-600 hover:text-rose-800 p-2 rounded-md hover:bg-rose-50"
                                                    title="মুছে ফেলুন"
                                                >
                                                    🗑️
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* 📌 Pagination Controls Container */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                        <div className="text-xs text-slate-500">
                            দেখাচ্ছে {complaints.length} টির মধ্যে সর্বমোট {totalComplaints} টি ডাটা
                        </div>

                        <div className="flex items-center gap-1.5">
                            {/* Previous Button */}
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            >
                                ◀ আগেরটি
                            </button>

                            {/* Dynamic Page Buttons */}
                            {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                                <button
                                    key={page}
                                    onClick={() => handlePageChange(page)}
                                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${currentPage === page
                                        ? "bg-blue-600 text-white"
                                        : "bg-white border border-slate-300 text-slate-700 hover:bg-slate-50"
                                        }`}
                                >
                                    {page}
                                </button>
                            ))}

                            {/* Next Button */}
                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            >
                                পরেরটি ▶
                            </button>
                        </div>
                    </div>
                </>
            )}

            {/* Image Preview Modal */}
            {selectedImage && (
                <div
                    className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
                    onClick={() => setSelectedImage(null)}
                >
                    <div className="relative max-w-3xl w-full bg-white rounded-xl p-2 shadow-2xl">
                        <button
                            onClick={() => setSelectedImage(null)}
                            className="absolute -top-3 -right-3 bg-rose-600 text-white w-8 h-8 rounded-full font-bold"
                        >
                            ✕
                        </button>
                        <img
                            src={selectedImage}
                            alt="Full View"
                            className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminComplaints;