import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    Mail, ShieldCheck, ShoppingBag, LogOut,
    ChevronRight, PackageCheck,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

// ব্যাকএন্ডের মূল URL (লোকাল ফাইল আপলোডের ক্ষেত্রে প্রয়োজন)
const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:5000";

const Profile = () => {
    const navigate = useNavigate();
    const { user, logout, loading } = useAuth();

    // ১. ইনফিনিট রিডাইরেক্ট বাগ ফিক্স (useEffect-এর মাধ্যমে রিডাইরেক্ট)
    useEffect(() => {
        if (!loading && !user) {
            navigate('/login');
        }
    }, [user, loading, navigate]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // // ২. MongoDB Document (Cloudinary / Local / Google) থেকে ছবি প্রসেস করার ফাংশন



    const getProfileImageUrl = () => {
        // ১. ইউজার না থাকলে সরাসরি null রিটার্ন (src="" বা অতিরিক্ত রেন্ডার এড়াতে)
        if (!user) return null;

        let picUrl = null;

        // ২. profilePic অবজেক্ট নাকি স্ট্রিং তা চেক করা
        if (typeof user?.profilePic === 'object' && user?.profilePic !== null) {
            picUrl = user.profilePic.url;
        } else if (typeof user?.profilePic === 'string') {
            picUrl = user.profilePic;
        }

        if (picUrl) {
            // ৩. Windows path সমস্যা সমাধানের জন্য ব্যাকস্ল্যাশকে ফরওয়ার্ড স্ল্যাশে রূপান্তর
            const normalizedPath = picUrl.replace(/\\/g, '/');

            // ৪. Cloudinary / Google OAuth / External HTTP-HTTPS URL
            if (normalizedPath.startsWith('http://') || normalizedPath.startsWith('https://')) {
                return normalizedPath;
            }

            // ৫. Multer/Local Storage এর সার্ভার ইউআরএল ক্লিনআপ
            const cleanServerUrl = (SERVER_URL || 'http://localhost:5000').replace(/\/$/, '');
            const cleanPath = normalizedPath.startsWith('/') ? normalizedPath : `/${normalizedPath}`;
            return `${cleanServerUrl}${cleanPath}`;
        }

        // ৬. কোনো ছবি না থাকলে ডাইনামিক ইউজার অবতার
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "User")}&background=6366f1&color=fff&bold=true`;
    };

    console.log(user, "hello mahin")

    // লোডিং অবস্থায় স্পিনার
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-indigo-600 border-t-transparent"></div>
            </div>
        );
    }

    // ইউজার না থাকলে রেন্ডার বন্ধ রাখা (useEffect রিডাইরেক্ট করবে)
    if (!user) {
        return null;
    }

    const profileImageUrl = getProfileImageUrl();

    return (
        <div className="min-h-screen bg-slate-50/50 py-6 sm:py-10 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto space-y-6">

                {/* Profile Header Card */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>

                    <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left w-full md:w-auto">
                        <div className="relative group">
                            <img
                                src={profileImageUrl}
                                alt={user?.name || "Profile"}
                                onError={(e) => {
                                    e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "User")}&background=6366f1&color=fff&bold=true`;
                                }}
                                className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-slate-50 shadow-md ring-2 ring-indigo-500/20"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">{user?.name}</h1>
                                {user?.isAdmin && (
                                    <span className="bg-amber-100 text-amber-800 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 border border-amber-200">
                                        <ShieldCheck className="w-3.5 h-3.5" /> Admin
                                    </span>
                                )}
                            </div>
                            <p className="text-sm text-slate-500 flex items-center justify-center sm:justify-start gap-1.5">
                                <Mail className="w-4 h-4 text-slate-400" /> {user?.email}
                            </p>
                            <div className="pt-1 flex items-center justify-center sm:justify-start gap-2">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                                    Verified Customer
                                </span>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="w-full md:w-auto flex items-center justify-center gap-2 bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-100 px-5 py-2.5 rounded-2xl text-sm font-semibold transition-all active:scale-95"
                    >
                        <LogOut className="w-4 h-4" /> লগআউট
                    </button>
                </div>

                {/* Dashboard Options Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

                    {/* Orders */}
                    <Link to="/orders" className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-indigo-500/50 transition-all group flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl group-hover:scale-110 transition-transform">
                                <ShoppingBag className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-slate-900">আমার অর্ডারস</h3>
                                <p className="text-xs text-slate-500">অর্ডার ট্র্যাকিং ও হিস্ট্রি</p>
                            </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 transition-transform" />
                    </Link>









                    {/* Admin Dashboard (Only visible if Admin) */}
                    {user?.isAdmin && (
                        <Link to="/admin/categories" className="bg-indigo-600 p-5 rounded-2xl shadow-sm hover:shadow-md hover:bg-indigo-700 transition-all group flex items-center justify-between text-white">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-white/10 rounded-xl group-hover:scale-110 transition-transform">
                                    <PackageCheck className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-white">এডমিন প্যানেল</h3>
                                    <p className="text-xs text-indigo-100">প্রোডাক্ট ও অর্ডার ম্যানেজমেন্ট</p>
                                </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-indigo-200 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    )}

                </div>

            </div>
        </div>
    );
};

export default Profile;