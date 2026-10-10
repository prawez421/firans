
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  FolderOpen,
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  Loader2,
  RefreshCw,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
} from "lucide-react";

import toast from "react-hot-toast";

import {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../../services/adminServies/categoryService";

// ==========================================
// CONFIG
// ==========================================
const PAGE_SIZE = 10;

const EMPTY_FORM = {
  name: "",
  slug: "",
  description: "",
  status: "active",
};

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100";

// ==========================================
// HELPERS
// ==========================================
const generateSlug = (value) => {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
};

const getErrorMessage = (error) => {
  const errors = error?.response?.data?.errors;

  if (errors) {
    const firstError = Object.values(errors).flat()[0];

    if (firstError) return String(firstError);
  }

  return (
    error?.response?.data?.message ||
    error?.message ||
    "Something went wrong"
  );
};

const getCategoryList = (payload) => {
  if (Array.isArray(payload)) return payload;

  if (Array.isArray(payload?.data)) {
    return payload.data;
  }

  if (Array.isArray(payload?.data?.data)) {
    return payload.data.data;
  }

  return [];
};

const formatDate = (date) => {
  if (!date) return "—";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "—";

  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

// ==========================================
// MAIN COMPONENT
// ==========================================
export default function Categories() {
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [page, setPage] = useState(1);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] =
    useState(null);

  const [deleteTarget, setDeleteTarget] = useState(null);

  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [slugManuallyEdited, setSlugManuallyEdited] =
    useState(false);

  // ==========================================
  // FETCH CATEGORIES
  // ==========================================
  const fetchCategories = useCallback(async () => {
    setLoading(true);

    try {
      const response = await getAllCategories();

      const list = getCategoryList(response.data);

      setCategories(list);
    } catch (error) {
      console.error("Fetch Categories Error:", error);

      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // ==========================================
  // FILTERING
  // ==========================================
  const filteredCategories = useMemo(() => {
    const query = search.trim().toLowerCase();

    return categories.filter((category) => {
      const matchesSearch = [
        category.name,
        category.slug,
        category.description,
      ].some((value) =>
        String(value || "").toLowerCase().includes(query)
      );

      const matchesStatus =
        statusFilter === "all" ||
        category.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [categories, search, statusFilter]);

  // ==========================================
  // PAGINATION
  // ==========================================
  const totalPages = Math.max(
    1,
    Math.ceil(filteredCategories.length / PAGE_SIZE)
  );

  const currentPage = Math.min(page, totalPages);

  const paginatedCategories = filteredCategories.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  // ==========================================
  // DASHBOARD STATS
  // ==========================================
  const totalCategories = categories.length;

  const activeCategories = categories.filter(
    (category) => category.status === "active"
  ).length;

  const inactiveCategories = categories.filter(
    (category) => category.status === "inactive"
  ).length;

  // ==========================================
  // OPEN ADD MODAL
  // ==========================================
  const openAddModal = () => {
    setEditingCategory(null);

    setForm({ ...EMPTY_FORM });

    setSlugManuallyEdited(false);

    setModalOpen(true);
  };

  // ==========================================
  // OPEN EDIT MODAL
  // ==========================================
  const openEditModal = (category) => {
    setEditingCategory(category);

    setForm({
      name: category.name || "",
      slug: category.slug || "",
      description: category.description || "",
      status: category.status || "active",
    });

    setSlugManuallyEdited(true);

    setModalOpen(true);
  };

  // ==========================================
  // CLOSE MODAL
  // ==========================================
  const closeModal = () => {
    if (saving) return;

    setModalOpen(false);

    setEditingCategory(null);

    setForm({ ...EMPTY_FORM });

    setSlugManuallyEdited(false);
  };

  // ==========================================
  // HANDLE NAME CHANGE
  // ==========================================
  const handleNameChange = (value) => {
    setForm((prev) => ({
      ...prev,
      name: value,
      slug: slugManuallyEdited
        ? prev.slug
        : generateSlug(value),
    }));
  };

  // ==========================================
  // HANDLE SLUG CHANGE
  // ==========================================
  const handleSlugChange = (value) => {
    setSlugManuallyEdited(true);

    setForm((prev) => ({
      ...prev,
      slug: generateSlug(value),
    }));
  };

  // ==========================================
  // SAVE CATEGORY
  // ==========================================
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (saving) return;

    if (!form.name.trim()) {
      toast.error("Category name is required");
      return;
    }

    if (!form.slug.trim()) {
      toast.error("Category slug is required");
      return;
    }

    const payload = {
      name: form.name.trim(),
      slug: generateSlug(form.slug),
      description: form.description.trim() || null,
      status: form.status,
    };

    setSaving(true);

    try {
      const response = editingCategory
        ? await updateCategory(
            editingCategory.id,
            payload
          )
        : await createCategory(payload);

      if (response.data?.status === "error") {
        throw new Error(
          response.data.message || "Operation failed"
        );
      }

      toast.success(
        editingCategory
          ? "Category updated successfully"
          : "Category created successfully"
      );

      setModalOpen(false);
      setEditingCategory(null);
      setForm({ ...EMPTY_FORM });
      setSlugManuallyEdited(false);

      await fetchCategories();
    } catch (error) {
      console.error("Save Category Error:", error);

      toast.error(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // DELETE CATEGORY
  // ==========================================
  const handleDelete = async () => {
    if (!deleteTarget || deleting) return;

    setDeleting(true);

    try {
      const response = await deleteCategory(
        deleteTarget.id
      );

      if (response.data?.status === "error") {
        throw new Error(
          response.data.message || "Delete failed"
        );
      }

      toast.success("Category deleted successfully");

      setDeleteTarget(null);

      await fetchCategories();
    } catch (error) {
      console.error("Delete Category Error:", error);

      toast.error(getErrorMessage(error));
    } finally {
      setDeleting(false);
    }
  };

  // ==========================================
  // JSX
  // ==========================================
  return (
    <div className="space-y-6">
      {/* =====================================
          PAGE HEADER
      ===================================== */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Category Management
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage categories for your PDF documents.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
        >
          <Plus size={18} />
          Add Category
        </button>
      </div>

      {/* =====================================
          STATISTICS CARDS
      ===================================== */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          {
            title: "Total Categories",
            value: totalCategories,
            icon: FolderOpen,
            color: "indigo",
          },
          {
            title: "Active Categories",
            value: activeCategories,
            icon: CheckCircle2,
            color: "emerald",
          },
          {
            title: "Inactive Categories",
            value: inactiveCategories,
            icon: XCircle,
            color: "rose",
          },
        ].map((item) => {
          const Icon = item.icon;

          const iconStyles = {
            indigo: "bg-indigo-50 text-indigo-600",
            emerald: "bg-emerald-50 text-emerald-600",
            rose: "bg-rose-50 text-rose-600",
          };

          return (
            <div
              key={item.title}
              className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div>
                <p className="text-sm text-slate-500">
                  {item.title}
                </p>

                <h2 className="mt-2 text-3xl font-bold text-slate-900">
                  {loading ? "..." : item.value}
                </h2>
              </div>

              <div
                className={`rounded-xl p-3 ${
                  iconStyles[item.color]
                }`}
              >
                <Icon size={23} />
              </div>
            </div>
          );
        })}
      </div>

      {/* =====================================
          CATEGORY TABLE
      ===================================== */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {/* Toolbar */}
        <div className="flex flex-col gap-4 border-b border-slate-100 p-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="font-bold text-slate-900">
              All Categories
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              {filteredCategories.length} categories found
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
                placeholder="Search categories..."
                className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-indigo-500"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            {/* Refresh */}
            <button
              type="button"
              onClick={fetchCategories}
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
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-5 py-4">#</th>
                <th className="px-5 py-4">Category</th>
                <th className="px-5 py-4">Slug</th>
                <th className="px-5 py-4">Description</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Created</th>
                <th className="px-5 py-4 text-right">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td
                    colSpan={7}
                    className="py-16 text-center"
                  >
                    <Loader2
                      size={28}
                      className="mx-auto animate-spin text-indigo-600"
                    />

                    <p className="mt-3 text-sm text-slate-500">
                      Loading categories...
                    </p>
                  </td>
                </tr>
              ) : paginatedCategories.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="py-16 text-center"
                  >
                    <FolderOpen
                      size={36}
                      className="mx-auto mb-3 text-slate-300"
                    />

                    <p className="text-sm text-slate-500">
                      No categories found
                    </p>
                  </td>
                </tr>
              ) : (
                paginatedCategories.map(
                  (category, index) => (
                    <tr
                      key={category.id}
                      className="transition hover:bg-slate-50"
                    >
                      {/* Serial */}
                      <td className="px-5 py-4 text-sm text-slate-500">
                        {(currentPage - 1) *
                          PAGE_SIZE +
                          index +
                          1}
                      </td>

                      {/* Name */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600">
                            <FolderOpen size={19} />
                          </div>

                          <p className="font-semibold text-slate-800">
                            {category.name}
                          </p>
                        </div>
                      </td>

                      {/* Slug */}
                      <td className="px-5 py-4">
                        <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs text-slate-600">
                          {category.slug}
                        </span>
                      </td>

                      {/* Description */}
                      <td className="max-w-60 truncate px-5 py-4 text-sm text-slate-500">
                        {category.description || "—"}
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        {category.status === "active" ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                            <CheckCircle2 size={13} />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700">
                            <XCircle size={13} />
                            Inactive
                          </span>
                        )}
                      </td>

                      {/* Date */}
                      <td className="px-5 py-4 text-sm text-slate-500">
                        {formatDate(category.created_at)}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              openEditModal(category)
                            }
                            title="Edit Category"
                            className="rounded-lg bg-indigo-50 p-2 text-indigo-600 hover:bg-indigo-100"
                          >
                            <Pencil size={17} />
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              setDeleteTarget(category)
                            }
                            title="Delete Category"
                            className="rounded-lg bg-red-50 p-2 text-red-600 hover:bg-red-100"
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                )
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
          ADD / EDIT MODAL
      ===================================== */}
      {modalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4">
          <div className="flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 p-5">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {editingCategory
                    ? "Edit Category"
                    : "Add New Category"}
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  {editingCategory
                    ? "Update category information."
                    : "Create a new PDF category."}
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                className="rounded-lg p-2 hover:bg-slate-100"
              >
                <X size={21} />
              </button>
            </div>

            {/* Form */}
            <form
              onSubmit={handleSubmit}
              className="space-y-5 overflow-y-auto p-5"
            >
              {/* Category Name */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Category Name *
                </label>

                <input
                  type="text"
                  value={form.name}
                  onChange={(e) =>
                    handleNameChange(e.target.value)
                  }
                  placeholder="Example: Programming"
                  required
                  className={inputClass}
                />
              </div>

              {/* Slug */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Slug *
                </label>

                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) =>
                    handleSlugChange(e.target.value)
                  }
                  placeholder="programming"
                  required
                  className={inputClass}
                />

                <p className="mt-1 text-xs text-slate-400">
                  Automatically generated from category name.
                </p>
              </div>

              {/* Description */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Description
                </label>

                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Enter category description"
                  className={inputClass}
                />
              </div>

              {/* Status */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Status *
                </label>

                <select
                  value={form.status}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      status: e.target.value,
                    }))
                  }
                  className={inputClass}
                >
                  <option value="active">
                    Active
                  </option>

                  <option value="inactive">
                    Inactive
                  </option>
                </select>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 border-t border-slate-100 pt-5">
                <button
                  type="button"
                  onClick={closeModal}
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
                    : editingCategory
                    ? "Update Category"
                    : "Save Category"}
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
              Delete Category?
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Are you sure you want to delete{" "}
              <strong>{deleteTarget.name}</strong>?
              This action cannot be undone.
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
                onClick={handleDelete}
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
