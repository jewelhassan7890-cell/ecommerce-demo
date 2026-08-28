// import React, { useEffect, useState } from "react";
// import { useParams, Link, useNavigate, useLocation } from "react-router-dom";



// import {
//     ShoppingCart,
//     Truck,
//     ShieldCheck,
//     RefreshCw,
//     Minus,
//     Plus,
//     Check,
//     PhoneCall,
//     Zap,
//     Loader2,
//     PlayCircle,
//     Share2
// } from "lucide-react";
// import { FaWhatsapp, FaFacebookMessenger } from "react-icons/fa";
// import axios from "axios";
// import toast from "react-hot-toast";

// // Context & Custom Hooks
// import { useCart } from "../context/CartContext";

// // Components
// import OurCustomers from "../components/OurCustomers";


// // Base API URL
// const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// // 1. Facebook Video/Reel Embed Helper
// const getFacebookVideoEmbedUrl = (url) => {
//     if (!url) return "";
//     const cleanUrl = url.trim();
//     return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(
//         cleanUrl
//     )}&show_text=false&width=500&autoplay=false`;
// };



// const ProductDetails = () => {
//     const { slug } = useParams();
//     const navigate = useNavigate();
//     const location = useLocation();

//     // Context থেকে সরাসরি addToCart আনা হচ্ছে
//     const { addToCart } = useCart();

//     // States
//     const [product, setProduct] = useState(null);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);
//     const [selectedImage, setSelectedImage] = useState("");
//     const [selectedColor, setSelectedColor] = useState("");
//     const [selectedSize, setSelectedSize] = useState("");
//     const [quantity, setQuantity] = useState(1);
//     const [isAdding, setIsAdding] = useState(false);

//     // Fetch Product Details
//     useEffect(() => {
//         const fetchProductDetails = async () => {
//             try {
//                 setLoading(true);
//                 setError(null);

//                 const response = await axios.get(`${BASE_URL}/products/${slug}`);
//                 const data = response.data?.data || response.data;

//                 if (!data) {
//                     throw new Error("প্রোডাক্ট ডাটা পাওয়া যায়নি!");
//                 }

//                 setProduct(data);

//                 // Default Image Set
//                 const defaultImg =
//                     data.thumbnail?.url ||
//                     data.thumbnail ||
//                     data.gallery?.[0]?.url ||
//                     data.gallery?.[0] ||
//                     "";
//                 setSelectedImage(defaultImg);

//                 // Default Variations Set
//                 // if (data.colors && data.colors.length > 0) setSelectedColor(data.colors[0]);
//                 if (data.sizes && data.sizes.length > 0) setSelectedSize(data.sizes[0]);

//             } catch (err) {
//                 console.error("Error loading product:", err);
//                 setError(err.response?.data?.message || "প্রোডাক্ট লোড করতে ব্যর্থ হয়েছে!");
//             } finally {
//                 setLoading(false);
//             }
//         };

//         if (slug) {
//             fetchProductDetails();
//         } else {
//             setError("অবৈধ লিঙ্ক বা প্রোডাক্ট আইডি পাওয়া যায়নি!");
//             setLoading(false);
//         }
//     }, [slug]);

//     // Quantity Change Handler
//     const handleQuantityChange = (type) => {
//         if (type === "increase") {
//             if (product?.stock && quantity >= product.stock) return;
//             setQuantity((prev) => prev + 1);
//         } else {
//             if (quantity > 1) setQuantity((prev) => prev - 1);
//         }
//     };



//     // ১. আপনার দেওয়া handleAddToCart ফাংশনটি একদম অপরিবর্তিত রাখা হয়েছে
//     const handleAddToCart = async () => {
//         if (!product) return false;

//         // ১. ভ্যালিডেশন চেক (Color & Size validation)
//         if (product.colors?.length > 0 && !selectedColor) {
//             toast.error("অনুগ্রহ করে একটি কালার সিলেক্ট করুন!");
//             return false;
//         }

//         if (product.sizes?.length > 0 && !selectedSize) {
//             toast.error("অনুগ্রহ করে একটি সাইজ সিলেক্ট করুন!");
//             return false;
//         }

//         try {
//             setIsAdding(true);

//             // ২. Context-এর addToCart কল করা হচ্ছে
//             const success = await addToCart(
//                 product,
//                 Number(quantity) || 1,
//                 selectedColor || null,
//                 selectedSize || null
//             );

//             if (success !== false) {
//                 toast.success(`"${product.name || product.title}" কার্টে যোগ করা হয়েছে!`);
//                 return true;
//             }

//             return false;
//         } catch (err) {
//             console.error("Cart Error:", err);

//             // ৩. ৪০১/৪০৩ কেবল তখনই হ্যান্ডেল করা হবে যদি আপনি Guest User সাপোর্ট না দিতে চান।
//             // তবে Guest User সাপোর্ট থাকলে Context-এর ভেতর লগইন ছাড়া LocalStorage-এ ডাটা সেভ হয়ে যাবে, তাই এই এরর আসা উচিত নয়।
//             if (err.response?.status === 401 || err.response?.status === 403) {
//                 toast.error("আপনার সেশন শেষ হয়ে গেছে, অনুগ্রহ করে আবার লগইন করুন!");
//                 navigate("/login", { state: { from: location.pathname } });
//                 return false;
//             }

//             const errorMessage = err.response?.data?.message || err.message || "কার্টে যোগ করতে ব্যর্থ হয়েছে!";
//             toast.error(errorMessage);
//             return false;
//         } finally {
//             setIsAdding(false);
//         }
//     };

//     const handleOrderNow = async () => {
//         const isSuccess = await handleAddToCart();

//         if (isSuccess) {
//             // Cart State সিঙ্ক হতে ৫০-১০০ মি.সে. সময় দেওয়া নিরাপদ
//             setTimeout(() => {
//                 navigate("/checkout");
//             }, 100);
//         }
//     };


//     // Combine Image Gallery
//     const getGalleryImages = () => {
//         if (!product) return [];
//         const imgs = [];

//         if (product.thumbnail) {
//             imgs.push(typeof product.thumbnail === 'string' ? product.thumbnail : product.thumbnail.url);
//         }
//         if (Array.isArray(product.gallery)) {
//             product.gallery.forEach(img => {
//                 imgs.push(typeof img === 'string' ? img : img.url);
//             });
//         }
//         return [...new Set(imgs)].filter(Boolean);
//     };

//     const allImages = getGalleryImages();

//     return (
//         <div className="w-full min-h-screen bg-gray-50 flex flex-col justify-between">
//             <main className="flex-grow py-4 sm:py-8">
//                 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

//                     {/* Loading State */}
//                     {loading && (
//                         <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm animate-pulse grid grid-cols-1 md:grid-cols-2 gap-8">
//                             <div className="bg-gray-200 aspect-square rounded-xl"></div>
//                             <div className="space-y-4">
//                                 <div className="h-6 bg-gray-200 rounded w-1/4"></div>
//                                 <div className="h-8 bg-gray-200 rounded w-3/4"></div>
//                                 <div className="h-6 bg-gray-200 rounded w-1/3"></div>
//                                 <div className="h-20 bg-gray-200 rounded w-full"></div>
//                                 <div className="h-12 bg-gray-200 rounded w-1/2"></div>
//                             </div>
//                         </div>
//                     )}

//                     {/* Error State */}
//                     {!loading && error && (
//                         <div className="bg-white border border-gray-200 rounded-2xl p-8 sm:p-12 text-center my-8 shadow-sm">
//                             <h2 className="text-2xl font-bold text-gray-800 mb-2">দুঃখিত!</h2>
//                             <p className="text-gray-600 mb-6">{error}</p>
//                             <Link to="/products" className="inline-block bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-indigo-700 transition">
//                                 সব প্রোডাক্ট দেখুন
//                             </Link>
//                         </div>
//                     )}

//                     {/* Main Product View */}
//                     {!loading && !error && product && (
//                         <>
//                             {/* Breadcrumbs */}
//                             <nav className="text-xs sm:text-sm font-medium text-gray-500 mb-4 sm:mb-6 flex items-center space-x-2 overflow-x-auto whitespace-nowrap">
//                                 <Link to="/" className="hover:text-indigo-600 transition">Home</Link>
//                                 <span>/</span>
//                                 <Link to="/products" className="hover:text-indigo-600 transition">Products</Link>
//                                 <span>/</span>
//                                 <span className="text-gray-900 truncate max-w-[180px] sm:max-w-xs">{product.name}</span>
//                             </nav>

//                             <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10">

//                                 {/* Left Side: Product Images */}
//                                 <div className="space-y-4">
//                                     <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden relative group border border-gray-100">
//                                         <img
//                                             src={selectedImage || "https://via.placeholder.com/600x600?text=No+Image"}
//                                             alt={product.name}
//                                             className="w-full h-full object-cover object-center group-hover:scale-105 transition duration-300"
//                                         />
//                                         {product.isOnSale && (
//                                             <span className="absolute top-3 left-3 sm:top-4 sm:left-4 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
//                                                 Sale
//                                             </span>
//                                         )}
//                                     </div>

//                                     {/* Thumbnail Gallery */}
//                                     {allImages.length > 1 && (
//                                         <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-thin">
//                                             {allImages.map((imgUrl, index) => (
//                                                 <button
//                                                     key={index}
//                                                     onClick={() => setSelectedImage(imgUrl)}
//                                                     className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border-2 flex-shrink-0 transition ${selectedImage === imgUrl ? "border-indigo-600 ring-2 ring-indigo-100" : "border-gray-200 hover:border-gray-300"
//                                                         }`}
//                                                 >
//                                                     <img src={imgUrl} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover" />
//                                                 </button>
//                                             ))}
//                                         </div>
//                                     )}
//                                 </div>

//                                 {/* Right Side: Product Details & Controls */}
//                                 <div className="flex flex-col justify-between space-y-6 md:space-y-0">
//                                     <div>
//                                         {/* Category & Title */}
//                                         <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-1">
//                                             {product.category?.name || product.brand || "Fashion"}
//                                         </p>
//                                         <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-gray-900 mb-3">
//                                             {product.name}
//                                         </h1>
//                                         <h3 className="text-lg sm:text-2xl md:text-3xl font-extrabold text-gray-900 mb-3">
//                                             {product.sku}
//                                         </h3>

//                                         {/* Price & Stock Status */}
//                                         <div className="flex items-center space-x-4 mb-4">
//                                             <div className="flex items-baseline space-x-2">
//                                                 <span className="text-2xl sm:text-3xl font-bold text-gray-900">
//                                                     ৳{product.salePrice ? product.salePrice : product.price}
//                                                 </span>
//                                                 {product.salePrice && (
//                                                     <span className="text-base sm:text-lg text-gray-400 line-through">
//                                                         ৳{product.price}
//                                                     </span>
//                                                 )}
//                                             </div>
//                                             <span
//                                                 className={`text-xs font-semibold px-2.5 py-1 rounded-md ${(product.stockStatus === "in-stock" || !product.stockStatus) && (product.stock > 0 || product.stock === undefined)
//                                                     ? "bg-green-100 text-green-800"
//                                                     : "bg-red-100 text-red-800"
//                                                     }`}
//                                             >
//                                                 {(product.stockStatus === "in-stock" || !product.stockStatus) && (product.stock > 0 || product.stock === undefined)
//                                                     ? "In Stock"
//                                                     : "Out of Stock"}
//                                             </span>
//                                         </div>

//                                         {/* Description */}
//                                         <p className="text-gray-600 text-xs sm:text-sm leading-relaxed mb-6">
//                                             {product.shortDescription || product.description || "No description available for this product."}
//                                         </p>

//                                         {/* Free Shipping */}
//                                         {product.shipping.freeShipping && (
//                                             <div className="flex items-center space-x-2 mb-6">
//                                                 <Zap className="w-5 h-5 text-indigo-600" />
//                                                 <span className="text-sm text-gray-700">Delivery Charge *FREE* </span>
//                                             </div>
//                                         )}

//                                         <hr className="my-6 border-gray-100" />

//                                         {/* Color Selection */}
//                                         <span>Please choose your desired color</span>
//                                         {product.colors && product.colors.length > 0 && (
//                                             <div className="mb-6">
//                                                 <h3 className="text-sm font-medium text-gray-900 mb-3">
//                                                     Color: <span className="text-gray-500 capitalize">{selectedColor}</span>
//                                                 </h3>
//                                                 <div className="flex items-center space-x-3">
//                                                     {product.colors.map((color) => (
//                                                         <button
//                                                             key={color}
//                                                             onClick={() => setSelectedColor(color)}
//                                                             className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full border-2 flex items-center justify-center transition capitalize ${selectedColor === color ? "border-indigo-600 ring-2 ring-indigo-200" : "border-gray-200"
//                                                                 }`}
//                                                             style={{ backgroundColor: color.toLowerCase() }}
//                                                             title={color}
//                                                         >
//                                                             {selectedColor === color && (
//                                                                 <Check className={`w-4 h-4 ${["white", "yellow"].includes(color.toLowerCase()) ? "text-black" : "text-white"}`} />
//                                                             )}
//                                                         </button>
//                                                     ))}
//                                                 </div>
//                                             </div>
//                                         )}

//                                         {/* Quantity Selector */}
//                                         <div className="mb-6">
//                                             <h3 className="text-sm font-medium text-gray-900 mb-3">Quantity</h3>
//                                             <div className="flex items-center border border-gray-200 rounded-lg w-max bg-white">
//                                                 <button
//                                                     onClick={() => handleQuantityChange("decrease")}
//                                                     className="p-2 sm:p-2.5 text-gray-600 hover:bg-gray-50 transition disabled:opacity-50"
//                                                     disabled={quantity <= 1}
//                                                 >
//                                                     <Minus className="w-4 h-4" />
//                                                 </button>
//                                                 <span className="px-4 sm:px-5 font-semibold text-gray-800 text-sm">
//                                                     {quantity}
//                                                 </span>
//                                                 <button
//                                                     onClick={() => handleQuantityChange("increase")}
//                                                     className="p-2 sm:p-2.5 text-gray-600 hover:bg-gray-50 transition disabled:opacity-50"
//                                                     disabled={product.stock && quantity >= product.stock}
//                                                 >
//                                                     <Plus className="w-4 h-4" />
//                                                 </button>
//                                             </div>
//                                         </div>
//                                     </div>

//                                     {/* Action Buttons */}
//                                     <div className="space-y-3 pt-4 border-t border-gray-100">
//                                         <div className="flex flex-col sm:flex-row gap-3">
//                                             {/* Add to Cart */}
//                                             <button
//                                                 onClick={handleAddToCart}
//                                                 disabled={isAdding || (product.stock !== undefined && product.stock < 1)}
//                                                 className="flex-1 bg-indigo-50 border border-indigo-600 text-indigo-600 font-semibold py-3 px-6 rounded-xl hover:bg-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center space-x-2 shadow-sm"
//                                             >
//                                                 {isAdding ? (
//                                                     <>
//                                                         <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
//                                                         <span>Adding...</span>
//                                                     </>
//                                                 ) : (
//                                                     <>
//                                                         <ShoppingCart className="w-5 h-5" />
//                                                         <span>Add to Cart</span>
//                                                     </>
//                                                 )}
//                                             </button>

//                                             {/* Order Now Direct */}


//                                             <button
//                                                 onClick={handleOrderNow}
//                                                 disabled={isAdding}
//                                                 className="flex-1 bg-indigo-600 text-white font-semibold py-3 px-6 rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center space-x-2 shadow-md"
//                                             >
//                                                 অর্ডার করুন
//                                             </button>
//                                         </div>

//                                         {/* Direct Contact Banners */}
//                                         <div className="space-y-2 pt-2">
//                                             <a
//                                                 href="tel:+8801301002648"
//                                                 className="w-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium py-2.5 px-4 rounded-xl flex items-center justify-center space-x-2 text-xs sm:text-sm hover:bg-emerald-100 transition"
//                                             >
//                                                 <PhoneCall className="w-4 h-4 text-emerald-600" />
//                                                 <span>সরাসরি কল করতে ডায়াল করুন: +8801301002648</span>
//                                             </a>

//                                             <a
//                                                 href={`https://wa.me/8801301002648?text=${encodeURIComponent(`Hello! I want to know more about: ${product?.name || "this product"}`)}`}
//                                                 target="_blank"
//                                                 rel="noopener noreferrer"
//                                                 className="w-full bg-green-50 text-green-800 border border-green-200 font-medium py-2.5 px-4 rounded-xl flex items-center justify-center space-x-2 text-xs sm:text-sm hover:bg-green-100 transition"
//                                             >
//                                                 <FaWhatsapp className="w-4 h-4 text-green-600" />
//                                                 <span>হোয়াটসঅ্যাপে মেসেজ দিন</span>
//                                             </a>

//                                             <a
//                                                 href="https://m.me/stylecloset624"
//                                                 target="_blank"
//                                                 rel="noopener noreferrer"
//                                                 className="w-full bg-blue-50 text-blue-800 border border-blue-200 font-medium py-2.5 px-4 rounded-xl flex items-center justify-center space-x-2 text-xs sm:text-sm hover:bg-blue-100 transition"
//                                             >
//                                                 <FaFacebookMessenger className="w-4 h-4 text-blue-600" />
//                                                 <span>ফেসবুক মেসেঞ্জারে মেসেজ দিন</span>
//                                             </a>
//                                         </div>

//                                         {/* Guarantees */}
//                                         <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 text-xs text-gray-500">
//                                             <div className="flex items-center space-x-2">
//                                                 <Truck className="w-4 h-4 text-indigo-600" />
//                                                 <span>ফাস্ট ডেলিভারি</span>
//                                             </div>
//                                             <div className="flex items-center space-x-2">
//                                                 <ShieldCheck className="w-4 h-4 text-indigo-600" />
//                                                 <span>১০০% অরিজিনাল ডাটা</span>
//                                             </div>
//                                             <div className="flex items-center space-x-2">
//                                                 <RefreshCw className="w-4 h-4 text-indigo-600" />
//                                                 <span>সহজ রিটার্ন পলিসি</span>
//                                             </div>
//                                         </div>
//                                     </div>

//                                 </div>
//                             </div>
//                         </>
//                     )}


//                     {/* Facebook Embedded Content Grid */}
//                     {(product?.facebookEmbed?.reelUrl || product?.facebookEmbed?.photoPostUrl) && (
//                         <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">

//                             {/* Left Side: Facebook Video / Reels Embed */}
//                             {product?.facebookEmbed?.reelUrl && (
//                                 <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-gray-100 flex flex-col justify-between">
//                                     <div className="flex items-center space-x-3 mb-4 border-b border-gray-100 pb-3">
//                                         <PlayCircle className="w-6 h-6 text-indigo-600 flex-shrink-0" />
//                                         <h2 className="text-lg font-bold text-gray-900">
//                                             ফেসবুক রিলস ও ভিডিও রিভিউ
//                                         </h2>
//                                     </div>

//                                     <div className="flex justify-center items-center flex-1 my-auto overflow-hidden">
//                                         <div className="w-full max-w-[340px] sm:max-w-[360px] aspect-[9/16] bg-black rounded-xl overflow-hidden shadow-md relative">
//                                             <iframe
//                                                 src={getFacebookVideoEmbedUrl(product.facebookEmbed.reelUrl)}
//                                                 className="w-full h-full border-0"
//                                                 scrolling="no"
//                                                 allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
//                                                 allowFullScreen={true}
//                                                 title="Facebook Reel Video"
//                                             ></iframe>
//                                         </div>
//                                     </div>
//                                 </div>
//                             )}

//                             {/* Right Side: Facebook Image / Post Embed */}

//                             {product?.facebookEmbed?.photoPostUrl && (
//                                 <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-gray-100 flex flex-col justify-between">
//                                     <div className="flex items-center space-x-3 mb-4 border-b border-gray-100 pb-3">
//                                         <Share2 className="w-6 h-6 text-indigo-600 flex-shrink-0" />
//                                         <h2 className="text-lg font-bold text-gray-900">
//                                             ফেসবুক অফিশিয়াল পোস্ট ও ছবি
//                                         </h2>
//                                     </div>

//                                     <div className="flex justify-center items-center flex-1 my-auto overflow-hidden">
//                                         <div className="w-full max-w-[500px] min-h-[580px] sm:min-h-[620px] bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200">
//                                             <iframe
//                                                 src={`https://www.facebook.com/plugins/post.php?href=${encodeURIComponent(
//                                                     product.facebookEmbed.photoPostUrl
//                                                 )}&show_text=true&width=500`}
//                                                 className="w-full h-full min-h-[580px] sm:min-h-[620px] border-0 overflow-hidden"
//                                                 scrolling="no"
//                                                 frameBorder="0"
//                                                 allowFullScreen={true}
//                                                 allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
//                                                 title="Facebook Post Embed"
//                                             ></iframe>
//                                         </div>
//                                     </div>
//                                 </div>
//                             )}

//                         </div>
//                     )}

//                 </div>
//             </main>



//             <OurCustomers />
//         </div>
//     );
// };

// export default ProductDetails;










import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";

import {
    ShoppingCart,
    Truck,
    ShieldCheck,
    RefreshCw,
    Minus,
    Plus,
    Check,
    PhoneCall,
    Zap,
    Loader2,
    PlayCircle,
    Share2
} from "lucide-react";
import { FaWhatsapp, FaFacebookMessenger } from "react-icons/fa";
import axios from "axios";
import toast from "react-hot-toast";

// Context & Custom Hooks
import { useCart } from "../context/CartContext";

// Components


// Base API URL
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// 1. Facebook Video/Reel Embed Helper
const getFacebookVideoEmbedUrl = (url) => {
    if (!url) return "";
    const cleanUrl = url.trim();

    return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(
        cleanUrl
    )}&show_text=false&width=500&autoplay=false`;
};

const ProductDetails = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    // Context থেকে সরাসরি addToCart আনা হচ্ছে
    const { addToCart } = useCart();

    // States
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedImage, setSelectedImage] = useState("");
    const [selectedColor, setSelectedColor] = useState("");
    const [colorError, setColorError] = useState("");
    const [selectedSize, setSelectedSize] = useState("");
    const [quantity, setQuantity] = useState(1);
    const [isAdding, setIsAdding] = useState(false);

    // Fetch Product Details
    useEffect(() => {
        const fetchProductDetails = async () => {
            try {
                setLoading(true);
                setError(null);

                const response = await axios.get(`${BASE_URL}/products/${slug}`);
                const data = response.data?.data || response.data;

                if (!data) {
                    throw new Error("প্রোডাক্ট ডাটা পাওয়া যায়নি!");
                }

                setProduct(data);

                // Default Image Set
                const defaultImg =
                    data.thumbnail?.url ||
                    data.thumbnail ||
                    data.gallery?.[0]?.url ||
                    data.gallery?.[0] ||
                    "";

                setSelectedImage(defaultImg);

                // Default Variations Set
                if (data.sizes && data.sizes.length > 0) {
                    setSelectedSize(data.sizes[0]);
                }
            } catch (err) {
                console.error("Error loading product:", err);

                setError(
                    err.response?.data?.message ||
                    "প্রোডাক্ট লোড করতে ব্যর্থ হয়েছে!"
                );
            } finally {
                setLoading(false);
            }
        };

        if (slug) {
            fetchProductDetails();
        } else {
            setError("অবৈধ লিঙ্ক বা প্রোডাক্ট আইডি পাওয়া যায়নি!");
            setLoading(false);
        }
    }, [slug]);

    // Quantity Change Handler
    const handleQuantityChange = (type) => {
        if (type === "increase") {
            if (product?.stock && quantity >= product.stock) return;

            setQuantity((prev) => prev + 1);
        } else {
            if (quantity > 1) {
                setQuantity((prev) => prev - 1);
            }
        }
    };

    // Add To Cart
    const handleAddToCart = async () => {
        if (!product) return false;

        // Color Validation
        if (
            Array.isArray(product.colors) &&
            product.colors.length > 0 &&
            !selectedColor
        ) {
            setColorError("অনুগ্রহ করে একটি কালার সিলেক্ট করুন!");
            toast.error("অনুগ্রহ করে একটি কালার সিলেক্ট করুন!");

            return false;
        }

        // Color selected হলে error clear
        setColorError("");

        // Size Validation
        if (
            Array.isArray(product.sizes) &&
            product.sizes.length > 0 &&
            !selectedSize
        ) {
            toast.error("অনুগ্রহ করে একটি সাইজ সিলেক্ট করুন!");

            return false;
        }

        try {
            setIsAdding(true);

            const success = await addToCart(
                product,
                Number(quantity) || 1,
                selectedColor || null,
                selectedSize || null
            );

            if (success !== false) {
                toast.success(
                    `"${product.name || product.title}" কার্টে যোগ করা হয়েছে!`
                );

                return true;
            }

            return false;
        } catch (err) {
            console.error("Cart Error:", err);

            if (
                err.response?.status === 401 ||
                err.response?.status === 403
            ) {
                toast.error(
                    "আপনার সেশন শেষ হয়ে গেছে, অনুগ্রহ করে আবার লগইন করুন!"
                );

                navigate("/login", {
                    state: {
                        from: location.pathname
                    }
                });

                return false;
            }

            const errorMessage =
                err.response?.data?.message ||
                err.message ||
                "কার্টে যোগ করতে ব্যর্থ হয়েছে!";

            toast.error(errorMessage);

            return false;
        } finally {
            setIsAdding(false);
        }
    };

    const handleOrderNow = async () => {
        const isSuccess = await handleAddToCart();

        if (isSuccess) {
            // Cart State সিঙ্ক হতে ৫০-১০০ মি.সে. সময় দেওয়া নিরাপদ
            setTimeout(() => {
                navigate("/checkout");
            }, 100);
        }
    };

    // Combine Image Gallery
    const getGalleryImages = () => {
        if (!product) return [];

        const imgs = [];

        if (product.thumbnail) {
            imgs.push(
                typeof product.thumbnail === "string"
                    ? product.thumbnail
                    : product.thumbnail.url
            );
        }

        if (Array.isArray(product.gallery)) {
            product.gallery.forEach((img) => {
                imgs.push(typeof img === "string" ? img : img.url);
            });
        }

        return [...new Set(imgs)].filter(Boolean);
    };

    const allImages = getGalleryImages();

    return (
        <div className="w-full min-h-screen bg-gray-50 flex flex-col justify-between">
            <main className="flex-grow py-4 sm:py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                    {/* Loading State */}
                    {loading && (
                        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm animate-pulse grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="bg-gray-200 aspect-square rounded-xl"></div>

                            <div className="space-y-4">
                                <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                                <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                                <div className="h-20 bg-gray-200 rounded w-full"></div>
                                <div className="h-12 bg-gray-200 rounded w-1/2"></div>
                            </div>
                        </div>
                    )}

                    {/* Error State */}
                    {!loading && error && (
                        <div className="bg-white border border-gray-200 rounded-2xl p-8 sm:p-12 text-center my-8 shadow-sm">
                            <h2 className="text-2xl font-bold text-gray-800 mb-2">
                                দুঃখিত!
                            </h2>

                            <p className="text-gray-600 mb-6">
                                {error}
                            </p>

                            <Link
                                to="/products"
                                className="inline-block bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-indigo-700 transition"
                            >
                                সব প্রোডাক্ট দেখুন
                            </Link>
                        </div>
                    )}

                    {/* Main Product View */}
                    {!loading && !error && product && (
                        <>
                            {/* Breadcrumbs */}
                            <nav className="text-xs sm:text-sm font-medium text-gray-500 mb-4 sm:mb-6 flex items-center space-x-2 overflow-x-auto whitespace-nowrap">
                                <Link
                                    to="/"
                                    className="hover:text-indigo-600 transition"
                                >
                                    Home
                                </Link>

                                <span>/</span>

                                <Link
                                    to="/products"
                                    className="hover:text-indigo-600 transition"
                                >
                                    Products
                                </Link>

                                <span>/</span>

                                <span className="text-gray-900 truncate max-w-[180px] sm:max-w-xs">
                                    {product.name}
                                </span>
                            </nav>

                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10">

                                {/* Left Side: Product Images */}
                                <div className="space-y-4">
                                    <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden relative group border border-gray-100">
                                        <img
                                            src={
                                                selectedImage ||
                                                "https://via.placeholder.com/600x600?text=No+Image"
                                            }
                                            alt={product.name}
                                            className="w-full h-full object-cover object-center group-hover:scale-105 transition duration-300"
                                        />

                                        {product.isOnSale && (
                                            <span className="absolute top-3 left-3 sm:top-4 sm:left-4 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                                                Sale
                                            </span>
                                        )}
                                    </div>

                                    {/* Thumbnail Gallery */}
                                    {allImages.length > 1 && (
                                        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-thin">
                                            {allImages.map((imgUrl, index) => (
                                                <button
                                                    key={index}
                                                    onClick={() =>
                                                        setSelectedImage(imgUrl)
                                                    }
                                                    className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border-2 flex-shrink-0 transition ${selectedImage === imgUrl
                                                        ? "border-indigo-600 ring-2 ring-indigo-100"
                                                        : "border-gray-200 hover:border-gray-300"
                                                        }`}
                                                >
                                                    <img
                                                        src={imgUrl}
                                                        alt={`Thumbnail ${index + 1
                                                            }`}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Right Side: Product Details & Controls */}
                                <div className="flex flex-col justify-between space-y-6 md:space-y-0">

                                    <div>
                                        {/* Category & Title */}
                                        <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-1">
                                            {product.category?.name ||
                                                product.brand ||
                                                "Fashion"}
                                        </p>

                                        <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-gray-900 mb-3">
                                            {product.name}
                                        </h1>

                                        <h3 className="text-lg sm:text-2xl md:text-3xl font-extrabold text-gray-900 mb-3">
                                            {product.sku}
                                        </h3>

                                        {/* Price & Stock Status */}
                                        <div className="flex items-center space-x-4 mb-4">
                                            <div className="flex items-baseline space-x-2">
                                                <span className="text-2xl sm:text-3xl font-bold text-gray-900">
                                                    ৳
                                                    {product.salePrice
                                                        ? product.salePrice
                                                        : product.price}
                                                </span>

                                                {product.salePrice && (
                                                    <span className="text-base sm:text-lg text-gray-400 line-through">
                                                        ৳{product.price}
                                                    </span>
                                                )}
                                            </div>

                                            <span
                                                className={`text-xs font-semibold px-2.5 py-1 rounded-md ${(product.stockStatus ===
                                                    "in-stock" ||
                                                    !product.stockStatus) &&
                                                    (product.stock > 0 ||
                                                        product.stock ===
                                                        undefined)
                                                    ? "bg-green-100 text-green-800"
                                                    : "bg-red-100 text-red-800"
                                                    }`}
                                            >
                                                {(product.stockStatus ===
                                                    "in-stock" ||
                                                    !product.stockStatus) &&
                                                    (product.stock > 0 ||
                                                        product.stock === undefined)
                                                    ? "In Stock"
                                                    : "Out of Stock"}
                                            </span>
                                        </div>

                                        {/* Description */}
                                        <p className="text-gray-600 text-xs sm:text-sm leading-relaxed mb-6">
                                            {product.shortDescription ||
                                                product.description ||
                                                "No description available for this product."}
                                        </p>

                                        {/* Free Shipping */}
                                        {product.shipping?.freeShipping && (
                                            <div className="flex items-center space-x-2 mb-6">
                                                <Zap className="w-5 h-5 text-indigo-600" />

                                                <span className="text-sm text-gray-700">
                                                    Delivery Charge *FREE*
                                                </span>
                                            </div>
                                        )}

                                        <hr className="my-6 border-gray-100" />

                                        {/* Color Selection */}
                                        {Array.isArray(product.colors) &&
                                            product.colors.length > 0 && (
                                                <div className="mb-6">
                                                    <h3 className="text-sm font-medium text-gray-900 mb-3">
                                                        Color:{" "}
                                                        <span className="text-gray-500 capitalize">
                                                            {selectedColor ||
                                                                "Please select a color"}
                                                        </span>
                                                    </h3>

                                                    <div className="flex items-center space-x-3">
                                                        {product.colors.map(
                                                            (color) => (
                                                                <button
                                                                    key={color}
                                                                    type="button"
                                                                    onClick={() => {
                                                                        setSelectedColor(
                                                                            color
                                                                        );
                                                                        setColorError(
                                                                            ""
                                                                        );
                                                                    }}
                                                                    className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full border-2 flex items-center justify-center transition capitalize ${selectedColor ===
                                                                        color
                                                                        ? "border-indigo-600 ring-2 ring-indigo-200"
                                                                        : colorError
                                                                            ? "border-red-300 hover:border-red-500"
                                                                            : "border-gray-200 hover:border-gray-300"
                                                                        }`}
                                                                    style={{
                                                                        backgroundColor:
                                                                            color.toLowerCase()
                                                                    }}
                                                                    title={color}
                                                                >
                                                                    {selectedColor ===
                                                                        color && (
                                                                            <Check
                                                                                className={`w-4 h-4 ${[
                                                                                    "white",
                                                                                    "yellow"
                                                                                ].includes(
                                                                                    color.toLowerCase()
                                                                                )
                                                                                    ? "text-black"
                                                                                    : "text-white"
                                                                                    }`}
                                                                            />
                                                                        )}
                                                                </button>
                                                            )
                                                        )}
                                                    </div>

                                                    {/* Color Warning */}
                                                    {colorError && (
                                                        <p className="mt-2 text-sm font-medium text-red-600">
                                                            {colorError}
                                                        </p>
                                                    )}
                                                </div>
                                            )}

                                        {/* Quantity Selector */}
                                        <div className="mb-6">
                                            <h3 className="text-sm font-medium text-gray-900 mb-3">
                                                Quantity
                                            </h3>

                                            <div className="flex items-center border border-gray-200 rounded-lg w-max bg-white">
                                                <button
                                                    onClick={() =>
                                                        handleQuantityChange(
                                                            "decrease"
                                                        )
                                                    }
                                                    className="p-2 sm:p-2.5 text-gray-600 hover:bg-gray-50 transition disabled:opacity-50"
                                                    disabled={quantity <= 1}
                                                >
                                                    <Minus className="w-4 h-4" />
                                                </button>

                                                <span className="px-4 sm:px-5 font-semibold text-gray-800 text-sm">
                                                    {quantity}
                                                </span>

                                                <button
                                                    onClick={() =>
                                                        handleQuantityChange(
                                                            "increase"
                                                        )
                                                    }
                                                    className="p-2 sm:p-2.5 text-gray-600 hover:bg-gray-50 transition disabled:opacity-50"
                                                    disabled={
                                                        product.stock &&
                                                        quantity >=
                                                        product.stock
                                                    }
                                                >
                                                    <Plus className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="space-y-3 pt-4 border-t border-gray-100">
                                        <div className="flex flex-col sm:flex-row gap-3">

                                            {/* Add to Cart */}
                                            <button
                                                onClick={handleAddToCart}
                                                disabled={
                                                    isAdding ||
                                                    (product.stock !==
                                                        undefined &&
                                                        product.stock < 1)
                                                }
                                                className="flex-1 bg-indigo-50 border border-indigo-600 text-indigo-600 font-semibold py-3 px-6 rounded-xl hover:bg-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center space-x-2 shadow-sm"
                                            >
                                                {isAdding ? (
                                                    <>
                                                        <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />

                                                        <span>
                                                            Adding...
                                                        </span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <ShoppingCart className="w-5 h-5" />

                                                        <span>
                                                            Add to Cart
                                                        </span>
                                                    </>
                                                )}
                                            </button>

                                            {/* Order Now Direct */}
                                            <button
                                                onClick={handleOrderNow}
                                                disabled={isAdding}
                                                className="flex-1 bg-indigo-600 text-white font-semibold py-3 px-6 rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center space-x-2 shadow-md"
                                            >
                                                অর্ডার করুন
                                            </button>
                                        </div>

                                        {/* Direct Contact Banners */}
                                        <div className="space-y-2 pt-2">

                                            <a
                                                href="tel:+8801301002648"
                                                className="w-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium py-2.5 px-4 rounded-xl flex items-center justify-center space-x-2 text-xs sm:text-sm hover:bg-emerald-100 transition"
                                            >
                                                <PhoneCall className="w-4 h-4 text-emerald-600" />

                                                <span>
                                                    সরাসরি কল করতে ডায়াল করুন:
                                                    +8801301002648
                                                </span>
                                            </a>

                                            <a
                                                href={`https://wa.me/8801301002648?text=${encodeURIComponent(
                                                    `Hello! I want to know more about: ${product?.name ||
                                                    "this product"
                                                    }`
                                                )}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="w-full bg-green-50 text-green-800 border border-green-200 font-medium py-2.5 px-4 rounded-xl flex items-center justify-center space-x-2 text-xs sm:text-sm hover:bg-green-100 transition"
                                            >
                                                <FaWhatsapp className="w-4 h-4 text-green-600" />

                                                <span>
                                                    হোয়াটসঅ্যাপে মেসেজ দিন
                                                </span>
                                            </a>

                                            <a
                                                href="https://m.me/stylecloset624"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="w-full bg-blue-50 text-blue-800 border border-blue-200 font-medium py-2.5 px-4 rounded-xl flex items-center justify-center space-x-2 text-xs sm:text-sm hover:bg-blue-100 transition"
                                            >
                                                <FaFacebookMessenger className="w-4 h-4 text-blue-600" />

                                                <span>
                                                    ফেসবুক মেসেঞ্জারে মেসেজ দিন
                                                </span>
                                            </a>
                                        </div>

                                        {/* Guarantees */}
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 text-xs text-gray-500">
                                            <div className="flex items-center space-x-2">
                                                <Truck className="w-4 h-4 text-indigo-600" />

                                                <span>
                                                    ফাস্ট ডেলিভারি
                                                </span>
                                            </div>

                                            <div className="flex items-center space-x-2">
                                                <ShieldCheck className="w-4 h-4 text-indigo-600" />

                                                <span>
                                                    ১০০% অরিজিনাল ডাটা
                                                </span>
                                            </div>

                                            <div className="flex items-center space-x-2">
                                                <RefreshCw className="w-4 h-4 text-indigo-600" />

                                                <span>
                                                    সহজ রিটার্ন পলিসি
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {/* Facebook Embedded Content Grid */}
                    {(product?.facebookEmbed?.reelUrl ||
                        product?.facebookEmbed?.photoPostUrl) && (
                            <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">

                                {/* Left Side: Facebook Video / Reels Embed */}
                                {product?.facebookEmbed?.reelUrl && (
                                    <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-gray-100 flex flex-col justify-between">
                                        <div className="flex items-center space-x-3 mb-4 border-b border-gray-100 pb-3">
                                            <PlayCircle className="w-6 h-6 text-indigo-600 flex-shrink-0" />

                                            <h2 className="text-lg font-bold text-gray-900">
                                                ফেসবুক রিলস ও ভিডিও রিভিউ
                                            </h2>
                                        </div>

                                        <div className="flex justify-center items-center flex-1 my-auto overflow-hidden">
                                            <div className="w-full max-w-[340px] sm:max-w-[360px] aspect-[9/16] bg-black rounded-xl overflow-hidden shadow-md relative">
                                                <iframe
                                                    src={getFacebookVideoEmbedUrl(
                                                        product.facebookEmbed.reelUrl
                                                    )}
                                                    className="w-full h-full border-0"
                                                    scrolling="no"
                                                    allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                                                    allowFullScreen={true}
                                                    title="Facebook Reel Video"
                                                ></iframe>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Right Side: Facebook Image / Post Embed */}
                                {product?.facebookEmbed?.photoPostUrl && (
                                    <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-gray-100 flex flex-col justify-between">
                                        <div className="flex items-center space-x-3 mb-4 border-b border-gray-100 pb-3">
                                            <Share2 className="w-6 h-6 text-indigo-600 flex-shrink-0" />
                                            <h2 className="text-lg font-bold text-gray-900">
                                                ফেসবুক অফিশিয়াল পোস্ট ও ছবি
                                            </h2>
                                        </div>

                                        <div className="flex justify-center items-center flex-1 my-auto overflow-hidden">
                                            <div className="w-full max-w-[500px] min-h-[580px] sm:min-h-[620px] bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200">
                                                <iframe
                                                    src={`https://www.facebook.com/plugins/post.php?href=${encodeURIComponent(
                                                        product.facebookEmbed.photoPostUrl
                                                    )}&show_text=true&width=500`}
                                                    className="w-full h-full min-h-[580px] sm:min-h-[620px] border-0 overflow-hidden"
                                                    scrolling="no"
                                                    frameBorder="0"
                                                    allowFullScreen={true}
                                                    allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                                                    title="Facebook Post Embed"
                                                ></iframe>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                </div>
            </main>


        </div>
    );
};

export default ProductDetails;

