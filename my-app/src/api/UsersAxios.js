import axios from 'axios';

// 1. Production API Base URL (Vite + CRA + Next.js Compatible)
const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    // Vite (React) check
    if (import.meta && import.meta.env && import.meta.env.VITE_API_BASE_URL) {
      return import.meta.env.VITE_API_BASE_URL;
    }
  }
  // Create React App / Next.js check
  return (
    process.env.VITE_API_BASE_URL ||
    process.env.REACT_APP_API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    'http://localhost:8000/api'
  );
};

const UserAPI = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// 🟢 Request Interceptor: User Token Auto-Attach (SSR & Deployment Safe)
UserAPI.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token =
        localStorage.getItem('user_token') ||
        localStorage.getItem('admin_token') ||
        localStorage.getItem('token');

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 🟢 Response Interceptor: Global Error Handling
UserAPI.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn('Unauthorized Access (401). Token may be invalid or expired.');

      if (typeof window !== 'undefined') {
        localStorage.removeItem('user_token');
        localStorage.removeItem('admin_token');
        localStorage.removeItem('token');
      }
    }
    return Promise.reject(error);
  }
);

// 🚀 API Methods

/**
 * Fetch PDFs with optional Search and Category filters
 */
export const getPdfs = async (search = '', category = '') => {
  try {
    const params = {};

    if (search && String(search).trim() !== '') {
      params.search = String(search).trim();
    }

    const categoryStr = String(category || '').trim();

    if (
      categoryStr !== '' &&
      categoryStr !== 'All' &&
      categoryStr !== 'undefined' &&
      categoryStr !== 'null'
    ) {
      params.category = category;
    }

    const response = await UserAPI.get('/pdfs', { params });
    return response.data?.data || response.data;
  } catch (error) {
    console.error('Error fetching PDFs from backend:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Fetch Categories List from Backend
 */
export const getCategories = async () => {
  try {
    const response = await UserAPI.get('/categories');
    return response.data?.data || response.data;
  } catch (error) {
    console.error('Error fetching categories from backend:', error.response?.data || error.message);
    throw error;
  }
};

export default UserAPI;