import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { Flame, Sparkles, ArrowRight, Tag } from "lucide-react";

// UI Components
import Hero from "../components/Hero";

import PublicCoupon from "./PublicCoupon";
import ReviewCarousel from "./ReviewCarousel";

// API Base URL Setup
const BASE_URL = import.meta.env.VITE_API_URL || "https://ecommerce-demo-ro6m48tke-style-and-closet.vercel.app";

// ----------------------------------------------------
// Reusable Product Skeleton Loader Component (Declared Outside Home)
// ----------------------------------------------------
const ProductSkeleton = () => (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {[...Array(4)].map((_, index) => (
            <div key={index} className="bg-gray-100 rounded-2xl p-3 animate-pulse">
                <div className="w-full h-44 sm:h-56 bg-gray-200 rounded-xl mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
                <div className="h-8 bg-gray-200 rounded-lg w-full"></div>
            </div>
        ))}
    </div>
);

// ----------------------------------------------------
// Reusable Product Grid Component (Declared Outside Home)
// ----------------------------------------------------
const ProductGrid = ({ products }) => {
    if (!products || products.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500 font-medium">
                বর্তমানে কোনো প্রোডাক্ট পাওয়া যায়নি!
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {products.map((product) => {
                const mainImage = product.thumbnail?.url || product.thumbnail || product.gallery?.[0]?.url || product.gallery?.[0] || "https://via.placeholder.com/300";
                const currentPrice = product.salePrice || product.price;
                const hasDiscount = product.salePrice && product.salePrice < product.price;

                return (
                    <div
                        key={product._id}
                        className="group bg-white border border-gray-100 rounded-2xl p-3 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                    >
                        <div className="relative">
                            {/* Product Image */}
                            <div className="aspect-square w-full bg-gray-50 rounded-xl overflow-hidden mb-3">
                                <img
                                    src={mainImage}
                                    alt={product.name}
                                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                                />
                            </div>

                            {/* Sale Badge */}
                            {hasDiscount && (
                                <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-md shadow-sm">
                                    OFFER
                                </span>
                            )}
                        </div>

                        {/* Product Info */}
                        <div>
                            <p className="text-[11px] font-semibold text-indigo-600 uppercase tracking-wider mb-1 truncate">
                                {product.category?.name || "Fashion"}
                            </p>
                            <h3 className="text-xs sm:text-sm font-bold text-gray-800 line-clamp-1 mb-1 group-hover:text-indigo-600 transition-colors">
                                {product.name}
                            </h3>
                            <h3 className="text-xs sm:text-sm font-bold text-gray-800 line-clamp-1 mb-1 group-hover:text-indigo-600 transition-colors">
                                {product.sku}
                            </h3>

                            {/* Pricing */}
                            <div className="flex items-baseline space-x-2 mb-3">
                                <span className="text-sm sm:text-base font-extrabold text-gray-900">
                                    ৳{currentPrice}
                                </span>
                                {hasDiscount && (
                                    <span className="text-xs text-gray-400 line-through">
                                        ৳{product.price}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Dynamic Action Button Route */}
                        <Link
                            to={`/product/${product.slug || product._id}`}
                            className="w-full text-center px-3.5 py-2 bg-black text-white text-xs font-semibold rounded-lg hover:bg-indigo-600 active:scale-95 transition-all duration-200 block shadow-sm"
                        >
                            View
                        </Link>
                    </div>
                );
            })}
        </div>
    );
};

const Home = () => {
    // ----------------------------------------------------
    // State Management for Dynamic Sections
    // ----------------------------------------------------
    const [newArrivals, setNewArrivals] = useState([]);
    const [featuredProducts, setFeaturedProducts] = useState([]);
    const [onSaleProducts, setOnSaleProducts] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // ----------------------------------------------------
    // Fetch API Data Based on Database Schema Flags
    // ----------------------------------------------------
    useEffect(() => {
        const fetchHomeData = async () => {
            setLoading(true);
            setError(null);

            try {
                // Promise.all দিয়ে ৩টি API কল একসাথে প্রসেস করা
                const [newArrivalRes, featuredRes, onSaleRes] = await Promise.all([
                    axios.get(`${BASE_URL}/products?isNewArrival=true&limit=8`),
                    axios.get(`${BASE_URL}/products?isFeatured=true&limit=8`),
                    axios.get(`${BASE_URL}/products?isOnSale=true&limit=8`)
                ]);

                setNewArrivals(newArrivalRes.data?.data || []);
                setFeaturedProducts(featuredRes.data?.data || []);
                setOnSaleProducts(onSaleRes.data?.data || []);

            } catch (err) {
                console.error("Error fetching homepage data:", err);
                setError("হোমপেজের ডাটা লোড করতে সমস্যা হয়েছে। দয়া করে পেজটি রিফ্রেশ করুন।");
            } finally {
                setLoading(false);
            }
        };

        fetchHomeData();
    }, []);

    return (
        <main className="min-h-screen bg-gray-50/50 pb-12">

            {/* Top Category List */}

            {/* Main Hero Banner */}
            <Hero />

            {/* Error State */}
            {error ? (
                <div className="max-w-7xl mx-auto px-4 py-12 text-center">
                    <div className="bg-red-50 border border-red-200 text-red-600 rounded-2xl p-6">
                        <p className="font-medium">{error}</p>
                    </div>
                </div>
            ) : (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 mt-8">

                    {/* 1. New Arrivals Section */}
                    <section>
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center space-x-2">
                                <Sparkles className="w-5 h-5 text-indigo-600" />
                                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">New Arrivals</h2>
                            </div>
                            <Link to="/category/office-collection" className="text-xs sm:text-sm font-semibold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1">
                                <span>See All</span>
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                        {loading ? <ProductSkeleton /> : <ProductGrid products={newArrivals} />}
                    </section>

                    {/* 2. Featured Products Section */}
                    <section>
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center space-x-2">
                                <Flame className="w-5 h-5 text-amber-500" />
                                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Featured Products</h2>
                            </div>
                            <Link to="/category/office-collection" className="text-xs sm:text-sm font-semibold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1">
                                <span>See All</span>
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                        {loading ? <ProductSkeleton /> : <ProductGrid products={featuredProducts} />}
                    </section>

                    {/* 3. On Sale Section */}
                    <section className="bg-red-50/40 p-4 sm:p-6 rounded-3xl border border-red-100">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center space-x-2">
                                <Tag className="w-5 h-5 text-red-500" />
                                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Special Discount</h2>
                            </div>
                            <Link to="/category/office-collection" className="text-xs sm:text-sm font-semibold text-red-600 hover:text-red-800 flex items-center space-x-1">
                                <span>See All</span>
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                        {loading ? <ProductSkeleton /> : <ProductGrid products={onSaleProducts} />}
                    </section>

                </div>
            )}

            {/* Customer Reviews/Testimonials */}
            <div className="mt-16">
                <ReviewCarousel />
            </div>
            <div className="mt-16">
                <PublicCoupon />
            </div>

        </main>
    );
};

export default Home;