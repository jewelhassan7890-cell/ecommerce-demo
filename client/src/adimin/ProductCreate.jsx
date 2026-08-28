import React, { useState, useEffect } from "react";
import API from "../api/axios";

const ProductCreate = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });

    // File Previews & Management
    const [thumbnailPreview, setThumbnailPreview] = useState(null);
    const [galleryPreviews, setGalleryPreviews] = useState([]);

    // Temporary Array Input States
    const [colorInput, setColorInput] = useState("");
    const [sizeInput, setSizeInput] = useState("");
    const [keywordInput, setKeywordInput] = useState("");

    // Main Form State
    const [formData, setFormData] = useState({
        name: "",
        slug: "",
        sku: "",
        shortDescription: "",
        description: "",
        category: "",
        price: "",
        salePrice: "",
        currency: "BDT",
        stock: 0,
        stockStatus: "in-stock",
        colors: [],
        sizes: [],
        shipping: {
            weight: 0,
            freeShipping: false,
        },
        seo: {
            metaTitle: "",
            metaDescription: "",
            keywords: [],
        },
        // Aligned exact structure with backend facebookEmbed
        facebookEmbed: {
            reelUrl: "",
            photoPostUrl: "",
            fbPostId: null,
            fbReelId: null,
            lastFbPostAt: null,
        },
        isFeatured: false,
        isNewArrival: false,
        isOnSale: false,
        isActive: true,
    });

    // File States
    const [thumbnailFile, setThumbnailFile] = useState(null);
    const [galleryFiles, setGalleryFiles] = useState([]);

    // Cleanup Object URLs to prevent memory leaks
    useEffect(() => {
        return () => {
            if (thumbnailPreview) URL.revokeObjectURL(thumbnailPreview);
            galleryPreviews.forEach((url) => URL.revokeObjectURL(url));
        };
    }, [thumbnailPreview, galleryPreviews]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await API.get("/categories");
                setCategories(res.data.data || res.data || []);
            } catch (err) {
                console.error("Failed to load categories:", err);
            }
        };
        fetchCategories();
    }, []);

    const generateSlug = (text) => {
        return text
            .toLowerCase()
            .replace(/[^\w ]+/g, "")
            .replace(/ +/g, "-");
    };

    const generateRandomSKU = () => {
        const prefix = formData.name ? formData.name.substring(0, 3).toUpperCase() : "PROD";
        const randomNum = Math.floor(1000 + Math.random() * 9000);
        return `${prefix}-${randomNum}`;
    };

    // Helper to extract FB Reel ID or Post ID from full URLs
    const extractFbId = (url) => {
        if (!url) return null;
        const matches = url.match(/(?:reels?|posts|videos|pfbid0)\/([a-zA-Z0-9]+)/);
        return matches ? matches[1] : null;
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (name === "name") {
            setFormData((prev) => ({
                ...prev,
                name: value,
                slug: generateSlug(value),
            }));
        } else {
            setFormData((prev) => ({
                ...prev,
                [name]: type === "checkbox" ? checked : value,
            }));
        }
    };

    const handleNestedChange = (parent, field, value) => {
        setFormData((prev) => ({
            ...prev,
            [parent]: {
                ...prev[parent],
                [field]: value,
            },
        }));
    };

    // Handler specifically for Facebook Reel / Post inputs
    const handleFacebookEmbedChange = (field, value) => {
        setFormData((prev) => {
            const extractedId = extractFbId(value);
            const isReel = field === "reelUrl";

            return {
                ...prev,
                facebookEmbed: {
                    ...prev.facebookEmbed,
                    [field]: value,
                    [isReel ? "fbReelId" : "fbPostId"]: extractedId,
                    lastFbPostAt: value ? new Date().toISOString() : prev.facebookEmbed.lastFbPostAt,
                },
            };
        });
    };

    // Safe Array Handlers
    const handleAddArrayItem = (e, fieldPath, value, setValue) => {
        if ((e.key === "Enter" || e.type === "click") && value.trim()) {
            e.preventDefault();

            const newItem = value.trim();
            if (fieldPath.includes(".")) {
                const [parent, child] = fieldPath.split(".");
                setFormData((prev) => {
                    const currentArray = Array.isArray(prev[parent]?.[child]) ? prev[parent][child] : [];
                    return {
                        ...prev,
                        [parent]: {
                            ...prev[parent],
                            [child]: [...currentArray, newItem],
                        },
                    };
                });
            } else {
                setFormData((prev) => {
                    const currentArray = Array.isArray(prev[fieldPath]) ? prev[fieldPath] : [];
                    return {
                        ...prev,
                        [fieldPath]: [...currentArray, newItem],
                    };
                });
            }
            setValue("");
        }
    };

    const handleRemoveArrayItem = (fieldPath, index) => {
        if (fieldPath.includes(".")) {
            const [parent, child] = fieldPath.split(".");
            setFormData((prev) => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: (Array.isArray(prev[parent]?.[child]) ? prev[parent][child] : []).filter((_, i) => i !== index),
                },
            }));
        } else {
            setFormData((prev) => ({
                ...prev,
                [fieldPath]: (Array.isArray(prev[fieldPath]) ? prev[fieldPath] : []).filter((_, i) => i !== index),
            }));
        }
    };

    const handleThumbnailChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (thumbnailPreview) URL.revokeObjectURL(thumbnailPreview);
            setThumbnailFile(file);
            setThumbnailPreview(URL.createObjectURL(file));
        }
    };

    const handleGalleryChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
        if (galleryFiles.length + selectedFiles.length > 8) {
            alert("Maximum 8 images allowed in gallery.");
            return;
        }
        const updatedFiles = [...galleryFiles, ...selectedFiles];
        setGalleryFiles(updatedFiles);

        galleryPreviews.forEach((url) => URL.revokeObjectURL(url));
        const updatedPreviews = updatedFiles.map((file) => URL.createObjectURL(file));
        setGalleryPreviews(updatedPreviews);
    };

    const handleRemoveGalleryImage = (index) => {
        URL.revokeObjectURL(galleryPreviews[index]);
        const updatedFiles = galleryFiles.filter((_, i) => i !== index);
        const updatedPreviews = galleryPreviews.filter((_, i) => i !== index);
        setGalleryFiles(updatedFiles);
        setGalleryPreviews(updatedPreviews);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.category) {
            setMessage({ type: "error", text: "Please select a valid category." });
            return;
        }

        setLoading(true);
        setMessage({ type: "", text: "" });

        try {
            const payload = new FormData();

            payload.append("name", formData.name.trim());
            payload.append("slug", formData.slug.trim());
            payload.append("sku", formData.sku.trim());
            payload.append("shortDescription", formData.shortDescription.trim());
            payload.append("description", formData.description.trim());
            payload.append("category", formData.category);
            payload.append("price", Number(formData.price) || 0);

            if (formData.salePrice !== "" && formData.salePrice !== null && formData.salePrice !== undefined) {
                payload.append("salePrice", Number(formData.salePrice));
            }

            payload.append("currency", formData.currency);
            payload.append("stock", Number(formData.stock) || 0);
            payload.append("stockStatus", formData.stockStatus);
            payload.append("isFeatured", formData.isFeatured);
            payload.append("isNewArrival", formData.isNewArrival);
            payload.append("isOnSale", formData.isOnSale);
            payload.append("isActive", formData.isActive);

            // JSON Stringify object and arrays
            payload.append("colors", JSON.stringify(Array.isArray(formData.colors) ? formData.colors : []));
            payload.append("sizes", JSON.stringify(Array.isArray(formData.sizes) ? formData.sizes : []));
            payload.append("shipping", JSON.stringify(formData.shipping));
            payload.append("seo", JSON.stringify(formData.seo));

            // Append exact facebookEmbed JSON structure
            payload.append("facebookEmbed", JSON.stringify(formData.facebookEmbed));

            if (thumbnailFile) {
                payload.append("thumbnail", thumbnailFile);
            }
            galleryFiles.forEach((file) => {
                payload.append("gallery", file);
            });

            const res = await API.post("/products", payload);

            setMessage({ type: "success", text: res.data.message || "Product created successfully!" });
        } catch (err) {
            setMessage({
                type: "error",
                text: err.response?.data?.message || err.message || "Failed to create product.",
            });
        } finally {
            setLoading(false);
        }
    };

    const safeColors = Array.isArray(formData.colors) ? formData.colors : [];
    const safeSizes = Array.isArray(formData.sizes) ? formData.sizes : [];
    const safeKeywords = Array.isArray(formData.seo?.keywords) ? formData.seo.keywords : [];

    return (
        <div className="max-w-6xl mx-auto p-6 bg-white shadow-md rounded-lg my-8">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-3">Add New Product</h2>

            {message.text && (
                <div
                    className={`p-4 mb-6 rounded ${message.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                        }`}
                >
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Details */}
                <div className="bg-gray-50 p-4 rounded border space-y-4">
                    <h3 className="font-semibold text-gray-700">1. Basic Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Product Name *</label>
                            <input
                                type="text"
                                name="name"
                                required
                                maxLength="200"
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="Wireless Headphones"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Slug *</label>
                            <input
                                type="text"
                                name="slug"
                                required
                                value={formData.slug}
                                onChange={handleChange}
                                className="w-full border p-2 rounded bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="wireless-headphones"
                            />
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <label className="block text-sm font-medium">SKU *</label>
                                <button
                                    type="button"
                                    onClick={() => setFormData((p) => ({ ...p, sku: generateRandomSKU() }))}
                                    className="text-xs text-blue-600 hover:underline"
                                >
                                    Auto Generate
                                </button>
                            </div>
                            <input
                                type="text"
                                name="sku"
                                required
                                value={formData.sku}
                                onChange={handleChange}
                                className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none uppercase"
                                placeholder="PROD-1024"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Category *</label>
                        <select
                            name="category"
                            required
                            value={formData.category}
                            onChange={handleChange}
                            className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                            <option value="">Select Category</option>
                            {categories.map((cat) => (
                                <option key={cat._id || cat.id} value={cat._id || cat.id}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Pricing & Stock */}
                <div className="bg-gray-50 p-4 rounded border space-y-4">
                    <h3 className="font-semibold text-gray-700">2. Pricing & Inventory</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Regular Price *</label>
                            <input
                                type="number"
                                name="price"
                                required
                                min="0"
                                value={formData.price}
                                onChange={handleChange}
                                className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Sale Price</label>
                            <input
                                type="number"
                                name="salePrice"
                                min="0"
                                value={formData.salePrice}
                                onChange={handleChange}
                                className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Currency</label>
                            <input
                                type="text"
                                name="currency"
                                value={formData.currency}
                                onChange={handleChange}
                                className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none uppercase"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Stock Quantity</label>
                            <input
                                type="number"
                                name="stock"
                                min="0"
                                value={formData.stock}
                                onChange={handleChange}
                                className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Stock Status</label>
                        <select
                            name="stockStatus"
                            value={formData.stockStatus}
                            onChange={handleChange}
                            className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                            <option value="in-stock">In Stock</option>
                            <option value="out-of-stock">Out of Stock</option>
                            <option value="pre-order">Pre-Order</option>
                        </select>
                    </div>
                </div>

                {/* Variants */}
                <div className="bg-gray-50 p-4 rounded border space-y-4">
                    <h3 className="font-semibold text-gray-700">3. Variants</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium mb-1">Color Options</label>
                            <div className="flex gap-2 mb-2">
                                <input
                                    type="text"
                                    value={colorInput}
                                    onChange={(e) => setColorInput(e.target.value)}
                                    onKeyDown={(e) => handleAddArrayItem(e, "colors", colorInput, setColorInput)}
                                    className="w-full border p-2 rounded outline-none"
                                    placeholder="e.g. Red (Press Enter)"
                                />
                                <button
                                    type="button"
                                    onClick={(e) => handleAddArrayItem(e, "colors", colorInput, setColorInput)}
                                    className="bg-gray-800 text-white px-4 rounded hover:bg-black transition"
                                >
                                    Add
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {safeColors.map((color, idx) => (
                                    <span key={idx} className="bg-blue-100 text-blue-800 text-sm px-2.5 py-1 rounded-full flex items-center gap-2">
                                        {color}
                                        <button type="button" onClick={() => handleRemoveArrayItem("colors", idx)} className="text-red-500 hover:text-red-700 font-bold">×</button>
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Size Options</label>
                            <div className="flex gap-2 mb-2">
                                <input
                                    type="text"
                                    value={sizeInput}
                                    onChange={(e) => setSizeInput(e.target.value)}
                                    onKeyDown={(e) => handleAddArrayItem(e, "sizes", sizeInput, setSizeInput)}
                                    className="w-full border p-2 rounded outline-none"
                                    placeholder="e.g. XL (Press Enter)"
                                />
                                <button
                                    type="button"
                                    onClick={(e) => handleAddArrayItem(e, "sizes", sizeInput, setSizeInput)}
                                    className="bg-gray-800 text-white px-4 rounded hover:bg-black transition"
                                >
                                    Add
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {safeSizes.map((size, idx) => (
                                    <span key={idx} className="bg-green-100 text-green-800 text-sm px-2.5 py-1 rounded-full flex items-center gap-2">
                                        {size}
                                        <button type="button" onClick={() => handleRemoveArrayItem("sizes", idx)} className="text-red-500 hover:text-red-700 font-bold">×</button>
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Description */}
                <div className="bg-gray-50 p-4 rounded border space-y-4">
                    <h3 className="font-semibold text-gray-700">4. Product Description</h3>
                    <div>
                        <label className="block text-sm font-medium mb-1">Short Description</label>
                        <textarea
                            name="shortDescription"
                            rows="2"
                            maxLength="500"
                            value={formData.shortDescription}
                            onChange={handleChange}
                            className="w-full border p-2 rounded outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Brief highlights..."
                        ></textarea>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Full Description</label>
                        <textarea
                            name="description"
                            rows="5"
                            value={formData.description}
                            onChange={handleChange}
                            className="w-full border p-2 rounded outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Detailed product specification..."
                        ></textarea>
                    </div>
                </div>

                {/* Media Upload */}
                <div className="bg-gray-50 p-4 rounded border space-y-4">
                    <h3 className="font-semibold text-gray-700">5. Media</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium mb-1">Thumbnail Image</label>
                            <input type="file" accept="image/*" onChange={handleThumbnailChange} className="w-full border p-2 bg-white rounded mb-2" />
                            {thumbnailPreview && (
                                <div className="mt-2">
                                    <img src={thumbnailPreview} alt="Thumbnail Preview" className="h-32 w-32 object-cover rounded border" />
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Gallery Images (Max 8)</label>
                            <input type="file" accept="image/*" multiple onChange={handleGalleryChange} className="w-full border p-2 bg-white rounded mb-2" />
                            <div className="flex flex-wrap gap-2 mt-2">
                                {galleryPreviews.map((src, idx) => (
                                    <div key={idx} className="relative group">
                                        <img src={src} alt="Gallery Preview" className="h-20 w-20 object-cover rounded border" />
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveGalleryImage(idx)}
                                            className="absolute top-0 right-0 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Shipping */}
                <div className="bg-gray-50 p-4 rounded border space-y-4">
                    <h3 className="font-semibold text-gray-700">6. Shipping</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                        <div>
                            <label className="block text-sm font-medium mb-1">Weight (KG)</label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={formData.shipping.weight}
                                onChange={(e) => handleNestedChange("shipping", "weight", Number(e.target.value))}
                                className="w-full border p-2 rounded outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div className="flex items-center pt-5">
                            <label className="flex items-center gap-2 cursor-pointer text-sm font-medium">
                                <input
                                    type="checkbox"
                                    checked={formData.shipping.freeShipping}
                                    onChange={(e) => handleNestedChange("shipping", "freeShipping", e.target.checked)}
                                    className="w-4 h-4 text-blue-600 rounded"
                                />
                                Free Shipping
                            </label>
                        </div>
                    </div>
                </div>

                {/* SEO */}
                <div className="bg-gray-50 p-4 rounded border space-y-4">
                    <h3 className="font-semibold text-gray-700">7. SEO</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Meta Title</label>
                            <input
                                type="text"
                                value={formData.seo.metaTitle}
                                onChange={(e) => handleNestedChange("seo", "metaTitle", e.target.value)}
                                className="w-full border p-2 rounded outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Meta Description</label>
                            <textarea
                                rows="2"
                                value={formData.seo.metaDescription}
                                onChange={(e) => handleNestedChange("seo", "metaDescription", e.target.value)}
                                className="w-full border p-2 rounded outline-none focus:ring-2 focus:ring-blue-500"
                            ></textarea>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Keywords</label>
                            <div className="flex gap-2 mb-2">
                                <input
                                    type="text"
                                    value={keywordInput}
                                    onChange={(e) => setKeywordInput(e.target.value)}
                                    onKeyDown={(e) => handleAddArrayItem(e, "seo.keywords", keywordInput, setKeywordInput)}
                                    className="w-full border p-2 rounded outline-none"
                                    placeholder="e.g. bluetooth (Press Enter)"
                                />
                                <button
                                    type="button"
                                    onClick={(e) => handleAddArrayItem(e, "seo.keywords", keywordInput, setKeywordInput)}
                                    className="bg-gray-800 text-white px-4 rounded hover:bg-black transition"
                                >
                                    Add
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {safeKeywords.map((kw, idx) => (
                                    <span key={idx} className="bg-purple-100 text-purple-800 text-sm px-2.5 py-1 rounded-full flex items-center gap-2">
                                        {kw}
                                        <button type="button" onClick={() => handleRemoveArrayItem("seo.keywords", idx)} className="text-red-500 hover:text-red-700 font-bold">×</button>
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Visibility Flags */}
                <div className="bg-gray-50 p-4 rounded border">
                    <h3 className="font-semibold text-gray-700 mb-3">8. Visibility & Flags</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <label className="flex items-center gap-2 cursor-pointer text-sm font-medium">
                            <input
                                type="checkbox"
                                name="isFeatured"
                                checked={formData.isFeatured}
                                onChange={handleChange}
                                className="w-4 h-4 text-blue-600 rounded"
                            />
                            Featured
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer text-sm font-medium">
                            <input
                                type="checkbox"
                                name="isNewArrival"
                                checked={formData.isNewArrival}
                                onChange={handleChange}
                                className="w-4 h-4 text-blue-600 rounded"
                            />
                            New Arrival
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer text-sm font-medium">
                            <input
                                type="checkbox"
                                name="isOnSale"
                                checked={formData.isOnSale}
                                onChange={handleChange}
                                className="w-4 h-4 text-blue-600 rounded"
                            />
                            On Sale
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer text-sm font-medium">
                            <input
                                type="checkbox"
                                name="isActive"
                                checked={formData.isActive}
                                onChange={handleChange}
                                className="w-4 h-4 text-blue-600 rounded"
                            />
                            Active / Published
                        </label>
                    </div>
                </div>

                {/* 9. Facebook Embed Details */}
                <div className="bg-gray-50 p-4 rounded border space-y-4">
                    <h3 className="font-semibold text-gray-700">9. Facebook Embed Integrations</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Facebook Reel URL (`reelUrl`)</label>
                            <input
                                type="url"
                                value={formData.facebookEmbed.reelUrl}
                                onChange={(e) => handleFacebookEmbedChange("reelUrl", e.target.value)}
                                className="w-full border p-2 rounded outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="https://www.facebook.com/reel/123456789"
                            />
                            {formData.facebookEmbed.fbReelId && (
                                <p className="text-xs text-green-600 mt-1">
                                    Detected Reel ID: <strong>{formData.facebookEmbed.fbReelId}</strong>
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Facebook Photo/Post URL (`photoPostUrl`)</label>
                            <input
                                type="url"
                                value={formData.facebookEmbed.photoPostUrl}
                                onChange={(e) => handleFacebookEmbedChange("photoPostUrl", e.target.value)}
                                className="w-full border p-2 rounded outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="https://www.facebook.com/posts/123456789"
                            />
                            {formData.facebookEmbed.fbPostId && (
                                <p className="text-xs text-green-600 mt-1">
                                    Detected Post ID: <strong>{formData.facebookEmbed.fbPostId}</strong>
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Submit Action */}
                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className={`px-6 py-2.5 bg-blue-600 text-white font-medium rounded hover:bg-blue-700 transition ${loading ? "opacity-50 cursor-not-allowed" : ""
                            }`}
                    >
                        {loading ? "Creating Product..." : "Create Product"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ProductCreate;