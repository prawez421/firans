
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FileText,
  Upload,
  Search,
  Pencil,
  Trash2,
  Eye,
  Download,
  RefreshCw,
  X,
  Loader2,
  FolderOpen,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Plus,
  ExternalLink,
} from "lucide-react";
import toast from "react-hot-toast";

import { AdminAPI, UserAPI } from "../../api/axios";

import {
  getAllPdfs,
  uploadPdf,
  updatePdf,
  deletePdf,
  bulkDeletePdfs,
  previewPdf,
  downloadPdfFile,
} from "../../services/adminServies/pdfService";

// ============================================
// CONFIG
// ============================================
const PAGE_SIZE = 10;
const MAX_FILE_SIZE = 10 * 1024 * 1024;

const EMPTY_FORM = {
  title: "",
  category_id: "",
  pdf: null,
};

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100";

// ============================================
// HELPERS
// ============================================
const getList = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.data?.data)) {
    return payload.data.data;
  }
  if (Array.isArray(payload?.categories)) {
    return payload.categories;
  }
  return [];
};

const getErrorMessage = (error) => {
  const errors = error?.response?.data?.errors;

  if (errors) {
    const first = Object.values(errors).flat()[0];
    if (first) return String(first);
  }

  return (
    error?.response?.data?.message ||
    error?.message ||
    "Something went wrong"
  );
};

const getBlobError = async (error) => {
  if (error?.response?.data instanceof Blob) {
    try {
      const text = await error.response.data.text();
      const json = JSON.parse(text);

      return json.message || "Unable to load PDF";
    } catch {
      return `PDF request failed (${error.response.status})`;
    }
  }

  return getErrorMessage(error);
};

const sizeLabel = (bytes) => {
  const size = Number(bytes || 0);

  if (size < 1024) return `${size} B`;

  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }

  return `${(size / (1024 * 1024)).toFixed(2)} MB`;
};

const dateLabel = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const categoryName = (pdf) => {
  return (
    pdf.category?.name ||
    pdf.category_name ||
    "Uncategorized"
  );
};

const makePdfBlob = async (data) => {
  const blob = new Blob([data], {
    type: "application/pdf",
  });

  if (!blob.size) {
    throw new Error("PDF file is empty");
  }

  // Basic PDF signature verification
  const signature = await blob.slice(0, 5).text();

  if (signature !== "%PDF-") {
    throw new Error(
      "Server did not return a valid PDF file"
    );
  }

  return blob;
};

// ============================================
// MAIN COMPONENT
// ============================================
export default function PdfManagement() {
  // PDF Data
  const [pdfs, setPdfs] = useState([]);
  const [categories, setCategories] = useState([]);

  // Loading States
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);

  // Filters
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [page, setPage] = useState(1);

  // Selection
  const [selectedIds, setSelectedIds] = useState([]);

  // Upload/Edit Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPdf, setEditingPdf] = useState(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });

  // Delete Modal
  const [deleteTarget, setDeleteTarget] = useState(null);

  // PDF Viewer
  const [viewPdf, setViewPdf] = useState(null);
  const [viewUrl, setViewUrl] = useState("");
  const [viewLoading, setViewLoading] = useState(false);
  const [viewError, setViewError] = useState("");

  // ============================================
  // FETCH PDFS
  // ============================================
  const fetchPdfs = useCallback(async () => {
    setLoading(true);

    try {
      const response = await getAllPdfs();

      if (response.data?.success === false) {
        throw new Error(response.data.message);
      }

      setPdfs(getList(response.data));
    } catch (error) {
      console.error("Fetch PDFs Error:", error);
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, []);

  // ============================================
  // FETCH CATEGORIES
  // ============================================
  const fetchCategories = useCallback(async () => {
    try {
      // Public category endpoint
      const response = await UserAPI.get("/categories");

      setCategories(getList(response.data));
    } catch (error) {
      // Fallback for projects with admin category route
      try {
        const response = await AdminAPI.get("/categories");
        setCategories(getList(response.data));
      } catch (adminError) {
        console.error(
          "Fetch Categories Error:",
          adminError
        );
      }
    }
  }, []);

  useEffect(() => {
    fetchPdfs();
    fetchCategories();
  }, [fetchPdfs, fetchCategories]);

  // Revoke temporary PDF URLs when replaced/unmounted
  useEffect(() => {
    return () => {
      if (viewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(viewUrl);
      }
    };
  }, [viewUrl]);

  // ============================================
  // FILTER + PAGINATION
  // ============================================
  const filteredPdfs = useMemo(() => {
    const query = search.trim().toLowerCase();

    return pdfs.filter((pdf) => {
      const matchesSearch = [
        pdf.title,
        pdf.original_name,
        categoryName(pdf),
      ].some((value) =>
        String(value || "").toLowerCase().includes(query)
      );

      const matchesCategory =
        !categoryFilter ||
        String(pdf.category_id ?? "") === categoryFilter;

      return matchesSearch && matchesCategory;
    });
  }, [pdfs, search, categoryFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredPdfs.length / PAGE_SIZE)
  );

  const currentPage = Math.min(page, totalPages);

  const paginatedPdfs = filteredPdfs.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const currentPageIds = paginatedPdfs.map(
    (pdf) => pdf.id
  );

  const allPageSelected =
    currentPageIds.length > 0 &&
    currentPageIds.every((id) =>
      selectedIds.includes(id)
    );

  const totalSize = pdfs.reduce(
    (sum, pdf) => sum + Number(pdf.file_size || 0),
    0
  );

  // ============================================
  // UPLOAD / EDIT MODAL
  // ============================================
  const openAdd = () => {
    setEditingPdf(null);
    setForm({ ...EMPTY_FORM });
    setModalOpen(true);
  };

  const openEdit = (pdf) => {
    setEditingPdf(pdf);

    setForm({
      title: pdf.title || "",
      category_id:
        pdf.category_id == null
          ? ""
          : String(pdf.category_id),
      pdf: null,
    });

    setModalOpen(true);
  };

  const closeForm = () => {
    if (saving) return;

    setModalOpen(false);
    setEditingPdf(null);
    setForm({ ...EMPTY_FORM });
  };

  const chooseFile = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (
      file.type !== "application/pdf" &&
      !file.name.toLowerCase().endsWith(".pdf")
    ) {
      toast.error("Please select a PDF file");
      event.target.value = "";
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error("Maximum PDF size is 10MB");
      event.target.value = "";
      return;
    }

    setForm((prev) => ({
      ...prev,
      pdf: file,
    }));
  };

  // ============================================
  // SAVE PDF
  // ============================================
  const savePdf = async (event) => {
    event.preventDefault();

    if (saving) return;

    if (!editingPdf && !form.pdf) {
      toast.error("Please select a PDF file");
      return;
    }

    setSaving(true);

    try {
      const data = new FormData();

      data.append("title", form.title.trim());

      // Laravel nullable category
      data.append("category_id", form.category_id);

      if (form.pdf) {
        data.append("pdf", form.pdf);
      }

      const response = editingPdf
        ? await updatePdf(editingPdf.id, data)
        : await uploadPdf(data);

      if (response.data?.success === false) {
        throw new Error(response.data.message);
      }

      toast.success(
        editingPdf
          ? "PDF updated successfully"
          : "PDF uploaded successfully"
      );

      closeFormAfterSave();
      await fetchPdfs();
    } catch (error) {
      console.error("Save PDF Error:", error);
      toast.error(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const closeFormAfterSave = () => {
    setModalOpen(false);
    setEditingPdf(null);
    setForm({ ...EMPTY_FORM });
  };

  // ============================================
  // VIEW PDF - AUTHENTICATED BLOB PREVIEW
  // ============================================
  const openView = async (pdf) => {
    setViewPdf(pdf);
    setViewUrl("");
    setViewError("");
    setViewLoading(true);

    try {
      const response = await previewPdf(pdf.id);

      const blob = await makePdfBlob(response.data);

      const url = URL.createObjectURL(blob);

      setViewUrl(url);
    } catch (error) {
      console.error("PDF Preview Error:", error);

      const message = await getBlobError(error);

      setViewError(message);
      toast.error(message);
    } finally {
      setViewLoading(false);
    }
  };

  const closeViewer = () => {
    setViewPdf(null);
    setViewUrl("");
    setViewError("");
    setViewLoading(false);
  };

  // ============================================
  // DOWNLOAD PDF
  // ============================================
  const downloadPdf = async (pdf) => {
    if (downloadingId !== null) return;

    setDownloadingId(pdf.id);

    try {
      const response = await downloadPdfFile(pdf.id);

      const blob = await makePdfBlob(response.data);

      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");

      link.href = url;
      link.download =
        pdf.original_name ||
        `${pdf.title || "document"}.pdf`;

      document.body.appendChild(link);
      link.click();
      link.remove();

      // Give browser time to begin download
      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 10000);

      toast.success("PDF download started");
    } catch (error) {
      console.error("Download PDF Error:", error);

      toast.error(await getBlobError(error));
    } finally {
      setDownloadingId(null);
    }
  };

  // ============================================
  // DELETE SINGLE PDF
  // ============================================
  const removePdf = async () => {
    if (!deleteTarget || deleting) return;

    setDeleting(true);

    try {
      const response = await deletePdf(deleteTarget.id);

      if (response.data?.success === false) {
        throw new Error(response.data.message);
      }

      toast.success("PDF deleted successfully");

      setSelectedIds((prev) =>
        prev.filter((id) => id !== deleteTarget.id)
      );

      setDeleteTarget(null);
      await fetchPdfs();
    } catch (error) {
      console.error("Delete PDF Error:", error);
      toast.error(getErrorMessage(error));
    } finally {
      setDeleting(false);
    }
  };

  // ============================================
  // BULK DELETE
  // ============================================
  const bulkDelete = async () => {
    if (!selectedIds.length || deleting) return;

    const confirmed = window.confirm(
      `Delete ${selectedIds.length} selected PDFs?`
    );

    if (!confirmed) return;

    setDeleting(true);

    try {
      const response = await bulkDeletePdfs(selectedIds);

      if (response.data?.success === false) {
        throw new Error(response.data.message);
      }

      toast.success("Selected PDFs deleted successfully");

      setSelectedIds([]);
      await fetchPdfs();
    } catch (error) {
      console.error("Bulk Delete Error:", error);
      toast.error(getErrorMessage(error));
    } finally {
      setDeleting(false);
    }
  };

  // ============================================
  // CHECKBOX SELECTION
  // ============================================
  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id]
    );
  };

  const toggleAll = () => {
    setSelectedIds((prev) =>
      allPageSelected
        ? prev.filter(
            (id) => !currentPageIds.includes(id)
          )
        : [...new Set([...prev, ...currentPageIds])]
    );
  };

  // ============================================
  // JSX
  // ============================================
  return (
    <div className="space-y-6">
      {/* =====================================
          HEADER
      ===================================== */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            PDF Management
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Upload, organize and manage PDF documents.
          </p>
        </div>

        <button
          type="button"
          onClick={openAdd}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
        >
          <Plus size={18} />
          Upload PDF
        </button>
      </div>

      {/* =====================================
          STATISTICS
      ===================================== */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          {
            label: "Total PDFs",
            value: pdfs.length,
            icon: FileText,
          },
          {
            label: "Categories",
            value: categories.length,
            icon: FolderOpen,
          },
          {
            label: "Total Storage",
            value: sizeLabel(totalSize),
            icon: Upload,
          },
        ].map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.label}
              className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div>
                <p className="text-sm text-slate-500">
                  {item.label}
                </p>

                <h2 className="mt-2 text-3xl font-bold text-slate-900">
                  {loading ? "..." : item.value}
                </h2>
              </div>

              <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600">
                <Icon size={23} />
              </div>
            </div>
          );
        })}
      </div>

      {/* =====================================
          PDF TABLE CARD
      ===================================== */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {/* Toolbar */}
        <div className="flex flex-col gap-4 border-b border-slate-100 p-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="font-bold text-slate-900">
              All PDF Documents
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              {filteredPdfs.length} documents found
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search */}
            <div className="relative min-w-48 flex-1">
              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search PDFs..."
                className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-indigo-500"
              />
            </div>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setPage(1);
              }}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none"
            >
              <option value="">All Categories</option>

              {categories.map((category) => (
                <option
                  key={category.id}
                  value={category.id}
                >
                  {category.name}
                </option>
              ))}
            </select>

            {/* Refresh */}
            <button
              type="button"
              onClick={fetchPdfs}
              title="Refresh"
              className="rounded-xl border border-slate-200 p-2.5 text-slate-600 hover:bg-slate-50"
            >
              <RefreshCw
                size={18}
                className={
                  loading ? "animate-spin" : ""
                }
              />
            </button>

            {/* Bulk Delete */}
            {selectedIds.length > 0 && (
              <button
                type="button"
                onClick={bulkDelete}
                disabled={deleting}
                className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
              >
                <Trash2 size={16} />
                Delete ({selectedIds.length})
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] text-left">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-5 py-4">
                  <input
                    type="checkbox"
                    checked={allPageSelected}
                    onChange={toggleAll}
                    className="h-4 w-4 accent-indigo-600"
                  />
                </th>

                <th className="px-5 py-4">
                  PDF Document
                </th>

                <th className="px-5 py-4">
                  Category
                </th>

                <th className="px-5 py-4">
                  File Size
                </th>

                <th className="px-5 py-4">
                  Uploaded
                </th>

                <th className="px-5 py-4 text-right">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="py-16 text-center"
                  >
                    <Loader2
                      size={28}
                      className="mx-auto animate-spin text-indigo-600"
                    />

                    <p className="mt-3 text-sm text-slate-500">
                      Loading PDFs...
                    </p>
                  </td>
                </tr>
              ) : paginatedPdfs.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="py-16 text-center text-sm text-slate-500"
                  >
                    <FileText
                      size={36}
                      className="mx-auto mb-3 text-slate-300"
                    />
                    No PDF documents found
                  </td>
                </tr>
              ) : (
                paginatedPdfs.map((pdf) => (
                  <tr
                    key={pdf.id}
                    className="transition hover:bg-slate-50"
                  >
                    {/* Checkbox */}
                    <td className="px-5 py-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(
                          pdf.id
                        )}
                        onChange={() =>
                          toggleSelect(pdf.id)
                        }
                        className="h-4 w-4 accent-indigo-600"
                      />
                    </td>

                    {/* Document */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-red-50 p-3 text-red-600">
                          <FileText size={21} />
                        </div>

                        <div className="min-w-0">
                          <p className="max-w-64 truncate text-sm font-semibold text-slate-800">
                            {pdf.title ||
                              pdf.original_name}
                          </p>

                          <p className="max-w-64 truncate text-xs text-slate-400">
                            {pdf.original_name ||
                              "PDF File"}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-5 py-4">
                      <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                        {categoryName(pdf)}
                      </span>
                    </td>

                    {/* Size */}
                    <td className="px-5 py-4 text-sm text-slate-600">
                      {sizeLabel(pdf.file_size)}
                    </td>

                    {/* Date */}
                    <td className="px-5 py-4 text-sm text-slate-500">
                      {dateLabel(pdf.created_at)}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        {/* VIEW */}
                        <button
                          type="button"
                          onClick={() => openView(pdf)}
                          title="View PDF"
                          className="rounded-lg bg-blue-50 p-2 text-blue-600 hover:bg-blue-100"
                        >
                          <Eye size={17} />
                        </button>

                        {/* DOWNLOAD */}
                        <button
                          type="button"
                          onClick={() =>
                            downloadPdf(pdf)
                          }
                          disabled={
                            downloadingId !== null
                          }
                          title="Download PDF"
                          className="rounded-lg bg-emerald-50 p-2 text-emerald-600 hover:bg-emerald-100 disabled:opacity-50"
                        >
                          {downloadingId === pdf.id ? (
                            <Loader2
                              size={17}
                              className="animate-spin"
                            />
                          ) : (
                            <Download size={17} />
                          )}
                        </button>

                        {/* EDIT */}
                        <button
                          type="button"
                          onClick={() => openEdit(pdf)}
                          title="Edit PDF"
                          className="rounded-lg bg-indigo-50 p-2 text-indigo-600 hover:bg-indigo-100"
                        >
                          <Pencil size={17} />
                        </button>

                        {/* DELETE */}
                        <button
                          type="button"
                          onClick={() =>
                            setDeleteTarget(pdf)
                          }
                          title="Delete PDF"
                          className="rounded-lg bg-red-50 p-2 text-red-600 hover:bg-red-100"
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-slate-100 px-5 py-4">
          <p className="text-xs text-slate-500">
            Page {currentPage} of {totalPages}
          </p>

          <div className="flex gap-2">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() =>
                setPage(currentPage - 1)
              }
              className="rounded-lg border border-slate-200 p-2 disabled:opacity-40"
            >
              <ChevronLeft size={18} />
            </button>

            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() =>
                setPage(currentPage + 1)
              }
              className="rounded-lg border border-slate-200 p-2 disabled:opacity-40"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* =====================================
          PDF VIEWER MODAL
      ===================================== */}
      {viewPdf && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/70 p-2 sm:p-5"
          role="dialog"
          aria-modal="true"
          aria-label="PDF Viewer"
        >
          <div className="flex h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
            {/* Viewer Header */}
            <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
              <div className="min-w-0">
                <h2 className="truncate font-bold text-slate-900">
                  {viewPdf.title ||
                    viewPdf.original_name}
                </h2>

                <p className="text-xs text-slate-500">
                  PDF Preview
                </p>
              </div>

              <div className="flex items-center gap-2">
                {viewUrl && (
                  <a
                    href={viewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg bg-indigo-50 px-3 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-100"
                  >
                    <ExternalLink size={16} />
                    Open
                  </a>
                )}

                <button
                  type="button"
                  onClick={closeViewer}
                  className="rounded-lg p-2 hover:bg-slate-100"
                  title="Close"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Viewer Content */}
            <div className="min-h-0 flex-1 bg-slate-100">
              {viewLoading ? (
                <div className="flex h-full items-center justify-center gap-3 text-slate-500">
                  <Loader2
                    size={24}
                    className="animate-spin text-indigo-600"
                  />
                  Loading PDF...
                </div>
              ) : viewError ? (
                <div className="flex h-full flex-col items-center justify-center p-6 text-center">
                  <AlertTriangle
                    size={36}
                    className="mb-3 text-red-500"
                  />

                  <p className="font-semibold text-red-600">
                    Unable to preview PDF
                  </p>

                  <p className="mt-2 max-w-lg text-sm text-slate-600">
                    {viewError}
                  </p>
                </div>
              ) : viewUrl ? (
                <iframe
                  key={viewUrl}
                  src={`${viewUrl}#toolbar=1&navpanes=0`}
                  title={
                    viewPdf.title || "PDF Preview"
                  }
                  className="h-full w-full border-0"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-slate-500">
                  PDF preview unavailable
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =====================================
          UPLOAD / EDIT MODAL
      ===================================== */}
      {modalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4">
          <div className="flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 p-5">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {editingPdf
                    ? "Edit PDF"
                    : "Upload New PDF"}
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  {editingPdf
                    ? "Update document details or replace its file."
                    : "Add a new PDF document."}
                </p>
              </div>

              <button
                type="button"
                onClick={closeForm}
                disabled={saving}
                className="rounded-lg p-2 hover:bg-slate-100"
              >
                <X size={21} />
              </button>
            </div>

            {/* Form */}
            <form
              onSubmit={savePdf}
              className="space-y-5 overflow-y-auto p-5"
            >
              {/* Title */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  PDF Title
                </label>

                <input
                  type="text"
                  value={form.title}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      title: e.target.value,
                    }))
                  }
                  placeholder="Enter PDF title"
                  className={inputClass}
                />
              </div>

              {/* Category */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Category
                </label>

                <select
                  value={form.category_id}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      category_id: e.target.value,
                    }))
                  }
                  className={inputClass}
                >
                  <option value="">
                    No Category
                  </option>

                  {categories.map((category) => (
                    <option
                      key={category.id}
                      value={category.id}
                    >
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* File */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  PDF File {!editingPdf && "*"}
                </label>

                <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-indigo-200 bg-indigo-50/50 p-8 text-center transition hover:border-indigo-400 hover:bg-indigo-50">
                  <Upload
                    size={32}
                    className="mb-3 text-indigo-500"
                  />

                  <p className="text-sm font-semibold text-slate-700">
                    {form.pdf
                      ? form.pdf.name
                      : editingPdf
                      ? "Choose a new PDF to replace current file"
                      : "Click to choose a PDF file"}
                  </p>

                  <p className="mt-2 text-xs text-slate-500">
                    PDF only · Maximum 10MB
                  </p>

                  <input
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={chooseFile}
                    className="hidden"
                  />
                </label>

                {form.pdf && (
                  <p className="mt-2 text-xs text-emerald-600">
                    Selected: {form.pdf.name} (
                    {sizeLabel(form.pdf.size)})
                  </p>
                )}

                {editingPdf && !form.pdf && (
                  <p className="mt-2 text-xs text-slate-500">
                    Current file:{" "}
                    {editingPdf.original_name}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3 border-t border-slate-100 pt-5">
                <button
                  type="button"
                  onClick={closeForm}
                  disabled={saving}
                  className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
                >
                  {saving && (
                    <Loader2
                      size={17}
                      className="animate-spin"
                    />
                  )}

                  {saving
                    ? "Saving..."
                    : editingPdf
                    ? "Update PDF"
                    : "Upload PDF"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================
          DELETE CONFIRMATION MODAL
      ===================================== */}
      {deleteTarget && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/50 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600">
              <AlertTriangle size={24} />
            </div>

            <h2 className="text-xl font-bold text-slate-900">
              Delete PDF?
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Are you sure you want to delete{" "}
              <strong>
                {deleteTarget.title ||
                  deleteTarget.original_name}
              </strong>
              ? This action cannot be undone.
            </p>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                disabled={deleting}
                onClick={() =>
                  setDeleteTarget(null)
                }
                className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={deleting}
                onClick={removePdf}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
              >
                {deleting && (
                  <Loader2
                    size={16}
                    className="animate-spin"
                  />
                )}

                {deleting
                  ? "Deleting..."
                  : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
