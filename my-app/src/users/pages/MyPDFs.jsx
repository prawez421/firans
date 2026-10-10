
import { useEffect, useMemo, useState } from "react";

import {
  Search,
  FileText,
  Eye,
  Download,
  RefreshCw,
  FolderOpen,
  Loader2,
  AlertCircle,
  Files,
} from "lucide-react";

import toast from "react-hot-toast";

import {
  getUserPdfs,
  previewUserPdf,
  downloadUserPdf,
} from "../../services/usersServies/userPdfService";

// ==========================================
// ERROR MESSAGE
// ==========================================
const getErrorMessage = (error, fallback) => {
  const status = error?.response?.status;

  if (status === 401) {
    return "Session expired. Please login again.";
  }

  if (status === 403) {
    return "You do not have permission.";
  }

  if (status === 404) {
    return (
      error?.response?.data?.message ||
      "PDF route or file not found (404)."
    );
  }

  if (status === 500) {
    return "Laravel server error (500).";
  }

  return (
    error?.response?.data?.message ||
    error?.message ||
    fallback
  );
};

// ==========================================
// FORMAT FILE SIZE
// ==========================================
const formatFileSize = (bytes) => {
  const size = Number(bytes);

  if (!Number.isFinite(size) || size < 0) {
    return null;
  }

  if (size < 1024) return `${size} B`;

  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }

  return `${(size / (1024 * 1024)).toFixed(2)} MB`;
};

// ==========================================
// MAIN COMPONENT
// ==========================================
export default function MyPDFs() {
  const [pdfs, setPdfs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  const [busyId, setBusyId] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  // ========================================
  // FETCH PDF LIST
  // ========================================
  const fetchPdfs = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const response = await getUserPdfs();

      console.log("PDF API Response:", response);

      if (response?.success === false) {
        throw new Error(
          response?.message || "Failed to load PDFs."
        );
      }

      const records = Array.isArray(response)
        ? response
        : Array.isArray(response?.data)
          ? response.data
          : Array.isArray(response?.data?.data)
            ? response.data.data
            : null;

      if (!records) {
        throw new Error(
          "Unexpected PDF API response format."
        );
      }

      setPdfs(records);
    } catch (error) {
      console.error("PDF Fetch Error:", error);

      const message = getErrorMessage(
        error,
        "Failed to load PDFs."
      );

      setErrorMessage(message);
      setPdfs([]);

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // INITIAL LOAD
  // ========================================
  useEffect(() => {
    fetchPdfs();
  }, []);

  // ========================================
  // CATEGORY LIST WITH PDF COUNT
  // ========================================
  const categories = useMemo(() => {
    const categoryMap = new Map();

    pdfs.forEach((pdf) => {
      const name =
        pdf.category?.name?.trim() || "Uncategorized";

      const current = categoryMap.get(name) || 0;

      categoryMap.set(name, current + 1);
    });

    return Array.from(categoryMap.entries())
      .map(([name, count]) => ({
        name,
        count,
      }))
      .sort((a, b) =>
        a.name.localeCompare(b.name)
      );
  }, [pdfs]);

  // ========================================
  // FILTER PDFS
  // ========================================
  const filteredPdfs = useMemo(() => {
    const searchText = search.toLowerCase().trim();

    return pdfs.filter((pdf) => {
      const title = String(
        pdf.title || ""
      ).toLowerCase();

      const originalName = String(
        pdf.original_name || ""
      ).toLowerCase();

      const description = String(
        pdf.description || ""
      ).toLowerCase();

      const categoryName =
        pdf.category?.name?.trim() || "Uncategorized";

      const matchSearch =
        title.includes(searchText) ||
        originalName.includes(searchText) ||
        description.includes(searchText) ||
        categoryName
          .toLowerCase()
          .includes(searchText);

      const matchCategory =
        category === "all" ||
        categoryName === category;

      return matchSearch && matchCategory;
    });
  }, [pdfs, search, category]);

  // ========================================
  // VIEW PDF
  // ========================================
  const handleView = async (pdf) => {
    if (busyId !== null) return;

    const newTab = window.open("", "_blank");

    if (!newTab) {
      toast.error(
        "Please allow pop-ups to preview PDFs."
      );
      return;
    }

    try {
      setBusyId(pdf.id);

      const blob = await previewUserPdf(pdf.id);

      const pdfBlob = new Blob([blob], {
        type: "application/pdf",
      });

      const url = URL.createObjectURL(pdfBlob);

      newTab.location.href = url;

      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 120000);
    } catch (error) {
      console.error("PDF Preview Error:", error);

      newTab.close();

      toast.error(
        getErrorMessage(
          error,
          "Unable to preview this PDF."
        )
      );
    } finally {
      setBusyId(null);
    }
  };

  // ========================================
  // DOWNLOAD PDF
  // ========================================
  const handleDownload = async (pdf) => {
    if (busyId !== null) return;

    try {
      setBusyId(pdf.id);

      const blob = await downloadUserPdf(pdf.id);

      const pdfBlob = new Blob([blob], {
        type: "application/pdf",
      });

      const url = URL.createObjectURL(pdfBlob);

      const link = document.createElement("a");

      let fileName =
        pdf.original_name ||
        pdf.title ||
        `document-${pdf.id}`;

      if (!fileName.toLowerCase().endsWith(".pdf")) {
        fileName += ".pdf";
      }

      link.href = url;
      link.download = fileName;

      document.body.appendChild(link);

      link.click();
      link.remove();

      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 3000);

      toast.success(
        "PDF downloaded successfully."
      );
    } catch (error) {
      console.error("PDF Download Error:", error);

      toast.error(
        getErrorMessage(
          error,
          "Failed to download PDF."
        )
      );
    } finally {
      setBusyId(null);
    }
  };

  // ========================================
  // RENDER
  // ========================================
  return (
    <div className="space-y-6">

      {/* ====================================
          HEADER
      ==================================== */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            My PDFs
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Browse, preview and download PDF documents.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchPdfs}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RefreshCw
            size={17}
            className={
              loading ? "animate-spin" : ""
            }
          />
          Refresh
        </button>
      </div>

      {/* ====================================
          ERROR MESSAGE
      ==================================== */}
      {errorMessage && (
        <div className="flex flex-col gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <AlertCircle
              size={20}
              className="mt-0.5 shrink-0 text-red-600"
            />

            <div>
              <p className="text-sm font-semibold text-red-700">
                Failed to load PDFs
              </p>

              <p className="mt-1 text-sm text-red-600">
                {errorMessage}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={fetchPdfs}
            disabled={loading}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
          >
            Try Again
          </button>
        </div>
      )}

      {/* ====================================
          SUMMARY CARDS
      ==================================== */}
      <div className="grid gap-4 sm:grid-cols-2">

        {/* TOTAL PDFS */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600">
              <FileText size={22} />
            </div>

            <div>
              <p className="text-sm text-slate-500">
                Total PDFs
              </p>

              <p className="text-2xl font-bold text-slate-900">
                {pdfs.length}
              </p>
            </div>
          </div>
        </div>

        {/* TOTAL CATEGORIES */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
              <FolderOpen size={22} />
            </div>

            <div>
              <p className="text-sm text-slate-500">
                Categories
              </p>

              <p className="text-2xl font-bold text-slate-900">
                {categories.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ====================================
          CATEGORY SECTION
      ==================================== */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

        <div className="mb-5 flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <FolderOpen
              size={21}
              className="text-indigo-600"
            />

            <h2 className="text-lg font-bold text-slate-900">
              Browse by Category
            </h2>
          </div>

          <p className="text-sm text-slate-500">
            Select a category to view its PDF documents.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">

          {/* ALL CATEGORIES */}
          <button
            type="button"
            onClick={() => setCategory("all")}
            className={`
              inline-flex items-center gap-2
              rounded-xl border px-4 py-2.5
              text-sm font-semibold
              transition-all duration-200
              ${
                category === "all"
                  ? "border-indigo-600 bg-indigo-600 text-white shadow-sm"
                  : "border-slate-200 bg-slate-50 text-slate-700 hover:border-indigo-300 hover:bg-indigo-50"
              }
            `}
          >
            <Files size={17} />

            All Categories

            <span
              className={`
                rounded-lg px-2 py-0.5 text-xs
                ${
                  category === "all"
                    ? "bg-white/20 text-white"
                    : "bg-slate-200 text-slate-600"
                }
              `}
            >
              {pdfs.length}
            </span>
          </button>

          {/* DYNAMIC CATEGORIES */}
          {categories.map((item) => {
            const isActive =
              category === item.name;

            return (
              <button
                key={item.name}
                type="button"
                onClick={() =>
                  setCategory(item.name)
                }
                className={`
                  inline-flex items-center gap-2
                  rounded-xl border px-4 py-2.5
                  text-sm font-semibold
                  transition-all duration-200
                  ${
                    isActive
                      ? "border-indigo-600 bg-indigo-600 text-white shadow-sm"
                      : "border-slate-200 bg-slate-50 text-slate-700 hover:border-indigo-300 hover:bg-indigo-50"
                  }
                `}
              >
                <FolderOpen size={16} />

                {item.name}

                <span
                  className={`
                    rounded-lg px-2 py-0.5 text-xs
                    ${
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-slate-200 text-slate-600"
                    }
                  `}
                >
                  {item.count}
                </span>
              </button>
            );
          })}
        </div>

        {!loading &&
          !errorMessage &&
          categories.length === 0 && (
            <p className="mt-4 text-sm text-slate-400">
              No PDF categories available yet.
            </p>
          )}
      </div>

      {/* ====================================
          SEARCH
      ==================================== */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="relative">

          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="text"
            placeholder="Search PDF by title, filename or category..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-indigo-500"
          />
        </div>
      </div>

      {/* ====================================
          PDF SECTION HEADER
      ==================================== */}
      <div className="flex flex-wrap items-center justify-between gap-3">

        <div>
          <h2 className="text-lg font-bold text-slate-900">
            {category === "all"
              ? "All PDF Documents"
              : `${category} PDFs`}
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Showing {filteredPdfs.length} documents
          </p>
        </div>

        {category !== "all" && (
          <button
            type="button"
            onClick={() => setCategory("all")}
            className="text-sm font-semibold text-indigo-600 hover:text-indigo-700"
          >
            Clear Category
          </button>
        )}
      </div>

      {/* ====================================
          PDF GRID
      ==================================== */}
      {loading ? (

        // LOADING
        <div className="flex min-h-[280px] items-center justify-center">
          <div className="flex flex-col items-center gap-3">

            <Loader2
              size={34}
              className="animate-spin text-indigo-600"
            />

            <p className="text-sm text-slate-500">
              Loading PDFs...
            </p>
          </div>
        </div>

      ) : errorMessage ? (

        // API ERROR
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center">

          <AlertCircle
            size={40}
            className="mx-auto text-red-400"
          />

          <h3 className="mt-4 text-lg font-bold text-slate-800">
            Unable to load documents
          </h3>

          <p className="mt-2 text-sm text-slate-500">
            Check the API error above and try again.
          </p>
        </div>

      ) : filteredPdfs.length === 0 ? (

        // EMPTY STATE
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center">

          <FileText
            size={42}
            className="mx-auto text-slate-300"
          />

          <h3 className="mt-4 text-lg font-bold text-slate-800">
            No PDFs Found
          </h3>

          <p className="mt-2 text-sm text-slate-500">
            {pdfs.length === 0
              ? "No PDF documents are available yet."
              : "Try changing your search or category filter."}
          </p>

          {(search || category !== "all") && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setCategory("all");
              }}
              className="mt-5 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              Clear Filters
            </button>
          )}
        </div>

      ) : (

        // PDF CARDS
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">

          {filteredPdfs.map((pdf) => {
            const isBusy = busyId === pdf.id;

            const fileSize = formatFileSize(
              pdf.file_size
            );

            return (
              <div
                key={pdf.id}
                className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
              >

                {/* ICON AND CATEGORY */}
                <div className="mb-4 flex items-start justify-between gap-3">

                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                    <FileText size={28} />
                  </div>

                  <span className="max-w-[65%] truncate rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-700">
                    {pdf.category?.name ||
                      "Uncategorized"}
                  </span>
                </div>

                {/* PDF TITLE */}
                <h3 className="line-clamp-2 text-base font-bold text-slate-900">
                  {pdf.title ||
                    pdf.original_name ||
                    "Untitled PDF"}
                </h3>

                {/* DESCRIPTION */}
                {pdf.description && (
                  <p className="mt-2 line-clamp-2 text-sm text-slate-500">
                    {pdf.description}
                  </p>
                )}

                {/* FILE NAME */}
                <p
                  className="mt-3 truncate text-xs text-slate-400"
                  title={
                    pdf.original_name || ""
                  }
                >
                  {pdf.original_name ||
                    "PDF Document"}
                </p>

                {/* FILE SIZE */}
                {fileSize && (
                  <p className="mt-2 text-xs text-slate-400">
                    Size: {fileSize}
                  </p>
                )}

                {/* ACTION BUTTONS */}
                <div className="mt-auto flex gap-3 pt-6">

                  {/* VIEW */}
                  <button
                    type="button"
                    onClick={() =>
                      handleView(pdf)
                    }
                    disabled={busyId !== null}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-indigo-200 px-3 py-2.5 text-sm font-semibold text-indigo-600 transition hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isBusy ? (
                      <Loader2
                        size={17}
                        className="animate-spin"
                      />
                    ) : (
                      <Eye size={17} />
                    )}

                    View
                  </button>

                  {/* DOWNLOAD */}
                  <button
                    type="button"
                    onClick={() =>
                      handleDownload(pdf)
                    }
                    disabled={busyId !== null}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isBusy ? (
                      <Loader2
                        size={17}
                        className="animate-spin"
                      />
                    ) : (
                      <Download size={17} />
                    )}

                    Download
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
