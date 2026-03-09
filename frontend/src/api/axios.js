import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
    withCredentials: true,
});

// Request Interceptor: Logging & Metadata
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

// Response Interceptor: Global Error Handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response ? error.response.status : null;

        if (status === 401) {
            // Unauthorized — Clear local session
            console.warn("Unauthorized request — clearing session and redirecting...");
            localStorage.removeItem('user');
            localStorage.removeItem('foodPartner');
            localStorage.removeItem('token');
            // window.location.href = '/user/login'; 
        }

        console.error(`[API Error] ${error.config?.url}:`, error.message);
        return Promise.reject(error);
    }
);

export default api;
