import axios from 'axios';

// Vite Environment Variable dynamically loaded with Fallback
const BASE_URL = import.meta.env.VITE_API_URL || 'https://ecommerce-demo-ro6m48tke-style-and-closet.vercel.app';

// Axios Instance Config for Categories
const api = axios.create({
    baseURL: `${BASE_URL}/categories`,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Axios Instance Config for General API calls (like products)
const mainApi = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request Interceptor: Auth Token ইনজেক্ট করা
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// ==========================================
// Public APIs
// ==========================================

// 1. Get Public Categories
export const getPublicCategories = async () => {
    try {
        const response = await api.get('/', {
            headers: {
                "Cache-Control": "no-cache, no-store, must-revalidate",
                "Pragma": "no-cache"
            }
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching categories:", error);
        throw error;
    }
};

export const getCategoryById = async (id) => {
    const response = await api.get(`/${id}`);
    return response.data;
};

// 2. Get Category Products API Function
export const getCategoryProducts = async ({ slug, inStock, sort, page = 1, limit = 8 }) => {
    try {
        const response = await mainApi.get("/products", {
            params: {
                category: slug,
                inStock: inStock ? "true" : undefined,
                sort: sort || "newest",
                page,
                limit
            },
            headers: {
                "Cache-Control": "no-cache, no-store, must-revalidate",
                "Pragma": "no-cache"
            }
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching category products:", error);
        throw error;
    }
};

// ==========================================
// Admin APIs
// ==========================================
export const createCategory = async (categoryData) => {
    const response = await api.post('/admin', categoryData);
    return response.data;
};

export const getAllCategoriesAdmin = async (params = {}) => {
    const response = await api.get('/admin', { params });
    return response.data;
};

export const updateCategory = async (id, categoryData) => {
    const response = await api.patch(`/admin/${id}`, categoryData);
    return response.data;
};

export const toggleCategoryStatus = async (id) => {
    const response = await api.patch(`/admin/${id}/toggle`);
    return response.data;
};

export const deleteCategory = async (id) => {
    const response = await api.delete(`/${id}`);
    return response.data;
};

export const restoreCategory = async (id) => {
    const response = await api.patch(`/admin/${id}/restore`);
    return response.data;
};




