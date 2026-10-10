
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";

import {
  Users as UsersIcon,
  UserPlus,
  Search,
  Pencil,
  Trash2,
  X,
  Loader2,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  ShieldCheck,
  UserRound,
  Camera,
  Upload,
  ImageOff,
} from "lucide-react";

import {
  getAllUsers,
  createAdminUser,
  updateAdminUser,
  deleteAdminUser,
} from "../../services/adminServies/adminService";

// ==========================================
// CONFIGURATION
// ==========================================
const EMPTY_FORM = {
  name: "",
  email: "",
  password: "",
  role: "user",
  bio: "",
  language: "English",
  avatar: "",
};

const PAGE_SIZE = 10;

const MAX_IMAGE_SIZE = 2 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100";

// ==========================================
// HELPERS
// ==========================================
function getUsersArray(response) {
  const data = response?.data ?? response;

  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.users)) return data.users;
  if (Array.isArray(response?.users)) return response.users;

  return [];
}

function getRole(user) {
  const role = user?.role ?? user?.role_name;

  if (role && typeof role === "object") {
    return String(role.slug ?? role.name ?? "user").toLowerCase();
  }

  return String(role ?? "user").toLowerCase();
}

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
}

function getErrorMessage(error) {
  const errors = error.response?.data?.errors;

  const firstError = errors
    ? Object.values(errors).flat()[0]
    : null;

  return (
    firstError ||
    error.response?.data?.message ||
    error.message ||
    "Something went wrong"
  );
}

function Field({ label, children, className = "" }) {
  return (
    <div className={className}>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </label>
      {children}
    </div>
  );
}

// ==========================================
// AVATAR COMPONENT
// ==========================================
function Avatar({ user, size = "h-11 w-11" }) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [user?.avatar]);

  return (
    <div
      className={`${size} flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-indigo-100 font-bold text-indigo-700`}
    >
      {user?.avatar && !failed ? (
        <img
          src={user.avatar}
          alt={user.name || "User"}
          className="h-full w-full object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <span>
          {user?.name?.charAt(0)?.toUpperCase() || "U"}
        </span>
      )}
    </div>
  );
}

// ==========================================
// MAIN USERS COMPONENT
// ==========================================
export default function Users() {
  // USER DATA
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // FILTERS
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [page, setPage] = useState(1);

  // MODALS
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [deleteUser, setDeleteUser] = useState(null);

  // FORM
  const [form, setForm] = useState({ ...EMPTY_FORM });

  // IMAGE UPLOAD
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [removeAvatar, setRemoveAvatar] = useState(false);

  const fileInputRef = useRef(null);

  // ==========================================
  // FETCH USERS
  // ==========================================
  const fetchUsers = useCallback(async () => {
    setLoading(true);

    try {
      const response = await getAllUsers();

      if (response?.success === false) {
        throw new Error(response.message || "Failed to load users");
      }

      setUsers(getUsersArray(response));
    } catch (error) {
      console.error("Fetch Users Error:", error);
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // ==========================================
  // IMAGE PREVIEW CLEANUP
  // ==========================================
  useEffect(() => {
    return () => {
      if (avatarPreview) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  // ==========================================
  // FILTER USERS
  // ==========================================
  const filteredUsers = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return users.filter((user) => {
      const matchesSearch = [
        user.id,
        user.name,
        user.email,
        user.bio,
        user.language,
        getRole(user),
      ].some((value) =>
        String(value ?? "").toLowerCase().includes(keyword)
      );

      const matchesRole =
        roleFilter === "all" ||
        getRole(user) === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [users, search, roleFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredUsers.length / PAGE_SIZE)
  );

  const currentPage = Math.min(page, totalPages);

  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  // ==========================================
  // RESET IMAGE
  // ==========================================
  const resetImage = () => {
    setAvatarFile(null);
    setAvatarPreview("");
    setRemoveAvatar(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // ==========================================
  // OPEN ADD USER MODAL
  // ==========================================
  const openAddModal = () => {
    setEditingUser(null);
    setForm({ ...EMPTY_FORM });
    resetImage();
    setModalOpen(true);
  };

  // ==========================================
  // OPEN EDIT USER MODAL
  // ==========================================
  const openEditModal = (user) => {
    setEditingUser(user);

    setForm({
      name: user.name ?? "",
      email: user.email ?? "",
      password: "",
      role: getRole(user),
      bio: user.bio ?? "",
      language: user.language ?? "English",
      avatar: user.avatar ?? "",
    });

    resetImage();
    setModalOpen(true);
  };

  // ==========================================
  // CLOSE MODAL
  // ==========================================
  const closeModal = () => {
    if (saving) return;

    setModalOpen(false);
    setEditingUser(null);
    setForm({ ...EMPTY_FORM });
    resetImage();
  };

  // ==========================================
  // HANDLE INPUT CHANGE
  // ==========================================
  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ==========================================
  // HANDLE IMAGE SELECT
  // ==========================================
  const handleAvatarChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      toast.error("Only JPG, PNG and WebP images are allowed");
      event.target.value = "";
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      toast.error("Image size must be less than 2MB");
      event.target.value = "";
      return;
    }

    setAvatarFile(file);
    setRemoveAvatar(false);

    const previewUrl = URL.createObjectURL(file);
    setAvatarPreview(previewUrl);
  };

  // ==========================================
  // REMOVE IMAGE
  // ==========================================
  const handleRemoveImage = () => {
    setAvatarFile(null);
    setAvatarPreview("");
    setRemoveAvatar(true);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // ==========================================
  // SUBMIT ADD / EDIT USER
  // ==========================================
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (saving) return;

    if (!form.name.trim() || !form.email.trim()) {
      toast.error("Name and email are required");
      return;
    }

    if (!editingUser && form.password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    setSaving(true);

    try {
      const payload = new FormData();

      payload.append("name", form.name.trim());
      payload.append("email", form.email.trim());
      payload.append("role", form.role);
      payload.append("bio", form.bio.trim());
      payload.append("language", form.language);

      // PASSWORD
      if (form.password) {
        payload.append("password", form.password);
      }

      // NEW IMAGE
      if (avatarFile) {
        payload.append("avatar", avatarFile);
      }

      // REMOVE EXISTING IMAGE
      if (removeAvatar) {
        payload.append("remove_avatar", "1");
      }

      const response = editingUser
        ? await updateAdminUser(editingUser.id, payload)
        : await createAdminUser(payload);

      if (response?.success === false) {
        throw new Error(
          response.message || "Failed to save user"
        );
      }

      toast.success(
        editingUser
          ? "User updated successfully"
          : "User created successfully"
      );

      closeModalAfterSave();
      await fetchUsers();
    } catch (error) {
      console.error("Save User Error:", error);
      toast.error(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const closeModalAfterSave = () => {
    setModalOpen(false);
    setEditingUser(null);
    setForm({ ...EMPTY_FORM });
    resetImage();
  };

  // ==========================================
  // DELETE USER
  // ==========================================
  const handleDelete = async () => {
    if (!deleteUser || deleting) return;

    setDeleting(true);

    try {
      const response = await deleteAdminUser(deleteUser.id);

      if (response?.success === false) {
        throw new Error(
          response.message || "Failed to delete user"
        );
      }

      toast.success("User deleted successfully");
      setDeleteUser(null);

      await fetchUsers();
    } catch (error) {
      console.error("Delete User Error:", error);
      toast.error(getErrorMessage(error));
    } finally {
      setDeleting(false);
    }
  };

  // ==========================================
  // DASHBOARD COUNTS
  // ==========================================
  const totalAdmins = users.filter(
    (user) => getRole(user) === "admin"
  ).length;

  const totalVerified = users.filter(
    (user) => Boolean(user.email_verified_at)
  ).length;

  const displayAvatar =
    avatarPreview ||
    (removeAvatar ? "" : form.avatar);

  // ==========================================
  // JSX
  // ==========================================
  return (
    <div className="space-y-6">
      {/* ======================================
          PAGE HEADER
      ====================================== */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Users Management
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage user accounts, profile images and permissions.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
        >
          <UserPlus size={18} />
          Add New User
        </button>
      </div>

      {/* ======================================
          STATS CARDS
      ====================================== */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          {
            label: "Total Users",
            value: users.length,
            icon: UsersIcon,
          },
          {
            label: "Total Admins",
            value: totalAdmins,
            icon: ShieldCheck,
          },
          {
            label: "Verified Emails",
            value: totalVerified,
            icon: UserRound,
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

      {/* ======================================
          USERS TABLE
      ====================================== */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {/* TABLE HEADER */}
        <div className="flex flex-col gap-4 border-b border-slate-100 p-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="font-bold text-slate-900">
              All Users
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              {filteredUsers.length} users found
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {/* SEARCH */}
            <div className="relative min-w-48 flex-1">
              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                placeholder="Search users..."
                className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-indigo-500"
              />
            </div>

            {/* ROLE FILTER */}
            <select
              value={roleFilter}
              onChange={(event) => {
                setRoleFilter(event.target.value);
                setPage(1);
              }}
              className="rounded-xl border border-slate-200 px-3 text-sm outline-none"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="user">User</option>
            </select>

            {/* REFRESH */}
            <button
              onClick={fetchUsers}
              title="Refresh"
              className="rounded-xl border border-slate-200 p-2.5 text-slate-600 hover:bg-slate-50"
            >
              <RefreshCw
                size={18}
                className={loading ? "animate-spin" : ""}
              />
            </button>
          </div>
        </div>

        {/* TABLE CONTENT */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1150px] text-left">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-5 py-4">User</th>
                <th className="px-5 py-4">Email</th>
                <th className="px-5 py-4">Role</th>
                <th className="px-5 py-4">Bio</th>
                <th className="px-5 py-4">Language</th>
                <th className="px-5 py-4">Verified</th>
                <th className="px-5 py-4">Joined</th>
                <th className="px-5 py-4 text-right">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td
                    colSpan={8}
                    className="py-16 text-center"
                  >
                    <Loader2
                      size={28}
                      className="mx-auto animate-spin text-indigo-600"
                    />

                    <p className="mt-3 text-sm text-slate-500">
                      Loading users...
                    </p>
                  </td>
                </tr>
              ) : paginatedUsers.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="py-16 text-center text-sm text-slate-500"
                  >
                    No users found
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="transition hover:bg-slate-50"
                  >
                    {/* USER AVATAR */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar user={user} />

                        <div>
                          <p className="text-sm font-semibold text-slate-800">
                            {user.name}
                          </p>

                          <p className="text-xs text-slate-400">
                            ID: {user.id}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* EMAIL */}
                    <td className="px-5 py-4 text-sm text-slate-600">
                      {user.email}
                    </td>

                    {/* ROLE */}
                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          getRole(user) === "admin"
                            ? "bg-purple-50 text-purple-700"
                            : "bg-blue-50 text-blue-700"
                        }`}
                      >
                        {getRole(user)}
                      </span>
                    </td>

                    {/* BIO */}
                    <td className="max-w-48 truncate px-5 py-4 text-sm text-slate-500">
                      {user.bio || "—"}
                    </td>

                    {/* LANGUAGE */}
                    <td className="px-5 py-4 text-sm text-slate-600">
                      {user.language || "—"}
                    </td>

                    {/* EMAIL VERIFICATION */}
                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          user.email_verified_at
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {user.email_verified_at
                          ? "Verified"
                          : "Unverified"}
                      </span>
                    </td>

                    {/* JOINED */}
                    <td className="px-5 py-4 text-sm text-slate-500">
                      {formatDate(user.created_at)}
                    </td>

                    {/* ACTIONS */}
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEditModal(user)}
                          title="Edit User"
                          className="rounded-lg bg-indigo-50 p-2 text-indigo-600 hover:bg-indigo-100"
                        >
                          <Pencil size={17} />
                        </button>

                        <button
                          onClick={() => setDeleteUser(user)}
                          title="Delete User"
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

        {/* PAGINATION */}
        <div className="flex items-center justify-between border-t border-slate-100 px-5 py-4">
          <p className="text-xs text-slate-500">
            Page {currentPage} of {totalPages}
          </p>

          <div className="flex gap-2">
            <button
              disabled={currentPage <= 1}
              onClick={() => setPage(currentPage - 1)}
              className="rounded-lg border border-slate-200 p-2 disabled:opacity-40"
            >
              <ChevronLeft size={18} />
            </button>

            <button
              disabled={currentPage >= totalPages}
              onClick={() => setPage(currentPage + 1)}
              className="rounded-lg border border-slate-200 p-2 disabled:opacity-40"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* ======================================
          ADD / EDIT USER MODAL
      ====================================== */}
      {modalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4">
          <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
            {/* MODAL HEADER */}
            <div className="flex items-center justify-between border-b border-slate-100 p-5">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {editingUser
                    ? "Edit User"
                    : "Add New User"}
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Manage account details and profile image.
                </p>
              </div>

              <button
                type="button"
                disabled={saving}
                onClick={closeModal}
                className="rounded-lg p-2 hover:bg-slate-100"
              >
                <X size={21} />
              </button>
            </div>

            {/* MODAL FORM */}
            <form
              onSubmit={handleSubmit}
              className="space-y-5 overflow-y-auto p-5"
            >
              {/* PROFILE IMAGE UPLOAD */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex flex-col items-center gap-4 sm:flex-row">
                  {/* IMAGE PREVIEW */}
                  <div className="relative">
                    <Avatar
                      user={{
                        name: form.name,
                        avatar: displayAvatar,
                      }}
                      size="h-24 w-24"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        fileInputRef.current?.click()
                      }
                      className="absolute -bottom-1 -right-1 flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-indigo-600 text-white shadow-md hover:bg-indigo-700"
                      title="Change Profile Image"
                    >
                      <Camera size={17} />
                    </button>
                  </div>

                  {/* UPLOAD BUTTONS */}
                  <div className="flex-1 text-center sm:text-left">
                    <h3 className="text-sm font-bold text-slate-800">
                      Profile Picture
                    </h3>

                    <p className="mt-1 text-xs text-slate-500">
                      Upload JPG, PNG or WebP image.
                      Maximum size: 2MB.
                    </p>

                    <div className="mt-3 flex flex-wrap justify-center gap-2 sm:justify-start">
                      <button
                        type="button"
                        onClick={() =>
                          fileInputRef.current?.click()
                        }
                        className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700"
                      >
                        <Upload size={15} />
                        {displayAvatar
                          ? "Change Image"
                          : "Upload Image"}
                      </button>

                      {displayAvatar && (
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-100"
                        >
                          <ImageOff size={15} />
                          Remove
                        </button>
                      )}
                    </div>

                    {avatarFile && (
                      <p className="mt-2 max-w-xs truncate text-xs text-emerald-600">
                        Selected: {avatarFile.name}
                      </p>
                    )}
                  </div>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </div>

              {/* USER FIELDS */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Full Name *">
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    placeholder="Enter full name"
                    className={inputClass}
                  />
                </Field>

                <Field label="Email Address *">
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    placeholder="Enter email address"
                    className={inputClass}
                  />
                </Field>

                <Field label="Password">
                  <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    required={!editingUser}
                    minLength={8}
                    autoComplete="new-password"
                    placeholder={
                      editingUser
                        ? "Leave blank to keep current"
                        : "Minimum 8 characters"
                    }
                    className={inputClass}
                  />
                </Field>

                <Field label="User Role *">
                  <select
                    name="role"
                    value={form.role}
                    onChange={handleChange}
                    required
                    className={inputClass}
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </Field>

                <Field label="Preferred Language">
                  <select
                    name="language"
                    value={form.language}
                    onChange={handleChange}
                    className={inputClass}
                  >
                    <option value="English">English</option>
                    <option value="Hindi">Hindi</option>
                    <option value="Hinglish">Hinglish</option>
                    <option value="Urdu">Urdu</option>
                  </select>
                </Field>
              </div>

              {/* BIO */}
              <Field label="Bio / About User">
                <textarea
                  name="bio"
                  value={form.bio}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Write something about this user..."
                  className={`${inputClass} resize-none`}
                />
              </Field>

              {/* EDIT DETAILS */}
              {editingUser && (
                <div className="grid grid-cols-1 gap-3 rounded-xl bg-slate-50 p-4 text-sm sm:grid-cols-2">
                  <p>
                    <span className="text-slate-500">
                      User ID:
                    </span>{" "}
                    <strong>{editingUser.id}</strong>
                  </p>

                  <p>
                    <span className="text-slate-500">
                      Joined:
                    </span>{" "}
                    <strong>
                      {formatDate(editingUser.created_at)}
                    </strong>
                  </p>

                  <p className="sm:col-span-2">
                    <span className="text-slate-500">
                      Email Verified At:
                    </span>{" "}
                    <strong>
                      {editingUser.email_verified_at
                        ? formatDate(
                            editingUser.email_verified_at
                          )
                        : "Not Verified"}
                    </strong>
                  </p>
                </div>
              )}

              {/* FORM BUTTONS */}
              <div className="flex gap-3 border-t border-slate-100 pt-5">
                <button
                  type="button"
                  disabled={saving}
                  onClick={closeModal}
                  className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold hover:bg-slate-50 disabled:opacity-50"
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
                    : editingUser
                    ? "Update User"
                    : "Create User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================
          DELETE CONFIRMATION
      ====================================== */}
      {deleteUser && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/50 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600">
              <AlertTriangle size={24} />
            </div>

            <h2 className="text-xl font-bold text-slate-900">
              Delete User?
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Are you sure you want to delete{" "}
              <strong>{deleteUser.name}</strong>?
              This action may be permanent.
            </p>

            <div className="mt-6 flex gap-3">
              <button
                disabled={deleting}
                onClick={() => setDeleteUser(null)}
                className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold"
              >
                Cancel
              </button>

              <button
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

                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
