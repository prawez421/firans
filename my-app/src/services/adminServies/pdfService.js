
import { AdminAPI } from "../../api/axios";

// ==========================================
// 1. GET ALL PDFS
// ==========================================
export const getAllPdfs = (params = {}) => {
  return AdminAPI.get("/pdfs", { params });
};

// ==========================================
// 2. GET SINGLE PDF DETAILS
// ==========================================
export const getPdfById = (id) => {
  return AdminAPI.get(`/pdfs/${id}`);
};

// ==========================================
// 3. UPLOAD PDF
// ==========================================
export const uploadPdf = (data) => {
  return AdminAPI.post("/pdf/upload", data);
};

// ==========================================
// 4. UPDATE PDF
// ==========================================
export const updatePdf = (id, data) => {
  if (data instanceof FormData) {
    data.set("_method", "PUT");

    return AdminAPI.post(`/pdfs/${id}`, data);
  }

  return AdminAPI.put(`/pdfs/${id}`, data);
};

// ==========================================
// 5. DELETE SINGLE PDF
// ==========================================
export const deletePdf = (id) => {
  return AdminAPI.delete(`/pdfs/${id}`);
};

// ==========================================
// 6. BULK DELETE PDFS
// ==========================================
export const bulkDeletePdfs = (ids) => {
  return AdminAPI.post("/pdfs/bulk-delete", {
    ids,
  });
};

// ==========================================
// 7. PREVIEW PDF (ACTUAL FILE)
// ==========================================
export const previewPdf = (id) => {
  return AdminAPI.get(`/pdfs/${id}/preview`, {
    responseType: "blob",
    headers: {
      Accept: "application/pdf",
    },
  });
};

// ==========================================
// 8. DOWNLOAD PDF
// ==========================================
export const downloadPdfFile = (id) => {
  return AdminAPI.get(`/pdfs/${id}/download`, {
    responseType: "blob",
    headers: {
      Accept: "application/pdf",
    },
  });
};
