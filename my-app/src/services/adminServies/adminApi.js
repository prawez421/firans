
import { AdminAPI } from "../../api/axios";

// =====================================================
// COMMON HELPERS
// =====================================================

// Return Laravel API response data
const getResponseData = (response) => {
  return response.data;
};

// Validate and encode resource ID
const validateId = (id) => {
  if (
    id === undefined ||
    id === null ||
    String(id).trim() === ""
  ) {
    throw new Error("A valid ID is required.");
  }

  return encodeURIComponent(String(id).trim());
};

// Build search and category filter parameters
const buildPdfParams = (search = "", category = "") => {
  const params = {};

  const searchValue = String(search ?? "").trim();
  const categoryValue = String(category ?? "").trim();

  if (searchValue) {
    params.search = searchValue;
  }

  if (
    categoryValue &&
    !["all", "undefined", "null"].includes(
      categoryValue.toLowerCase()
    )
  ) {
    params.category = categoryValue;
  }

  return params;
};

// Centralized API error handling
const handleApiError = (error, action) => {
  if (error.code === "ERR_CANCELED") {
    throw error;
  }

  console.error(`${action} Error:`, {
    message:
      error.response?.data?.message ||
      error.message ||
      "Something went wrong.",

    status: error.response?.status,

    errors: error.response?.data?.errors,
  });

  throw error;
};

// =====================================================
// DASHBOARD
// GET /api/admin/dashboard-stats
// =====================================================
export const getDashboardStats = async () => {
  try {
    const response = await AdminAPI.get("/dashboard-stats");

    return getResponseData(response);
  } catch (error) {
    return handleApiError(error, "Dashboard Fetch");
  }
};

// =====================================================
// ADMIN PROFILE
// =====================================================

// GET /api/admin/me
export const getAdminProfile = async () => {
  try {
    const response = await AdminAPI.get("/me");

    return getResponseData(response);
  } catch (error) {
    return handleApiError(error, "Admin Profile Fetch");
  }
};

// PUT /api/admin/me
export const updateAdminProfile = async (profileData) => {
  try {
    const response = await AdminAPI.put(
      "/me",
      profileData
    );

    return getResponseData(response);
  } catch (error) {
    return handleApiError(error, "Admin Profile Update");
  }
};

// =====================================================
// USERS MANAGEMENT
// =====================================================

// GET /api/admin/users
export const getAllUsers = async () => {
  try {
    const response = await AdminAPI.get("/users");

    return getResponseData(response);
  } catch (error) {
    return handleApiError(error, "Users Fetch");
  }
};

// POST /api/admin/users
export const createAdminUser = async (userData) => {
  try {
    const response = await AdminAPI.post(
      "/users",
      userData
    );

    return getResponseData(response);
  } catch (error) {
    return handleApiError(error, "User Create");
  }
};

// PUT /api/admin/users/:id
export const updateAdminUser = async (id, userData) => {
  try {
    const response = await AdminAPI.put(
      `/users/${validateId(id)}`,
      userData
    );

    return getResponseData(response);
  } catch (error) {
    return handleApiError(error, "User Update");
  }
};

// DELETE /api/admin/users/:id
export const deleteAdminUser = async (id) => {
  try {
    const response = await AdminAPI.delete(
      `/users/${validateId(id)}`
    );

    return getResponseData(response);
  } catch (error) {
    return handleApiError(error, "User Delete");
  }
};

// =====================================================
// CATEGORIES MANAGEMENT
// =====================================================

// GET /api/admin/categories
export const getAdminCategories = async () => {
  try {
    const response = await AdminAPI.get("/categories");

    return getResponseData(response);
  } catch (error) {
    return handleApiError(error, "Categories Fetch");
  }
};

// Alias for existing admin components
export const getCategories = getAdminCategories;

// POST /api/admin/categories
export const createCategory = async (data) => {
  try {
    const response = await AdminAPI.post(
      "/categories",
      data
    );

    return getResponseData(response);
  } catch (error) {
    return handleApiError(error, "Category Create");
  }
};

// PUT /api/admin/categories/:id
export const updateCategory = async (id, data) => {
  try {
    const response = await AdminAPI.put(
      `/categories/${validateId(id)}`,
      data
    );

    return getResponseData(response);
  } catch (error) {
    return handleApiError(error, "Category Update");
  }
};

// DELETE /api/admin/categories/:id
export const deleteCategory = async (id) => {
  try {
    const response = await AdminAPI.delete(
      `/categories/${validateId(id)}`
    );

    return getResponseData(response);
  } catch (error) {
    return handleApiError(error, "Category Delete");
  }
};

// =====================================================
// PDF MANAGEMENT
// =====================================================

// GET /api/admin/pdfs
// Search + Category Filter
export const getAdminPdfs = async (
  search = "",
  category = ""
) => {
  try {
    const response = await AdminAPI.get("/pdfs", {
      params: buildPdfParams(search, category),
    });

    return getResponseData(response);
  } catch (error) {
    return handleApiError(error, "Admin PDFs Fetch");
  }
};

// Alias for older admin components
export const getPdfs = getAdminPdfs;

// =====================================================
// GET SINGLE PDF
// GET /api/admin/pdfs/:id
// =====================================================
export const getPdfById = async (id) => {
  try {
    const response = await AdminAPI.get(
      `/pdfs/${validateId(id)}`
    );

    return getResponseData(response);
  } catch (error) {
    return handleApiError(error, "PDF Details Fetch");
  }
};

// =====================================================
// UPLOAD PDF
// POST /api/admin/pdfs/upload
// =====================================================
export const uploadPdf = async (
  formData,
  onProgress
) => {
  if (!(formData instanceof FormData)) {
    throw new Error("PDF upload requires FormData.");
  }

  try {
    const response = await AdminAPI.post(
      "/pdfs/upload",
      formData,
      {
        onUploadProgress: (event) => {
          if (
            typeof onProgress === "function" &&
            event.total
          ) {
            const percent = Math.min(
              100,
              Math.round(
                (event.loaded / event.total) * 100
              )
            );

            onProgress(percent);
          }
        },
      }
    );

    return getResponseData(response);
  } catch (error) {
    return handleApiError(error, "PDF Upload");
  }
};

// =====================================================
// UPDATE PDF
// PUT /api/admin/pdfs/:id
// =====================================================
export const updatePdf = async (id, data) => {
  const pdfId = validateId(id);

  try {
    // Laravel supports multipart POST with _method=PUT
    if (data instanceof FormData) {
      const payload = new FormData();

      for (const [key, value] of data.entries()) {
        if (key !== "_method") {
          payload.append(key, value);
        }
      }

      payload.append("_method", "PUT");

      const response = await AdminAPI.post(
        `/pdfs/${pdfId}`,
        payload
      );

      return getResponseData(response);
    }

    // Normal JSON update
    const response = await AdminAPI.put(
      `/pdfs/${pdfId}`,
      data
    );

    return getResponseData(response);
  } catch (error) {
    return handleApiError(error, "PDF Update");
  }
};

// =====================================================
// DELETE PDF
// DELETE /api/admin/pdfs/:id
// =====================================================
export const deletePdf = async (id) => {
  try {
    const response = await AdminAPI.delete(
      `/pdfs/${validateId(id)}`
    );

    return getResponseData(response);
  } catch (error) {
    return handleApiError(error, "PDF Delete");
  }
};

// =====================================================
// DEFAULT EXPORT
// =====================================================
export default AdminAPI;
