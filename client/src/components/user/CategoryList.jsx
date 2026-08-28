import React, { useEffect, useState } from 'react';
import { getPublicCategories } from '../../api/categoryApi';
import { Link, useLocation } from "react-router-dom";


const CategoryList = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');


    const location = useLocation();

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const res = await getPublicCategories();
            if (res?.success) {
                // ডাটা যাতে অ্যারে নিশ্চিত থাকে
                setCategories(Array.isArray(res.data) ? res.data : []);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load categories');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="bg-[#111625] py-4 text-center text-gray-400 text-sm animate-pulse">
                Loading categories...
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-[#111625] py-4 text-center text-red-400 text-sm">
                {error}
            </div>
        );
    }



    return (
        <nav className="bg-[#111625] text-white border-b border-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Horizontal scrollbar for mobile, centered for desktop */}
                <div className="flex items-center justify-start md:justify-center space-x-2 sm:space-x-4 overflow-x-auto py-3 no-scrollbar scroll-smooth">

                    {categories.map((cat) => {
                        const isSpecial = cat.slug?.includes('offer') || cat.name?.toLowerCase().includes('special');
                        const targetPath = `/category/${cat.slug}`;
                        const isActive = location.pathname === targetPath;

                        return (
                            <Link
                                key={cat._id || cat.id || cat.slug}
                                to={targetPath}
                                className={`whitespace-nowrap px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 flex items-center space-x-1.5 shrink-0 ${isSpecial
                                    ? 'bg-[#FFC700] text-black hover:bg-[#e6b300] font-bold shadow-md transform hover:scale-105'
                                    : isActive
                                        ? 'bg-white/20 text-white font-semibold'
                                        : 'text-gray-200 hover:text-white hover:bg-white/10'
                                    }`}
                            >
                                <span>{cat.name}</span>

                                {/* যদি বিশেষ অফার হয় তবে একটি বিজলি (Lightning) আইকন দেখানো হবে */}
                                {isSpecial && (
                                    <svg
                                        className="w-4 h-4 fill-current text-black inline-block"
                                        viewBox="0 0 24 24"
                                    >
                                        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                                    </svg>
                                )}
                            </Link>
                        );
                    })}

                    {/* Customer Request Link */}
                    <Link
                        to="/restock"
                        className="whitespace-nowrap px-4 py-2 text-xs sm:text-sm font-medium text-white hover:text-yellow-400 transition-colors duration-200 shrink-0"
                    >
                        Customer Request
                    </Link>

                    <Link
                        to="/orders"
                        className="whitespace-nowrap px-4 py-2 text-xs sm:text-sm font-medium text-white hover:text-yellow-400 transition-colors duration-200 shrink-0"
                    >
                        My orders
                    </Link>
                </div>
            </div>

            {/* Custom CSS to hide scrollbar while keeping scroll functionality */}
            <style>{`
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .no-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </nav>
    );
};

export default CategoryList;