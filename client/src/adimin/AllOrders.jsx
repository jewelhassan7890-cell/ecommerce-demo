import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
    FiPackage,
    FiSearch,
    FiRefreshCw,
    FiTrash2,
    FiEdit3,
    FiClock,
    FiCheckCircle,
    FiAlertCircle,
    FiChevronLeft,
    FiChevronRight,
    FiX,
    FiEye,
    FiPhone,
    FiMapPin,
    FiUser,
    FiMail,
    FiCalendar,
    FiCreditCard,
    FiPrinter
} from "react-icons/fi";
import InvoicePrint from "./InvoicePrint";

const BASE_URL = import.meta.env.VITE_API_URL || "https://ecommerce-demo-ro6m48tke-style-and-closet.vercel.app";
const BACKEND_DOMAIN = BASE_URL.replace("/", "");

const AllOrders = () => {
    // ---------------- State Management ----------------
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [successMsg, setSuccessMsg] = useState("");

    // Filter & Pagination States
    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [pagination, setPagination] = useState({});
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [paymentFilter, setPaymentFilter] = useState("");

    // Modal States
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    // Update Form States
    const [updateStatus, setUpdateStatus] = useState("");
    const [updatePaymentStatus, setUpdatePaymentStatus] = useState("");
    const [adminNote, setAdminNote] = useState("");
    const [statusMessage, setStatusMessage] = useState("");

    // Image Preview Modal States
    const [previewImage, setPreviewImage] = useState(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);

    // Image Click Handler
    const handleImageClick = (imageUrl) => {
        if (imageUrl && !imageUrl.includes("placehold.co")) {
            setPreviewImage(imageUrl);
            setIsPreviewOpen(true);
        }
    };

    // ---------------- Debounce Search Input ----------------
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(1);
        }, 500);

        return () => clearTimeout(handler);
    }, [search]);

    // ---------------- Fetch Admin Orders ----------------
    const fetchAdminOrders = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const token = localStorage.getItem("token");
            const response = await axios.get(`${BASE_URL}/orders/admin/all`, {
                headers: { Authorization: `Bearer ${token}` },
                params: {
                    page,
                    limit,
                    search: debouncedSearch.trim() || undefined,
                    status: statusFilter || undefined,
                    paymentStatus: paymentFilter || undefined,
                },
            });

            if (response.data.success) {
                setOrders(response.data.orders || []);
                setPagination(response.data.pagination || {});
            }
        } catch (err) {
            console.error("Admin Fetch Orders Error:", err);
            setError(err.response?.data?.message || "অর্ডার ফেচ করতে ব্যর্থ হয়েছে।");
        } finally {
            setLoading(false);
        }
    }, [page, limit, debouncedSearch, statusFilter, paymentFilter]);

    useEffect(() => {
        fetchAdminOrders();
    }, [fetchAdminOrders]);

    // ---------------- Helper Functions ----------------

    const getProductImage = (orderOrItem) => {
        if (!orderOrItem) return "https://placehold.co/60x60?text=No+Image";

        let rawUrl =
            (typeof orderOrItem.thumbnail === "object" ? orderOrItem.thumbnail?.url : orderOrItem.thumbnail) ||
            orderOrItem.image ||
            orderOrItem.product?.thumbnail?.url ||
            orderOrItem.product?.image;

        if (!rawUrl && (orderOrItem.items || orderOrItem.products || orderOrItem.orderItems)) {
            const firstItem = orderOrItem.items?.[0] || orderOrItem.products?.[0] || orderOrItem.orderItems?.[0];
            if (firstItem) {
                rawUrl =
                    (typeof firstItem.thumbnail === "object" ? firstItem.thumbnail?.url : firstItem.thumbnail) ||
                    firstItem.image ||
                    firstItem.product?.thumbnail?.url ||
                    firstItem.product?.image;
            }
        }

        if (!rawUrl || typeof rawUrl !== "string") return "https://placehold.co/60x60?text=No+Image";
        if (rawUrl.startsWith("http://") || rawUrl.startsWith("https://")) return rawUrl;

        const formattedPath = rawUrl.startsWith("/") ? rawUrl : `/${rawUrl}`;
        return `${BACKEND_DOMAIN}${formattedPath}`;
    };

    const formatDateTime = (isoDate) => {
        if (!isoDate) return "N/A";
        return new Date(isoDate).toLocaleString("en-US", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        });
    };

    const getStatusBadge = (status) => {
        switch (status?.toLowerCase()) {
            case "delivered":
                return "bg-green-100 text-green-700 border-green-200";
            case "shipped":
                return "bg-blue-100 text-blue-700 border-blue-200";
            case "processing":
            case "packed":
            case "confirmed":
                return "bg-purple-100 text-purple-700 border-purple-200";
            case "cancelled":
            case "returned":
                return "bg-red-100 text-red-700 border-red-200";
            default:
                return "bg-amber-100 text-amber-700 border-amber-200";
        }
    };

    // ---------------- Event Handlers ----------------

    const openViewModal = (order) => {
        setSelectedOrder(order);
        setIsViewModalOpen(true);
    };

    const openUpdateModal = (order) => {
        setSelectedOrder(order);
        setUpdateStatus(order.orderStatus || "pending");
        setUpdatePaymentStatus(order.payment?.status || order.paymentStatus || "pending");
        setAdminNote(order.adminNote || "");
        setStatusMessage("");
        setIsUpdateModalOpen(true);
    };

    const openDeleteModal = (order) => {
        setSelectedOrder(order);
        setIsDeleteModalOpen(true);
    };

    const openInvoiceModal = (order) => {
        setSelectedOrder(order);
        setIsInvoiceModalOpen(true);
    };

    const handleUpdateSubmit = async (e) => {
        e.preventDefault();
        try {
            setActionLoading(true);
            setError("");
            const token = localStorage.getItem("token");

            const response = await axios.patch(
                `${BASE_URL}/orders/admin/${selectedOrder._id}/status`,
                {
                    orderStatus: updateStatus,
                    paymentStatus: updatePaymentStatus,
                    adminNote,
                    message: statusMessage,
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                setSuccessMsg("অর্ডার স্ট্যাটাস সফলভাবে আপডেট করা হয়েছে!");
                setIsUpdateModalOpen(false);
                fetchAdminOrders();
                setTimeout(() => setSuccessMsg(""), 3000);
            }
        } catch (err) {
            setError(err.response?.data?.message || "অর্ডার আপডেট করতে সমস্যা হয়েছে।");
        } finally {
            setActionLoading(false);
        }
    };

    const handleDeleteSubmit = async () => {
        try {
            setActionLoading(true);
            setError("");
            const token = localStorage.getItem("token");

            const response = await axios.delete(
                `${BASE_URL}/orders/admin/${selectedOrder._id}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                setSuccessMsg("অর্ডার সফলভাবে ডিলিট করা হয়েছে!");
                setIsDeleteModalOpen(false);
                fetchAdminOrders();
                setTimeout(() => setSuccessMsg(""), 3000);
            }
        } catch (err) {
            setError(err.response?.data?.message || "অর্ডার ডিলিট করা সম্ভব হয়নি।");
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* Header Section */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-2">
                            <FiPackage className="text-[#1b2a57]" /> Admin Order Management
                        </h1>
                        <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                            সব গ্রাহকের অর্ডার ট্র্যাকিং, ফিল্টারিং ও আপডেট পরিচালনা করুন
                        </p>
                    </div>

                    <button
                        onClick={fetchAdminOrders}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg text-sm font-medium transition self-start sm:self-auto"
                    >
                        <FiRefreshCw className={loading ? "animate-spin" : ""} /> Refresh
                    </button>
                </div>

                {/* Alerts */}
                {successMsg && (
                    <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm flex items-center gap-2">
                        <FiCheckCircle className="text-lg flex-shrink-0" /> {successMsg}
                    </div>
                )}
                {error && (
                    <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-center gap-2">
                        <FiAlertCircle className="text-lg flex-shrink-0" /> {error}
                    </div>
                )}

                {/* Filter Controls */}
                <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="relative">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Order ID, Name, Phone..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1b2a57]"
                        />
                    </div>

                    <div>
                        <select
                            value={statusFilter}
                            onChange={(e) => {
                                setStatusFilter(e.target.value);
                                setPage(1);
                            }}
                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1b2a57]"
                        >
                            <option value="">All Order Status</option>
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="processing">Processing</option>
                            <option value="packed">Packed</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                            <option value="returned">Returned</option>
                        </select>
                    </div>

                    <div>
                        <select
                            value={paymentFilter}
                            onChange={(e) => {
                                setPaymentFilter(e.target.value);
                                setPage(1);
                            }}
                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1b2a57]"
                        >
                            <option value="">All Payment Status</option>
                            <option value="pending">Pending</option>
                            <option value="paid">Paid</option>
                            <option value="failed">Failed</option>
                        </select>
                    </div>

                    <button
                        onClick={() => {
                            setSearch("");
                            setStatusFilter("");
                            setPaymentFilter("");
                            setPage(1);
                        }}
                        className="w-full py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-200 transition"
                    >
                        Reset Filters
                    </button>
                </div>

                {/* Table Data */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    {loading ? (
                        <div className="p-8 text-center text-gray-500 flex flex-col items-center gap-2">
                            <FiRefreshCw className="animate-spin text-2xl text-[#1b2a57]" />
                            <span>অর্ডার ডাটা লোড হচ্ছে...</span>
                        </div>
                    ) : orders.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">কোনো অর্ডার পাওয়া যায়নি।</div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            <th className="p-4">Product</th>
                                            <th className="p-4">Order Details</th>
                                            <th className="p-4">Customer Info</th>
                                            <th className="p-4">Total Amount</th>
                                            <th className="p-4">Payment</th>
                                            <th className="p-4">Order Status</th>
                                            <th className="p-4 text-center">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 text-xs sm:text-sm">
                                        {orders.map((order) => {
                                            const firstProduct = order.products?.[0] || order.items?.[0] || order.orderItems?.[0];
                                            const customerName = order.shipping?.fullName || order.customer?.name || "Guest";
                                            const customerPhone = order.shipping?.phone || order.customer?.phone || "N/A";
                                            const customerEmail = order.customer?.email || order.shipping?.email || "N/A";
                                            const customerAddress = order.shipping?.address || order.shipping?.address || "N/A";
                                            const customerArea = order.shipping?.area || order.shipping?.area || "N/A";
                                            const customerPostalcode = order.shipping?.postalCode || order.shipping?.postalCode || "N/A";
                                            const customerCity = order.shipping?.city || order.shipping?.city || "N/A";

                                            return (
                                                <tr key={order._id} className="hover:bg-gray-50/50 transition">
                                                    <td className="p-4">
                                                        <div className="flex items-center gap-3">
                                                            <img
                                                                src={getProductImage(order)}
                                                                alt={order.name || "Product"}
                                                                onClick={() => handleImageClick(getProductImage(order))}
                                                                className="w-10 h-10 object-cover rounded-lg border bg-white cursor-pointer hover:opacity-80 transition"
                                                                onError={(e) => {
                                                                    e.target.onerror = null;
                                                                    e.target.src = "https://placehold.co/50x50?text=No+Img";
                                                                }}
                                                            />
                                                            <div className="max-w-[150px]">
                                                                <p className="font-semibold text-gray-800 truncate" title={firstProduct?.name || firstProduct?.title || "Product"}>
                                                                    {firstProduct?.name || firstProduct?.title || "Multiple Items"}
                                                                </p>
                                                                <p className="font-semibold text-gray-800 truncate" title={firstProduct?.name || firstProduct?.title || "Product"}>
                                                                    {firstProduct?.sku || firstProduct?.sku || "Multiple Items"}
                                                                </p>
                                                                <p className="font-semibold text-gray-800 truncate" title={firstProduct?.name || firstProduct?.title || "Product"}>
                                                                    {firstProduct?.color || firstProduct?.color || "Multiple Items"}
                                                                </p>
                                                                {(order.products?.length || order.items?.length || order.orderItems?.length) > 1 && (
                                                                    <span className="text-[10px] text-gray-500 font-medium bg-gray-100 px-1.5 py-0.5 rounded">
                                                                        +{(order.products?.length || order.items?.length || order.orderItems?.length) - 1} more
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>

                                                    <td className="p-4">
                                                        <p className="font-mono font-bold text-gray-800">
                                                            {order.orderNumber || order.invoiceNumber || order._id.slice(-8)}
                                                        </p>
                                                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                                            <FiClock className="text-gray-400 flex-shrink-0" />
                                                            {formatDateTime(order.createdAt)}
                                                        </p>
                                                    </td>

                                                    <td className="p-4">
                                                        <p className="font-medium text-gray-800 flex items-center gap-1.5">
                                                            <FiUser className="text-gray-400" /> {customerName}
                                                        </p>
                                                        <p className="text-xs text-gray-500 flex items-center gap-1.5 mt-0.5">
                                                            <FiPhone className="text-gray-400" /> {customerPhone}
                                                        </p>
                                                        <p className="text-xs text-gray-500 flex items-center gap-1.5 mt-0.5 truncate max-w-[160px]">
                                                            <FiMail className="text-gray-400" /> {customerEmail}
                                                        </p>
                                                        <p className="text-xs text-gray-500 flex items-center gap-1.5 mt-0.5 truncate max-w-[160px]">
                                                            <FiMail className="text-gray-400" /> {customerAddress}
                                                        </p>
                                                        <p className="text-xs text-gray-500 flex items-center gap-1.5 mt-0.5 truncate max-w-[160px]">
                                                            <FiMail className="text-gray-400" /> {customerArea}
                                                        </p>
                                                        <p className="text-xs text-gray-500 flex items-center gap-1.5 mt-0.5 truncate max-w-[160px]">
                                                            <FiMail className="text-gray-400" /> {customerPostalcode}
                                                        </p>
                                                        <p className="text-xs text-gray-500 flex items-center gap-1.5 mt-0.5 truncate max-w-[160px]">
                                                            <FiMail className="text-gray-400" /> {customerCity}
                                                        </p>
                                                    </td>

                                                    <td className="p-4 font-bold text-gray-800">
                                                        ৳{order.grandTotal || order.totalAmount || 0}
                                                    </td>

                                                    <td className="p-4">
                                                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize border ${(order.payment?.status || order.paymentStatus) === "paid"
                                                            ? "bg-green-50 text-green-700 border-green-200"
                                                            : "bg-amber-50 text-amber-700 border-amber-200"
                                                            }`}>
                                                            {order.payment?.status || order.paymentStatus || "pending"}
                                                        </span>
                                                    </td>

                                                    <td className="p-4">
                                                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize border ${getStatusBadge(order.orderStatus)}`}>
                                                            {order.orderStatus || "pending"}
                                                        </span>
                                                    </td>

                                                    {/* Actions - Print Invoice added */}
                                                    <td className="p-4 text-center">
                                                        <div className="flex items-center justify-center gap-1">
                                                            <button
                                                                onClick={() => openInvoiceModal(order)}
                                                                className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                                                                title="Print / Download Invoice"
                                                            >
                                                                <FiPrinter className="text-base" />
                                                            </button>
                                                            <button
                                                                onClick={() => openViewModal(order)}
                                                                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                                                                title="View Details"
                                                            >
                                                                <FiEye className="text-base" />
                                                            </button>
                                                            <button
                                                                onClick={() => openUpdateModal(order)}
                                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                                                title="Edit Status"
                                                            >
                                                                <FiEdit3 className="text-base" />
                                                            </button>
                                                            <button
                                                                onClick={() => openDeleteModal(order)}
                                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                                                title="Delete Order"
                                                            >
                                                                <FiTrash2 className="text-base" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {pagination.totalPages > 1 && (
                                <div className="p-4 border-t border-gray-100 flex items-center justify-between">
                                    <span className="text-xs text-gray-500">
                                        Page {pagination.currentPage} of {pagination.totalPages} ({pagination.totalOrders} total)
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <button
                                            disabled={!pagination.hasPrevPage}
                                            onClick={() => setPage((p) => Math.max(p - 1, 1))}
                                            className="p-2 border rounded-lg hover:bg-gray-50 disabled:opacity-40 transition"
                                        >
                                            <FiChevronLeft />
                                        </button>
                                        <button
                                            disabled={!pagination.hasNextPage}
                                            onClick={() => setPage((p) => p + 1)}
                                            className="p-2 border rounded-lg hover:bg-gray-50 disabled:opacity-40 transition"
                                        >
                                            <FiChevronRight />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* MODAL 1: View Details */}
            {isViewModalOpen && selectedOrder && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-2xl rounded-2xl p-6 space-y-6 shadow-xl relative max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center pb-4 border-b">
                            <div>
                                <h3 className="font-bold text-gray-800 text-lg">
                                    Order Details (#{selectedOrder.orderNumber || selectedOrder._id})
                                </h3>
                                <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                    <FiCalendar /> Placed on: {formatDateTime(selectedOrder.createdAt)}
                                </p>
                            </div>
                            <button onClick={() => setIsViewModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <FiX className="text-xl" />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
                            <div className="bg-gray-50 p-4 rounded-xl space-y-2 border">
                                <h4 className="font-bold text-gray-700 flex items-center gap-1.5 border-b pb-1.5">
                                    <FiUser className="text-[#1b2a57]" /> Customer Info
                                </h4>
                                <p className="text-gray-800 font-medium">
                                    Name: {selectedOrder.shipping?.fullName || selectedOrder.customer?.name || "N/A"}
                                </p>
                                <p className="text-gray-600 flex items-center gap-1.5">
                                    <FiMail className="text-gray-400" /> {selectedOrder.customer?.email || selectedOrder.shipping?.email || "N/A"}
                                </p>
                                <p className="text-gray-600 flex items-center gap-1.5">
                                    <FiPhone className="text-gray-400" /> {selectedOrder.shipping?.phone || selectedOrder.customer?.phone || "N/A"}
                                </p>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-xl space-y-2 border">
                                <h4 className="font-bold text-gray-700 flex items-center gap-1.5 border-b pb-1.5">
                                    <FiMapPin className="text-[#1b2a57]" /> Delivery Address
                                </h4>
                                <p className="text-gray-700">
                                    {selectedOrder.shipping?.address || selectedOrder.shippingAddress || "No address provided"}
                                </p>
                                {selectedOrder.shipping?.city && (
                                    <p className="text-gray-500 text-xs">
                                        City: {selectedOrder.shipping.city}, Postal: {selectedOrder.shipping.postalCode || "N/A"}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div>
                            <h4 className="font-bold text-gray-700 mb-3 text-sm">Ordered Products</h4>
                            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                                {(selectedOrder.products || selectedOrder.items || selectedOrder.orderItems || []).map((item, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 border rounded-xl">
                                        <div className="flex items-center gap-3">
                                            <img
                                                src={getProductImage(item)}
                                                alt="item"
                                                onClick={() => handleImageClick(getProductImage(item))}
                                                className="w-10 h-10 object-cover rounded-lg border bg-white cursor-pointer hover:opacity-80 transition"
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = "https://placehold.co/50x50?text=No+Img";
                                                }}
                                            />
                                            <div>
                                                <p className="font-medium text-gray-800 text-xs sm:text-sm">
                                                    {item.name || item.title || item.product?.name || "Product Item"}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    Qty: {item.quantity || item.qty || 1} × ৳{item.price || item.unitPrice || 0}
                                                </p>
                                            </div>
                                        </div>
                                        <p className="font-bold text-gray-800 text-xs sm:text-sm">
                                            ৳{(item.quantity || item.qty || 1) * (item.price || item.unitPrice || 0)}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-xl space-y-2 text-xs sm:text-sm border">
                            <div className="flex justify-between text-gray-600">
                                <span>Subtotal</span>
                                <span>৳{selectedOrder.subtotal || selectedOrder.totalAmount || 0}</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Shipping Charge</span>
                                <span>৳{selectedOrder.shippingCharge || selectedOrder.shippingFee || 0}</span>
                            </div>
                            {selectedOrder.discount > 0 && (
                                <div className="flex justify-between text-green-600">
                                    <span>Discount</span>
                                    <span>-৳{selectedOrder.discount}</span>
                                </div>
                            )}
                            <div className="flex justify-between font-bold text-gray-800 text-base pt-2 border-t">
                                <span>Grand Total</span>
                                <span>৳{selectedOrder.grandTotal || selectedOrder.totalAmount || 0}</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                            <div className="bg-gray-50 p-3 rounded-lg border space-y-1">
                                <p className="font-semibold text-gray-700 flex items-center gap-1">
                                    <FiCreditCard /> Payment Method: <span className="uppercase text-blue-600">{selectedOrder.payment?.method || selectedOrder.paymentMethod || "COD"}</span>
                                </p>
                                <p className="text-gray-600">
                                    Payment Status: <span className="font-bold capitalize">{selectedOrder.payment?.status || selectedOrder.paymentStatus || "pending"}</span>
                                </p>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-lg border space-y-1">
                                <p className="font-semibold text-gray-700">Admin Note:</p>
                                <p className="text-gray-600 italic">{selectedOrder.adminNote || "No note added."}</p>
                            </div>
                        </div>

                        <div className="flex justify-end pt-2">
                            <button
                                onClick={() => setIsViewModalOpen(false)}
                                className="px-5 py-2 bg-gray-200 text-gray-700 hover:bg-gray-300 rounded-xl text-sm font-medium transition"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL 2: Update Status Modal */}
            {isUpdateModalOpen && selectedOrder && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-md rounded-2xl p-6 space-y-4 shadow-xl relative">
                        <div className="flex justify-between items-center pb-3 border-b">
                            <h3 className="font-bold text-gray-800 text-base">Update Order Status</h3>
                            <button onClick={() => setIsUpdateModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <FiX className="text-xl" />
                            </button>
                        </div>

                        <form onSubmit={handleUpdateSubmit} className="space-y-4 text-sm">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">Order Status</label>
                                <select
                                    value={updateStatus}
                                    onChange={(e) => setUpdateStatus(e.target.value)}
                                    className="w-full p-2.5 bg-gray-50 border rounded-lg focus:outline-none focus:border-[#1b2a57]"
                                >
                                    <option value="pending">Pending</option>
                                    <option value="confirmed">Confirmed</option>
                                    <option value="processing">Processing</option>
                                    <option value="packed">Packed</option>
                                    <option value="shipped">Shipped</option>
                                    <option value="delivered">Delivered</option>
                                    <option value="cancelled">Cancelled</option>
                                    <option value="returned">Returned</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">Payment Status</label>
                                <select
                                    value={updatePaymentStatus}
                                    onChange={(e) => setUpdatePaymentStatus(e.target.value)}
                                    className="w-full p-2.5 bg-gray-50 border rounded-lg focus:outline-none focus:border-[#1b2a57]"
                                >
                                    <option value="pending">Pending</option>
                                    <option value="paid">Paid</option>
                                    <option value="failed">Failed</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">Customer Message (Optional)</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Your parcel is on the way"
                                    value={statusMessage}
                                    onChange={(e) => setStatusMessage(e.target.value)}
                                    className="w-full p-2.5 bg-gray-50 border rounded-lg focus:outline-none focus:border-[#1b2a57]"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">Admin Internal Note</label>
                                <textarea
                                    rows="2"
                                    placeholder="Internal notes for team..."
                                    value={adminNote}
                                    onChange={(e) => setAdminNote(e.target.value)}
                                    className="w-full p-2.5 bg-gray-50 border rounded-lg focus:outline-none focus:border-[#1b2a57]"
                                ></textarea>
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsUpdateModalOpen(false)}
                                    className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg font-medium hover:bg-gray-200 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={actionLoading}
                                    className="px-4 py-2 bg-[#1b2a57] text-white rounded-lg font-medium hover:bg-navy-800 transition disabled:opacity-50 flex items-center gap-2"
                                >
                                    {actionLoading && <FiRefreshCw className="animate-spin" />} Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL 3: Delete Confirmation */}
            {isDeleteModalOpen && selectedOrder && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-sm rounded-2xl p-6 space-y-4 shadow-xl text-center">
                        <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto text-xl">
                            <FiTrash2 />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-800 text-base">অর্ডার মুছে ফেলতে চান?</h3>
                            <p className="text-xs text-gray-500 mt-1">
                                Order #{selectedOrder.orderNumber || selectedOrder._id.slice(-8)} চিরতরে মুছে ফেলা হবে।
                            </p>
                        </div>
                        <div className="flex items-center justify-center gap-3 pt-2">
                            <button
                                onClick={() => setIsDeleteModalOpen(false)}
                                className="w-full py-2 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition text-sm"
                            >
                                বাতিল
                            </button>
                            <button
                                onClick={handleDeleteSubmit}
                                disabled={actionLoading}
                                className="w-full py-2 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition text-sm disabled:opacity-50 flex items-center justify-center gap-1"
                            >
                                {actionLoading && <FiRefreshCw className="animate-spin" />} ডিলিট করুন
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL 4: Fullsize Image Preview */}
            {isPreviewOpen && previewImage && (
                <div
                    className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    onClick={() => setIsPreviewOpen(false)}
                >
                    <div className="relative max-w-3xl max-h-[90vh] overflow-hidden rounded-2xl p-2 bg-white/10 border border-white/20">
                        <button
                            onClick={() => setIsPreviewOpen(false)}
                            className="absolute top-4 right-4 bg-black/60 text-white p-2 rounded-full hover:bg-black transition z-10"
                        >
                            <FiX className="text-xl" />
                        </button>
                        <img
                            src={previewImage}
                            alt="Preview"
                            className="w-full h-auto max-h-[85vh] object-contain rounded-xl"
                        />
                    </div>
                </div>
            )}

            {/* MODAL 5: Professional Invoice Modal */}
            {isInvoiceModalOpen && selectedOrder && (
                <InvoicePrint
                    order={selectedOrder}
                    onClose={() => setIsInvoiceModalOpen(false)}
                    backendDomain={BACKEND_DOMAIN}
                />
            )}
        </div>
    );
};

export default AllOrders;