import axios from "axios"

export const BASE_URL = import.meta.env.VITE_BACKEND_URL || 'https://algoforge-30zk.onrender.com';

const axiosClient = axios.create({
    baseURL: BASE_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Flag to prevent multiple refresh requests simultaneously
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve();
        }
    });
    failedQueue = [];
};

// Response interceptor — auto-refresh on 401
axiosClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Don't try to refresh for these endpoints
        const authEndpoints = ['/login', '/register', '/check', '/refresh-token', '/verify-otp'];
        const isAuthRequest = authEndpoints.some(endpoint => originalRequest.url?.includes(endpoint));

        if (error.response?.status === 401 && !originalRequest._retry && !isAuthRequest) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then(() => axiosClient(originalRequest));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                await axiosClient.post('/user/refresh-token');
                processQueue(null);
                return axiosClient(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError);
                // No redirect here — let the React app handle unauthorized state via Redux
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default axiosClient;
