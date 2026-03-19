import axios from "axios"

const axiosClient =  axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL || 'https://algoforge-30zk.onrender.com',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
});


export default axiosClient;

