import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Response interceptor to handle token refresh automatically
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        
        // If response is unauthorized (401) and we haven't retried yet
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                // Trigger token refresh endpoint on the backend
                await axios.post(`${API_URL}/auth/refresh`, {}, { withCredentials: true });
                // Retry the original request
                return api(originalRequest);
            } catch (refreshError) {
                // If refresh fails, log out the user on client
                if (typeof window !== 'undefined') {
                    window.dispatchEvent(new Event('auth-logout'));
                }
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);
