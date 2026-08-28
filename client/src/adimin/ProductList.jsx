import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const ProductList = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState({ type: '', text: '' });

    // 🔍 সার্চ ও পেজিনেশন স্টেট
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [pagination, setPagination] = useState({
        totalProducts: 0,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false,
        limit: 10
    });
    const [zoomedImage, setZoomedImage] = useState(null);

    // ১. প্রোডাক্ট লিস্ট লোড করা (সার্চ ও পেজিনেশন সহ)
    const fetchProducts = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${API_URL}/products`, {
                params: {
                    search: searchTerm,
                    page: currentPage,
                    limit: 10
                }
            });

            if (res.data?.success) {
                // response schema: res.data.data -> Array of products
                setProducts(Array.isArray(res.data.data) ? res.data.data : []);
                if (res.data.pagination) {
                    setPagination(res.data.pagination);
                }
            }
        } catch (err) {
            console.error('Fetch Error:', err);
            setMessage({ type: 'error', text: 'প্রোডাক্ট লোড করতে ব্যর্থ হয়েছে।' });
        } finally {
            setLoading(false);
        }
    };

    // পৃষ্ঠা বা সার্চের মান পরিবর্তন হলে ডাটা রি-ফেচ হবে
    useEffect(() => {
        fetchProducts();
    }, [currentPage, searchTerm]);

    // টাইপিংয়ের সাথে সাথে পেজ ১-এ রিসেট করার জন্য হ্যান্ডলার
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1); // সার্চ পরিবর্তন হলে প্রথম পেজে ফেরত যাবে
    };

    // ২. Soft Delete Handler (router.delete("/:id"))
    const handleDelete = async (id, name) => {
        const confirmDelete = window.confirm(`আপনি কি সত্যিই "${name}" ডিলিট (Soft Delete) করতে চান?`);
        if (!confirmDelete) return;

        try {
            const token = localStorage.getItem('token');
            const res = await axios.delete(`${API_URL}/products/${id}`, {
                headers: {
                    Authorization: token ? `Bearer ${token}` : ''
                }
            });

            if (res.data?.success) {
                setMessage({ type: 'success', text: 'প্রোডাক্ট সফলভাবে ডিলিট করা হয়েছে!' });
                // UI স্টেট আপডেট অথবা বর্তমান পেজের ডাটা পুনরায় ফেচ করা
                fetchProducts();
            }
        } catch (err) {
            setMessage({
                type: 'error',
                text: err.response?.data?.message || 'ডিলিট করতে সমস্যা হয়েছে।'
            });
        }
    };

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-6 bg-gray-50 min-h-screen">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h1 className="text-2xl font-bold text-gray-800">🛍️ Product Management</h1>
                <Link
                    to="/admin/productupload"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl font-semibold text-sm shadow transition shrink-0"
                >
                    + Add New Product
                </Link>
            </div>

            {/* 🔍 সার্চ ফিল্টার বার (Search Input Bar) */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-6 flex items-center justify-between gap-4">
                <div className="relative w-full max-w-md">
                    <input
                        type="text"
                        placeholder="Search product by name, SKU..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:bg-white transition"
                    />
                    <span className="absolute left-3 top-2.5 text-gray-400 text-sm">🔍</span>
                </div>
                <div className="text-xs font-semibold text-gray-500 hidden sm:block">
                    Total Products: <span className="text-emerald-600 font-bold">{pagination.totalProducts}</span>
                </div>
            </div>

            {message.text && (
                <div className={`p-4 rounded-xl mb-6 text-sm font-semibold flex justify-between items-center ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                    <span>{message.text}</span>
                    <button
                        onClick={() => setMessage({ type: '', text: '' })}
                        className="text-xs font-bold underline ml-4 cursor-pointer"
                    >
                        Dismiss
                    </button>
                </div>
            )}

            {/* Product Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b text-gray-600 text-xs uppercase tracking-wider">
                            <th className="p-4">Image</th>
                            <th className="p-4">Product Name</th>
                            <th className="p-4">Category</th>
                            <th className="p-4">SKU code</th>
                            <th className="p-4">Price</th>
                            <th className="p-4">Stock</th>
                            <th className="p-4 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm">
                        {loading ? (
                            <tr>
                                <td colSpan="6" className="p-8 text-center text-gray-500 font-bold">
                                    ডাটা লোড হচ্ছে...
                                </td>
                            </tr>
                        ) : products.length > 0 ? (
                            products.map((item) => (
                                <tr key={item._id} className="hover:bg-gray-50 transition">
                                    <td className="p-4">


                                        <div className="p-4">
                                            {/* প্রোডাক্ট ইমেজ (থাম্বনেইল) */}
                                            <img
                                                src={item.thumbnail?.url || "https://via.placeholder.com/50"}
                                                alt={item.name}
                                                className="w-12 h-12 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-80 hover:scale-105 transition-all duration-200"
                                                onClick={() =>
                                                    setZoomedImage(item.thumbnail?.url || "https://via.placeholder.com/500")
                                                }
                                            />

                                            {/* 🔍 Image Zoom Modal (পপআপ) */}
                                            {zoomedImage && (
                                                <div
                                                    className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 transition-all duration-300"
                                                    onClick={() => setZoomedImage(null)} // বাইরে ক্লিক করলে পপআপ বন্ধ হবে
                                                >
                                                    <div
                                                        className="relative bg-white p-2 sm:p-3 rounded-2xl max-w-lg w-full shadow-2xl transform scale-100 transition-transform"
                                                        onClick={(e) => e.stopPropagation()} // ছবির ওপর ক্লিক করলে পপআপ বন্ধ হবে না
                                                    >
                                                        {/* Close Button */}
                                                        <button
                                                            onClick={() => setZoomedImage(null)}
                                                            className="absolute -top-3 -right-3 bg-rose-600 hover:bg-rose-700 text-white w-8 h-8 rounded-full font-bold shadow-md flex items-center justify-center transition-colors z-10"
                                                            title="বন্ধ করুন"
                                                        >
                                                            ✕
                                                        </button>

                                                        {/* Medium Zoomed Image */}
                                                        <img
                                                            src={zoomedImage}
                                                            alt={item.name}
                                                            className="w-full h-auto max-h-[75vh] object-contain rounded-xl"
                                                        />

                                                        {/* Title Below Image */}
                                                        {item.name && (
                                                            <p className="text-center text-xs sm:text-sm font-semibold text-slate-700 mt-2.5 truncate">
                                                                {item.name}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-4 font-semibold text-gray-800">{item.name}</td>
                                    <td className="p-4 text-gray-500">{item.category?.name || 'N/A'}</td>
                                    <td className="p-4 text-gray-500">{item.sku || 'N/A'}</td>
                                    <td className="p-4 font-bold text-emerald-600">
                                        {item.salePrice ? (
                                            <div>
                                                <span>৳{item.salePrice}</span>
                                                <span className="text-xs text-gray-400 line-through ml-2">৳{item.price}</span>
                                            </div>
                                        ) : (
                                            `৳${item.price}`
                                        )}
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${item.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                            }`}>
                                            {item.stock > 0 ? `${item.stock} in stock` : 'Out of Stock'}
                                        </span>
                                    </td>
                                    <td className="p-4 text-center space-x-2">
                                        <Link
                                            to={`/admin/productedit/${item?._id}`}
                                            className="px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-xs font-bold transition inline-block"
                                        >
                                            ✏️ Edit
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(item._id, item.name)}
                                            className="px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-xs font-bold transition"
                                        >
                                            🗑️ Delete
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="p-8 text-center text-gray-400">কোনো প্রোডাক্ট পাওয়া যায়নি।</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* 📄 প্রফেশনাল ই-কমার্স পেজিনেশন কন্ট্রোল (Pagination Controls) */}
            {!loading && pagination.totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="text-xs text-gray-500">
                        Page <span className="font-bold text-gray-800">{pagination.currentPage}</span> of{' '}
                        <span className="font-bold text-gray-800">{pagination.totalPages}</span>
                    </div>

                    <div className="flex items-center space-x-2">
                        {/* Previous Page Button */}
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={!pagination.hasPrevPage}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition ${pagination.hasPrevPage
                                ? 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50 cursor-pointer'
                                : 'bg-gray-100 text-gray-400 border-gray-100 cursor-not-allowed'
                                }`}
                        >
                            ◀ Previous
                        </button>

                        {/* Page Numbers */}
                        {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((pageNum) => (
                            <button
                                key={pageNum}
                                onClick={() => setCurrentPage(pageNum)}
                                className={`w-8 h-8 rounded-xl text-xs font-bold transition ${currentPage === pageNum
                                    ? 'bg-emerald-600 text-white shadow'
                                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 cursor-pointer'
                                    }`}
                            >
                                {pageNum}
                            </button>
                        ))}

                        {/* Next Page Button */}
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, pagination.totalPages))}
                            disabled={!pagination.hasNextPage}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition ${pagination.hasNextPage
                                ? 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50 cursor-pointer'
                                : 'bg-gray-100 text-gray-400 border-gray-100 cursor-not-allowed'
                                }`}
                        >
                            Next ▶
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductList;