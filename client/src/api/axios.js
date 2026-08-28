import axios from "axios";

export const API_URL = import.meta.env.VITE_API_URL || "https://ecommerce-demo-ro6m48tke-style-and-closet.vercel.app";

const API = axios.create({
    baseURL: API_URL,
});

// Admin JWT Token Interceptor
API.interceptors.request.use((config) => {
    const token = localStorage.getItem("token"); // অথবা আপনার Auth State / Cookie
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default API;