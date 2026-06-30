import axios from "axios"

export const BASE_URL = import.meta.env.VITE_BACKEND_URL || 'https://algoforge-30zk.onrender.com';

const axiosClient = axios.create({
    baseURL: BASE_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Clerk token injection — set from React context via setClerkGetToken()
let _clerkGetToken = null;

export const setClerkGetToken = (fn) => {
    _clerkGetToken = fn;
};

// Request interceptor — inject Clerk JWT token
axiosClient.interceptors.request.use(
    async (config) => {
        if (_clerkGetToken) {
            try {
                const token = await _clerkGetToken();
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
            } catch (e) {
                console.error("Failed to fetch Clerk token", e);
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);
// Response interceptor — just pass through errors (Clerk handles token refresh)
axiosClient.interceptors.response.use(
    (response) => response,
    (error) => {
        return Promise.reject(error);
    }
);

export default axiosClient;
