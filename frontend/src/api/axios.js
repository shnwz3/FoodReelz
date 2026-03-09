import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
    withCredentials: true,
});

// Request Interceptor: Logging & Metadata
api.interceptors.request.use(
    (config) => {
        // Senior Refinement: Can add dynamic headers here if needed
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
            // Unauthorized — Clear localized session if necessary and redirect
            console.warn("Unauthorized request — redirecting to login...");
            // window.location.href = '/login'; // Optional: handled by protected routes usually
        }

        console.error(`[API Error] ${error.config?.url}:`, error.message);
        return Promise.reject(error);
    }
);

export default api;
