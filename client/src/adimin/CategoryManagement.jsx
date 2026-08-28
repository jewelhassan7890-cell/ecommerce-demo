import React, { useEffect, useState } from 'react';
import {
    getAllCategoriesAdmin,
    updateCategory,
    createCategory,
    toggleCategoryStatus,
    deleteCategory,
    restoreCategory
} from '../api/categoryApi';

const CategoryManagement = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState({ page: 1, limit: 10, search: '' });

    // Form State
    const [editId, setEditId] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        description: '',
        image: { url: '', public_id: '' },
        sortOrder: 0,
        isActive: true,
    });

    useEffect(() => {
        loadCategories();
    }, [filters]);

    const loadCategories = async () => {
        setLoading(true);
        try {
            // Clean params object
            const cleanParams = {};
            if (filters.page) cleanParams.page = filters.page;
            if (filters.limit) cleanParams.limit = filters.limit;
            if (filters.search && filters.search.trim() !== "") {
                cleanParams.search = filters.search.trim();
            }

            const res = await getAllCategoriesAdmin(cleanParams);
            if (res?.success) {
                // Ensure data is array
                setCategories(Array.isArray(res.data) ? res.data : []);
            }
        } catch (err) {
            console.error("API Error details:", err.response?.data);
            alert(err.response?.data?.message || 'Error fetching categories');
        } finally {
            setLoading(false);
        }
    };

    // Auto-generate slug from name
    const handleNameChange = (e) => {
        const name = e.target.value;
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        setFormData({ ...formData, name, slug });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editId) {
                await updateCategory(editId, formData);
                alert('Category updated successfully');
            } else {
                await createCategory(formData);
                alert('Category created successfully');
            }
            resetForm();
            loadCategories();
        } catch (err) {
            alert(err.response?.data?.message || 'Operation failed');
        }
    };

    const handleEdit = (cat) => {
        const id = cat._id || cat.id;
        if (!id) {
            alert('Invalid Category ID');
            return;
        }
        setEditId(id);
        setFormData({
            name: cat.name || '',
            slug: cat.slug || '',
            description: cat.description || '',
            image: cat.image || { url: '', public_id: '' },
            sortOrder: cat.sortOrder || 0,
            isActive: cat.isActive ?? true,
        });
    };

    const handleToggle = async (id) => {
        if (!id) {
            alert('Invalid Category ID');
            return;
        }
        try {
            await toggleCategoryStatus(id);
            loadCategories();
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || 'Toggle status failed');
        }
    };

    const handleDelete = async (id) => {
        if (!id) {
            alert('Invalid Category ID');
            return;
        }
        if (window.confirm('Are you sure you want to soft delete this category?')) {
            try {
                await deleteCategory(id);
                loadCategories();
            } catch (err) {
                console.error(err);
                alert(err.response?.data?.message || 'Delete failed');
            }
        }
    };

    const handleRestore = async (id) => {
        if (!id) {
            alert('Invalid Category ID');
            return;
        }
        try {
            await restoreCategory(id);
            loadCategories();
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || 'Restore failed');
        }
    };

    const resetForm = () => {
        setEditId(null);
        setFormData({
            name: '',
            slug: '',
            description: '',
            image: { url: '', public_id: '' },
            sortOrder: 0,
            isActive: true,
        });
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen space-y-8">
            <h1 className="text-2xl font-bold text-gray-800">Category Management (Admin)</h1>

            {/* Category Create/Edit Form */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-lg font-semibold mb-4">
                    {editId ? 'Edit Category' : 'Create New Category'}
                </h2>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Category Name</label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={handleNameChange}
                            className="mt-1 block w-full border rounded-md p-2 border-gray-300"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Slug</label>
                        <input
                            type="text"
                            required
                            value={formData.slug}
                            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                            className="mt-1 block w-full border rounded-md p-2 bg-gray-100 border-gray-300"
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700">Description</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="mt-1 block w-full border rounded-md p-2 border-gray-300"
                            rows="2"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Image URL</label>
                        <input
                            type="text"
                            value={formData.image.url}
                            onChange={(e) => setFormData({ ...formData, image: { ...formData.image, url: e.target.value } })}
                            className="mt-1 block w-full border rounded-md p-2 border-gray-300"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Sort Order</label>
                        <input
                            type="number"
                            value={formData.sortOrder}
                            onChange={(e) => setFormData({ ...formData, sortOrder: Number(e.target.value) })}
                            className="mt-1 block w-full border rounded-md p-2 border-gray-300"
                        />
                    </div>

                    <div className="md:col-span-2 flex items-center space-x-3 pt-2">
                        <button
                            type="submit"
                            className="bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-700"
                        >
                            {editId ? 'Update Category' : 'Create Category'}
                        </button>
                        {editId && (
                            <button
                                type="button"
                                onClick={resetForm}
                                className="bg-gray-400 text-white px-5 py-2 rounded-md hover:bg-gray-500"
                            >
                                Cancel
                            </button>
                        )}
                    </div>
                </form>
            </div>

            {/* Category Table */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">Category List</h2>
                    <input
                        type="text"
                        placeholder="Search categories..."
                        onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                        className="border rounded-md p-2 text-sm w-64 border-gray-300"
                    />
                </div>

                {loading ? (
                    <div>Loading table...</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b bg-gray-100 text-gray-600 text-sm">
                                    <th className="p-3">Image</th>
                                    <th className="p-3">Name</th>
                                    <th className="p-3">Slug</th>
                                    <th className="p-3">Order</th>
                                    <th className="p-3">Status</th>
                                    <th className="p-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {categories.map((cat) => {
                                    const catId = cat._id || cat.id;
                                    return (
                                        <tr key={catId || cat.slug} className={`border-b ${cat.isDeleted ? 'bg-red-50' : 'hover:bg-gray-50'}`}>
                                            <td className="p-3">
                                                {cat.image?.url ? (
                                                    <img src={cat.image.url} alt={cat.name} className="w-10 h-10 object-cover rounded" />
                                                ) : (
                                                    <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center text-xs">No Img</div>
                                                )}
                                            </td>
                                            <td className="p-3 font-medium">{cat.name}</td>
                                            <td className="p-3 text-sm text-gray-500">{cat.slug}</td>
                                            <td className="p-3 text-sm">{cat.sortOrder}</td>
                                            <td className="p-3">
                                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${cat.isActive ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                    {cat.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="p-3 text-right space-x-2">
                                                {!cat.isDeleted ? (
                                                    <>
                                                        <button
                                                            onClick={() => handleToggle(catId)}
                                                            className="text-xs bg-gray-200 px-2 py-1 rounded hover:bg-gray-300"
                                                        >
                                                            Toggle
                                                        </button>
                                                        <button
                                                            onClick={() => handleEdit(cat)}
                                                            className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded hover:bg-blue-200"
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(catId)}
                                                            className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded hover:bg-red-200"
                                                        >
                                                            Delete
                                                        </button>
                                                    </>
                                                ) : (
                                                    <button
                                                        onClick={() => handleRestore(catId)}
                                                        className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded hover:bg-green-200"
                                                    >
                                                        Restore
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CategoryManagement;