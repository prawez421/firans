import axios from 'axios';

// Environment variable with fallback
const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.REACT_APP_API_BASE_URL ||
  'http://localhost:8000/api';

const UserAPI = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Request Interceptor: SSR Safe Token Handler
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

// Response Interceptor: Global Error Handling
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

// API Methods
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
    console.error('Error fetching PDFs:', error.response?.data || error.message);
    throw error;
  }
};

export const getCategories = async () => {
  try {
    const response = await UserAPI.get('/categories');
    return response.data?.data || response.data;
  } catch (error) {
    console.error('Error fetching categories:', error.response?.data || error.message);
    throw error;
  }
};

export default UserAPI;