import axios from "axios"

export const BASE_URL = import.meta.env.VITE_BACKEND_URL || 'https://algoforge-30zk.onrender.com';

const axiosClient =  axios.create({
    baseURL: BASE_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
});


export default axiosClient;

