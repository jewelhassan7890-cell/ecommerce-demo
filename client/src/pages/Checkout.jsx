// import React, { useState, useEffect, useMemo } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { useForm } from "react-hook-form";
// import axios from "axios";
// import {
//     ShoppingBag,
//     CreditCard,
//     Tag,
//     CheckCircle,

//     ChevronRight,
//     ShieldCheck,
//     MapPin,
//     Loader2,
//     ArrowLeft,

//     Truck,
//     PackageCheck
// } from "lucide-react";

// const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

// const Checkout = () => {
//     const { id } = useParams();
//     const navigate = useNavigate();

//     // States
//     const [checkoutItems, setCheckoutItems] = useState([]);
//     const [loadingProduct, setLoadingProduct] = useState(false);
//     const [deliveryCharge, setDeliveryCharge] = useState(80);

//     // Coupon States
//     const [couponCode, setCouponCode] = useState("");
//     const [appliedCoupon, setAppliedCoupon] = useState(null);
//     const [discountAmount, setDiscountAmount] = useState(0);
//     const [couponError, setCouponError] = useState("");
//     const [couponSuccess, setCouponSuccess] = useState("");
//     const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

//     // Order Submission State
//     const [isSubmitting, setIsSubmitting] = useState(false);
//     const [orderSuccessData, setOrderSuccessData] = useState(null);

//     // React Hook Form
//     const {
//         register,
//         handleSubmit,
//         watch,
//         formState: { errors },
//     } = useForm({
//         defaultValues: {
//             fullName: "",
//             phone: "",
//             email: "",
//             address: "",
//             area: "",
//             city: "Dhaka",
//             postalCode: "",
//             paymentMethod: "cash-on-delivery",
//             customerNote: "",
//         },
//     });

//     const selectedCity = watch("city");



//     const getItemImage = (item) => {
//         if (!item) return "/placeholder-image.jpg"; // ডিফোল্ট ইমেজ (public/placeholder-image.jpg)

//         // ১. যদি সরাসরি String URL দেওয়া থাকে
//         if (typeof item === "string") return item;

//         // ২. Database / Order Schema: item.thumbnail.url
//         if (item?.thumbnail?.url) return item.thumbnail.url;

//         // ৩. LocalStorage / Cart State: item.thumbnail (String)
//         if (typeof item?.thumbnail === "string") return item.thumbnail;

//         // ৪. item.image চেক (String নাকি Object দুইটাই হ্যান্ডেল করবে)
//         if (typeof item?.image === "string") return item.image;
//         if (item?.image?.url) return item.image.url;

//         // ৫. Images Array Fallback
//         if (Array.isArray(item?.images) && item.images.length > 0) {
//             return typeof item.images[0] === "string" ? item.images[0] : item.images[0]?.url;
//         }

//         // ৬. Nested Product Data Check
//         if (item?.productData) return getItemImage(item.productData);
//         if (item?.product && typeof item.product === "object") return getItemImage(item.product);

//         return "/placeholder-image.jpg";
//     };


//     // 1. Fetch direct product ("Buy Now") or load cart from LocalStorage
//     useEffect(() => {
//         if (id) {
//             const fetchSingleProduct = async () => {
//                 try {
//                     setLoadingProduct(true);
//                     const res = await axios.get(`${API_URL}/products/${id}`);
//                     const product = res.data.data || res.data;

//                     setCheckoutItems([
//                         {
//                             _id: product._id,
//                             name: product.name,
//                             sku: product.sku || "N/A",
//                             price: Number(product.price) || 0,
//                             salePrice: Number(product.salePrice) || Number(product.price) || 0,
//                             quantity: 1,
//                             color: product.colors?.[0] || "",
//                             size: product.sizes?.[0] || "",
//                             thumbnail: product.thumbnail || product.images?.[0] || "",
//                         },
//                     ]);
//                 } catch (err) {
//                     console.error("Product fetch error:", err);
//                 } finally {
//                     setLoadingProduct(false);
//                 }
//             };

//             fetchSingleProduct();
//         } else {
//             try {
//                 const savedCart = JSON.parse(localStorage.getItem("cartItems")) || [];
//                 setCheckoutItems(savedCart);
//             } catch (err) {
//                 console.error("Failed to parse cart items:", err);
//                 setCheckoutItems([]);
//             }
//         }
//     }, [id]);

//     // 2. Location-based Dynamic Delivery Fee Calculation
//     useEffect(() => {
//         if (selectedCity && selectedCity.toLowerCase() === "dhaka") {
//             setDeliveryCharge(80);
//         } else {
//             setDeliveryCharge(150);
//         }
//     }, [selectedCity]);

//     // Subtotal Memoization
//     const subtotal = useMemo(() => {
//         return checkoutItems.reduce((acc, item) => {
//             const activePrice = item.salePrice > 0 ? item.salePrice : item.price;
//             return acc + (Number(activePrice) || 0) * (Number(item.quantity) || 1);
//         }, 0);
//     }, [checkoutItems]);

//     // Dynamic Grand Total Calculation
//     const grandTotal = Math.max(0, subtotal + deliveryCharge - discountAmount);


//     const handleApplyCoupon = async () => {
//         setCouponError("");
//         setCouponSuccess("");

//         if (!couponCode.trim()) {
//             setCouponError("Please enter a coupon code.");
//             return;
//         }

//         try {
//             setIsApplyingCoupon(true);
//             const token = localStorage.getItem("token");
//             const isValidToken = token && token !== "null" && token !== "undefined" && token.trim() !== "";

//             // Guest এবং Auth User উভয়ের হেডার হ্যান্ডেল করা
//             const headers = {
//                 "Content-Type": "application/json"
//             };
//             if (isValidToken) {
//                 headers["Authorization"] = `Bearer ${token}`;
//             }

//             const res = await axios.post(
//                 `${API_URL}/coupons/apply`,
//                 {
//                     code: couponCode.trim(),
//                     subtotal: Number(subtotal) || 0
//                 },
//                 { headers }
//             );

//             if (res.data.success) {
//                 const couponData = res.data.data;

//                 // ডিসকাউন্ট এবং কুপন ডেটা সেভ
//                 setDiscountAmount(couponData.calculatedDiscount);
//                 setAppliedCoupon(couponData);

//                 const savedText = couponData.discountType === "percentage"
//                     ? `${couponData.discountValue}% (BDT ${couponData.calculatedDiscount})`
//                     : `BDT ${couponData.calculatedDiscount}`;

//                 setCouponSuccess(`Coupon applied successfully! Saved ${savedText}`);
//             }
//         } catch (err) {
//             setDiscountAmount(0);
//             setAppliedCoupon(null);
//             setCouponError(err.response?.data?.message || "Invalid or expired coupon code.");
//         } finally {
//             setIsApplyingCoupon(false);
//         }
//     };

//     // কুপন রিমুভ করার ফাংশন
//     const handleRemoveCoupon = () => {
//         setAppliedCoupon(null);
//         setDiscountAmount(0);
//         setCouponCode("");
//         setCouponSuccess("");
//         setCouponError("");
//     };



//     const onSubmitOrder = async (formData) => {
//         if (checkoutItems.length === 0) {
//             alert("Your checkout list is empty.");
//             return;
//         }

//         try {
//             setIsSubmitting(true);

//             // Cart Items ফরম্যাট করা
//             const formattedCartItems = checkoutItems.map((item) => {
//                 const realProductId = item.product?._id
//                     || (typeof item.product === "string" ? item.product : null)
//                     || item.productId
//                     || item._id;

//                 let thumbUrl = "";
//                 if (typeof item.thumbnail === "string" && item.thumbnail.trim() !== "") {
//                     thumbUrl = item.thumbnail;
//                 } else if (typeof getItemImage === "function") {
//                     thumbUrl = getItemImage(item);
//                 }

//                 return {
//                     product: realProductId,
//                     productId: realProductId,
//                     name: item.name || item.title || "",
//                     sku: item.sku || "N/A",
//                     quantity: Number(item.quantity) || 1,
//                     color: item.color || "",
//                     size: item.size || "",
//                     price: Number(item.salePrice || item.price || 0),
//                     thumbnail: thumbUrl,
//                 };
//             });

//             // Auth Token চেক
//             const token = localStorage.getItem("token");
//             const isValidToken = token && token !== "null" && token !== "undefined" && token.trim() !== "";

//             // টাকার অংক হিসাব করা
//             const computedSubtotal = checkoutItems.reduce((acc, item) => {
//                 return acc + (Number(item.salePrice || item.price || 0) * (Number(item.quantity) || 1));
//             }, 0);

//             const currentDeliveryCharge = Number(deliveryCharge) || 0;
//             const currentDiscount = appliedCoupon ? Number(discountAmount) || 0 : 0;
//             const computedTotalAmount = Math.max(0, computedSubtotal + currentDeliveryCharge - currentDiscount);

//             // 🟢 Payload প্রস্তুত করা
//             const payload = {
//                 cartItems: formattedCartItems,
//                 items: formattedCartItems,
//                 shippingAddress: {
//                     fullName: formData.fullName || "",
//                     phone: formData.phone || "",
//                     email: formData.email || "",
//                     address: formData.address || "",
//                     area: formData.area || "",
//                     city: formData.city || "",
//                     postalCode: formData.postalCode || "",
//                     country: "Bangladesh",
//                 },
//                 paymentMethod: formData.paymentMethod || "cod",

//                 // 💡 কুপন সেফটি ফিক্স: কুপন অ্যাপ্লাই করা থাকলেই কেবল কোড যাবে, নাহলে null পাঠাবে।
//                 couponCode: appliedCoupon && appliedCoupon.code ? appliedCoupon.code.trim() : null,
//                 couponId: appliedCoupon && appliedCoupon._id ? appliedCoupon._id : null,

//                 subtotal: computedSubtotal,
//                 discountAmount: currentDiscount,
//                 deliveryCharge: currentDeliveryCharge,
//                 shippingFee: currentDeliveryCharge,
//                 totalAmount: computedTotalAmount,
//                 grandTotal: computedTotalAmount,

//                 customerNote: formData.customerNote || "",
//                 isGuest: !isValidToken,
//             };

//             // হেডার্স ডায়নামিক সেট করা
//             const headers = {
//                 "Content-Type": "application/json"
//             };
//             if (isValidToken) {
//                 headers["Authorization"] = `Bearer ${token}`;
//             }

//             const response = await axios.post(`${API_URL}/orders`, payload, { headers });

//             if (response.data.success) {
//                 if (typeof id === "undefined" || !id) {
//                     localStorage.removeItem("cartItems");
//                     localStorage.removeItem("checkoutData");
//                     window.dispatchEvent(new Event("cartUpdated"));
//                 }
//                 setOrderSuccessData(response.data.order || response.data.data);
//             }
//         } catch (error) {
//             console.error("Order Submission Error Details:", error.response?.data);
//             const backendMsg = error.response?.data?.message
//                 || error.response?.data?.error
//                 || "Failed to place order. Please try again.";

//             alert(`Order Failed: ${backendMsg}`);
//         } finally {
//             setIsSubmitting(false);
//         }
//     };

//     // Loading State
//     if (loadingProduct) {
//         return (
//             <div className="min-h-screen flex items-center justify-center bg-slate-50">
//                 <div className="flex flex-col items-center gap-3">
//                     <Loader2 className="w-10 h-10 animate-spin text-slate-800" />
//                     <p className="text-sm font-medium text-slate-600">Loading checkout details...</p>
//                 </div>
//             </div>
//         );
//     }

//     // Success Screen Component
//     if (orderSuccessData) {
//         return (
//             <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
//                 <div className="bg-white rounded-3xl shadow-xl p-8 max-w-lg w-full text-center border border-slate-100">
//                     <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
//                         <CheckCircle className="w-12 h-12 text-emerald-600" />
//                     </div>
//                     <h6 className="text-xl font-bold text-slate-900">অর্ডার ট্র্যাকিংয়ের সুবিধার্থে অনুগ্রহ করে আপনার Order Numberটি সংরক্ষণ করে রাখুন। ✅</h6>
//                     <h2 className="text-2xl font-bold text-slate-900">Order Placed Successfully!</h2>
//                     <p className="text-slate-500 mt-2 text-sm">
//                         Thank you for shopping with us. We have received your order and are processing it.
//                     </p>

//                     <div className="bg-slate-50 rounded-2xl p-5 my-6 text-left border border-slate-100 text-sm space-y-3">
//                         <div className="flex justify-between items-center pb-2 border-b border-slate-200/60">
//                             <span className="text-slate-500">Order Number:</span>
//                             <span className="font-semibold text-slate-800 font-mono">{orderSuccessData.orderNumber || orderSuccessData._id}</span>
//                         </div>
//                         <div className="flex justify-between items-center pb-2 border-b border-slate-200/60">
//                             <span className="text-slate-500">Payment Method:</span>
//                             <span className="font-medium text-slate-800 uppercase">{orderSuccessData.payment.
//                                 method?.replace(/-/g, ' ')}</span>
//                         </div>
//                         <div className="flex justify-between items-center">
//                             <span className="text-slate-500">Grand Total:</span>
//                             <span className="font-bold text-emerald-600 text-base">BDT {orderSuccessData.grandTotal || grandTotal}</span>
//                         </div>
//                     </div>

//                     <button
//                         onClick={() => navigate("/")}
//                         className="w-full bg-slate-900 text-white font-semibold py-3.5 rounded-xl hover:bg-slate-800 transition active:scale-[0.98]"
//                     >
//                         Continue Shopping
//                     </button>
//                 </div>
//             </div>
//         );
//     }

//     return (
//         <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 font-sans">
//             <div className="max-w-7xl mx-auto">
//                 {/* Navigation Header */}
//                 <div className="mb-6 flex items-center justify-between">
//                     <div className="flex items-center gap-2 text-sm text-slate-500">
//                         <button
//                             type="button"
//                             onClick={() => navigate(-1)}
//                             className="flex items-center gap-1 hover:text-slate-900 transition-colors"
//                         >
//                             <ArrowLeft className="w-4 h-4" /> Back
//                         </button>
//                         <ChevronRight className="w-4 h-4" />
//                         <span className="text-slate-900 font-semibold">Checkout</span>
//                     </div>

//                     <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-white border border-slate-200 px-3 py-1.5 rounded-full shadow-sm">
//                         <ShieldCheck className="w-4 h-4 text-emerald-600" /> Encrypted Checkout
//                     </div>
//                 </div>

//                 <form onSubmit={handleSubmit(onSubmitOrder)} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
//                     {/* LEFT COLUMN: SHIPPING & PAYMENT */}
//                     <div className="lg:col-span-7 space-y-6">
//                         {/* Shipping Details */}
//                         <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-100">
//                             <div className="flex items-center gap-3 mb-6">
//                                 <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
//                                     <MapPin className="w-5 h-5" />
//                                 </div>
//                                 <div>
//                                     <h2 className="text-lg font-bold text-slate-800">Shipping Details</h2>
//                                     <p className="text-xs text-slate-500">Where should we deliver your order?</p>
//                                 </div>
//                             </div>

//                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                                 <div className="sm:col-span-2">
//                                     <label className="block text-xs font-semibold text-slate-600 uppercase mb-1.5">
//                                         Full Name *
//                                     </label>
//                                     <input
//                                         type="text"
//                                         placeholder="e.g. John Doe"
//                                         {...register("fullName", { required: "Full name is required" })}
//                                         className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition focus:border-blue-500 ${errors.fullName ? "border-red-500 bg-red-50/20" : "border-slate-200"
//                                             }`}
//                                     />
//                                     {errors.fullName && <span className="text-xs text-red-500 mt-1 block">{errors.fullName.message}</span>}
//                                 </div>

//                                 <div>
//                                     <label className="block text-xs font-semibold text-slate-600 uppercase mb-1.5">
//                                         Phone Number *
//                                     </label>
//                                     <input
//                                         type="tel"
//                                         placeholder="017XXXXXXXX"
//                                         {...register("phone", {
//                                             required: "Phone number is required",
//                                             pattern: { value: /^01[3-9]\d{8}$/, message: "Valid 11-digit mobile number required" }
//                                         })}
//                                         className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition focus:border-blue-500 ${errors.phone ? "border-red-500 bg-red-50/20" : "border-slate-200"
//                                             }`}
//                                     />
//                                     {errors.phone && <span className="text-xs text-red-500 mt-1 block">{errors.phone.message}</span>}
//                                 </div>

//                                 <div>
//                                     <label className="block text-xs font-semibold text-slate-600 uppercase mb-1.5">
//                                         Email Address (Optional)
//                                     </label>
//                                     <input
//                                         type="email"
//                                         placeholder="name@example.com"
//                                         {...register("email")}
//                                         className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-500 transition"
//                                     />
//                                 </div>

//                                 <div>
//                                     <label className="block text-xs font-semibold text-slate-600 uppercase mb-1.5">
//                                         City / District *
//                                     </label>
//                                     <select
//                                         {...register("city", { required: "City is required" })}
//                                         className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none bg-white focus:border-blue-500 transition"
//                                     >
//                                         <option value="Dhaka">Dhaka (Inside City)</option>
//                                         <option value="Chittagong">Chittagong</option>
//                                         <option value="Sylhet">Sylhet</option>
//                                         <option value="Rajshahi">Rajshahi</option>
//                                         <option value="Khulna">Khulna</option>
//                                         <option value="Barisal">Barisal</option>
//                                         <option value="Rangpur">Rangpur</option>
//                                         <option value="Mymensingh">Mymensingh</option>
//                                         <option value="Other">Outside Dhaka</option>
//                                     </select>
//                                 </div>

//                                 <div>
//                                     <label className="block text-xs font-semibold text-slate-600 uppercase mb-1.5">
//                                         Area / Thana *
//                                     </label>
//                                     <input
//                                         type="text"
//                                         placeholder="e.g. Uttara, Dhanmondi"
//                                         {...register("area", { required: "Area is required" })}
//                                         className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition focus:border-blue-500 ${errors.area ? "border-red-500 bg-red-50/20" : "border-slate-200"
//                                             }`}
//                                     />
//                                     {errors.area && <span className="text-xs text-red-500 mt-1 block">{errors.area.message}</span>}
//                                 </div>

//                                 <div className="sm:col-span-2">
//                                     <label className="block text-xs font-semibold text-slate-600 uppercase mb-1.5">
//                                         Full Address *
//                                     </label>
//                                     <input
//                                         type="text"
//                                         placeholder="House / Road / Block / Apartment details"
//                                         {...register("address", { required: "Address details are required" })}
//                                         className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition focus:border-blue-500 ${errors.address ? "border-red-500 bg-red-50/20" : "border-slate-200"
//                                             }`}
//                                     />
//                                     {errors.address && <span className="text-xs text-red-500 mt-1 block">{errors.address.message}</span>}
//                                 </div>

//                                 <div className="sm:col-span-2">
//                                     <label className="block text-xs font-semibold text-slate-600 uppercase mb-1.5">
//                                         Order Notes (Optional)
//                                     </label>
//                                     <textarea
//                                         rows={2}
//                                         placeholder="Notes about your order, e.g. special delivery instructions."
//                                         {...register("customerNote")}
//                                         className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-500 transition resize-none"
//                                     />
//                                 </div>
//                             </div>
//                         </div>

//                         {/* Payment Selection */}
//                         <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-100">
//                             <div className="flex items-center gap-3 mb-6">
//                                 <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
//                                     <CreditCard className="w-5 h-5" />
//                                 </div>
//                                 <div>
//                                     <h2 className="text-lg font-bold text-slate-800">Payment Option</h2>
//                                     <p className="text-xs text-slate-500">Choose how you wish to pay</p>
//                                 </div>
//                             </div>

//                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                                 <label className="border-2 border-emerald-500 bg-emerald-50/20 rounded-2xl p-4 flex gap-3 cursor-pointer transition">
//                                     <input
//                                         type="radio"
//                                         value="cash-on-delivery"
//                                         {...register("paymentMethod")}
//                                         defaultChecked
//                                         className="mt-0.5 text-emerald-600 focus:ring-emerald-500"
//                                     />
//                                     <div>
//                                         <span className="font-semibold text-sm text-slate-800 block">Cash on Delivery</span>
//                                         <span className="text-xs text-slate-500">Pay cash right at your doorstep upon receipt</span>
//                                     </div>
//                                 </label>
//                             </div>
//                         </div>
//                     </div>

//                     {/* RIGHT COLUMN: ORDER SUMMARY */}
//                     <div className="lg:col-span-5 space-y-6">
//                         <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-100 sticky top-6">
//                             <div className="flex items-center justify-between mb-4 pb-4 border-b">
//                                 <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
//                                     <ShoppingBag className="w-5 h-5 text-slate-600" />
//                                     Order Summary
//                                 </h2>
//                                 <span className="text-xs font-semibold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full">
//                                     {checkoutItems.length} {checkoutItems.length === 1 ? "Item" : "Items"}
//                                 </span>
//                             </div>

//                             {/* Cart List */}
//                             <div className="divide-y max-h-64 overflow-y-auto pr-1">
//                                 {checkoutItems.length === 0 ? (
//                                     <div className="py-8 text-center text-slate-400 text-sm">
//                                         Your cart is currently empty.
//                                     </div>
//                                 ) : (
//                                     checkoutItems.map((item, idx) => (
//                                         <div key={idx} className="py-3 flex gap-4 items-center">
//                                             {/* <img
//                                                 src={getItemImage(item.thumbnail)}
//                                                 alt={item.name}
//                                                 className="w-14 h-14 object-cover rounded-xl border border-slate-100 shrink-0 bg-slate-50"
//                                             /> */}

//                                             <img
//                                                 src={getItemImage(item)}
//                                                 alt={item.name}
//                                                 className="w-14 h-14 object-cover rounded-xl border border-slate-100 shrink-0 bg-slate-50"
//                                             />
//                                             <div className="flex-1 min-w-0">
//                                                 <h4 className="text-sm font-semibold text-slate-800 truncate">{item.name}</h4>
//                                                 <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
//                                                     <span>Qty: {item.quantity}</span>
//                                                     {item.size && <span>• Size: {item.size}</span>}
//                                                     {item.color && <span>• Color: {item.color}</span>}
//                                                 </div>
//                                             </div>
//                                             <div className="text-right">
//                                                 <span className="text-sm font-bold text-slate-800 block">
//                                                     BDT {(item.salePrice || item.price) * item.quantity}
//                                                 </span>
//                                             </div>
//                                         </div>
//                                     ))
//                                 )}
//                             </div>

//                             {/* Coupon Code Section */}
//                             <div className="mt-4 pt-4 border-t border-slate-100">
//                                 {appliedCoupon ? (
//                                     <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
//                                         <div className="flex items-center gap-2">
//                                             <Tag className="w-4 h-4 text-emerald-600" />
//                                             <span className="text-xs font-semibold text-emerald-800 uppercase">
//                                                 {appliedCoupon.code} (-BDT {discountAmount})
//                                             </span>
//                                         </div>
//                                         <button
//                                             type="button"
//                                             onClick={handleRemoveCoupon}
//                                             className="text-xs text-red-500 hover:text-red-700 font-medium"
//                                         >
//                                             Remove
//                                         </button>
//                                     </div>
//                                 ) : (
//                                     <div className="flex gap-2">

//                                         <div className="relative flex-1">
//                                             <input
//                                                 type="text"
//                                                 placeholder="Coupon code Optional"
//                                                 value={couponCode}
//                                                 onChange={(e) => setCouponCode(e.target.value)}
//                                                 className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm uppercase outline-none focus:border-slate-800 transition"
//                                             />
//                                         </div>
//                                         <button
//                                             type="button"
//                                             onClick={handleApplyCoupon}
//                                             disabled={isApplyingCoupon || !couponCode.trim()}
//                                             className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 rounded-xl transition disabled:bg-slate-300 flex items-center justify-center shrink-0"
//                                         >
//                                             {isApplyingCoupon ? <Loader2 className="w-4 h-4 animate-spin" /> : "Apply"}
//                                         </button>
//                                     </div>
//                                 )}

//                                 {couponError && <p className="text-xs text-red-500 mt-1.5">{couponError}</p>}
//                                 {couponSuccess && <p className="text-xs text-emerald-600 mt-1.5">{couponSuccess}</p>}
//                             </div>

//                             {/* Summary Totals */}
//                             <div className="mt-6 space-y-2.5 text-sm border-t border-slate-100 pt-4">
//                                 <div className="flex justify-between text-slate-600">
//                                     <span>Subtotal</span>
//                                     <span className="font-medium text-slate-800">BDT {subtotal}</span>
//                                 </div>

//                                 <div className="flex justify-between text-slate-600">
//                                     <span className="flex items-center gap-1.5">
//                                         <Truck className="w-4 h-4 text-slate-400" />
//                                         Delivery Fee ({selectedCity.toLowerCase() === 'dhaka' ? 'Inside Dhaka' : 'Outside Dhaka'})
//                                     </span>
//                                     <span className="font-medium text-slate-800">BDT {deliveryCharge}</span>
//                                 </div>



//                                 {discountAmount > 0 && (
//                                     <div className="flex justify-between text-emerald-600 font-medium">
//                                         <span>Discount</span>
//                                         <span>- BDT {discountAmount}</span>
//                                     </div>
//                                 )}

//                                 <div className="flex justify-between font-bold text-lg text-slate-900 border-t border-slate-100 pt-3 mt-2">
//                                     <span>Grand Total</span>
//                                     <span className="text-emerald-600">BDT {grandTotal}</span>
//                                 </div>
//                             </div>

//                             {/* Submit Button */}
//                             <button
//                                 type="submit"
//                                 disabled={isSubmitting || checkoutItems.length === 0}
//                                 className="w-full mt-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-emerald-600/20 transition flex items-center justify-center gap-2 disabled:bg-slate-300 disabled:shadow-none active:scale-[0.99]"
//                             >
//                                 {isSubmitting ? (
//                                     <>
//                                         <Loader2 className="w-5 h-5 animate-spin" />
//                                         Processing Order...
//                                     </>
//                                 ) : (
//                                     <>
//                                         <PackageCheck className="w-5 h-5" />
//                                         Place Order — BDT {grandTotal}
//                                     </>
//                                 )}
//                             </button>
//                         </div>
//                     </div>
//                 </form>
//             </div>
//         </div>
//     );
// };

// export default Checkout;



import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import axios from "axios";
import {
    ShoppingBag,
    CreditCard,
    Tag,
    CheckCircle,
    ChevronRight,
    ShieldCheck,
    MapPin,
    Loader2,
    ArrowLeft,
    Truck,
    X,
    PackageCheck
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const Checkout = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    // States
    const [checkoutItems, setCheckoutItems] = useState([]);
    const [loadingProduct, setLoadingProduct] = useState(false);
    const [deliveryCharge, setDeliveryCharge] = useState(80);

    // Coupon States
    const [couponCode, setCouponCode] = useState("");
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [discountAmount, setDiscountAmount] = useState(0);
    const [couponError, setCouponError] = useState("");
    const [couponSuccess, setCouponSuccess] = useState("");
    const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

    // Order Submission State
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [orderSuccessData, setOrderSuccessData] = useState(null);

    // React Hook Form
    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm({
        defaultValues: {
            fullName: "",
            phone: "",
            email: "",
            address: "",
            area: "",
            city: "Dhaka",

            postalCode: "",
            paymentMethod: "cash-on-delivery",
            customerNote: "",
        },
    });

    const selectedCity = watch("city");

    const getItemImage = (item) => {
        if (!item) return "/placeholder-image.jpg";

        if (typeof item === "string") return item;
        if (item?.thumbnail?.url) return item.thumbnail.url;
        if (typeof item?.thumbnail === "string") return item.thumbnail;
        if (typeof item?.image === "string") return item.image;
        if (item?.image?.url) return item.image.url;

        if (Array.isArray(item?.images) && item.images.length > 0) {
            return typeof item.images[0] === "string" ? item.images[0] : item.images[0]?.url;
        }

        if (item?.productData) return getItemImage(item.productData);
        if (item?.product && typeof item.product === "object") return getItemImage(item.product);

        return "/placeholder-image.jpg";
    };

    // // 1. Fetch direct product ("Buy Now") or load cart from LocalStorage

    useEffect(() => {
        const loadCheckoutData = async () => {
            const token = localStorage.getItem("token");
            const isAuthenticated = Boolean(
                token && token !== "null" && token !== "undefined" && token.trim() !== ""
            );

            // ১. কেস ১: Buy Now (সরাসরি ১টি প্রোডাক্ট)
            if (id) {
                try {
                    setLoadingProduct(true);
                    const config = {
                        headers: {
                            "Content-Type": "application/json",
                            ...(isAuthenticated && { Authorization: `Bearer ${token}` }),
                        },
                    };
                    const res = await axios.get(`${API_URL}/products/${id}`, config);
                    const product = res.data?.data || res.data;

                    const isFree = Boolean(
                        product?.freeShipping === true ||
                        product?.shipping?.freeShipping === true
                    );

                    setCheckoutItems([{
                        _id: product._id,
                        product: product._id,
                        name: product.name,
                        sku: product.sku || "N/A",
                        price: Number(product.price) || 0,
                        salePrice: Number(product.salePrice) || Number(product.price) || 0,
                        quantity: 1,
                        color: product.colors?.[0] || "",
                        size: product.sizes?.[0] || "",
                        thumbnail: product.thumbnail?.url || product.thumbnail || "",
                        freeShipping: isFree,
                        shipping: { freeShipping: isFree, weight: product.shipping?.weight || 0 },
                        product: product,
                    }]);
                } catch (err) {
                    console.error("Fetch error:", err);
                    setCheckoutItems([]);
                } finally {
                    setLoadingProduct(false);
                }
            }
            // ২. কেস ২: LocalStorage Cart (একাধিক প্রোডাক্ট)
            else {
                try {
                    setLoadingProduct(true);
                    const savedCart = JSON.parse(localStorage.getItem("cartItems")) || [];

                    // কার্টের ডাটাতে ফ্রি শিপিং না থাকলে API থেকে ফেচ করে নিশ্চিত করা
                    const updatedItems = await Promise.all(
                        savedCart.map(async (item) => {
                            // যদি কার্টেই ফ্রি শিপিং ট্রু থাকে
                            if (item.freeShipping === true || item.shipping?.freeShipping === true) {
                                return item;
                            }

                            // যদি কার্টে ফ্রি শিপিং না থাকে কিন্তু প্রোডাক্ট ID থাকে, এপিআই থেকে ডাটা চেক করা
                            const productId = item.product?._id || item.product || item._id;
                            if (productId && typeof productId === 'string') {
                                try {
                                    const res = await axios.get(`${API_URL}/products/${productId}`);
                                    const pData = res.data?.data || res.data;
                                    const isFree = Boolean(
                                        pData?.freeShipping === true ||
                                        pData?.shipping?.freeShipping === true
                                    );
                                    return {
                                        ...item,
                                        freeShipping: isFree,
                                        shipping: { ...item.shipping, freeShipping: isFree }
                                    };
                                } catch (e) {
                                    return item;
                                }
                            }
                            return item;
                        })
                    );

                    setCheckoutItems(updatedItems);
                } catch (err) {
                    console.error("Cart error:", err);
                    setCheckoutItems([]);
                } finally {
                    setLoadingProduct(false);
                }
            }
        };

        loadCheckoutData();
    }, [id]);

    // Free Shipping Detection
    const isFreeShipping = useMemo(() => {
        if (!checkoutItems || checkoutItems.length === 0) return false;

        return checkoutItems.some((item) => {
            if (item?.freeShipping === true) return true;
            if (item?.shipping?.freeShipping === true) return true;
            if (item?.product?.shipping?.freeShipping === true) return true;
            if (item?.productData?.shipping?.freeShipping === true) return true;
            return false;
        });
    }, [checkoutItems]);

    // 2. Dynamic Delivery Fee Calculation
    useEffect(() => {
        if (isFreeShipping) {
            setDeliveryCharge(0);
        } else if (selectedCity && selectedCity.toLowerCase() === "dhaka") {
            setDeliveryCharge(80);
        } else {
            setDeliveryCharge(150);
        }
    }, [selectedCity, isFreeShipping]);

    // Subtotal Memoization
    const subtotal = useMemo(() => {
        return checkoutItems.reduce((acc, item) => {
            const activePrice = item.salePrice > 0 ? item.salePrice : item.price;
            return acc + (Number(activePrice) || 0) * (Number(item.quantity) || 1);
        }, 0);
    }, [checkoutItems]);

    // Dynamic Grand Total Calculation
    const grandTotal = Math.max(0, subtotal + deliveryCharge - discountAmount);

    const handleApplyCoupon = async () => {
        setCouponError("");
        setCouponSuccess("");

        if (!couponCode.trim()) {
            setCouponError("Please enter a coupon code.");
            return;
        }

        try {
            setIsApplyingCoupon(true);
            const token = localStorage.getItem("token");
            const isValidToken = token && token !== "null" && token !== "undefined" && token.trim() !== "";

            const headers = {
                "Content-Type": "application/json"
            };
            if (isValidToken) {
                headers["Authorization"] = `Bearer ${token}`;
            }

            const res = await axios.post(
                `${API_URL}/coupons/apply`,
                {
                    code: couponCode.trim(),
                    subtotal: Number(subtotal) || 0
                },
                { headers }
            );

            if (res.data.success) {
                const couponData = res.data.data;

                setDiscountAmount(couponData.calculatedDiscount);
                setAppliedCoupon(couponData);

                const savedText = couponData.discountType === "percentage"
                    ? `${couponData.discountValue}% (BDT ${couponData.calculatedDiscount})`
                    : `BDT ${couponData.calculatedDiscount}`;

                setCouponSuccess(`Coupon applied successfully! Saved ${savedText}`);
            }
        } catch (err) {
            setDiscountAmount(0);
            setAppliedCoupon(null);
            setCouponError(err.response?.data?.message || "Invalid or expired coupon code.");
        } finally {
            setIsApplyingCoupon(false);
        }
    };

    const handleRemoveCoupon = () => {
        setAppliedCoupon(null);
        setDiscountAmount(0);
        setCouponCode("");
        setCouponSuccess("");
        setCouponError("");
    };

    const onSubmitOrder = async (formData) => {
        if (checkoutItems.length === 0) {
            alert("Your checkout list is empty.");
            return;
        }

        try {
            setIsSubmitting(true);

            const formattedCartItems = checkoutItems.map((item) => {
                const realProductId = item.product?._id
                    || (typeof item.product === "string" ? item.product : null)
                    || item.productId
                    || item._id;

                let thumbUrl = "";
                if (typeof item.thumbnail === "string" && item.thumbnail.trim() !== "") {
                    thumbUrl = item.thumbnail;
                } else if (typeof getItemImage === "function") {
                    thumbUrl = getItemImage(item);
                }

                return {
                    product: realProductId,
                    productId: realProductId,
                    name: item.name || item.title || "",
                    sku: item.sku || "N/A",
                    quantity: Number(item.quantity) || 1,
                    color: item.color || "",
                    size: item.size || "",
                    price: Number(item.salePrice || item.price || 0),
                    thumbnail: thumbUrl,
                };
            });

            const token = localStorage.getItem("token");
            const isValidToken = token && token !== "null" && token !== "undefined" && token.trim() !== "";

            const computedSubtotal = checkoutItems.reduce((acc, item) => {
                return acc + (Number(item.salePrice || item.price || 0) * (Number(item.quantity) || 1));
            }, 0);

            const currentDeliveryCharge = Number(deliveryCharge) || 0;
            const currentDiscount = appliedCoupon ? Number(discountAmount) || 0 : 0;
            const computedTotalAmount = Math.max(0, computedSubtotal + currentDeliveryCharge - currentDiscount);

            const payload = {
                cartItems: formattedCartItems,
                items: formattedCartItems,
                shippingAddress: {
                    fullName: formData.fullName || "",
                    phone: formData.phone || "",
                    email: formData.email || "",
                    address: formData.address || "",
                    area: formData.area || "",
                    city: formData.city || "",
                    postalCode: formData.postalCode || "",
                    country: "Bangladesh",
                },
                paymentMethod: formData.paymentMethod || "cod",
                couponCode: appliedCoupon && appliedCoupon.code ? appliedCoupon.code.trim() : null,
                couponId: appliedCoupon && appliedCoupon._id ? appliedCoupon._id : null,
                subtotal: computedSubtotal,
                discountAmount: currentDiscount,
                deliveryCharge: currentDeliveryCharge,
                shippingFee: currentDeliveryCharge,
                totalAmount: computedTotalAmount,
                grandTotal: computedTotalAmount,
                customerNote: formData.customerNote || "",
                isGuest: !isValidToken,
            };

            const headers = {
                "Content-Type": "application/json"
            };
            if (isValidToken) {
                headers["Authorization"] = `Bearer ${token}`;
            }

            const response = await axios.post(`${API_URL}/orders`, payload, { headers });

            if (response.data.success) {
                if (typeof id === "undefined" || !id) {
                    localStorage.removeItem("cartItems");
                    localStorage.removeItem("checkoutData");
                    window.dispatchEvent(new Event("cartUpdated"));
                }
                setOrderSuccessData(response.data.order || response.data.data);
            }
        } catch (error) {
            console.error("Order Submission Error Details:", error.response?.data);
            const backendMsg = error.response?.data?.message
                || error.response?.data?.error
                || "Failed to place order. Please try again.";

            alert(`Order Failed: ${backendMsg}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loadingProduct) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-10 h-10 animate-spin text-slate-800" />
                    <p className="text-sm font-medium text-slate-600">Loading checkout details...</p>
                </div>
            </div>
        );
    }

    if (orderSuccessData) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
                <div className="bg-white rounded-3xl shadow-xl p-8 max-w-lg w-full text-center border border-slate-100">
                    <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-12 h-12 text-emerald-600" />
                    </div>
                    <h6 className="text-sm font-semibold text-slate-700 mb-2">
                        অর্ডার ট্র্যাকিংয়ের সুবিধার্থে অনুগ্রহ করে আপনার Order Numberটি সংরক্ষণ করে রাখুন। ✅
                    </h6>
                    <h2 className="text-2xl font-bold text-slate-900">Order Placed Successfully!</h2>
                    <p className="text-slate-500 mt-2 text-sm">
                        Thank you for shopping with us. We have received your order and are processing it.
                    </p>

                    <div className="bg-slate-50 rounded-2xl p-5 my-6 text-left border border-slate-100 text-sm space-y-3">
                        <div className="flex justify-between items-center pb-2 border-b border-slate-200/60">
                            <span className="text-slate-500">Order Number:</span>
                            <span className="font-semibold text-slate-800 font-mono">
                                {orderSuccessData.orderNumber || orderSuccessData._id}
                            </span>
                        </div>
                        <div className="flex justify-between items-center pb-2 border-b border-slate-200/60">
                            <span className="text-slate-500">Payment Method:</span>
                            <span className="font-medium text-slate-800 uppercase">
                                {orderSuccessData.payment?.method?.replace(/-/g, " ") || "Cash on Delivery"}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-slate-500">Grand Total:</span>
                            <span className="font-bold text-emerald-600 text-base">
                                BDT {orderSuccessData.grandTotal || grandTotal}
                            </span>
                        </div>
                    </div>

                    <button
                        onClick={() => navigate("/")}
                        className="w-full bg-slate-900 text-white font-semibold py-3.5 rounded-xl hover:bg-slate-800 transition active:scale-[0.98]"
                    >
                        Continue Shopping
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-7xl mx-auto">
                {/* Navigation Header */}
                <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="flex items-center gap-1 hover:text-slate-900 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" /> Back
                        </button>
                        <ChevronRight className="w-4 h-4" />
                        <span className="text-slate-900 font-semibold">Checkout</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-white border border-slate-200 px-3 py-1.5 rounded-full shadow-sm">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" /> Encrypted Checkout
                    </div>
                </div>

                <form onSubmit={handleSubmit(onSubmitOrder)} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* LEFT COLUMN: SHIPPING & PAYMENT */}
                    <div className="lg:col-span-7 space-y-6">
                        {/* Shipping Details */}
                        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-100">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                                    <MapPin className="w-5 h-5" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-slate-800">Shipping Details</h2>
                                    <p className="text-xs text-slate-500">Where should we deliver your order?</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="sm:col-span-2">
                                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-1.5">
                                        Full Name *
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. John Doe"
                                        {...register("fullName", { required: "Full name is required" })}
                                        className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition focus:border-blue-500 ${errors.fullName ? "border-red-500 bg-red-50/20" : "border-slate-200"}`}
                                    />
                                    {errors.fullName && <span className="text-xs text-red-500 mt-1 block">{errors.fullName.message}</span>}
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-1.5">
                                        Phone Number *
                                    </label>
                                    <input
                                        type="tel"
                                        placeholder="017XXXXXXXX"
                                        {...register("phone", {
                                            required: "Phone number is required",
                                            pattern: { value: /^01[3-9]\d{8}$/, message: "Valid 11-digit mobile number required" }
                                        })}
                                        className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition focus:border-blue-500 ${errors.phone ? "border-red-500 bg-red-50/20" : "border-slate-200"}`}
                                    />
                                    {errors.phone && <span className="text-xs text-red-500 mt-1 block">{errors.phone.message}</span>}
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-1.5">
                                        Email Address (Optional)
                                    </label>
                                    <input
                                        type="email"
                                        placeholder="name@example.com"
                                        {...register("email")}
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-500 transition"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-1.5">
                                        City / District *
                                    </label>
                                    <select
                                        {...register("city", { required: "City is required" })}
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none bg-white focus:border-blue-500 transition"
                                    >
                                        <option value="Dhaka">Dhaka (Inside City)</option>
                                        <option value="Chittagong">Chittagong</option>
                                        <option value="Sylhet">Sylhet</option>
                                        <option value="Rajshahi">Rajshahi</option>
                                        <option value="Khulna">Khulna</option>
                                        <option value="Barisal">Barisal</option>
                                        <option value="Rangpur">Rangpur</option>
                                        <option value="Mymensingh">Mymensingh</option>
                                        <option value="Other">Outside Dhaka</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-1.5">
                                        Area / Thana *
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Uttara, Dhanmondi"
                                        {...register("area", { required: "Area is required" })}
                                        className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition focus:border-blue-500 ${errors.area ? "border-red-500 bg-red-50/20" : "border-slate-200"}`}
                                    />
                                    {errors.area && <span className="text-xs text-red-500 mt-1 block">{errors.area.message}</span>}
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-1.5">
                                        ZIP / Code *
                                    </label>
                                    <input
                                        type="number"
                                        placeholder="e.g. 1230"
                                        {...register("postalCode", {
                                            required: "Zip code is required",
                                            valueAsNumber: true
                                        })}
                                        className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition focus:border-blue-500 ${errors.area ? "border-red-500 bg-red-50/20" : "border-slate-200"
                                            }`}
                                    />
                                    {errors.area && <span className="text-xs text-red-500 mt-1 block">{errors.area.message}</span>}
                                </div>

                                <div className="sm:col-span-2">
                                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-1.5">
                                        Full Address *
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="House / Road / Block / Apartment details"
                                        {...register("address", { required: "Address details are required" })}
                                        className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition focus:border-blue-500 ${errors.address ? "border-red-500 bg-red-50/20" : "border-slate-200"}`}
                                    />
                                    {errors.address && <span className="text-xs text-red-500 mt-1 block">{errors.address.message}</span>}
                                </div>

                                <div className="sm:col-span-2">
                                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-1.5">
                                        Order Notes (Optional)
                                    </label>
                                    <textarea
                                        rows={2}
                                        placeholder="Notes about your order, e.g. special delivery instructions."
                                        {...register("customerNote")}
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-500 transition resize-none"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Payment Selection */}
                        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-100">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
                                    <CreditCard className="w-5 h-5" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-slate-800">Payment Option</h2>
                                    <p className="text-xs text-slate-500">Choose how you wish to pay</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <label className="border-2 border-emerald-500 bg-emerald-50/20 rounded-2xl p-4 flex gap-3 cursor-pointer transition">
                                    <input
                                        type="radio"
                                        value="cash-on-delivery"
                                        {...register("paymentMethod")}
                                        defaultChecked
                                        className="mt-0.5 text-emerald-600 focus:ring-emerald-500"
                                    />
                                    <div>
                                        <span className="font-semibold text-sm text-slate-800 block">Cash on Delivery</span>
                                        <span className="text-xs text-slate-500">Pay cash right at your doorstep upon receipt</span>
                                    </div>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: ORDER SUMMARY */}
                    <div className="lg:col-span-5 space-y-6">
                        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-100 sticky top-6">
                            <div className="flex items-center justify-between mb-4 pb-4 border-b">
                                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                    <ShoppingBag className="w-5 h-5 text-slate-600" />
                                    Order Summary
                                </h2>
                                <span className="text-xs font-semibold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full">
                                    {checkoutItems.length} {checkoutItems.length === 1 ? "Item" : "Items"}
                                </span>
                            </div>

                            {/* Cart List */}
                            <div className="divide-y max-h-64 overflow-y-auto pr-1">
                                {checkoutItems.length === 0 ? (
                                    <div className="py-8 text-center text-slate-400 text-sm">
                                        Your cart is currently empty.
                                    </div>
                                ) : (
                                    checkoutItems.map((item, idx) => (
                                        <div key={idx} className="py-3 flex gap-4 items-center">
                                            <img
                                                src={getItemImage(item)}
                                                alt={item.name}
                                                className="w-14 h-14 object-cover rounded-xl border border-slate-100 shrink-0 bg-slate-50"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-sm font-semibold text-slate-800 truncate">{item.name}</h4>
                                                <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                                                    <span>Qty: {item.quantity}</span>
                                                    {item.size && <span>• Size: {item.size}</span>}
                                                    {item.color && <span>• Color: {item.color}</span>}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-sm font-bold text-slate-800 block">
                                                    BDT {(item.salePrice || item.price) * item.quantity}
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Coupon Code Section */}
                            <div className="mt-4 pt-4 border-t border-slate-100">
                                {appliedCoupon ? (
                                    <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                                        <div className="flex items-center gap-2">
                                            <Tag className="w-4 h-4 text-emerald-600" />
                                            <span className="text-xs font-semibold text-emerald-800 uppercase">
                                                {appliedCoupon.code} (-BDT {discountAmount})
                                            </span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleRemoveCoupon}
                                            className="text-slate-400 hover:text-red-500 transition-colors p-1"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <div className="flex gap-2">
                                            <div className="relative flex-1">
                                                <Tag className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                                <input
                                                    type="text"
                                                    placeholder="Promo or Coupon code"
                                                    value={couponCode}
                                                    onChange={(e) => setCouponCode(e.target.value)}
                                                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs outline-none focus:border-blue-500 uppercase font-mono transition"
                                                />
                                            </div>
                                            <button
                                                type="button"
                                                onClick={handleApplyCoupon}
                                                disabled={isApplyingCoupon || !couponCode.trim()}
                                                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 disabled:opacity-50 transition shrink-0 flex items-center gap-1.5"
                                            >
                                                {isApplyingCoupon ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Apply"}
                                            </button>
                                        </div>
                                        {couponError && <p className="text-xs text-red-500 mt-1">{couponError}</p>}
                                        {couponSuccess && <p className="text-xs text-emerald-600 mt-1">{couponSuccess}</p>}
                                    </div>
                                )}
                            </div>

                            {/* Price Breakdown */}
                            <div className="mt-6 pt-4 border-t border-slate-100 space-y-2 text-sm">
                                <div className="flex justify-between text-slate-600">
                                    <span>Subtotal</span>
                                    <span className="font-semibold text-slate-800">BDT {subtotal}</span>
                                </div>

                                <div className="flex justify-between text-slate-600">
                                    <span className="flex items-center gap-1">
                                        <Truck className="w-4 h-4 text-slate-400" /> Delivery Charge
                                    </span>
                                    {isFreeShipping ? (
                                        <span className="font-semibold text-emerald-600 uppercase text-xs bg-emerald-50 px-2 py-0.5 rounded">
                                            Free
                                        </span>
                                    ) : (
                                        <span className="font-semibold text-slate-800">BDT {deliveryCharge}</span>
                                    )}
                                </div>

                                {discountAmount > 0 && (
                                    <div className="flex justify-between text-emerald-600">
                                        <span>Discount</span>
                                        <span className="font-semibold">- BDT {discountAmount}</span>
                                    </div>
                                )}

                                <div className="flex justify-between text-base font-bold text-slate-900 pt-3 border-t border-slate-100">
                                    <span>Total</span>
                                    <span className="text-emerald-600">BDT {grandTotal}</span>
                                </div>
                            </div>

                            {/* Order Placement Button */}
                            <button
                                type="submit"
                                disabled={isSubmitting || checkoutItems.length === 0}
                                className="w-full mt-6 bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-slate-800 active:scale-[0.98] disabled:opacity-50 transition shadow-lg shadow-slate-900/10 flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" /> Placing Order...
                                    </>
                                ) : (
                                    <>
                                        <PackageCheck className="w-5 h-5" /> Place Order
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Checkout;