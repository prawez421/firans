
import { AdminAPI } from "../../api/axios";

// GET ALL CATEGORIES
export const getAllCategories = () => {
  return AdminAPI.get("/categories");
};

// CREATE CATEGORY
export const createCategory = (data) => {
  return AdminAPI.post("/categories", data);
};

// UPDATE CATEGORY
export const updateCategory = (id, data) => {
  return AdminAPI.put(`/categories/${id}`, data);
};

// DELETE CATEGORY
export const deleteCategory = (id) => {
  return AdminAPI.delete(`/categories/${id}`);
};
