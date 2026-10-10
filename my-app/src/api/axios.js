
import axios from "axios";

// ==========================================
// API BASE URL
// ==========================================
const BASE_URL = (
  import.meta.env.VITE_API_URL ||
  "http://127.0.0.1:8000/api"
).replace(/\/+$/, "");

// ==========================================
// USER API
// ==========================================
export const UserAPI = axios.create({
  baseURL: BASE_URL,
  headers: {
    Accept: "application/json",
  },
});

// ==========================================
// ADMIN API
// ==========================================
export const AdminAPI = axios.create({
  baseURL: `${BASE_URL}/admin`,
  headers: {
    Accept: "application/json",
  },
});

// ==========================================
// USER REQUEST INTERCEPTOR
// ==========================================
UserAPI.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("user_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Let Axios/browser handle multipart boundary.
    if (config.data instanceof FormData) {
      config.headers.setContentType(undefined);
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ==========================================
// ADMIN REQUEST INTERCEPTOR
// ==========================================
AdminAPI.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("admin_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Image upload: browser sets correct Content-Type.
    if (config.data instanceof FormData) {
      config.headers.setContentType(undefined);
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ==========================================
// ERROR HANDLER
// ==========================================
const handleError = (error) => {
  const status = error.response?.status;

  if (status === 401) {
    console.error("Unauthorized: Invalid or expired token");
  }

  if (status === 403) {
    console.error("Forbidden: Permission denied");
  }

  if (status === 404) {
    console.error("API endpoint not found");
  }

  if (status === 405) {
    console.error("HTTP method not allowed");
  }

  if (status === 422) {
    console.error(
      "Validation Errors:",
      error.response?.data?.errors
    );
  }

  if (status === 500) {
    console.error(
      "Laravel Server Error:",
      error.response?.data
    );
  }

  return Promise.reject(error);
};

// ==========================================
// RESPONSE INTERCEPTORS
// ==========================================
UserAPI.interceptors.response.use(
  (response) => response,
  handleError
);

AdminAPI.interceptors.response.use(
  (response) => response,
  handleError
);
