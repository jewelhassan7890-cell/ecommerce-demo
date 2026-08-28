import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AdminProtect = ({ children }) => {
    const navigate = useNavigate();

    // ১. আপনার Auth State বা LocalStorage থেকে ইউজার ও রোল বের করুন
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    // ইউজার অ্যাডমিন কি না চেক করা (আপনার ব্যাকএন্ড অনুযায়ী role এর নাম মেলাবেন)
    const isAdmin = token && (user?.role === "admin" || user?.isAdmin === true);

    // ২. কাউন্টডাউন টাইমার স্টেট (১২০ সেকেন্ড = ২ মিনিট)
    const [timeLeft, setTimeLeft] = useState(120);

    useEffect(() => {
        // ইউজার যদি অ্যাডমিন না হয়, তবেই টাইমার চালু হবে
        if (!isAdmin) {
            // প্রতি ১ সেকেন্ড পরপর টাইমার কমবে
            const timer = setInterval(() => {
                setTimeLeft((prevTime) => {
                    if (prevTime <= 1) {
                        clearInterval(timer);
                        navigate("/", { replace: true }); // ২ মিনিট শেষে হোমপেজে পাঠাবে
                        return 0;
                    }
                    return prevTime - 1;
                });
            }, 1000);

            // কম্পোনেন্ট আনমাউন্ট হলে টাইমার ক্লিয়ার করবে
            return () => clearInterval(timer);
        }
    }, [isAdmin, navigate]);

    // ৩. সেকেন্ডকে মিনিট এবং সেকেন্ড ফরম্যাটে রূপান্তর করার ফাংশন (MM:SS)
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
    };

    // ৪. যদি ইউজার অ্যাডমিন হয়, তবে কাঙ্ক্ষিত পেজটি (children) রেন্ডার হবে
    if (isAdmin) {
        return children;
    }

    // ৫. অ্যাডমিন না হলে "Access Denied" UI দেখানো হবে
    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            <div className="bg-white max-w-md w-full rounded-2xl shadow-xl p-8 text-center space-y-6 border border-gray-100">

                {/* Warning Icon */}
                <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
                    <svg
                        className="w-10 h-10"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        ></path>
                    </svg>
                </div>

                {/* Message */}
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Only Admin Access</h2>
                    <p className="text-sm text-gray-500 mt-2">
                        দুঃখিত! এই পেজটি শুধুমাত্র অ্যাডমিনদের জন্য সংরক্ষিত। আপনাকে ২ মিনিটের মধ্যে হোম পেজে পাঠিয়ে দেওয়া হবে।
                    </p>
                </div>

                {/* Countdown Timer Display */}
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                    <p className="text-xs text-red-600 uppercase font-bold tracking-wider mb-1">
                        Redirecting to Home in
                    </p>
                    <span className="text-3xl font-extrabold text-red-600 font-mono">
                        {formatTime(timeLeft)}
                    </span>
                </div>

                {/* Manual Home Button */}
                <button
                    onClick={() => navigate("/", { replace: true })}
                    className="w-full py-3 bg-gray-800 hover:bg-gray-900 text-white font-medium rounded-xl transition text-sm shadow-md"
                >
                    এখনই হোম পেজে যান
                </button>
            </div>
        </div>
    );
};

export default AdminProtect;