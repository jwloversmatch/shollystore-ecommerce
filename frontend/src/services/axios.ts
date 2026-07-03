import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
});

// ---------- Request interceptor: attach token ----------
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ---------- Response interceptor: handle global errors ----------
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // The server responded with a status code outside 2xx
      const status = error.response.status;

      if (status === 401) {
        // Unauthorized – token invalid or expired
        localStorage.removeItem('token');
        // Redirect to login (use window.location to avoid circular imports with router)
        window.location.href = '/login';
      }
    } else if (error.request) {
      // The request was made but no response received (network error)
      console.error('Network error – please check your connection.');
    } else {
      // Something happened in setting up the request
      console.error('Request error:', error.message);
    }

    return Promise.reject(error);
  }
);

// ---------- Optional: helper to manually logout ----------
export const clearAuthAndRedirect = () => {
  localStorage.removeItem('token');
  window.location.href = '/login';
};

export default api;