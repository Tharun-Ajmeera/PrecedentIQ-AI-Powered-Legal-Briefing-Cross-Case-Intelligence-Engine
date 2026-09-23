// client/src/services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const customError = {
      status: error.response?.status,
      message: error.response?.data?.error || error.message || 'An unexpected error occurred',
      details: error.response?.data?.details,
    };
    return Promise.reject(customError);
  }
);

export default api;
