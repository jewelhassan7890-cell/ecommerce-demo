import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import API from "../api/axios";

const ProductEdit = () => {
    // 1. Matches both :identifier OR :id from React Router
    const params = useParams();
    const identifier = params.identifier || params.id;
    const navigate = useNavigate();

    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });

    // Existing Image Preview States
    const [existingThumbnail, setExistingThumbnail] = useState("");
    const [existingGallery, setExistingGallery] = useState([]);

    // New File Selection & Previews
    const [thumbnailFile, setThumbnailFile] = useState(null);
    const [thumbnailPreview, setThumbnailPreview] = useState(null);
    const [galleryFiles, setGalleryFiles] = useState([]);
    const [galleryPreviews, setGalleryPreviews] = useState([]);

    // Array Inputs Temp State
    const [colorInput, setColorInput] = useState("");
    const [sizeInput, setSizeInput] = useState("");

    const [formData, setFormData] = useState({
        name: "",
        category: "",
        price: "",
        salePrice: "",
        stock: 0,
        stockStatus: "in-stock",
        shortDescription: "",
        description: "",
        colors: [],
        sizes: [],
        isFeatured: false,
        isNewArrival: false,
        isOnSale: false,
        isActive: true,
        shipping: { weight: 0, freeShipping: false },
        seo: { metaTitle: "", metaDescription: "", keywords: [] },
    });

    // Fetch Product & Categories Data
    useEffect(() => {
        const fetchData = async () => {
            // 🛑 Safety Guard: Avoid calling API if identifier is missing or literally "undefined"
            if (!identifier || identifier === "undefined") {
                setMessage({ type: "error", text: "সঠিক প্রোডাক্ট আইডি পাওয়া যায়নি।" });
                setLoading(false);
                return;
            }

            try {
                const [productRes, categoryRes] = await Promise.all([
                    API.get(`/products/${identifier}`),
                    API.get("/categories"),
                ]);

                const product = productRes.data?.data || productRes.data;
                setCategories(categoryRes.data?.data || categoryRes.data || []);

                if (product) {
                    setFormData({
                        name: product.name || "",
                        category: product.category?._id || product.category || "",
                        price: product.price || "",
                        salePrice: product.salePrice || "",
                        stock: product.stock || 0,
                        stockStatus: product.stockStatus || "in-stock",
                        shortDescription: product.shortDescription || "",
                        description: product.description || "",
                        colors: product.colors || [],
                        sizes: product.sizes || [],
                        isFeatured: product.isFeatured || false,
                        isNewArrival: product.isNewArrival || false,
                        isOnSale: product.isOnSale || false,
                        isActive: product.isActive ?? true,
                        shipping: product.shipping || { weight: 0, freeShipping: false },
                        seo: product.seo || { metaTitle: "", metaDescription: "", keywords: [] },
                    });

                    if (product.thumbnail?.url) setExistingThumbnail(product.thumbnail.url);
                    if (product.gallery) setExistingGallery(product.gallery.map((img) => img.url));
                }
            } catch (err) {
                setMessage({
                    type: "error",
                    text: err.response?.data?.message || "প্রোডাক্টের ডাটা লোড করা সম্ভব হয়নি।",
                });
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [identifier]);

    // Cleanup Blob URLs to prevent memory leak
    useEffect(() => {
        return () => {
            if (thumbnailPreview) URL.revokeObjectURL(thumbnailPreview);
            galleryPreviews.forEach((url) => URL.revokeObjectURL(url));
        };
    }, [thumbnailPreview, galleryPreviews]);

    // Handle Standard Inputs
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleNestedChange = (parent, field, value) => {
        setFormData((prev) => ({
            ...prev,
            [parent]: { ...prev[parent], [field]: value },
        }));
    };

    // Array Handlers (Colors / Sizes)
    const handleAddArrayItem = (e, field, value, setValue) => {
        if ((e.key === "Enter" || e.type === "click") && value.trim()) {
            e.preventDefault();
            setFormData((prev) => ({
                ...prev,
                [field]: [...prev[field], value.trim()],
            }));
            setValue("");
        }
    };

    const handleRemoveArrayItem = (field, index) => {
        setFormData((prev) => ({
            ...prev,
            [field]: prev[field].filter((_, i) => i !== index),
        }));
    };

    // Handle File Selection
    const handleThumbnailChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setThumbnailFile(file);
            setThumbnailPreview(URL.createObjectURL(file));
        }
    };

    const handleGalleryChange = (e) => {
        const files = Array.from(e.target.files);
        setGalleryFiles(files);
        setGalleryPreviews(files.map((file) => URL.createObjectURL(file)));
    };

    // Submit Updated Product
    const handleUpdate = async (e) => {
        e.preventDefault();

        if (!identifier || identifier === "undefined") {
            setMessage({ type: "error", text: "প্রোডাক্ট আইডি অকার্যকর!" });
            return;
        }

        setUpdating(true);
        setMessage({ type: "", text: "" });

        try {
            const payload = new FormData();

            payload.append("name", formData.name);
            payload.append("category", formData.category);
            payload.append("price", formData.price);
            if (formData.salePrice) payload.append("salePrice", formData.salePrice);
            payload.append("stock", formData.stock);
            payload.append("stockStatus", formData.stockStatus);
            payload.append("shortDescription", formData.shortDescription);
            payload.append("description", formData.description);
            payload.append("isFeatured", formData.isFeatured);
            payload.append("isNewArrival", formData.isNewArrival);
            payload.append("isOnSale", formData.isOnSale);
            payload.append("isActive", formData.isActive);

            // Send Complex Types as JSON Strings
            payload.append("colors", JSON.stringify(formData.colors));
            payload.append("sizes", JSON.stringify(formData.sizes));
            payload.append("shipping", JSON.stringify(formData.shipping));
            payload.append("seo", JSON.stringify(formData.seo));

            if (thumbnailFile) payload.append("thumbnail", thumbnailFile);
            galleryFiles.forEach((file) => payload.append("gallery", file));

            const res = await API.put(`/products/${identifier}`, payload, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            setMessage({ type: "success", text: res.data.message || "প্রোডাক্ট আপডেট সফল হয়েছে!" });
            setTimeout(() => navigate("/admin/productlist"), 1500);
        } catch (err) {
            setMessage({
                type: "error",
                text: err.response?.data?.message || "আপডেট করা সম্ভব হয়নি!",
            });
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return <div className="text-center py-16 font-bold text-gray-600">ডাটা লোড হচ্ছে...</div>;
    }

    return (
        <div className="max-w-5xl mx-auto p-6 bg-white shadow-md rounded-lg my-8">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
                <h2 className="text-2xl font-bold text-gray-800">প্রোডাক্ট সম্পাদনা করুন (Edit)</h2>
                <Link
                    to="/admin/products"
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg transition"
                >
                    ← তালিকায় ফিরে যান
                </Link>
            </div>

            {message.text && (
                <div
                    className={`p-4 mb-6 rounded-lg text-sm font-medium ${message.type === "success"
                        ? "bg-green-100 text-green-700 border border-green-200"
                        : "bg-red-100 text-red-700 border border-red-200"
                        }`}
                >
                    {message.text}
                </div>
            )}

            <form onSubmit={handleUpdate} className="space-y-6">
                {/* Title & Category */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">প্রোডাক্টের নাম *</label>
                        <input
                            type="text"
                            name="name"
                            required
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full border p-2.5 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">ক্যাটাগরি *</label>
                        <select
                            name="category"
                            required
                            value={formData.category}
                            onChange={handleChange}
                            className="w-full border p-2.5 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                            <option value="">ক্যাটাগরি সিলেক্ট করুন</option>
                            {categories.map((cat) => (
                                <option key={cat._id} value={cat._id}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Price, Sale Price, Stock & Status */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">মূল্য *</label>
                        <input
                            type="number"
                            name="price"
                            required
                            value={formData.price}
                            onChange={handleChange}
                            className="w-full border p-2.5 rounded-md"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">ছাড়ের মূল্য</label>
                        <input
                            type="number"
                            name="salePrice"
                            value={formData.salePrice}
                            onChange={handleChange}
                            className="w-full border p-2.5 rounded-md"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">স্টক</label>
                        <input
                            type="number"
                            name="stock"
                            value={formData.stock}
                            onChange={handleChange}
                            className="w-full border p-2.5 rounded-md"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">স্টক স্ট্যাটাস</label>
                        <select
                            name="stockStatus"
                            value={formData.stockStatus}
                            onChange={handleChange}
                            className="w-full border p-2.5 rounded-md"
                        >
                            <option value="in-stock">In Stock</option>
                            <option value="out-of-stock">Out of Stock</option>
                            <option value="pre-order">Pre-Order</option>
                        </select>
                    </div>
                </div>

                {/* Colors & Sizes Input */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">কালার</label>
                        <div className="flex gap-2 mb-2">
                            <input
                                type="text"
                                value={colorInput}
                                onChange={(e) => setColorInput(e.target.value)}
                                onKeyDown={(e) => handleAddArrayItem(e, "colors", colorInput, setColorInput)}
                                className="w-full border p-2 rounded-md text-sm"
                                placeholder="যেমন: Black (Enter প্রেস করুন)"
                            />
                            <button
                                type="button"
                                onClick={(e) => handleAddArrayItem(e, "colors", colorInput, setColorInput)}
                                className="bg-gray-800 text-white px-3 py-1.5 rounded-md text-xs"
                            >
                                যোগ
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                            {formData.colors.map((color, idx) => (
                                <span key={idx} className="bg-blue-50 text-blue-700 text-xs px-2.5 py-1 rounded border flex items-center gap-1.5">
                                    {color}
                                    <button type="button" onClick={() => handleRemoveArrayItem("colors", idx)} className="text-red-500 font-bold hover:text-red-700">×</button>
                                </span>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">সাইজ</label>
                        <div className="flex gap-2 mb-2">
                            <input
                                type="text"
                                value={sizeInput}
                                onChange={(e) => setSizeInput(e.target.value)}
                                onKeyDown={(e) => handleAddArrayItem(e, "sizes", sizeInput, setSizeInput)}
                                className="w-full border p-2 rounded-md text-sm"
                                placeholder="যেমন: XL (Enter প্রেস করুন)"
                            />
                            <button
                                type="button"
                                onClick={(e) => handleAddArrayItem(e, "sizes", sizeInput, setSizeInput)}
                                className="bg-gray-800 text-white px-3 py-1.5 rounded-md text-xs"
                            >
                                যোগ
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                            {formData.sizes.map((size, idx) => (
                                <span key={idx} className="bg-green-50 text-green-700 text-xs px-2.5 py-1 rounded border flex items-center gap-1.5">
                                    {size}
                                    <button type="button" onClick={() => handleRemoveArrayItem("sizes", idx)} className="text-red-500 font-bold hover:text-red-700">×</button>
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Descriptions */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">সংক্ষিপ্ত বিবরণ</label>
                    <textarea
                        name="shortDescription"
                        rows="2"
                        value={formData.shortDescription}
                        onChange={handleChange}
                        className="w-full border p-2.5 rounded-md text-sm"
                    ></textarea>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">বিস্তারিত বিবরণ</label>
                    <textarea
                        name="description"
                        rows="4"
                        value={formData.description}
                        onChange={handleChange}
                        className="w-full border p-2.5 rounded-md text-sm"
                    ></textarea>
                </div>

                {/* Images Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t pt-4">
                    {/* Thumbnail */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">থাম্বনেইল ইমেজ</label>
                        <div className="mb-2">
                            {thumbnailPreview ? (
                                <img src={thumbnailPreview} alt="New Preview" className="h-24 w-24 object-cover rounded border" />
                            ) : existingThumbnail ? (
                                <img src={existingThumbnail} alt="Current Thumbnail" className="h-24 w-24 object-cover rounded border" />
                            ) : null}
                        </div>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleThumbnailChange}
                            className="w-full text-xs text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 cursor-pointer border p-1 rounded"
                        />
                    </div>

                    {/* Gallery */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">গ্যালারি ইমেজসমূহ</label>
                        <div className="flex flex-wrap gap-2 mb-2">
                            {galleryPreviews.length > 0
                                ? galleryPreviews.map((url, i) => (
                                    <img key={i} src={url} alt={`New Gallery ${i}`} className="h-16 w-16 object-cover rounded border" />
                                ))
                                : existingGallery.map((url, i) => (
                                    <img key={i} src={url} alt={`Gallery ${i}`} className="h-16 w-16 object-cover rounded border" />
                                ))}
                        </div>
                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleGalleryChange}
                            className="w-full text-xs text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 cursor-pointer border p-1 rounded"
                        />
                    </div>
                </div>

                {/* Status Options */}
                <div className="flex flex-wrap gap-6 border-t pt-4 text-sm text-gray-700">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={formData.shipping.freeShipping}
                            onChange={(e) => handleNestedChange("shipping", "freeShipping", e.target.checked)}
                            className="rounded text-blue-600 focus:ring-blue-500"
                        />
                        ফ্রি শিপিং
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" name="isFeatured" checked={formData.isFeatured} onChange={handleChange} className="rounded text-blue-600 focus:ring-blue-500" />
                        Featured Product
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" name="isNewArrival" checked={formData.isNewArrival} onChange={handleChange} className="rounded text-blue-600 focus:ring-blue-500" />
                        New Arrival
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleChange} className="rounded text-blue-600 focus:ring-blue-500" />
                        Active on Store
                    </label>
                </div>

                {/* Submit */}
                <button
                    type="submit"
                    disabled={updating}
                    className="w-full bg-green-600 text-white py-3 rounded-md font-semibold hover:bg-green-700 transition disabled:bg-gray-400 cursor-pointer"
                >
                    {updating ? "আপডেট হচ্ছে..." : "প্রোডাক্ট আপডেট করুন"}
                </button>
            </form>
        </div>
    );
};

export default ProductEdit;