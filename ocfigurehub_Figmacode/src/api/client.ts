import axios from 'axios';
import axiosRetry from 'axios-retry';
import toast from 'react-hot-toast';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Auto-retry on 5xx / network errors
axiosRetry(API, {
  retries: 3,
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (error) =>
    axiosRetry.isNetworkError(error) ||
    (error.response?.status !== undefined && error.response.status >= 500),
});

// Attach JWT token to every request
API.interceptors.request.use((config) => {
  try {
    const raw = localStorage.getItem('oc-auth');
    if (raw) {
      const parsed = JSON.parse(raw);
      const token = parsed?.state?.token;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
  } catch {
    // ignore corrupt localStorage
  }
  return config;
});

// Handle 401 → auto logout
API.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('oc-auth');
      toast.error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
      window.location.href = '/sign-in';
    }
    return Promise.reject(error);
  }
);

export default API;
