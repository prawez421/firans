
import { useCallback, useEffect, useState } from "react";

import {
  Settings as SettingsIcon,
  UserRound,
  Mail,
  ShieldCheck,
  RefreshCw,
  Loader2,
  AlertCircle,
} from "lucide-react";

import toast from "react-hot-toast";

import { getAdminProfile } from "../../services/adminServies/settingsService";

// ==========================================
// EXTRACT ADMIN DATA
// ==========================================
const extractAdmin = (response) => {
  const payload = response?.data;

  return (
    payload?.data?.user ||
    payload?.data?.admin ||
    payload?.data ||
    payload?.user ||
    payload?.admin ||
    payload
  );
};

// ==========================================
// ERROR MESSAGE
// ==========================================
const getErrorMessage = (error) => {
  return (
    error?.response?.data?.message ||
    error?.message ||
    "Failed to load admin profile"
  );
};

// ==========================================
// MAIN SETTINGS COMPONENT
// ==========================================
export default function Settings() {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==========================================
  // FETCH CURRENT LOGGED-IN ADMIN
  // ==========================================
  const fetchAdmin = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await getAdminProfile();

      if (
        response.data?.success === false ||
        response.data?.status === "error"
      ) {
        throw new Error(
          response.data?.message || "Failed to load profile"
        );
      }

      const adminData = extractAdmin(response);

      if (
        !adminData ||
        typeof adminData !== "object" ||
        (!adminData.name && !adminData.email)
      ) {
        throw new Error("Admin profile data not found");
      }

      setAdmin(adminData);
    } catch (err) {
      console.error("Admin Profile Error:", err);

      const message = getErrorMessage(err);

      setAdmin(null);
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdmin();
  }, [fetchAdmin]);

  // ==========================================
  // ADMIN INITIALS
  // ==========================================
  const initials = admin?.name
    ? admin.name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((word) => word.charAt(0).toUpperCase())
        .join("")
    : "A";

  // ==========================================
  // ADMIN ROLE
  // ==========================================
  const role =
    typeof admin?.role === "object"
      ? admin.role?.name || admin.role?.slug
      : admin?.role_name || admin?.role || "Administrator";

  return (
    <div className="space-y-6">
      {/* PAGE HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600">
            <SettingsIcon size={24} />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Admin Settings
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              View your logged-in admin account details.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={fetchAdmin}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
        >
          <RefreshCw
            size={17}
            className={loading ? "animate-spin" : ""}
          />
          Refresh
        </button>
      </div>

      {/* PROFILE CARD */}
      <div className="max-w-4xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-6">
          <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
            <UserRound
              size={21}
              className="text-indigo-600"
            />
            My Profile
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Your account information from the Admin API.
          </p>
        </div>

        {/* LOADING */}
        {loading ? (
          <div className="flex items-center justify-center gap-3 py-20 text-slate-500">
            <Loader2
              size={23}
              className="animate-spin text-indigo-600"
            />
            Loading your profile...
          </div>
        ) : error ? (
          /* ERROR */
          <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
            <AlertCircle
              size={32}
              className="text-red-500"
            />

            <p className="font-semibold text-slate-800">
              Unable to load profile
            </p>

            <p className="text-sm text-red-600">
              {error}
            </p>

            <button
              type="button"
              onClick={fetchAdmin}
              className="mt-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              Try Again
            </button>
          </div>
        ) : (
          <div className="space-y-6 p-6">
            {/* ADMIN SUMMARY */}
            <div className="flex flex-wrap items-center gap-4 rounded-xl bg-slate-50 p-5">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-2xl font-bold text-indigo-700">
                {initials}
              </div>

              <div className="min-w-0">
                <h3 className="break-words text-xl font-bold text-slate-900">
                  {admin?.name || "Administrator"}
                </h3>

                <p className="mt-1 break-all text-sm text-slate-500">
                  {admin?.email || "Not available"}
                </p>

                <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">
                  <ShieldCheck size={14} />
                  {role}
                </span>
              </div>
            </div>

            {/* ADMIN DETAILS */}
            <div>
              <h3 className="mb-4 text-base font-bold text-slate-900">
                Account Information
              </h3>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                {/* NAME */}
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <div className="mb-3 flex items-center gap-2 text-slate-500">
                    <UserRound size={18} />
                    <span className="text-sm font-medium">
                      Full Name
                    </span>
                  </div>

                  <p className="break-words text-base font-semibold text-slate-900">
                    {admin?.name || "Not available"}
                  </p>
                </div>

                {/* EMAIL */}
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <div className="mb-3 flex items-center gap-2 text-slate-500">
                    <Mail size={18} />
                    <span className="text-sm font-medium">
                      Email Address
                    </span>
                  </div>

                  <p className="break-all text-base font-semibold text-slate-900">
                    {admin?.email || "Not available"}
                  </p>
                </div>

                {/* ROLE */}
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <div className="mb-3 flex items-center gap-2 text-slate-500">
                    <ShieldCheck size={18} />
                    <span className="text-sm font-medium">
                      Account Role
                    </span>
                  </div>

                  <p className="break-words text-base font-semibold capitalize text-slate-900">
                    {role}
                  </p>
                </div>

                {/* ACCOUNT STATUS */}
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <div className="mb-3 flex items-center gap-2 text-slate-500">
                    <ShieldCheck size={18} />
                    <span className="text-sm font-medium">
                      Account Status
                    </span>
                  </div>

                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                      admin?.status === false ||
                      admin?.status === 0 ||
                      admin?.status === "0" ||
                      admin?.status === "inactive"
                        ? "bg-red-100 text-red-700"
                        : admin?.status === true ||
                            admin?.status === 1 ||
                            admin?.status === "1" ||
                            admin?.status === "active"
                          ? "bg-green-100 text-green-700"
                          : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {admin?.status === false ||
                    admin?.status === 0 ||
                    admin?.status === "0" ||
                    admin?.status === "inactive"
                      ? "Inactive"
                      : admin?.status === true ||
                          admin?.status === 1 ||
                          admin?.status === "1" ||
                          admin?.status === "active"
                        ? "Active"
                        : "Not available"}
                  </span>
                </div>
              </div>
            </div>

            {/* READ ONLY INFO */}
            <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-4">
              <p className="text-sm text-indigo-800">
                This page displays the currently authenticated
                admin's information. Profile editing and
                password changing are disabled.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
