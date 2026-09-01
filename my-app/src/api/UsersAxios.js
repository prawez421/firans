import axios from "axios";

// ✅ API Base URL
// .env / Vercel Environment Variable se URL aayega
const BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";

const UserAPI = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// =====================================================
// 🔐 REQUEST INTERCEPTOR
// Token automatically request ke sath send karega
// =====================================================
UserAPI.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem("user_token") ||
      localStorage.getItem("admin_token") ||
      localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// =====================================================
// 🚨 RESPONSE INTERCEPTOR
// Global error handling
// =====================================================
UserAPI.interceptors.response.use(
  (response) => response,

  (error) => {
    // Unauthorized
    if (error.response?.status === 401) {
      console.warn("Unauthorized: Token invalid or expired.");

      localStorage.removeItem("user_token");
      localStorage.removeItem("admin_token");
      localStorage.removeItem("token");
    }

    // Backend reachable nahi hai
    if (!error.response) {
      console.error(
        "Backend server connection failed:",
        error.message
      );
    }

    return Promise.reject(error);
  }
);

// =====================================================
// 📚 GET PDFs
// Search + Category filter
// =====================================================
export const getPdfs = async (search = "", category = "") => {
  try {
    const params = {};

    const searchValue = String(search || "").trim();
    const categoryValue = String(category || "").trim();

    // Search
    if (searchValue !== "") {
      params.search = searchValue;
    }

    // Category
    if (
      categoryValue !== "" &&
      categoryValue.toLowerCase() !== "all" &&
      categoryValue.toLowerCase() !== "undefined" &&
      categoryValue.toLowerCase() !== "null"
    ) {
      params.category = categoryValue;
    }

    const response = await UserAPI.get("/pdfs", {
      params,
    });

    return response.data?.data ?? response.data;
  } catch (error) {
    console.error(
      "PDF Fetch Error:",
      error.response?.data || error.message
    );

    throw error;
  }
};

// =====================================================
// 📂 GET CATEGORIES
// =====================================================
export const getCategories = async () => {
  try {
    const response = await UserAPI.get("/categories");

    return response.data?.data ?? response.data;
  } catch (error) {
    console.error(
      "Category Fetch Error:",
      error.response?.data || error.message
    );

    throw error;
  }
};

// =====================================================
// 🔑 LOGIN
// =====================================================
export const loginUser = async (data) => {
  try {
    const response = await UserAPI.post("/login", data);

    return response.data;
  } catch (error) {
    console.error(
      "Login Error:",
      error.response?.data || error.message
    );

    throw error;
  }
};

// ✅ Export Axios instance
export default UserAPI;