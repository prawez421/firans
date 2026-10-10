
import axios from "axios";
import { UserAPI } from "../api/axios";

// =====================================
// AUTH STORAGE KEYS
// =====================================
const AUTH_KEYS = {
  user: {
    token: "user_token",
    profile: "user",
  },
  admin: {
    token: "admin_token",
    profile: "admin_user",
  },
};

// =====================================
// ACCOUNT TYPE
// =====================================
const normalizeType = (type = "user") => {
  return type === "admin" ? "admin" : "user";
};

// =====================================
// GET USER ROLE
// =====================================
export const getUserRole = (user) => {
  const role = user?.role ?? user?.role_name;

  if (typeof role === "string") {
    return role.trim().toLowerCase();
  }

  if (role && typeof role === "object") {
    return String(role.slug || role.name || "")
      .trim()
      .toLowerCase();
  }

  return "";
};

// =====================================
// SAVE AUTH DATA
// =====================================
export const saveAuthData = (type, token, user) => {
  const keys = AUTH_KEYS[normalizeType(type)];

  if (!token || !user) {
    throw new Error("Token or user data missing");
  }

  localStorage.setItem(keys.token, token);

  localStorage.setItem(
    keys.profile,
    JSON.stringify(user)
  );
};

// =====================================
// GET TOKEN
// =====================================
export const getToken = (type = "user") => {
  const keys = AUTH_KEYS[normalizeType(type)];

  return localStorage.getItem(keys.token);
};

// =====================================
// GET CURRENT USER
// =====================================
export const getCurrentUser = (type = "user") => {
  const keys = AUTH_KEYS[normalizeType(type)];

  const stored = localStorage.getItem(keys.profile);

  if (!stored) return null;

  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
};

// =====================================
// CLEAR AUTH DATA
// =====================================
export const clearAuthData = (type = "user") => {
  const keys = AUTH_KEYS[normalizeType(type)];

  localStorage.removeItem(keys.token);
  localStorage.removeItem(keys.profile);
};

// =====================================
// LOGIN ADMIN / USER
// =====================================
export const loginUser = async (
  credentials,
  type = "user"
) => {
  const accountType = normalizeType(type);

  const response = await UserAPI.post(
    "/login",
    credentials
  );

  const payload = response.data;
  const data = payload?.data ?? payload;

  const token =
    data?.token ??
    data?.access_token ??
    payload?.token ??
    payload?.access_token;

  const user =
    data?.user ??
    payload?.user;

  if (!token || !user) {
    throw new Error(
      "Login response missing token or user"
    );
  }

  const role = getUserRole(user);

  // ADMIN VALIDATION
  if (accountType === "admin" && role !== "admin") {
    throw new Error(
      "Access denied. Admin account required."
    );
  }

  // USER VALIDATION
  if (accountType === "user" && role === "admin") {
    throw new Error(
      "Please select Admin Login."
    );
  }

  saveAuthData(accountType, token, user);

  return {
    success: true,
    token,
    user,
    role,
    accountType,
    redirectTo:
      accountType === "admin"
        ? "/admin/dashboard"
        : "/user",
  };
};

// =====================================
// LOGOUT ADMIN / USER
// =====================================
export const logoutUser = async (type = "user") => {
  const accountType = normalizeType(type);
  const token = getToken(accountType);

  if (!token) {
    clearAuthData(accountType);

    return {
      success: true,
      serverLogoutSuccess: false,
      error: "No authentication token found",
    };
  }

  let serverLogoutSuccess = false;
  let errorMessage = "";
  let status = null;

  try {
    // Use the same base URL as UserAPI,
    // but bypass its request interceptors.
    const baseURL = UserAPI.defaults.baseURL;

    if (!baseURL) {
      throw new Error(
        "UserAPI baseURL is not configured"
      );
    }

    const response = await axios.post(
      `${baseURL.replace(/\/$/, "")}/logout`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        timeout: 15000,
      }
    );

    if (response.data?.success === false) {
      throw new Error(
        response.data?.message || "Logout failed"
      );
    }

    serverLogoutSuccess = true;
  } catch (error) {
    status = error?.response?.status ?? null;

    errorMessage =
      error?.response?.data?.message ||
      error?.message ||
      "Logout request failed";

    console.error("Logout API Error:", {
      accountType,
      status,
      message: errorMessage,
    });
  } finally {
    // Clear only the selected account's local session.
    clearAuthData(accountType);
  }

  return {
    success: true,
    serverLogoutSuccess,
    error: errorMessage,
    status,
  };
};

// =====================================
// CHECK AUTHENTICATION
// =====================================
export const isAuthenticated = (type = "user") => {
  return Boolean(
    getToken(type) && getCurrentUser(type)
  );
};

// =====================================
// CHECK ADMIN
// =====================================
export const isAdmin = () => {
  const admin = getCurrentUser("admin");

  return (
    isAuthenticated("admin") &&
    getUserRole(admin) === "admin"
  );
};

// =====================================
// REDIRECT PATH
// =====================================
export const getRedirectPath = (type = "user") => {
  const accountType = normalizeType(type);

  if (accountType === "admin") {
    return isAdmin()
      ? "/admin/dashboard"
      : "/";
  }

  return isAuthenticated("user")
    ? "/user"
    : "/";
};
