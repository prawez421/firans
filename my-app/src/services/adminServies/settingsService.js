import { AdminAPI } from "../../api/axios";

// GET ADMIN PROFILE
export const getAdminProfile = () => {
  return AdminAPI.get("/me");
};

// UPDATE ADMIN PROFILE
export const updateAdminProfile = (data) => {
  return AdminAPI.put("/me", data);
};