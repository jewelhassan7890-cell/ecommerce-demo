import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Trash2, UploadCloud, Image as ImageIcon, Loader2 } from 'lucide-react';
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const AdminCarousel = () => {
    const [carousels, setCarousels] = useState([]);
    const [title, setTitle] = useState('');
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    // Fetch Images
    const fetchCarousels = async () => {
        try {
            const res = await axios.get(`${BASE_URL}/carousel`);
            if (res.data.success) setCarousels(res.data.data);
        } catch (error) {
            console.log(error)
            alert('Error loading carousels');
        } finally {
            setFetching(false);
        }
    };

    useEffect(() => {
        fetchCarousels();
    }, []);

    // Image Selection & Preview
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    // Upload Form Submit
    const handleUpload = async (e) => {
        e.preventDefault();
        if (!image) return alert('Please select an image!');

        const formData = new FormData();
        formData.append('title', title);
        formData.append('image', image);

        try {
            setLoading(true);
            const token = localStorage.getItem('token'); // Your JWT auth token

            const res = await axios.post(`${BASE_URL}/carousel`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`,
                },
            });

            if (res.data.success) {
                setTitle('');
                setImage(null);
                setPreview(null);
                fetchCarousels();
                alert('Carousel Image Uploaded Successfully!');
            }
        } catch (error) {
            alert(error.response?.data?.message || 'Upload failed!');
        } finally {
            setLoading(false);
        }
    };

    // Delete Image
    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this image?')) return;

        try {
            const token = localStorage.getItem('token');
            const res = await axios.delete(`${BASE_URL}/carousel/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (res.data.success) {
                setCarousels(carousels.filter((item) => item._id !== id));
            }
        } catch (error) {
            console.log(error)
            alert('Failed to delete image!');
        }
    };

    return (
        <div className="p-4 sm:p-8 max-w-6xl mx-auto">
            <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-800 flex items-center gap-2">
                <ImageIcon className="w-8 h-8 text-blue-600" /> Carousel Management
            </h1>

            {/* Upload Box */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 mb-8">
                <h2 className="text-lg font-semibold mb-4 text-gray-700">Add New Carousel Image</h2>
                <form onSubmit={handleUpload} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Title (Optional)</label>
                        <input
                            type="text"
                            placeholder="e.g. Quality Banner"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Upload File</label>
                        <div className="flex items-center justify-center w-full">
                            <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-2xl cursor-pointer bg-gray-50 hover:bg-gray-100 border-gray-300">
                                {preview ? (
                                    <img src={preview} alt="Preview" className="h-36 object-contain rounded-lg" />
                                ) : (
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <UploadCloud className="w-10 h-10 text-gray-400 mb-2" />
                                        <p className="text-sm text-gray-500">Click to upload or drag & drop</p>
                                    </div>
                                )}
                                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                            </label>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition flex justify-center items-center gap-2 disabled:bg-blue-400"
                    >
                        {loading ? <Loader2 className="animate-spin w-5 h-5" /> : 'Upload Image'}
                    </button>
                </form>
            </div>

            {/* Image Gallery Grid */}
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Active Carousel List</h2>
            {fetching ? (
                <p>Loading...</p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {carousels.map((item) => (
                        <div key={item._id} className="bg-white rounded-2xl border shadow-sm overflow-hidden relative group">
                            <img src={item.imageUrl} alt={item.title} className="w-full h-48 object-cover" />
                            <div className="p-4 flex justify-between items-center">
                                <p className="text-sm font-medium text-gray-700 truncate">{item.title || 'Untitled Image'}</p>
                                <button
                                    onClick={() => handleDelete(item._id)}
                                    className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdminCarousel;