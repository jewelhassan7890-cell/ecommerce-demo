import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://ecommerce-demo-ro6m48tke-style-and-closet.vercel.app';

const AdminHeroConfig = () => {
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Form States
    const [badgeText, setBadgeText] = useState('');
    const [subHeading, setSubHeading] = useState('');
    const [mainHeading, setMainHeading] = useState('');
    const [discountBadge, setDiscountBadge] = useState({ tag: '', discountText: '' });
    const [features, setFeatures] = useState([]);

    // Image Handling States
    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState('');

    // ১. ব্যাকএন্ড থেকে বর্তমান ডাটা লোড করা
    useEffect(() => {
        fetchCurrentHeroConfig();
    }, []);

    const fetchCurrentHeroConfig = async () => {
        try {
            const response = await axios.get(`${API_URL}/hero`);
            if (response.data?.success && response.data?.data) {
                const data = response.data.data;
                setBadgeText(data.badgeText || '');
                setSubHeading(data.subHeading || '');
                setMainHeading(data.mainHeading || '');
                setDiscountBadge(data.discountBadge || { tag: 'New Arrival', discountText: '30% OFF' });
                setFeatures(data.features || []);
                setImagePreview(data.bannerImage?.url || '');
            }
        } catch (error) {
            console.log(error)
            setMessage({ type: 'error', text: 'বর্তমান কনফিগারেশন লোড করা যায়নি।' });
        } finally {
            setFetching(false);
        }
    };

    // ২. নতুন ছবি সিলেক্ট হ্যান্ডলার
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedImage(file);
            setImagePreview(URL.createObjectURL(file)); // ব্রাউজারে ইনস্ট্যান্ট প্রিভিউ
        }
    };

    // ৩. ফিচার অবজেক্ট আপডেট হ্যান্ডলার
    const handleFeatureChange = (index, field, value) => {
        const updatedFeatures = [...features];
        updatedFeatures[index][field] = value;
        setFeatures(updatedFeatures);
    };

    // ৪. ফর্ম সাবমিট (FormData এর মাধ্যমে Cloudinary + Data পাঠানো)
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const formData = new FormData();
            formData.append('badgeText', badgeText);
            formData.append('subHeading', subHeading);
            formData.append('mainHeading', mainHeading);

            // Object & Array টেক্সট ফিল্ডগুলো JSON stringify করে পাঠাতে হবে
            formData.append('discountBadge', JSON.stringify(discountBadge));
            formData.append('features', JSON.stringify(features));

            // যদি নতুন ছবি আপলোড করা হয়
            if (selectedImage) {
                formData.append('image', selectedImage);
            }

            // JWT token পাঠাতে চাইলে localStorage থেকে রিড করতে পারেন
            const token = localStorage.getItem('token');

            const response = await axios.post(`${API_URL}/hero/admin`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: token ? `Bearer ${token}` : ''
                }
            });

            if (response.data?.success) {
                setMessage({ type: 'success', text: 'Hero Section সফলভাবে আপডেট হয়েছে!' });
                if (response.data.data?.bannerImage?.url) {
                    setImagePreview(response.data.data.bannerImage.url);
                }
            }
        } catch (error) {
            setMessage({
                type: 'error',
                text: error.response?.data?.message || 'আপডেট করতে সমস্যা হয়েছে।'
            });
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return <div className="p-10 text-center font-bold text-gray-600">ডাটা লোড হচ্ছে...</div>;
    }

    return (
        <div className="max-w-4xl mx-auto p-6 bg-white rounded-2xl shadow-lg my-10 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 pb-2 border-b">
                ⚙️ Hero Section Management Panel
            </h2>

            {/* Notification Message */}
            {message.text && (
                <div className={`p-4 rounded-xl mb-6 text-sm font-semibold ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">

                {/* Image Upload Section */}
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                        Banner Image (Cloudinary)
                    </label>

                    <div className="flex flex-col sm:flex-row items-center gap-6">
                        {imagePreview && (
                            <img
                                src={imagePreview}
                                alt="Preview"
                                className="w-32 h-32 object-cover rounded-xl shadow-md border"
                            />
                        )}
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-[#16213E] file:text-white hover:file:bg-[#0F172A] cursor-pointer"
                        />
                    </div>
                </div>

                {/* Text Fields Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                            Trusted Badge Text
                        </label>
                        <input
                            type="text"
                            value={badgeText}
                            onChange={(e) => setBadgeText(e.target.value)}
                            className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                            Sub Heading
                        </label>
                        <input
                            type="text"
                            value={subHeading}
                            onChange={(e) => setSubHeading(e.target.value)}
                            className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
                            required
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Main Heading
                    </label>
                    <input
                        type="text"
                        value={mainHeading}
                        onChange={(e) => setMainHeading(e.target.value)}
                        className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
                        required
                    />
                </div>

                {/* Discount Badge Grid */}
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                            Discount Tag Name
                        </label>
                        <input
                            type="text"
                            value={discountBadge.tag}
                            onChange={(e) => setDiscountBadge({ ...discountBadge, tag: e.target.value })}
                            className="w-full p-3 border rounded-xl bg-white outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                            Discount Text
                        </label>
                        <input
                            type="text"
                            value={discountBadge.discountText}
                            onChange={(e) => setDiscountBadge({ ...discountBadge, discountText: e.target.value })}
                            className="w-full p-3 border rounded-xl bg-white outline-none"
                        />
                    </div>
                </div>

                {/* Features List Section */}
                <div className="border-t pt-4">
                    <h3 className="text-lg font-bold text-gray-800 mb-3">Features Points</h3>
                    <div className="space-y-3">
                        {features.map((feature, idx) => (
                            <div key={idx} className="flex flex-col sm:flex-row items-center gap-3 p-3 bg-gray-50 rounded-xl border">
                                <input
                                    type="text"
                                    placeholder="Icon (Emoji)"
                                    value={feature.icon}
                                    onChange={(e) => handleFeatureChange(idx, 'icon', e.target.value)}
                                    className="w-full sm:w-20 p-2.5 border rounded-lg bg-white text-center"
                                    required
                                />
                                <input
                                    type="text"
                                    placeholder="Feature Text"
                                    value={feature.text}
                                    onChange={(e) => handleFeatureChange(idx, 'text', e.target.value)}
                                    className="w-full sm:flex-1 p-2.5 border rounded-lg bg-white"
                                    required
                                />
                                <input
                                    type="text"
                                    placeholder="Tailwind Bg Class (e.g. bg-green-100)"
                                    value={feature.bgColor}
                                    onChange={(e) => handleFeatureChange(idx, 'bgColor', e.target.value)}
                                    className="w-full sm:w-44 p-2.5 border rounded-lg bg-white text-sm"
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#16213E] hover:bg-[#0F172A] text-white font-bold py-4 rounded-xl shadow-lg transition-all duration-300 disabled:opacity-50"
                >
                    {loading ? 'আপলোড এবং সেভ হচ্ছে...' : 'Save & Update Hero Banner'}
                </button>

            </form>
        </div>
    );
};

export default AdminHeroConfig;