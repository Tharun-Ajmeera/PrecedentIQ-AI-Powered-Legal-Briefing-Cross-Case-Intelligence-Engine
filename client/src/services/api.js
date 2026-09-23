// client/src/services/api.js
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL.replace(/\/+$/, '')}/api`
  : '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token from localStorage if present (crucial for cross-domain Vercel <-> Render)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('precedentiq_token');
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token if expired or unauthorized
      const currentToken = localStorage.getItem('precedentiq_token');
      if (currentToken && !error.config.url.includes('/auth/login') && !error.config.url.includes('/auth/register')) {
        localStorage.removeItem('precedentiq_token');
      }
    }

    const customError = {
      status: error.response?.status,
      message: error.response?.data?.error || error.message || 'An unexpected error occurred',
      details: error.response?.data?.details,
    };
    return Promise.reject(customError);
  }
);

export default api;

