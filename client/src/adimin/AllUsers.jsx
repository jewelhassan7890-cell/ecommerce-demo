import React, { useEffect, useState } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || 'https://ecommerce-demo-ro6m48tke-style-and-closet.vercel.app';

const AllUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Token নেওয়ার জন্য (সাধারণত localStorage-এ থাকে)
    const token = localStorage.getItem("token");

    // API base config
    const axiosInstance = axios.create({
        baseURL: `${API_URL}/users`, // আপনার ব্যাকএন্ড URL অনুযায়ী পরিবর্তন করুন
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    // ১. সব ইউজার ডাটা ফেচ করা
    const fetchUsers = async () => {
        try {
            setLoading(true);
            const res = await axiosInstance.get("/allusers");
            setUsers(res.data);
            setLoading(false);
        } catch (err) {
            setError(err.response?.data?.message || "Something went wrong!");
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    // ২. Admin Status Toggle করা
    const handleToggleAdmin = async (id, currentStatus) => {
        try {
            const res = await axiosInstance.patch(`/toggle-admin/${id}`, {
                isAdmin: !currentStatus,
            });

            // UI রিয়েল-টাইমে আপডেট করা
            setUsers((prevUsers) =>
                prevUsers.map((user) =>
                    user._id === id ? { ...user, isAdmin: !currentStatus } : user
                )
            );
        } catch (err) {
            alert(err.response?.data?.message || "Failed to update admin status");
        }
    };

    // ৩. User Delete করা
    const handleDeleteUser = async (id) => {
        const confirmDelete = window.confirm(
            "Are you sure you want to delete this user?"
        );
        if (!confirmDelete) return;

        try {
            await axiosInstance.delete(`/delete/${id}`);

            // UI থেকে ডিলিট হওয়া ইউজার সরিয়ে দেওয়া
            setUsers((prevUsers) => prevUsers.filter((user) => user._id !== id));
        } catch (err) {
            alert(err.response?.data?.message || "Failed to delete user");
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <p className="text-lg font-semibold text-gray-600">Loading users...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 bg-red-100 text-red-700 rounded-md my-4">
                {error}
            </div>
        );
    }

    return (
        <div className="p-6 bg-white rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">User Management</h2>
                <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
                    Total Users: {users.length}
                </span>
            </div>

            {/* Users Table */}
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                User
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Email
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Role
                            </th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Toggle Admin
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {users.map((user) => (
                            <tr key={user._id} className="hover:bg-gray-50 transition">
                                {/* Name */}
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">
                                        {user.name || "N/A"}
                                    </div>
                                </td>

                                {/* Email */}
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-500">{user.email}</div>
                                </td>

                                {/* Role Badge */}
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {user.isAdmin ? (
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                            Admin
                                        </span>
                                    ) : (
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                                            Customer
                                        </span>
                                    )}
                                </td>

                                {/* Toggle Admin Button */}
                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                    <button
                                        onClick={() => handleToggleAdmin(user._id, user.isAdmin)}
                                        className={`px-3 py-1 text-xs font-semibold rounded-md transition ${user.isAdmin
                                            ? "bg-amber-100 text-amber-800 hover:bg-amber-200"
                                            : "bg-indigo-100 text-indigo-800 hover:bg-indigo-200"
                                            }`}
                                    >
                                        {user.isAdmin ? "Demote to User" : "Make Admin"}
                                    </button>
                                </td>

                                {/* Delete Button */}
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button
                                        onClick={() => handleDeleteUser(user._id)}
                                        className="text-red-600 hover:text-red-900 font-semibold transition"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AllUsers;