import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
});

// Request Interceptor
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response Interceptor (এটাই আসল ফিক্স)
api.interceptors.response.use(
    (response) => {
        // ব্যাকএন্ড যদি { success: true, data: { user } } পাঠায়, 
        // তবে ফ্রন্টএন্ডে সরাসরি response.data.data বা response.data এক্সট্র্যাক্ট করে নিন
        return response.data;
    },
    (error) => Promise.reject(error)
);

// Auth API Calls
export const registerApi = (formData) =>
    api.post('/auth/register', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });

export const loginApi = (credentials) => api.post('/auth/login', credentials);

export const googleApi = (googleData) => api.post('/auth/google', googleData);

export const getProfileApi = () => api.get('/auth/profile');

export default api;