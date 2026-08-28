import axios from "axios";

export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const API = axios.create({
    baseURL: `${API_URL}/cart`,
    withCredentials: true,
});

API.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// 1. Get Cart
export const getCart = async () => {
    const res = await API.get("/");
    return res.data;
};

// 2. Add Item to Cart
export const addToCartApi = async (cartData) => {
    const res = await API.post("/add", cartData);
    return res.data;
};

// 3. Update Quantity
export const updateCartQuantityApi = async (itemId, quantity) => {
    const res = await API.patch(`/item/${itemId}`, { quantity });
    return res.data;
};

// 4. Remove Item
export const removeCartItemApi = async (itemId) => {
    const res = await API.delete(`/item/${itemId}`);
    return res.data;
};

// 5. Clear Cart
export const clearCartApi = async () => {
    const res = await API.delete("/clear");
    return res.data;
};



