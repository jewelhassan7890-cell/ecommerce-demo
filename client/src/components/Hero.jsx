import React, { useEffect, useState } from 'react';
import axios from 'axios';
import heroImageFallback from "../assets/hero-banner.png"; // ব্যাকএন্ডে ছবি না থাকলে এটি দেখাবে
import { Link } from "react-router-dom";

// Vite Environment Variable থেকে Base URL পড়া হচ্ছে
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Hero = () => {
    // ব্যাকএন্ড থেকে ডাটা লোড করার স্টেট (ডিফল্ট ডাটা দেওয়া আছে যাতে API লোড হওয়ার আগেও ডিজাইন ঠিক থাকে)
    const [heroData, setHeroData] = useState({
        badgeText: "Trusted by 35,000+ Customers",
        subHeading: "Style & Closet এ অর্ডার করুন",
        mainHeading: "একেবারেই নিশ্চিন্তে",
        discountBadge: {
            tag: "New Arrival",
            discountText: "30% OFF"
        },
        bannerImage: {
            url: ""
        },
        features: [
            { icon: "👁️", text: "ডেলিভারি ম্যান এর সামনে ড্রেস দেখবেন", bgColor: "bg-orange-100" },
            { icon: "✅", text: "ড্রেস পছন্দ হলে পেমেন্ট করবেন", bgColor: "bg-green-100" },
            { icon: "↩️", text: "না হলে কুরিয়ার ফি দিয়ে রিটার্ন করবেন", bgColor: "bg-blue-100" },
            { icon: "🔄", text: "যে কোন সমস্যায় ৩ দিনের মধ্যে এক্সচেঞ্জ", bgColor: "bg-sky-100" }
        ]
    });

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchHeroConfig();
    }, []);

    const fetchHeroConfig = async () => {
        try {
            // dynamic VITE_API_URL ব্যবহার করে endpoint এ কল করা হচ্ছে
            const response = await axios.get(`${API_URL}/hero`);
            if (response.data?.success && response.data?.data) {
                setHeroData(response.data.data);
            }
        } catch (error) {
            console.error("Hero Config fetch error:", error);
            // এরর হলেও ডিফল্ট স্টেট এর ডাটা ফ্রেমে বজায় থাকবে
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="bg-[#f8f6f3]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">

                <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-10">

                    {/* Left Side */}
                    <div className="relative order-2 lg:order-1">

                        <div className="overflow-hidden rounded-3xl shadow-xl">
                            <img
                                src={heroData.bannerImage?.url || heroImageFallback}
                                alt="Summer Collection"
                                className="w-full h-[420px] sm:h-[520px] lg:h-[650px] object-cover"
                            />
                        </div>

                        {/* Discount Badge */}
                        <div className="absolute top-6 left-6 bg-[#1b2a57] text-white px-5 py-3 rounded-xl shadow-lg">
                            <p className="text-xs uppercase tracking-[3px]">
                                {heroData.discountBadge?.tag || "New Arrival"}
                            </p>

                            <h3 className="text-2xl font-bold">
                                {heroData.discountBadge?.discountText || "30% OFF"}
                            </h3>
                        </div>

                    </div>

                    {/* Right Side */}
                    <div className="order-1 lg:order-2 w-full">

                        {/* Trusted Badge */}
                        <div className="inline-flex items-center gap-2 bg-[#FFE9A8] px-5 py-2 rounded-full shadow-sm">
                            <span className="text-yellow-600 text-lg">⭐</span>

                            <p className="text-xs sm:text-sm font-bold uppercase tracking-wide text-[#6B4A00]">
                                {heroData.badgeText}
                            </p>
                        </div>

                        {/* Heading */}
                        <div className="mt-7">
                            <h3 className="text-2xl sm:text-3xl text-gray-500 font-medium">
                                {heroData.subHeading}
                            </h3>

                            <h1 className="mt-2 text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight text-[#00A76F]">
                                {heroData.mainHeading}
                            </h1>
                        </div>

                        {/* Feature Box (Dynamic Loop from API) */}
                        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-5">
                            {heroData.features?.map((feature, index) => (
                                <div
                                    key={index}
                                    className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white px-5 py-5 shadow-sm hover:shadow-lg transition"
                                >
                                    <div className={`h-11 w-11 rounded-lg ${feature.bgColor || 'bg-green-100'} flex items-center justify-center text-xl shrink-0`}>
                                        {feature.icon}
                                    </div>

                                    <p className="text-gray-700 text-sm sm:text-base font-medium leading-6">
                                        {feature.text}
                                    </p>
                                </div>
                            ))}
                        </div>

                        {/* Button */}
                        <div className="mt-10">
                            <button className="group bg-[#16213E] hover:bg-[#0F172A] text-white rounded-2xl px-10 py-5 text-lg font-semibold shadow-xl transition-all duration-300 flex items-center gap-3">
                                <Link to="/shop">Start Shopping</Link>
                                <span className="group-hover:translate-x-2 transition">
                                    →
                                </span>
                            </button>
                        </div>

                    </div>

                </div>

            </div>
        </section>
    );
};

export default Hero;