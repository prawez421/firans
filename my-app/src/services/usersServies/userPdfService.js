
import { UserAPI } from "../../api/axios";
import { getToken } from "../authService";

// ==========================================
// API ENDPOINTS
// ==========================================
const PDF_API = "/pdfs";

// ==========================================
// USER AUTH CONFIG
// ==========================================
const userAuthConfig = () => {
  const token = getToken("user");

  if (!token) {
    throw new Error(
      "User token not found. Please login again."
    );
  }

  return {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  };
};

// ==========================================
// VALIDATE PDF BLOB
// ==========================================
const validatePdfBlob = async (blob) => {
  if (!(blob instanceof Blob) || blob.size === 0) {
    throw new Error("PDF file is empty or invalid.");
  }

  // Check actual PDF signature
  const signature = await blob
    .slice(0, 5)
    .text();

  if (signature !== "%PDF-") {
    const text = await blob.text().catch(() => "");

    console.error(
      "Invalid PDF Response:",
      text.slice(0, 500)
    );

    throw new Error(
      "Server did not return a valid PDF file."
    );
  }

  return blob;
};

// ==========================================
// GET ALL PDFS
// GET /api/pdfs
// ==========================================
export const getUserPdfs = async () => {
  try {
    const response = await UserAPI.get(
      PDF_API,
      {
        headers: {
          Accept: "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Get PDFs Error:", {
      status: error?.response?.status,
      message: error?.response?.data?.message,
      url: error?.config?.url,
    });

    throw error;
  }
};

// ==========================================
// GET SINGLE PDF DETAILS
// GET /api/admin/pdfs/:id
// ==========================================
// Public /api/pdfs/:id is not registered.
// User details can be obtained from the list.
export const getUserPdfById = async (id) => {
  const response = await getUserPdfs();

  const data = response?.data ?? response;

  const pdfs = Array.isArray(data)
    ? data
    : Array.isArray(data?.data)
      ? data.data
      : [];

  const pdf = pdfs.find(
    (item) => String(item.id) === String(id)
  );

  if (!pdf) {
    throw new Error("PDF not found.");
  }

  return {
    success: true,
    data: pdf,
  };
};

// ==========================================
// PREVIEW PDF
// GET /api/pdfs/:id/preview
// ==========================================
export const previewUserPdf = async (id) => {
  try {
    const response = await UserAPI.get(
      `/pdfs/${id}/preview`,
      {
        ...userAuthConfig(),
        responseType: "blob",
      }
    );

    const blob = response.data;

    if (!(blob instanceof Blob) || blob.size === 0) {
      throw new Error("PDF response is empty.");
    }

    const signature = await blob.slice(0, 5).text();

    if (signature !== "%PDF-") {
      const text = await blob.text();

      console.error("Invalid PDF Response:", text);

      throw new Error(
        "Server returned invalid PDF content."
      );
    }

    return blob;
  } catch (error) {
    const status = error?.response?.status;

    let serverMessage = "";

    if (error?.response?.data instanceof Blob) {
      const text = await error.response.data.text();

      try {
        const json = JSON.parse(text);
        serverMessage = json.message || "";
      } catch {
        serverMessage = text.slice(0, 200);
      }
    } else {
      serverMessage = error?.response?.data?.message || "";
    }

    console.error("PDF PREVIEW FAILED:", {
      status,
      baseURL: error?.config?.baseURL,
      endpoint: error?.config?.url,
      message: serverMessage || error?.message,
    });

    if (status === 401) {
      throw new Error("Session expired. Please login again.");
    }

    if (status === 403) {
      throw new Error("PDF access denied.");
    }

    if (status === 404) {
      throw new Error(
        serverMessage || "PDF route or file not found (404)."
      );
    }

    throw new Error(
      serverMessage ||
      error?.message ||
      "Unable to preview this PDF."
    );
  }
};

// ==========================================
// DOWNLOAD PDF
// GET /api/pdfs/:id/download
// ==========================================
export const downloadUserPdf = async (id) => {
  try {
    const response = await UserAPI.get(
      `${PDF_API}/${id}/download`,
      {
        ...userAuthConfig(),
        responseType: "blob",
      }
    );

    return await validatePdfBlob(response.data);
  } catch (error) {
    console.error("PDF Download Error:", {
      status: error?.response?.status,
      message: error?.message,
      url: error?.config?.url,
    });

    throw error;
  }
};
