import axios from 'axios';

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.REACT_APP_API_BASE_URL ||
  'http://localhost:8000/api';

const BASE_URL = `${API_BASE.replace(/\/+$/, '')}/admin`;

const AdminAPI = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Request Interceptor
AdminAPI.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('admin_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor
AdminAPI.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('admin_token');
      }
    }
    return Promise.reject(error);
  }
);

// Admin API Services
export const getDashboardStats = async () => {
  const res = await AdminAPI.get('/dashboard-stats');
  return res.data;
};

export const getAdminProfile = async () => {
  const res = await AdminAPI.get('/me');
  return res.data;
};

export const updateAdminProfile = async (profileData) => {
  const res = await AdminAPI.put('/me', profileData);
  return res.data;
};

export const getAllUsers = async () => {
  const res = await AdminAPI.get('/users');
  return res.data;
};

export const createAdminUser = async (userData) => {
  const res = await AdminAPI.post('/users', userData);
  return res.data;
};

export const updateAdminUser = async (id, userData) => {
  const res = await AdminAPI.put(`/users/${id}`, userData);
  return res.data;
};

export const deleteAdminUser = async (id) => {
  const res = await AdminAPI.delete(`/users/${id}`);
  return res.data;
};

export const getAdminCategories = async () => {
  const res = await AdminAPI.get('/categories');
  return res.data;
};

export const getCategories = async () => {
  const res = await AdminAPI.get('/categories');
  return res.data;
};

export const createCategory = async (data) => {
  const res = await AdminAPI.post('/categories', data);
  return res.data;
};

export const updateCategory = async (id, data) => {
  const res = await AdminAPI.put(`/categories/${id}`, data);
  return res.data;
};

export const deleteCategory = async (id) => {
  const res = await AdminAPI.delete(`/categories/${id}`);
  return res.data;
};

export const getAdminPdfs = async (search = '', category = '') => {
  const params = {};
  if (search && String(search).trim() !== '') params.search = String(search).trim();
  if (category && String(category).trim() !== '' && category !== 'All') params.category = category;

  const res = await AdminAPI.get('/pdfs', { params });
  return res.data;
};

export const getPdfById = async (id) => {
  const res = await AdminAPI.get(`/pdfs/${id}`);
  return res.data;
};

export const uploadPdf = async (formData, onProgress) => {
  const res = await AdminAPI.post('/pdfs/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        onProgress(percentCompleted);
      }
    },
  });
  return res.data;
};

export const updatePdf = async (id, formData) => {
  if (formData instanceof FormData) {
    if (!formData.has('_method')) {
      formData.append('_method', 'PUT');
    }
    const res = await AdminAPI.post(`/pdfs/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  }

  const res = await AdminAPI.put(`/pdfs/${id}`, formData);
  return res.data;
};

export const deletePdf = async (id) => {
  const res = await AdminAPI.delete(`/pdfs/${id}`);
  return res.data;
};

export default AdminAPI;