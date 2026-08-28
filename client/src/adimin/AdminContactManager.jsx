import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
    Search,
    Filter,
    RefreshCw,
    Eye,
    Reply,
    Trash2,
    CheckCircle2,
    Clock,
    Mail,
    Phone,
    User,
    ChevronLeft,
    ChevronRight,
    X,
    Send,
    MessageSquare,
    AlertCircle,
    Inbox
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const AdminContactManager = () => {
    // Data States
    const [contacts, setContacts] = useState([]);
    const [meta, setMeta] = useState({
        unreadCount: 0,
        totalContacts: 0,
        totalPages: 1,
        currentPage: 1,
        limit: 10,
    });

    // Query & Filter States
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);

    // Modal & Selected Message States
    const [selectedContact, setSelectedContact] = useState(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);

    // Reply Form State
    const [replyData, setReplyData] = useState({ adminReply: "", adminNote: "" });
    const [actionLoading, setActionLoading] = useState(false);
    const [alert, setAlert] = useState({ type: "", message: "" });

    // Axios Instance / Config with Auth Token
    const getAuthConfig = () => {
        const token = localStorage.getItem("token"); // আপনার টোকেন সেভ করার কী (Key) অনুযায়ী দিন
        return {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        };
    };

    // Auto-clear Alert Banner
    const showAlert = (type, message) => {
        setAlert({ type, message });
        setTimeout(() => setAlert({ type: "", message: "" }), 4000);
    };

    // 1. Fetch All Contacts (GET)
    const fetchContacts = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${API_URL}/contact/admin/all`, {
                ...getAuthConfig(),
                params: {
                    page,
                    limit: 10,
                    search,
                    status: statusFilter || undefined,
                },
            });

            if (response.data.success) {
                setContacts(response.data.data);
                setMeta(response.data.meta);
            }
        } catch (error) {
            showAlert("error", error.response?.data?.message || "ডেটা লোড করতে সমস্যা হয়েছে।");
        } finally {
            setLoading(false);
        }
    }, [page, search, statusFilter]);

    useEffect(() => {
        fetchContacts();
    }, [fetchContacts]);

    // 2. View Single Contact Details & Mark Read (GET)
    const handleViewContact = async (id) => {
        try {
            const response = await axios.get(`${API_URL}/contact/admin/${id}`, getAuthConfig());
            if (response.data.success) {
                setSelectedContact(response.data.data);
                setIsViewModalOpen(true);
                fetchContacts(); // Update unread count & read status list
            }
        } catch (error) {
            showAlert("error", error.response?.data?.message || "মেসেজটি পাওয়া যায়নি।");
        }
    };

    // 3. Open Reply Modal
    const handleOpenReplyModal = (contact) => {
        setSelectedContact(contact);
        setReplyData({ adminReply: "", adminNote: contact.adminNote || "" });
        setIsReplyModalOpen(true);
    };

    // 4. Send Reply via Resend Email (POST)
    const handleSendReply = async (e) => {
        e.preventDefault();
        if (!replyData.adminReply.trim()) {
            return showAlert("error", "উত্তর লেখা বাধ্যতামূলক।");
        }

        setActionLoading(true);
        try {
            const response = await axios.post(
                `${API_URL}/contact/admin/${selectedContact._id}/reply`,
                replyData,
                getAuthConfig()
            );

            if (response.data.success) {
                showAlert("success", "গ্রাহককে সফলভাবে উত্তর পাঠানো হয়েছে।");
                setIsReplyModalOpen(false);
                fetchContacts();
            }
        } catch (error) {
            showAlert("error", error.response?.data?.message || "ইমেইল পাঠানো সম্ভব হয়নি।");
        } finally {
            setActionLoading(false);
        }
    };

    // 5. Soft Delete Contact (DELETE)
    const handleDeleteContact = async (id) => {
        if (!window.confirm("আপনি কি নিশ্চিত যে এই মেসেজটি মুছে ফেলতে চান?")) return;

        try {
            const response = await axios.delete(`${API_URL}/contact/admin/${id}`, getAuthConfig());
            if (response.data.success) {
                showAlert("success", "মেসেজটি ট্র্যাশে সরানো হয়েছে।");
                fetchContacts();
            }
        } catch (error) {
            showAlert("error", error.response?.data?.message || "মেসেজ ডিলিট করা যায়নি।");
        }
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8 bg-slate-50 min-h-screen text-slate-800 font-sans">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* Top Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                            <Inbox className="w-6 h-6 text-indigo-600" /> Customer Messages
                        </h1>
                        <p className="text-xs text-slate-500 mt-1">
                            আপনার ই-কমার্স স্টোরের কন্টাক্ট মেসেজগুলো ম্যানেজ ও রিপ্লাই করুন।
                        </p>
                    </div>

                    {/* Unread Counter Badge */}
                    <div className="flex items-center gap-3">
                        <div className="bg-indigo-50 border border-indigo-100 px-4 py-2 rounded-xl text-center">
                            <span className="text-xs text-indigo-600 font-medium block">Unread Messages</span>
                            <span className="text-lg font-bold text-indigo-700">{meta.unreadCount}</span>
                        </div>
                        <button
                            onClick={fetchContacts}
                            className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 transition"
                            title="Refresh Data"
                        >
                            <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin text-indigo-600" : ""}`} />
                        </button>
                    </div>
                </div>

                {/* Global Alert Notification */}
                {alert.message && (
                    <div className={`p-4 rounded-xl text-sm font-medium flex items-center justify-between border ${alert.type === "success"
                        ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                        : "bg-rose-50 text-rose-800 border-rose-200"
                        }`}>
                        <div className="flex items-center gap-2">
                            {alert.type === "success" ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <AlertCircle className="w-5 h-5 text-rose-600" />}
                            <span>{alert.message}</span>
                        </div>
                        <button onClick={() => setAlert({ type: "", message: "" })}><X className="w-4 h-4" /></button>
                    </div>
                )}

                {/* Filters & Search Toolbar */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center gap-4 justify-between">
                    {/* Search Input */}
                    <div className="relative w-full md:w-96">
                        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by Name, Email, Subject..."
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setPage(1);
                            }}
                            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                        />
                    </div>

                    {/* Filter Status */}
                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <Filter className="w-4 h-4 text-slate-400" />
                        <select
                            value={statusFilter}
                            onChange={(e) => {
                                setStatusFilter(e.target.value);
                                setPage(1);
                            }}
                            className="w-full md:w-48 py-2 px-3 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                        >
                            <option value="">All Status</option>
                            <option value="new">New</option>
                            <option value="read">Read</option>
                            <option value="replied">Replied</option>
                        </select>
                    </div>
                </div>

                {/* Messages Data Table */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[11px] font-semibold uppercase tracking-wider">
                                    <th className="py-3.5 px-4">Customer</th>
                                    <th className="py-3.5 px-4">Subject</th>
                                    <th className="py-3.5 px-4">Status</th>
                                    <th className="py-3.5 px-4">Date</th>
                                    <th className="py-3.5 px-4 text-right">Actions</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                                {loading ? (
                                    <tr>
                                        <td colSpan="5" className="text-center py-12 text-slate-400">
                                            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-600" />
                                            ডেটা লোড হচ্ছে...
                                        </td>
                                    </tr>
                                ) : contacts.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="text-center py-12 text-slate-400">
                                            কোনো মেসেজ পাওয়া যায়নি।
                                        </td>
                                    </tr>
                                ) : (
                                    contacts.map((item) => (
                                        <tr
                                            key={item._id}
                                            className={`hover:bg-slate-50/80 transition-colors ${!item.isRead ? "bg-indigo-50/30 font-medium" : ""}`}
                                        >
                                            {/* Customer Details */}
                                            <td className="py-3.5 px-4">
                                                <div className="font-semibold text-slate-900">{item.fullName}</div>
                                                <div className="text-xs text-slate-500">{item.email}</div>
                                                {item.phone && <div className="text-[11px] text-slate-400">{item.phone}</div>}
                                            </td>

                                            {/* Subject */}
                                            <td className="py-3.5 px-4 max-w-xs truncate text-slate-700">
                                                {item.subject}
                                            </td>

                                            {/* Status Badge */}
                                            <td className="py-3.5 px-4">
                                                {item.status === "replied" ? (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-100 text-emerald-800">
                                                        <CheckCircle2 className="w-3 h-3" /> Replied
                                                    </span>
                                                ) : item.isRead ? (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700">
                                                        <Clock className="w-3 h-3" /> Read
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-amber-100 text-amber-800">
                                                        <MessageSquare className="w-3 h-3" /> New
                                                    </span>
                                                )}
                                            </td>

                                            {/* Date */}
                                            <td className="py-3.5 px-4 text-xs text-slate-500 whitespace-nowrap">
                                                {new Date(item.createdAt).toLocaleDateString("en-US", {
                                                    day: "numeric",
                                                    month: "short",
                                                    year: "numeric"
                                                })}
                                            </td>

                                            {/* Actions Button */}
                                            <td className="py-3.5 px-4 text-right space-x-1 whitespace-nowrap">
                                                <button
                                                    onClick={() => handleViewContact(item._id)}
                                                    className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                                                    title="View Message"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleOpenReplyModal(item)}
                                                    className="p-2 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                                                    title="Reply via Email"
                                                >
                                                    <Reply className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteContact(item._id)}
                                                    className="p-2 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                                                    title="Delete Message"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Footer */}
                    <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
                        <div>
                            Showing page <span className="font-semibold text-slate-800">{meta.currentPage}</span> of{" "}
                            <span className="font-semibold text-slate-800">{meta.totalPages}</span> (Total {meta.totalContacts} messages)
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                disabled={page === 1}
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <span className="px-2 font-medium text-slate-700">{page}</span>
                            <button
                                disabled={page >= meta.totalPages}
                                onClick={() => setPage((p) => p + 1)}
                                className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

            </div>

            {/* ================= MODAL: VIEW CONTACT DETAILS ================= */}
            {isViewModalOpen && selectedContact && (
                <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-xl rounded-2xl shadow-xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                            <h3 className="font-bold text-slate-900 text-base">Message Details</h3>
                            <button onClick={() => setIsViewModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                            {/* Sender Info */}
                            <div className="bg-slate-50 p-4 rounded-xl space-y-2 border border-slate-100 text-xs sm:text-sm">
                                <div className="flex items-center gap-2 font-semibold text-slate-900">
                                    <User className="w-4 h-4 text-indigo-600" /> {selectedContact.fullName}
                                </div>
                                <div className="flex items-center gap-2 text-slate-600">
                                    <Mail className="w-4 h-4 text-slate-400" /> {selectedContact.email}
                                </div>
                                {selectedContact.phone && (
                                    <div className="flex items-center gap-2 text-slate-600">
                                        <Phone className="w-4 h-4 text-slate-400" /> {selectedContact.phone}
                                    </div>
                                )}
                            </div>

                            {/* Subject & Message */}
                            <div>
                                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Subject</h4>
                                <p className="text-sm font-semibold text-slate-800">{selectedContact.subject}</p>
                            </div>

                            <div>
                                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Message Body</h4>
                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-xs sm:text-sm text-slate-700 whitespace-pre-line leading-relaxed">
                                    {selectedContact.message}
                                </div>
                            </div>

                            {/* Previous Admin Reply (If Exists) */}
                            {selectedContact.replied && (
                                <div className="border-t border-slate-100 pt-4 mt-4">
                                    <h4 className="text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-1 flex items-center gap-1">
                                        <CheckCircle2 className="w-3.5 h-3.5" /> Previous Admin Reply
                                    </h4>
                                    <p className="text-xs text-slate-400 mb-2">Sent at: {new Date(selectedContact.repliedAt).toLocaleString()}</p>
                                    <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-100 text-xs sm:text-sm text-slate-800 whitespace-pre-line">
                                        {selectedContact.adminReply}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="p-4 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50">
                            <button
                                onClick={() => setIsViewModalOpen(false)}
                                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-200 rounded-xl transition"
                            >
                                Close
                            </button>
                            <button
                                onClick={() => {
                                    setIsViewModalOpen(false);
                                    handleOpenReplyModal(selectedContact);
                                }}
                                className="px-4 py-2 text-xs font-medium bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition flex items-center gap-2"
                            >
                                <Reply className="w-4 h-4" /> Reply Now
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ================= MODAL: REPLY EMAIL ================= */}
            {isReplyModalOpen && selectedContact && (
                <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-xl rounded-2xl shadow-xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                            <h3 className="font-bold text-slate-900 text-base">Reply to Customer</h3>
                            <button onClick={() => setIsReplyModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSendReply} className="p-6 space-y-4">
                            <div className="text-xs text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-100">
                                Sending Email to: <span className="font-semibold text-slate-800">{selectedContact.fullName} ({selectedContact.email})</span>
                            </div>

                            {/* Reply Textarea */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">
                                    Email Reply Body <span className="text-rose-500">*</span>
                                </label>
                                <textarea
                                    rows={5}
                                    required
                                    placeholder="Type your official reply here..."
                                    value={replyData.adminReply}
                                    onChange={(e) => setReplyData({ ...replyData, adminReply: e.target.value })}
                                    className="w-full p-3 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                ></textarea>
                            </div>

                            {/* Internal Admin Note */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">
                                    Internal Admin Note (Optional)
                                </label>
                                <input
                                    type="text"
                                    placeholder="Only visible to admins..."
                                    value={replyData.adminNote}
                                    onChange={(e) => setReplyData({ ...replyData, adminNote: e.target.value })}
                                    className="w-full p-2.5 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                />
                            </div>

                            <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setIsReplyModalOpen(false)}
                                    className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={actionLoading}
                                    className="px-4 py-2 text-xs font-medium bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition flex items-center gap-2 disabled:opacity-50"
                                >
                                    {actionLoading ? (
                                        <RefreshCw className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Send className="w-4 h-4" />
                                    )}
                                    <span>Send Email</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
};

export default AdminContactManager;