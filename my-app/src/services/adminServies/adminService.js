
import { AdminAPI } from "../../api/axios";

// ==========================================
// DASHBOARD
// ==========================================
export const getDashboardStats = async () => {
  const response = await AdminAPI.get("/dashboard-stats");
  return response.data;
};

// ==========================================
// USERS MANAGEMENT
// ==========================================

// GET USERS
export const getAllUsers = async () => {
  const response = await AdminAPI.get("/users");
  return response.data;
};

// ADD USER WITH IMAGE
export const createAdminUser = async (data) => {
  const response = await AdminAPI.post("/users", data);

  return response.data;
};

// EDIT USER WITH IMAGE
export const updateAdminUser = async (id, data) => {
  if (data instanceof FormData) {
    data.set("_method", "PUT");

    const response = await AdminAPI.post(
      `/users/${id}`,
      data
    );

    return response.data;
  }

  const response = await AdminAPI.put(
    `/users/${id}`,
    data
  );

  return response.data;
};

// DELETE USER
export const deleteAdminUser = async (id) => {
  const response = await AdminAPI.delete(`/users/${id}`);
  return response.data;
};
