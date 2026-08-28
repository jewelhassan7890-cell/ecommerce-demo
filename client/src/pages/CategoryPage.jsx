import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getPublicCategories, getCategoryProducts } from "../api/categoryApi";

function CategoryPage() {
    const { slug } = useParams();
    const navigate = useNavigate();

    // States
    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filter States
    const [inStockOnly, setInStockOnly] = useState(false);
    const [sortOption, setSortOption] = useState("newest");
    const [totalProducts, setTotalProducts] = useState(0);

    // Pagination States
    const [currentPage, setCurrentPage] = useState(1);
    const productsPerPage = 6;

    // ১. ক্যাটাগরি লিস্ট লোড
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await getPublicCategories();
                if (res?.success) {
                    setCategories(res.data || []);
                }
            } catch (err) {
                console.error("Error loading categories:", err);
            }
        };
        fetchCategories();
    }, []);

    // ২. ক্যোয়ারি ফিল্টার অনুযায়ী প্রোডাক্ট লোড
    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                const res = await getCategoryProducts({
                    slug,
                    inStock: inStockOnly,
                    sort: sortOption
                });

                if (res?.success) {
                    setProducts(res.data || []);
                    setTotalProducts(res.pagination?.totalProducts || res.data?.length || 0);
                } else {
                    setProducts([]);
                    setTotalProducts(0);
                }
            } catch (err) {
                console.error("Error loading products:", err);
                setProducts([]);
                setTotalProducts(0);
            } finally {
                setLoading(false);
            }
        };

        if (slug) {
            fetchProducts();
            setCurrentPage(1); // ক্যাটাগরি বা ফিল্টার পরিবর্তন হলে পেজ ১-এ রিসেট হবে
        }
    }, [slug, inStockOnly, sortOption]);

    // বর্তমান ক্যাটাগরির ফরম্যাটেড নাম বের করা
    const currentCategory = categories.find(c => c.slug === slug);
    const currentCategoryName = currentCategory?.name || slug?.replace(/-/g, ' ');

    // ৩. পেজিনেশনের জন্য প্রোডাক্ট ক্যালকুলেশন
    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    const currentProducts = products.slice(indexOfFirstProduct, indexOfLastProduct);
    const totalPages = Math.ceil(products.length / productsPerPage);

    // পেজ হ্যান্ডলার (কোড স্ক্রোল হ্যান্ডলিং সহ)
    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div>
            <div className="bg-gray-50 min-h-screen py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">

                    {/* 1. Breadcrumb Navigation */}
                    <nav className="flex items-center space-x-2 text-sm text-gray-600 capitalize">
                        <Link to="/" className="hover:text-black flex items-center space-x-1 transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                            <span>Home</span>
                        </Link>
                        <span>&gt;</span>
                        <span className="font-semibold text-gray-900">{currentCategoryName}</span>
                    </nav>

                    {/* 2. Top Filter Bar */}
                    <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-sm">
                        {/* Left: In Stock Filter & Count */}
                        <div className="flex items-center space-x-3">
                            <label className="flex items-center space-x-2 cursor-pointer font-medium text-gray-800 text-sm sm:text-base select-none">
                                <input
                                    type="checkbox"
                                    checked={inStockOnly}
                                    onChange={(e) => {
                                        setInStockOnly(e.target.checked);
                                        setCurrentPage(1);
                                    }}
                                    className="w-4 h-4 text-black accent-black rounded border-gray-300 focus:ring-0 cursor-pointer"
                                />
                                <span>In Stock Only</span>
                            </label>
                            <span className="text-gray-400 text-sm border-l pl-3 border-gray-200">
                                {totalProducts} {totalProducts === 1 ? 'Product' : 'Products'} Found
                            </span>
                        </div>

                        {/* Right: Sorting Select */}
                        <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-gray-600">Sort By</span>
                            <select
                                value={sortOption}
                                onChange={(e) => {
                                    setSortOption(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="bg-white border border-gray-300 text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-black font-medium cursor-pointer"
                            >
                                <option value="newest">Newest</option>
                                <option value="low-high">Price: Low to High</option>
                                <option value="high-low">Price: High to Low</option>
                            </select>
                        </div>
                    </div>

                    {/* 3. Main Content Area */}
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

                        {/* Sidebar: Explore Categories */}
                        <aside className="lg:col-span-1">
                            <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-200 shadow-sm space-y-3 sticky top-6">
                                <h3 className="font-bold text-lg text-gray-900 border-b pb-3 border-gray-100">
                                    Explore Categories
                                </h3>
                                <div className="space-y-1 max-h-[70vh] overflow-y-auto pr-1">
                                    {categories.map((cat) => {
                                        const isActive = cat.slug === slug;
                                        return (
                                            <button
                                                key={cat._id || cat.slug}
                                                onClick={() => navigate(`/category/${cat.slug}`)}
                                                className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 capitalize flex items-center justify-between ${isActive
                                                    ? 'bg-black text-white font-semibold shadow-sm'
                                                    : 'text-gray-700 hover:bg-gray-100'
                                                    }`}
                                            >
                                                <span>{cat.name}</span>
                                                {isActive && <span className="text-xs">●</span>}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </aside>

                        {/* Product Grid / Empty State */}
                        <main className="lg:col-span-3 space-y-8">
                            {loading ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {[1, 2, 3, 4, 5, 6].map((n) => (
                                        <div key={n} className="bg-white border rounded-2xl p-4 animate-pulse h-80 flex flex-col justify-between">
                                            <div className="bg-gray-200 h-48 rounded-xl w-full"></div>
                                            <div className="space-y-2 mt-4">
                                                <div className="bg-gray-200 h-4 rounded w-3/4"></div>
                                                <div className="bg-gray-200 h-4 rounded w-1/2"></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : products.length === 0 ? (
                                /* No Products Found Container */
                                <div className="bg-white border border-gray-300 rounded-2xl p-12 text-center min-h-[380px] flex flex-col justify-center items-center shadow-sm">
                                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                                        No Products Found
                                    </h3>
                                    <p className="text-gray-500 text-sm sm:text-base max-w-md">
                                        Try changing your filters, clearing "In Stock Only", or explore another category.
                                    </p>
                                    {inStockOnly && (
                                        <button
                                            onClick={() => setInStockOnly(false)}
                                            className="mt-5 px-5 py-2.5 bg-black text-white text-xs sm:text-sm font-semibold rounded-lg hover:bg-gray-800 transition-all duration-200 shadow-sm"
                                        >
                                            Uncheck "In Stock Only"
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <>
                                    {/* Product Card Grid */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {currentProducts.map((product) => {
                                            // Sale / Discount Check
                                            const hasDiscount = product.isOnSale && product.salePrice && product.salePrice < product.price;
                                            const discountPercent = hasDiscount
                                                ? Math.round(((product.price - product.salePrice) / product.price) * 100)
                                                : 0;

                                            return (
                                                <div
                                                    key={product._id}
                                                    className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col group relative"
                                                >
                                                    {/* Badges */}
                                                    <div className="absolute top-3 left-3 z-10 flex flex-col gap-1">
                                                        {hasDiscount && (
                                                            <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                                                                -{discountPercent}%
                                                            </span>
                                                        )}
                                                        {(product.stockStatus === 'out-of-stock' || product.stock <= 0) && (
                                                            <span className="bg-gray-900 text-white text-[9px] uppercase font-bold px-2 py-0.5 rounded">
                                                                Stock Out
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* Product Image */}
                                                    <div className="relative aspect-square overflow-hidden bg-gray-50 border-b border-gray-100">
                                                        <img
                                                            src={product.thumbnail?.url || "/placeholder.jpg"}
                                                            alt={product.name}
                                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                                                            onError={(e) => {
                                                                e.target.onerror = null;
                                                                e.target.src = "https://via.placeholder.com/300?text=No+Image";
                                                            }}
                                                            loading="lazy"
                                                        />
                                                    </div>

                                                    {/* Product Info */}
                                                    <div className="p-4 flex flex-col flex-grow justify-between space-y-3">
                                                        <div>
                                                            <h4 className="font-semibold text-gray-800 text-sm sm:text-base line-clamp-1 group-hover:text-black transition-colors">
                                                                {product.name}
                                                            </h4>


                                                            <p className="text-xs text-gray-400 mt-1 capitalize">
                                                                {product.category?.name || currentCategoryName}
                                                            </p>
                                                        </div>

                                                        {/* Pricing & CTA */}
                                                        <div className="pt-2 border-t border-gray-50 flex items-center justify-between">
                                                            <div className="flex flex-col">
                                                                {hasDiscount ? (
                                                                    <div className="flex items-center space-x-1.5">
                                                                        <span className="text-base sm:text-lg font-bold text-gray-900">
                                                                            ৳{product.salePrice?.toLocaleString()}
                                                                        </span>
                                                                        <span className="text-xs text-gray-400 line-through">
                                                                            ৳{product.price?.toLocaleString()}
                                                                        </span>
                                                                    </div>
                                                                ) : (
                                                                    <span className="text-base sm:text-lg font-bold text-gray-900">
                                                                        ৳{product.salePrice?.toLocaleString()}
                                                                    </span>

                                                                )}
                                                            </div>

                                                            <Link
                                                                to={`/product/${product.slug || product._id}`}
                                                                className="px-3.5 py-1.5 bg-black text-white text-xs font-semibold rounded-lg hover:bg-gray-800 active:scale-95 transition-all duration-200 inline-flex items-center justify-center"
                                                            >
                                                                View
                                                            </Link>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* 4. Professional Pagination Controls */}
                                    {totalPages > 1 && (
                                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-gray-200">
                                            <p className="text-xs sm:text-sm text-gray-500 font-medium">
                                                Showing <span className="text-gray-900 font-semibold">{indexOfFirstProduct + 1}</span> to{" "}
                                                <span className="text-gray-900 font-semibold">
                                                    {Math.min(indexOfLastProduct, products.length)}
                                                </span>{" "}
                                                of <span className="text-gray-900 font-semibold">{products.length}</span> items
                                            </p>

                                            <div className="flex items-center space-x-1 sm:space-x-2">
                                                {/* Previous Button */}
                                                <button
                                                    onClick={() => handlePageChange(currentPage - 1)}
                                                    disabled={currentPage === 1}
                                                    className="px-3 py-2 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                                                >
                                                    Previous
                                                </button>

                                                {/* Page Numbers */}
                                                {Array.from({ length: totalPages }, (_, index) => index + 1).map((number) => (
                                                    <button
                                                        key={number}
                                                        onClick={() => handlePageChange(number)}
                                                        className={`px-3.5 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-all ${currentPage === number
                                                            ? "bg-black text-white shadow-sm"
                                                            : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
                                                            }`}
                                                    >
                                                        {number}
                                                    </button>
                                                ))}

                                                {/* Next Button */}
                                                <button
                                                    onClick={() => handlePageChange(currentPage + 1)}
                                                    disabled={currentPage === totalPages}
                                                    className="px-3 py-2 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                                                >
                                                    Next
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </main>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CategoryPage;