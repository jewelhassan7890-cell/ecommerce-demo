import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API from "./../api/axios";

const AdminRestockAlerts = () => {
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchCode, setSearchCode] = useState("");
    const [statusFilter, setStatusFilter] = useState("");

    const fetchAlerts = async () => {
        try {
            setLoading(true);
            let queryUrl = `/restock?dressCode=${searchCode}`;
            if (statusFilter) queryUrl += `&status=${statusFilter}`;

            const response = await API.get(queryUrl);
            setAlerts(response.data.data);
        } catch (error) {
            console.error("Failed to fetch restock requests:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchAlerts();
        }, 400);

        return () => clearTimeout(timer);
    }, [searchCode, statusFilter]);

    const handleStatusUpdate = async (id, newStatus) => {
        try {
            await API.patch(`/restock/${id}/status`, { status: newStatus });
            fetchAlerts();
        } catch (error) {
            console.log(error.message)
            alert("Failed to update status. Make sure you have Admin access.");
        }
    };

    return (
        <div className="p-3 sm:p-6 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
                {/* Header & Breadcrumb */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Restock Requests</h1>
                        <nav className="text-xs text-gray-500 mt-1">
                            <Link to="/admin" className="hover:underline text-blue-600">Dashboard</Link> / Restock Alerts
                        </nav>
                    </div>

                    {/* Search and Filters */}
                    <div className="flex flex-col sm:flex-row gap-2.5">
                        <input
                            type="text"
                            placeholder="Search Dress Code..."
                            value={searchCode}
                            onChange={(e) => setSearchCode(e.target.value)}
                            className="px-3.5 py-2 text-sm border rounded-lg bg-gray-50 focus:bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none uppercase"
                        />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-3.5 py-2 text-sm border rounded-lg bg-gray-50 focus:bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        >
                            <option value="">All Status</option>
                            <option value="Pending">Pending</option>
                            <option value="Notified">Notified</option>
                            <option value="Cancelled">Cancelled</option>
                        </select>
                    </div>
                </div>

                {/* Requests List (Desktop Table + Mobile Cards) */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    {/* Desktop View */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-100 text-gray-600 uppercase text-xs font-semibold">
                                <tr>
                                    <th className="p-4">Customer Name</th>
                                    <th className="p-4">Phone Number</th>
                                    <th className="p-4">Dress Code</th>
                                    <th className="p-4">Requested At</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4 text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {loading ? (
                                    <tr>
                                        <td colSpan="6" className="text-center p-6 text-gray-500">
                                            Loading restock requests...
                                        </td>
                                    </tr>
                                ) : alerts.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="text-center p-6 text-gray-500">
                                            No restock requests found.
                                        </td>
                                    </tr>
                                ) : (
                                    alerts.map((alertItem) => (
                                        <tr key={alertItem._id} className="hover:bg-gray-50 transition">
                                            <td className="p-4 font-medium text-gray-800">{alertItem.name}</td>
                                            <td className="p-4 font-mono text-gray-700">
                                                <a href={`tel:${alertItem.phone}`} className="hover:underline text-blue-600">
                                                    {alertItem.phone}
                                                </a>
                                            </td>
                                            <td className="p-4 font-bold text-blue-600">{alertItem.dressCode}</td>
                                            <td className="p-4 text-xs text-gray-500">
                                                {new Date(alertItem.createdAt).toLocaleDateString("en-US", {
                                                    day: "numeric",
                                                    month: "short",
                                                    year: "numeric",
                                                })}
                                            </td>
                                            <td className="p-4">
                                                <span
                                                    className={`px-2.5 py-1 text-xs rounded-full font-semibold ${alertItem.status === "Notified"
                                                        ? "bg-green-100 text-green-700"
                                                        : alertItem.status === "Cancelled"
                                                            ? "bg-red-100 text-red-700"
                                                            : "bg-yellow-100 text-yellow-700"
                                                        }`}
                                                >
                                                    {alertItem.status}
                                                </span>
                                            </td>
                                            <td className="p-4 text-center space-x-2">
                                                {alertItem.status === "Pending" && (
                                                    <button
                                                        onClick={() => handleStatusUpdate(alertItem._id, "Notified")}
                                                        className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded shadow-sm transition"
                                                    >
                                                        Mark Notified
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile View (Card Style) */}
                    <div className="block md:hidden divide-y divide-gray-200">
                        {loading ? (
                            <p className="p-4 text-center text-sm text-gray-500">Loading...</p>
                        ) : alerts.length === 0 ? (
                            <p className="p-4 text-center text-sm text-gray-500">No restock requests found.</p>
                        ) : (
                            alerts.map((alertItem) => (
                                <div key={alertItem._id} className="p-4 space-y-2.5">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-semibold text-gray-800 text-sm">{alertItem.name}</h3>
                                            <p className="text-xs text-gray-500 font-mono mt-0.5">
                                                <a href={`tel:${alertItem.phone}`} className="text-blue-600 underline">
                                                    {alertItem.phone}
                                                </a>
                                            </p>
                                        </div>
                                        <span
                                            className={`px-2 py-0.5 text-xs rounded-full font-semibold ${alertItem.status === "Notified"
                                                ? "bg-green-100 text-green-700"
                                                : alertItem.status === "Cancelled"
                                                    ? "bg-red-100 text-red-700"
                                                    : "bg-yellow-100 text-yellow-700"
                                                }`}
                                        >
                                            {alertItem.status}
                                        </span>
                                    </div>

                                    <div className="flex justify-between items-center text-xs text-gray-600">
                                        <div>
                                            Code: <span className="font-bold text-blue-600">{alertItem.dressCode}</span>
                                        </div>
                                        <div>{new Date(alertItem.createdAt).toLocaleDateString()}</div>
                                    </div>

                                    {alertItem.status === "Pending" && (
                                        <button
                                            onClick={() => handleStatusUpdate(alertItem._id, "Notified")}
                                            className="w-full mt-2 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded shadow-sm transition"
                                        >
                                            Mark Notified
                                        </button>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminRestockAlerts;