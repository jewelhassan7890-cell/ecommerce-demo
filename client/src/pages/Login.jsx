import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import axios from 'axios';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../firebase/firebase'; // আপনার ফায়ারবেস কনফিগ ফাইল
import { useAuth } from '../hooks/useAuth';

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const Login = () => {
    const navigate = useNavigate();
    const { saveAuthData } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [error, setError] = useState('');

    // ১. সাধারণ ইমেইল ও পাসওয়ার্ড দিয়ে লগইন
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await axios.post(`${BASE_URL}/auth/login`, { email, password });

            // ব্যাকএন্ডের Response: { success: true, data: { _id, name, email, profilePic, token } }
            if (res.data?.data) {
                const { token, ...userData } = res.data.data;
                saveAuthData(token, userData);
                navigate('/profile');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'ইমেইল অথবা পাসওয়ার্ড সঠিক নয়!');
        } finally {
            setLoading(false);
        }
    };

    // ২. গুগল সাইন-ইন (OAuth)
    const handleGoogleSignIn = async () => {
        setGoogleLoading(true);
        setError('');

        try {
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;

            const res = await axios.post(`${BASE_URL}/auth/google`, {
                name: user.displayName,
                email: user.email,
                googlePhotoUrl: user.photoURL,
            });

            if (res.data?.data) {
                const { token, ...userData } = res.data.data;
                saveAuthData(token, userData);
                navigate('/profile');
            }
        } catch (err) {
            console.error("Google Auth Error:", err);
            setError(err.response?.data?.message || 'গুগল দিয়ে সাইন-ইন করতে ব্যর্থ হয়েছে!');
        } finally {
            setGoogleLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50/50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
            <div className="max-w-md w-full bg-white rounded-3xl shadow-sm border border-slate-100 p-6 sm:p-8 space-y-6 relative overflow-hidden">

                {/* টপ ডেকোরেটিভ বার */}
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>

                {/* হেডার */}
                <div className="text-center space-y-1.5 pt-2">
                    <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">স্বাগতম!</h2>
                    <p className="text-sm text-slate-500">আপনার শপিং একাউন্টে লগইন করুন</p>
                </div>

                {/* এরর মেসেজ */}
                {error && (
                    <div className="bg-rose-50 border border-rose-100 text-rose-600 text-sm p-3.5 rounded-2xl text-center font-medium animate-fade-in">
                        {error}
                    </div>
                )}

                {/* গুগল সাইন-ইন বাটন */}
                <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={googleLoading || loading}
                    className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-50 text-slate-700 font-semibold py-3 px-4 rounded-2xl border border-slate-200 transition-all shadow-sm active:scale-98 disabled:opacity-70"
                >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    <span className="text-sm">{googleLoading ? 'গুগলে কানেক্ট হচ্ছে...' : 'Google দিয়ে চালিয়ে যান'}</span>
                </button>

                {/* ডিভাইডার */}
                <div className="relative flex items-center justify-center">
                    <div className="border-t border-slate-200 w-full"></div>
                    <span className="bg-white px-3 text-xs text-slate-400 font-medium uppercase absolute">অথবা</span>
                </div>

                {/* লগইন ফর্ম */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">ইমেইল ঠিকানা</label>
                        <div className="relative">
                            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="yourname@example.com"
                                className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-slate-800 text-sm transition-all"
                            />
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-1.5">
                            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">পাসওয়ার্ড</label>
                            <Link to="/forgot-password" className="text-xs font-semibold text-indigo-600 hover:underline">পাসওয়ার্ড ভুলে গেছেন?</Link>
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type={showPassword ? "text" : "password"}
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full pl-11 pr-11 py-3 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-slate-800 text-sm transition-all"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading || googleLoading}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3.5 rounded-2xl transition-all shadow-md shadow-indigo-100 flex items-center justify-center gap-2 text-sm active:scale-98 disabled:opacity-70 mt-2"
                    >
                        <span>{loading ? 'প্রবেশ করা হচ্ছে...' : 'লগইন করুন'}</span>
                        {!loading && <ArrowRight className="w-4 h-4" />}
                    </button>
                </form>

                {/* রেজিস্টার লিঙ্ক */}
                <p className="text-center text-sm text-slate-600 pt-2">
                    নতুন একাউন্ট খুলতে চান?{' '}
                    <Link to="/register" className="font-semibold text-indigo-600 hover:underline">
                        নিবন্ধন করুন
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Login;