import axios from 'axios';

const AdminAPI = axios.create({
  baseURL: 'http://localhost:8000/api/admin',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request Interceptor
AdminAPI.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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
      localStorage.removeItem('admin_token');
      // Optional: window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

// --- Admin API Services ---

// 📊 Dashboard Stats Service
export const getDashboardStats = async () => {
  const res = await AdminAPI.get('/dashboard-stats');
  return res.data;
};

// 👤 Admin Profile Services
export const getAdminProfile = async () => {
  const res = await AdminAPI.get('/me');
  return res.data;
};

export const updateAdminProfile = async (profileData) => {
  const res = await AdminAPI.put('/me', profileData);
  return res.data;
};

// 👥 User Management Services (ADDED)
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

// 📂 Categories Services
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

// 📄 PDFs Services
export const getAdminPdfs = async (search = '', category = '') => {
  const res = await AdminAPI.get('/pdfs', { params: { search, category } });
  return res.data;
};

export const getPdfById = async (id) => {
  const res = await AdminAPI.get(`/pdfs/${id}`);
  return res.data;
};

// 🚀 PDF Upload Service
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

// ✏️ PDF Update Service
export const updatePdf = async (id, formData) => {
  if (formData instanceof FormData) {
    formData.append('_method', 'PUT');
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