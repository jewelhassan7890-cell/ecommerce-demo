import React, { useState } from 'react';
import axios from 'axios';

import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Camera, ArrowRight } from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../firebase/firebase';

import { useAuth } from '../hooks/useAuth';

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const Register = () => {
    const navigate = useNavigate();
    const { saveAuthData } = useAuth();

    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const [profilePic, setProfilpic] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState("");

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfilpic(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const data = new FormData();
        data.append('name', formData.name);
        data.append('email', formData.email);
        data.append('password', formData.password);
        if (profilePic) {
            // ব্যাকএন্ডে ফিল্ডের নাম profilePic দেওয়া আছে
            data.append('profilePic', profilePic);
        }

        try {
            // সরাসরি Axios পোস্ট অথবা আপনার API হেলপার
            const res = await axios.post(`${BASE_URL}/auth/register`, data, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            // ব্যাকএন্ড থেকে আসা রেসপন্স স্ট্রাকচার অনুযায়ী ডাটা সেভ
            const userData = res.data.data;
            saveAuthData(userData.token, userData);

            navigate('/profile');
        } catch (err) {
            setError(err.response?.data?.message || 'নিবন্ধন ব্যর্থ হয়েছে! আবার চেষ্টা করুন।');
        } finally {
            setLoading(false);
        }
    };

    // গুগল দিয়ে সাইন-আপ করার ফাংশন
    const handleGoogleSignIn = async () => {
        setGoogleLoading(true);
        setError('');
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;

            // Send Google user data to backend
            const res = await axios.post(
                `${BASE_URL}/api/v1/auth/google`,
                {
                    email: user.email,
                    name: user.displayName,
                    googlePhotoUrl: user.photoURL,
                },
                { withCredentials: true }
            );

            const userData = res.data.data;

            // saveAuthData মেথডের মাধ্যমে স্টেট ও লোকালস্টোরেজ আপডেট
            saveAuthData(userData.token, userData);

            setSuccess("Google Sign-In successful! Welcome " + userData.name);
            navigate('/profile');
        } catch (err) {
            setError(err.response?.data?.message || "Google Sign-In failed!");
        } finally {
            setGoogleLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-6 sm:p-8 space-y-6 border border-slate-100">

                {/* হেডার */}
                <div className="text-center space-y-2">
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">একাউন্ট তৈরি করুন</h2>
                    <p className="text-sm text-slate-500">আমাদের ই-কমার্স শপে আপনাকে স্বাগতম</p>
                </div>

                {error && <div className="mt-4 p-3 bg-red-100 text-red-700 text-sm rounded-md">{error}</div>}
                {success && <div className="mt-4 p-3 bg-green-100 text-green-700 text-sm rounded-md">{success}</div>}

                {/* ফর্ম */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* প্রোফাইল পিকচার আপলোড */}
                    <div className="flex flex-col items-center justify-center space-y-2">
                        <div className="relative w-24 h-24 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden hover:border-indigo-500 transition-all group">
                            {preview ? (
                                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                                <Camera className="w-8 h-8 text-slate-400 group-hover:scale-110 transition-transform" />
                            )}
                            <input
                                type="file"
                                name="profilpic"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                        </div>
                        <span className="text-xs text-slate-500">ছবি আপলোড করুন (ঐচ্ছিক)</span>
                    </div>

                    {/* নাম ইনপুট */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">নাম</label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="text"
                                name="name"
                                required
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="যেমন: সাকিব আল হাসান"
                                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm transition-all"
                            />
                        </div>
                    </div>

                    {/* ইমেইল ইনপুট */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">ইমেইল</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="email"
                                name="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="yourname@example.com"
                                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm transition-all"
                            />
                        </div>
                    </div>

                    {/* পাসওয়ার্ড ইনপুট */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">পাসওয়ার্ড</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="password"
                                name="password"
                                required
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="••••••••"
                                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm transition-all"
                            />
                        </div>
                    </div>

                    {/* সাবমিট বাটন */}
                    <button
                        type="submit"
                        disabled={loading || googleLoading}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center space-x-2 shadow-md hover:shadow-lg disabled:opacity-50"
                    >
                        <span>{loading ? 'প্রসেসিং হচ্ছে...' : 'সাইন আপ করুন'}</span>
                        {!loading && <ArrowRight className="w-5 h-5" />}
                    </button>
                </form>

                {/* Divider/বিভাজক */}
                <div className="relative flex items-center justify-center my-4">
                    <div className="border-t border-slate-200 w-full"></div>
                    <span className="bg-white px-3 text-xs text-slate-500 uppercase font-medium absolute">অথবা</span>
                </div>

                {/* Google Sign-up Button */}
                <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={loading || googleLoading}
                    className="w-full bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-semibold py-2.5 px-4 rounded-xl transition-all flex items-center justify-center space-x-3 shadow-sm hover:shadow active:scale-[0.99] disabled:opacity-50"
                >
                    <FcGoogle className="w-6 h-6" />
                    <span className="text-sm">
                        {googleLoading ? 'গুগল কানেক্ট হচ্ছে...' : 'Google দিয়ে সাইন আপ করুন'}
                    </span>
                </button>

                {/* লগইন লিংক */}
                <p className="text-center text-sm text-slate-600">
                    ইতিমধ্যেই একাউন্ট আছে?{' '}
                    <Link to="/login" className="font-semibold text-indigo-600 hover:underline">
                        লগইন করুন
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Register;