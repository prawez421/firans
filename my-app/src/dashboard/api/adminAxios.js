import axios from "axios";

// ✅ Vite Environment Variable
const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";

// ✅ Final Admin Base URL
const BASE_URL = `${API_BASE.replace(/\/+$/, "")}/admin`;

const AdminAPI = axios.create({
  baseURL: BASE_URL,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

// ======================================================
// 🔐 REQUEST INTERCEPTOR
// ======================================================
AdminAPI.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("admin_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ======================================================
// 🚨 RESPONSE INTERCEPTOR
// ======================================================
AdminAPI.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("Admin session expired or unauthorized.");

      localStorage.removeItem("admin_token");
    }

    if (!error.response) {
      console.error(
        "Admin backend connection failed:",
        error.message
      );
    }

    return Promise.reject(error);
  }
);

// ======================================================
// 📊 DASHBOARD
// ======================================================
export const getDashboardStats = async () => {
  const res = await AdminAPI.get("/dashboard-stats");
  return res.data;
};

// ======================================================
// 👤 ADMIN PROFILE
// ======================================================
export const getAdminProfile = async () => {
  const res = await AdminAPI.get("/me");
  return res.data;
};

export const updateAdminProfile = async (profileData) => {
  const res = await AdminAPI.put("/me", profileData);
  return res.data;
};

// ======================================================
// 👥 USERS
// ======================================================
export const getAllUsers = async () => {
  const res = await AdminAPI.get("/users");
  return res.data;
};

export const createAdminUser = async (userData) => {
  const res = await AdminAPI.post("/users", userData);
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

// ======================================================
// 📂 CATEGORIES
// ======================================================
export const getAdminCategories = async () => {
  const res = await AdminAPI.get("/categories");
  return res.data;
};

// Agar kisi component me getCategories use ho raha hai
export const getCategories = getAdminCategories;

export const createCategory = async (data) => {
  const res = await AdminAPI.post("/categories", data);
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

// ======================================================
// 📚 PDF
// ======================================================
export const getAdminPdfs = async (
  search = "",
  category = ""
) => {
  const params = {};

  const searchValue = String(search || "").trim();
  const categoryValue = String(category || "").trim();

  if (searchValue !== "") {
    params.search = searchValue;
  }

  if (
    categoryValue !== "" &&
    categoryValue.toLowerCase() !== "all" &&
    categoryValue.toLowerCase() !== "undefined" &&
    categoryValue.toLowerCase() !== "null"
  ) {
    params.category = categoryValue;
  }

  const res = await AdminAPI.get("/pdfs", {
    params,
  });

  return res.data;
};

export const getPdfById = async (id) => {
  const res = await AdminAPI.get(`/pdfs/${id}`);
  return res.data;
};

// ======================================================
// 📤 UPLOAD PDF
// ======================================================
export const uploadPdf = async (
  formData,
  onProgress
) => {
  const res = await AdminAPI.post(
    "/pdfs/upload",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },

      onUploadProgress: (progressEvent) => {
        if (
          typeof onProgress === "function" &&
          progressEvent.total
        ) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) /
              progressEvent.total
          );

          onProgress(percentCompleted);
        }
      },
    }
  );

  return res.data;
};

// ======================================================
// ✏️ UPDATE PDF
// ======================================================
export const updatePdf = async (
  id,
  formData
) => {
  // PDF/file included
  if (formData instanceof FormData) {
    if (!formData.has("_method")) {
      formData.append("_method", "PUT");
    }

    const res = await AdminAPI.post(
      `/pdfs/${id}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return res.data;
  }

  // Normal JSON update
  const res = await AdminAPI.put(
    `/pdfs/${id}`,
    formData
  );

  return res.data;
};

// ======================================================
// 🗑️ DELETE PDF
// ======================================================
export const deletePdf = async (id) => {
  const res = await AdminAPI.delete(`/pdfs/${id}`);
  return res.data;
};

export default AdminAPI;