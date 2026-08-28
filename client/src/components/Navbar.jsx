// import React, { useState, useRef, useEffect } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import axios from "axios";
// import { useAuth } from "../hooks/useAuth";
// import {
//     FiSearch,
//     FiShoppingCart,
//     FiMenu,
//     FiX,
//     FiUser,
//     FiLogOut,
//     FiPackage,
//     FiLayout,
// } from "react-icons/fi"; // maintaining react-icons/fi
// import { useCart } from "../context/CartContext";

// import logo from "../assets/logo.jpg.jpeg";

// const SERVER_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

// const Navbar = () => {
//     const [mobileOpen, setMobileOpen] = useState(false);
//     const [profileOpen, setProfileOpen] = useState(false);
//     const [profileData, setProfileData] = useState(null);
//     const [imgError, setImgError] = useState(false);
//     const [searchQuery, setSearchQuery] = useState(""); // Search state added
//     const dropdownRef = useRef(null);
//     const navigate = useNavigate();

//     const [siteSettings, setSiteSettings] = useState(null);
//     const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

//     useEffect(() => {
//         const fetchSiteSettings = async () => {
//             try {
//                 const res = await axios.get(`${SERVER_URL}/site`);
//                 if (res.data?.success && res.data?.data) {
//                     setSiteSettings(res.data.data);

//                     // Favicon ডায়নামিক্যালি সেট করা (যদি ব্যাকএন্ডে থাকে)
//                     if (res.data.data.favicon?.url) {
//                         let link = document.querySelector("link[rel*='icon']");
//                         if (!link) {
//                             link = document.createElement("link");
//                             link.rel = "shortcut icon";
//                             document.getElementsByTagName("head")[0].appendChild(link);
//                         }
//                         link.href = res.data.data.favicon.url;
//                     }
//                 }
//             } catch (error) {
//                 console.error("Error loading site settings:", error);
//             }
//         };

//         fetchSiteSettings();
//     }, []);

//     const { cart } = useCart();

//     // safe fallbacks
//     const displayCount = cart?.totalItems || 0;

//     console.log(displayCount, "hello jewel");

//     const { user: authUser, logout, loading } = useAuth();

//     // User object (Auth Context or Local Profile State)
//     const user = profileData || authUser;
//     const isAuthenticated = Boolean(user);

//     // Close dropdown on outside click
//     useEffect(() => {
//         const handleClickOutside = (event) => {
//             if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
//                 setProfileOpen(false);
//             }
//         };
//         document.addEventListener("mousedown", handleClickOutside);
//         return () => document.removeEventListener("mousedown", handleClickOutside);
//     }, []);

//     const handleLogout = () => {
//         setProfileOpen(false);
//         setProfileData(null);
//         logout();
//         navigate("/login");
//     };

//     // Search execute function
//     const handleSearch = (e) => {
//         if (e) e.preventDefault();
//         if (searchQuery.trim()) {
//             navigate(`/category/${encodeURIComponent(searchQuery.trim())}`);
//             setMobileOpen(false);
//         }
//     };

//     const handleKeyDown = (e) => {
//         if (e.key === "Enter") {
//             handleSearch(e);
//         }
//     };

//     // Fetch logged-in user profile


//     useEffect(() => {
//         const fetchProfile = async () => {
//             const token = localStorage.getItem("token");
//             if (!token) return;

//             try {
//                 const res = await axios.get(`${SERVER_URL}/auth/profile`, {
//                     headers: { Authorization: `Bearer ${token}` },
//                 });

//                 // ✅ Response wrapper চেক (res.data.user নাকি res.data.data নাকি সরাসরি res.data)
//                 const extractedUser = res.data?.user || res.data?.data || res.data;

//                 setProfileData(extractedUser);
//                 setImgError(false); // ডাটা রিফ্রেশ হলে ইমেজ এরর রিসেট
//             } catch (error) {
//                 console.error("Error fetching profile:", error);
//             }
//         };

//         fetchProfile();
//     }, [SERVER_URL]);

//     // প্রোফাইল পিকচারের নিরাপদ URL প্রসেসিং ফাংশন
//     const getProfileImageUrl = (userData) => {
//         if (!userData) return null;

//         // ১. profilePic ফিল্ড চেক (অবজেক্ট, স্ট্রিং বা নেস্টেড অবজেক্ট)
//         const rawPic = userData.profilePic || userData.profilpic;

//         let picUrl = null;
//         if (typeof rawPic === 'object' && rawPic !== null) {
//             picUrl = rawPic.url || rawPic.path;
//         } else if (typeof rawPic === 'string') {
//             picUrl = rawPic;
//         }

//         if (picUrl) {
//             // Windows Backslash Fix
//             const normalizedPath = picUrl.replace(/\\/g, '/');

//             // Cloudinary বা External HTTP/HTTPS URL হলে সরাসরি রিটার্ন
//             if (normalizedPath.startsWith('http://') || normalizedPath.startsWith('https://')) {
//                 return normalizedPath;
//             }

//             // Local Server Storage (Multer) handling
//             let baseUrl;
//             try {
//                 baseUrl = new URL(SERVER_URL).origin;
//             } catch (e) {
//                 console.log(e, "hello japan")

//                 baseUrl = 'http://localhost:5000';
//             }

//             const cleanPath = normalizedPath.startsWith('/') ? normalizedPath : `/${normalizedPath}`;
//             return `${baseUrl}${cleanPath}`;
//         }

//         // কোনো ছবি না থাকলে Fallback UI Avatar
//         return `https://ui-avatars.com/api/?name=${encodeURIComponent(userData?.name || "User")}&background=6366f1&color=fff&bold=true`;
//     };

//     const userImageUrl = getProfileImageUrl(user);
//     return (
//         <header className="sticky top-0 z-50 bg-white shadow-md">
//             <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//                 <div className="flex items-center justify-between h-20 lg:h-24">

//                     {/* Logo */}
//                     <Link to="/" className="flex items-center flex-shrink-0">
//                         <div className="flex items-center gap-3 bg-[#1b2a57] rounded-xl px-3 py-2 shadow-lg">
//                             <img
//                                 src={logo}
//                                 alt="Style & Closet"
//                                 className="h-12 w-12 sm:h-14 sm:w-14 lg:h-16 lg:w-16 rounded-md object-cover bg-white p-1"
//                             />
//                             <div>
//                                 <h1 className="text-lg sm:text-xl lg:text-2xl font-bold leading-none text-white">
//                                     Style & Closet
//                                 </h1>
//                                 <p className="mt-1 text-[9px] sm:text-[10px] uppercase tracking-[3px] text-gray-300">
//                                     Evergreen Forever
//                                 </p>
//                             </div>
//                         </div>
//                     </Link>

//                     {/* Desktop Nav */}
//                     <nav className="hidden lg:flex items-center gap-8 font-medium text-gray-700">
//                         <Link to="/" className="hover:text-[#1b2a57] transition duration-300">
//                             Home
//                         </Link>
//                         <Link to="/shop" className="hover:text-[#1b2a57] transition duration-300">
//                             Shop
//                         </Link>
//                         <Link to="/contact" className="hover:text-[#1b2a57] transition duration-300">
//                             Contact
//                         </Link>
//                         <Link to="/report-issue" className="hover:text-[#1b2a57] transition duration-300">
//                             Report/Issue
//                         </Link>
//                         <Link to="/faq" className="hover:text-[#1b2a57] transition duration-300">
//                             FAQs
//                         </Link>
//                     </nav>

//                     {/* Search, Cart & Profile */}
//                     <div className="hidden lg:flex items-center gap-2">
//                         <form onSubmit={handleSearch} className="relative">
//                             <input
//                                 type="text"
//                                 value={searchQuery}
//                                 onChange={(e) => setSearchQuery(e.target.value)}
//                                 onKeyDown={handleKeyDown}
//                                 placeholder="Search products..."
//                                 className="w-72 xl:w-80 rounded-full border border-gray-300 bg-gray-50 py-3 pl-5 pr-12 text-sm outline-none transition-all duration-300 focus:border-[#1b2a57] focus:ring-2 focus:ring-[#1b2a57]/20"
//                             />
//                             <button
//                                 type="submit"
//                                 aria-label="Search"
//                                 className="absolute right-5 top-1/2 -translate-y-1/2 text-lg text-gray-500 hover:text-[#1b2a57] transition"
//                             >
//                                 <FiSearch />
//                             </button>
//                         </form>

//                         <Link
//                             to="/cart"
//                             className="relative inline-flex items-center justify-center p-2 text-gray-700 hover:text-indigo-600 transition-colors"
//                         >
//                             <FiShoppingCart className="text-2xl" />

//                             {/* ডাইনামিক কার্ট ব্যাজ */}
//                             {displayCount > 0 && (
//                                 <span className="absolute -top-1 -right-1.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-600 px-1 text-[11px] font-bold text-white leading-none shadow-md z-20 select-none">
//                                     {displayCount > 99 ? "99+" : displayCount}
//                                 </span>
//                             )}
//                         </Link>

//                         {loading ? (
//                             <div className="h-10 w-28 animate-pulse rounded-lg bg-gray-200" />
//                         ) : isAuthenticated ? (
//                             <div className="relative" ref={dropdownRef}>
//                                 <button
//                                     onClick={() => setProfileOpen(!profileOpen)}
//                                     className="flex items-center gap-2 rounded-full border border-gray-300 px-3 py-1.5 hover:bg-gray-100 transition"
//                                 >
//                                     {userImageUrl && !imgError ? (
//                                         <img
//                                             src={userImageUrl}
//                                             alt={user?.name || "Profile"}
//                                             className="w-10 h-10 rounded-full object-cover border-2 border-[#1b2a57] cursor-pointer hover:scale-105 transition"
//                                             onError={() => setImgError(true)}
//                                         />
//                                     ) : (
//                                         <div className="h-8 w-8 rounded-full bg-[#1b2a57] text-white flex items-center justify-center font-bold text-sm">
//                                             {user?.name ? user.name.charAt(0).toUpperCase() : <FiUser />}
//                                         </div>
//                                     )}
//                                     <span className="font-medium text-gray-800">{user?.name || "User"}</span>
//                                 </button>

//                                 {profileOpen && (
//                                     <div className="absolute right-0 mt-3 w-60 rounded-xl border bg-white shadow-xl py-2 z-50">
//                                         <div className="border-b px-4 py-3">
//                                             <h3 className="font-semibold text-gray-800">{user?.name}</h3>
//                                             <p className="text-sm text-gray-500 truncate">{user?.email}</p>
//                                         </div>

//                                         <Link
//                                             to="/profile"
//                                             onClick={() => setProfileOpen(false)}
//                                             className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition"
//                                         >
//                                             <FiUser />
//                                             My Profile
//                                         </Link>

//                                         <Link
//                                             to="/orders"
//                                             onClick={() => setProfileOpen(false)}
//                                             className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition"
//                                         >
//                                             <FiPackage />
//                                             My Orders
//                                         </Link>

//                                         {user?.isAdmin && (
//                                             <Link
//                                                 to="/admin"
//                                                 onClick={() => setProfileOpen(false)}
//                                                 className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition"
//                                             >
//                                                 <FiLayout />
//                                                 Dashboard
//                                             </Link>
//                                         )}

//                                         <button
//                                             onClick={handleLogout}
//                                             className="flex w-full items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 transition"
//                                         >
//                                             <FiLogOut />
//                                             Logout
//                                         </button>
//                                     </div>
//                                 )}
//                             </div>
//                         ) : (
//                             <div className="flex items-center gap-3">
//                                 <Link
//                                     to="/login"
//                                     className="rounded-lg border border-[#1b2a57] px-5 py-2 font-medium text-[#1b2a57] transition hover:bg-[#1b2a57] hover:text-[#1b2a57]"
//                                 >
//                                     Login
//                                 </Link>
//                                 <Link
//                                     to="/register"
//                                     className="rounded-lg bg-[#1b2a57] px-5 py-2 font-medium text-white transition hover:bg-[#162247]"
//                                 >
//                                     Register
//                                 </Link>
//                             </div>
//                         )}
//                     </div>

//                     {/* Mobile Menu Button */}
//                     <button
//                         onClick={() => setMobileOpen(!mobileOpen)}
//                         className="rounded-md p-2 text-2xl lg:hidden hover:bg-gray-100"
//                     >
//                         {mobileOpen ? <FiX /> : <FiMenu />}
//                     </button>
//                 </div>
//             </div>

//             {/* Mobile Menu */}
//             <div
//                 className={`overflow-hidden transition-all duration-300 lg:hidden ${mobileOpen ? "max-h-[600px]" : "max-h-0"
//                     }`}
//             >
//                 <div className="border-t bg-white px-5 py-5 shadow-md space-y-4">
//                     <form onSubmit={handleSearch} className="relative">
//                         <input
//                             type="text"
//                             value={searchQuery}
//                             onChange={(e) => setSearchQuery(e.target.value)}
//                             onKeyDown={handleKeyDown}
//                             placeholder="Search products..."
//                             className="w-full rounded-full border border-gray-300 py-3 pl-5 pr-12 outline-none focus:border-[#1b2a57]"
//                         />
//                         <button
//                             type="submit"
//                             aria-label="Search"
//                             className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#1b2a57]"
//                         >
//                             <FiSearch />
//                         </button>
//                     </form>

//                     <nav className="flex flex-col">
//                         <Link
//                             to="/"
//                             onClick={() => setMobileOpen(false)}
//                             className="border-b py-3 text-gray-700 hover:text-[#1b2a57]"
//                         >
//                             Home
//                         </Link>
//                         <Link
//                             to="/shop"
//                             onClick={() => setMobileOpen(false)}
//                             className="border-b py-3 text-gray-700 hover:text-[#1b2a57]"
//                         >
//                             Shop
//                         </Link>
//                         <Link
//                             to="/contact"
//                             onClick={() => setMobileOpen(false)}
//                             className="border-b py-3 text-gray-700 hover:text-[#1b2a57]"
//                         >
//                             Contact Us
//                         </Link>
//                         <Link
//                             to="/report-issue"
//                             onClick={() => setMobileOpen(false)}
//                             className="border-b py-3 text-gray-700 hover:text-[#1b2a57]"
//                         >
//                             Report an Issue
//                         </Link>
//                         <Link
//                             to="/faq"
//                             onClick={() => setMobileOpen(false)}
//                             className="border-b py-3 text-gray-700 hover:text-[#1b2a57]"
//                         >
//                             FAQs
//                         </Link>

//                         {isAuthenticated && (
//                             <>
//                                 <Link
//                                     to="/profile"
//                                     onClick={() => setMobileOpen(false)}
//                                     className="border-b py-3 text-gray-700 hover:text-[#1b2a57]"
//                                 >
//                                     My Profile
//                                 </Link>
//                                 <Link
//                                     to="/orders"
//                                     onClick={() => setMobileOpen(false)}
//                                     className="border-b py-3 text-gray-700 hover:text-[#1b2a57]"
//                                 >
//                                     My Orders
//                                 </Link>
//                                 {user?.isAdmin && (
//                                     <Link
//                                         to="/admin"
//                                         onClick={() => setMobileOpen(false)}
//                                         className="border-b py-3 text-gray-700 hover:text-[#1b2a57]"
//                                     >
//                                         Admin Dashboard
//                                     </Link>
//                                 )}
//                             </>
//                         )}
//                     </nav>

//                     <Link
//                         to="/cart"
//                         onClick={() => setMobileOpen(false)}
//                         className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#1b2a57] py-3 text-white transition hover:bg-[#162247]"
//                     >
//                         <FiShoppingCart />
//                         Cart ({displayCount})
//                     </Link>

//                     {!isAuthenticated ? (
//                         <div className="grid grid-cols-2 gap-3 pt-2">
//                             <Link
//                                 to="/login"
//                                 onClick={() => setMobileOpen(false)}
//                                 className="flex justify-center items-center rounded-lg border border-[#1b2a57] py-2.5 font-medium text-[#1b2a57]"
//                             >
//                                 Login
//                             </Link>
//                             <Link
//                                 to="/register"
//                                 onClick={() => setMobileOpen(false)}
//                                 className="flex justify-center items-center rounded-lg bg-[#1b2a57] py-2.5 font-medium text-white"
//                             >
//                                 Register
//                             </Link>
//                         </div>
//                     ) : (
//                         <button
//                             onClick={() => {
//                                 setMobileOpen(false);
//                                 handleLogout();
//                             }}
//                             className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-50 py-3 text-red-600 font-medium hover:bg-red-100 transition"
//                         >
//                             <FiLogOut /> Logout
//                         </button>
//                     )}
//                 </div>
//             </div>
//         </header>
//     );
// };

// export default Navbar;




import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../hooks/useAuth";
import {
    FiSearch,
    FiShoppingCart,
    FiMenu,
    FiX,
    FiUser,
    FiLogOut,
    FiPackage,
    FiLayout,
} from "react-icons/fi"; // maintaining react-icons/fi
import { useCart } from "../context/CartContext";

import logo from "../assets/logo.jpg.jpeg";

const SERVER_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const Navbar = () => {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const [profileData, setProfileData] = useState(null);
    const [imgError, setImgError] = useState(false);
    const [searchQuery, setSearchQuery] = useState(""); // Search state added
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    const [siteSettings, setSiteSettings] = useState(null);


    useEffect(() => {
        const fetchSiteSettings = async () => {
            try {
                const res = await axios.get(`${SERVER_URL}/site`);
                if (res.data?.success && res.data?.data) {
                    setSiteSettings(res.data.data);

                    // Favicon ডায়নামিক্যালি সেট করা (যদি ব্যাকএন্ডে থাকে)
                    if (res.data.data.favicon?.url) {
                        let link = document.querySelector("link[rel*='icon']");
                        if (!link) {
                            link = document.createElement("link");
                            link.rel = "shortcut icon";
                            document.getElementsByTagName("head")[0].appendChild(link);
                        }
                        link.href = res.data.data.favicon.url;
                    }
                }
            } catch (error) {
                console.error("Error loading site settings:", error);
            }
        };

        fetchSiteSettings();
    }, []);

    const { cart } = useCart();

    // safe fallbacks
    const displayCount = cart?.totalItems || 0;

    console.log(displayCount, "hello jewel");

    const { user: authUser, logout, loading } = useAuth();

    // User object (Auth Context or Local Profile State)
    const user = profileData || authUser;
    const isAuthenticated = Boolean(user);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setProfileOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogout = () => {
        setProfileOpen(false);
        setProfileData(null);
        logout();
        navigate("/login");
    };

    // Search execute function
    const handleSearch = (e) => {
        if (e) e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/category/${encodeURIComponent(searchQuery.trim())}`);
            setMobileOpen(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            handleSearch(e);
        }
    };

    // Fetch logged-in user profile
    useEffect(() => {
        const fetchProfile = async () => {
            const token = localStorage.getItem("token");
            if (!token) return;

            try {
                const res = await axios.get(`${SERVER_URL}/auth/profile`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                // ✅ Response wrapper চেক (res.data.user নাকি res.data.data নাকি সরাসরি res.data)
                const extractedUser = res.data?.user || res.data?.data || res.data;

                setProfileData(extractedUser);
                setImgError(false); // ডাটা রিফ্রেশ হলে ইমেজ এরর রিসেট
            } catch (error) {
                console.error("Error fetching profile:", error);
            }
        };

        fetchProfile();
    }, [SERVER_URL]);

    // প্রোফাইল পিকচারের নিরাপদ URL প্রসেসিং ফাংশন
    const getProfileImageUrl = (userData) => {
        if (!userData) return null;

        // ১. profilePic ফিল্ড চেক (অবজেক্ট, স্ট্রিং বা নেস্টেড অবজেক্ট)
        const rawPic = userData.profilePic || userData.profilpic;

        let picUrl = null;
        if (typeof rawPic === 'object' && rawPic !== null) {
            picUrl = rawPic.url || rawPic.path;
        } else if (typeof rawPic === 'string') {
            picUrl = rawPic;
        }

        if (picUrl) {
            // Windows Backslash Fix
            const normalizedPath = picUrl.replace(/\\/g, '/');

            // Cloudinary বা External HTTP/HTTPS URL হলে সরাসরি রিটার্ন
            if (normalizedPath.startsWith('http://') || normalizedPath.startsWith('https://')) {
                return normalizedPath;
            }

            // Local Server Storage (Multer) handling
            let baseUrl;
            try {
                baseUrl = new URL(SERVER_URL).origin;
            } catch (e) {
                console.log(e, "hello japan");

                baseUrl = `${SERVER_URL}`;
            }

            const cleanPath = normalizedPath.startsWith('/') ? normalizedPath : `/${normalizedPath}`;
            return `${baseUrl}${cleanPath}`;
        }

        // কোনো ছবি না থাকলে Fallback UI Avatar
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(userData?.name || "User")}&background=6366f1&color=fff&bold=true`;
    };

    const userImageUrl = getProfileImageUrl(user);

    // Dynamic logo handler
    const dynamicLogoUrl = siteSettings?.logo?.url || logo;

    return (
        <header className="sticky top-0 z-50 bg-white shadow-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20 lg:h-24">

                    {/* Logo */}
                    <Link to="/" className="flex items-center flex-shrink-0">
                        <div className="flex items-center gap-3 bg-[#1b2a57] rounded-xl px-3 py-2 shadow-lg">
                            <img
                                src={dynamicLogoUrl}
                                alt={siteSettings?.siteName || "Style & Closet"}
                                className="h-12 w-12 sm:h-14 sm:w-14 lg:h-16 lg:w-16 rounded-md object-cover bg-white p-1"
                            />
                            <div>
                                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold leading-none text-white">
                                    {siteSettings?.siteName || "Style & Closet"}
                                </h1>
                                <p className="mt-1 text-[9px] sm:text-[10px] uppercase tracking-[3px] text-gray-300">
                                    {siteSettings?.tagline || "Evergreen Forever"}
                                </p>
                            </div>
                        </div>
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="hidden lg:flex items-center gap-8 font-medium text-gray-700">
                        <Link to="/" className="hover:text-[#1b2a57] transition duration-300">
                            Home
                        </Link>
                        <Link to="/shop" className="hover:text-[#1b2a57] transition duration-300">
                            Shop
                        </Link>
                        <Link to="/contact" className="hover:text-[#1b2a57] transition duration-300">
                            Contact
                        </Link>
                        <Link to="/report-issue" className="hover:text-[#1b2a57] transition duration-300">
                            Report/Issue
                        </Link>
                        <Link to="/faq" className="hover:text-[#1b2a57] transition duration-300">
                            FAQs
                        </Link>
                    </nav>

                    {/* Search, Cart & Profile */}
                    <div className="hidden lg:flex items-center gap-2">
                        <form onSubmit={handleSearch} className="relative">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Search products..."
                                className="w-72 xl:w-80 rounded-full border border-gray-300 bg-gray-50 py-3 pl-5 pr-12 text-sm outline-none transition-all duration-300 focus:border-[#1b2a57] focus:ring-2 focus:ring-[#1b2a57]/20"
                            />
                            <button
                                type="submit"
                                aria-label="Search"
                                className="absolute right-5 top-1/2 -translate-y-1/2 text-lg text-gray-500 hover:text-[#1b2a57] transition"
                            >
                                <FiSearch />
                            </button>
                        </form>

                        <Link
                            to="/cart"
                            className="relative inline-flex items-center justify-center p-2 text-gray-700 hover:text-indigo-600 transition-colors"
                        >
                            <FiShoppingCart className="text-2xl" />

                            {/* ডাইনামিক কার্ট ব্যাজ */}
                            {displayCount > 0 && (
                                <span className="absolute -top-1 -right-1.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-600 px-1 text-[11px] font-bold text-white leading-none shadow-md z-20 select-none">
                                    {displayCount > 99 ? "99+" : displayCount}
                                </span>
                            )}
                        </Link>

                        {loading ? (
                            <div className="h-10 w-28 animate-pulse rounded-lg bg-gray-200" />
                        ) : isAuthenticated ? (
                            <div className="relative" ref={dropdownRef}>
                                <button
                                    onClick={() => setProfileOpen(!profileOpen)}
                                    className="flex items-center gap-2 rounded-full border border-gray-300 px-3 py-1.5 hover:bg-gray-100 transition"
                                >
                                    {userImageUrl && !imgError ? (
                                        <img
                                            src={userImageUrl}
                                            alt={user?.name || "Profile"}
                                            className="w-10 h-10 rounded-full object-cover border-2 border-[#1b2a57] cursor-pointer hover:scale-105 transition"
                                            onError={() => setImgError(true)}
                                        />
                                    ) : (
                                        <div className="h-8 w-8 rounded-full bg-[#1b2a57] text-white flex items-center justify-center font-bold text-sm">
                                            {user?.name ? user.name.charAt(0).toUpperCase() : <FiUser />}
                                        </div>
                                    )}
                                    <span className="font-medium text-gray-800">{user?.name || "User"}</span>
                                </button>

                                {profileOpen && (
                                    <div className="absolute right-0 mt-3 w-60 rounded-xl border bg-white shadow-xl py-2 z-50">
                                        <div className="border-b px-4 py-3">
                                            <h3 className="font-semibold text-gray-800">{user?.name}</h3>
                                            <p className="text-sm text-gray-500 truncate">{user?.email}</p>
                                        </div>

                                        <Link
                                            to="/profile"
                                            onClick={() => setProfileOpen(false)}
                                            className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition"
                                        >
                                            <FiUser />
                                            My Profile
                                        </Link>

                                        <Link
                                            to="/orders"
                                            onClick={() => setProfileOpen(false)}
                                            className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition"
                                        >
                                            <FiPackage />
                                            My Orders
                                        </Link>

                                        {user?.isAdmin && (
                                            <Link
                                                to="/admin"
                                                onClick={() => setProfileOpen(false)}
                                                className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition"
                                            >
                                                <FiLayout />
                                                Dashboard
                                            </Link>
                                        )}

                                        <button
                                            onClick={handleLogout}
                                            className="flex w-full items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 transition"
                                        >
                                            <FiLogOut />
                                            Logout
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                <Link
                                    to="/login"
                                    className="rounded-lg border border-[#1b2a57] px-5 py-2 font-medium text-[#1b2a57] transition hover:bg-[#1b2a57] hover:text-[#1b2a57]"
                                >
                                    Login
                                </Link>
                                <Link
                                    to="/register"
                                    className="rounded-lg bg-[#1b2a57] px-5 py-2 font-medium text-white transition hover:bg-[#162247]"
                                >
                                    Register
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setMobileOpen(!mobileOpen)}
                        className="rounded-md p-2 text-2xl lg:hidden hover:bg-gray-100"
                    >
                        {mobileOpen ? <FiX /> : <FiMenu />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            <div
                className={`overflow-hidden transition-all duration-300 lg:hidden ${mobileOpen ? "max-h-[600px]" : "max-h-0"
                    }`}
            >
                <div className="border-t bg-white px-5 py-5 shadow-md space-y-4">
                    <form onSubmit={handleSearch} className="relative">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Search products..."
                            className="w-full rounded-full border border-gray-300 py-3 pl-5 pr-12 outline-none focus:border-[#1b2a57]"
                        />
                        <button
                            type="submit"
                            aria-label="Search"
                            className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#1b2a57]"
                        >
                            <FiSearch />
                        </button>
                    </form>

                    <nav className="flex flex-col">
                        <Link
                            to="/"
                            onClick={() => setMobileOpen(false)}
                            className="border-b py-3 text-gray-700 hover:text-[#1b2a57]"
                        >
                            Home
                        </Link>
                        <Link
                            to="/shop"
                            onClick={() => setMobileOpen(false)}
                            className="border-b py-3 text-gray-700 hover:text-[#1b2a57]"
                        >
                            Shop
                        </Link>
                        <Link
                            to="/contact"
                            onClick={() => setMobileOpen(false)}
                            className="border-b py-3 text-gray-700 hover:text-[#1b2a57]"
                        >
                            Contact Us
                        </Link>
                        <Link
                            to="/report-issue"
                            onClick={() => setMobileOpen(false)}
                            className="border-b py-3 text-gray-700 hover:text-[#1b2a57]"
                        >
                            Report an Issue
                        </Link>
                        <Link
                            to="/faq"
                            onClick={() => setMobileOpen(false)}
                            className="border-b py-3 text-gray-700 hover:text-[#1b2a57]"
                        >
                            FAQs
                        </Link>

                        {isAuthenticated && (
                            <>
                                <Link
                                    to="/profile"
                                    onClick={() => setMobileOpen(false)}
                                    className="border-b py-3 text-gray-700 hover:text-[#1b2a57]"
                                >
                                    My Profile
                                </Link>
                                <Link
                                    to="/orders"
                                    onClick={() => setMobileOpen(false)}
                                    className="border-b py-3 text-gray-700 hover:text-[#1b2a57]"
                                >
                                    My Orders
                                </Link>
                                {user?.isAdmin && (
                                    <Link
                                        to="/admin"
                                        onClick={() => setMobileOpen(false)}
                                        className="border-b py-3 text-gray-700 hover:text-[#1b2a57]"
                                    >
                                        Admin Dashboard
                                    </Link>
                                )}
                            </>
                        )}
                    </nav>

                    <Link
                        to="/cart"
                        onClick={() => setMobileOpen(false)}
                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#1b2a57] py-3 text-white transition hover:bg-[#162247]"
                    >
                        <FiShoppingCart />
                        Cart ({displayCount})
                    </Link>

                    {!isAuthenticated ? (
                        <div className="grid grid-cols-2 gap-3 pt-2">
                            <Link
                                to="/login"
                                onClick={() => setMobileOpen(false)}
                                className="flex justify-center items-center rounded-lg border border-[#1b2a57] py-2.5 font-medium text-[#1b2a57]"
                            >
                                Login
                            </Link>
                            <Link
                                to="/register"
                                onClick={() => setMobileOpen(false)}
                                className="flex justify-center items-center rounded-lg bg-[#1b2a57] py-2.5 font-medium text-white"
                            >
                                Register
                            </Link>
                        </div>
                    ) : (
                        <button
                            onClick={() => {
                                setMobileOpen(false);
                                handleLogout();
                            }}
                            className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-50 py-3 text-red-600 font-medium hover:bg-red-100 transition"
                        >
                            <FiLogOut /> Logout
                        </button>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Navbar;