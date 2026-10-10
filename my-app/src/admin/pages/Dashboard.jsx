

import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  FileText,
  FolderOpen,
  Download,
  ArrowUpRight,
  RefreshCw,
  AlertCircle,
  CalendarDays,
  Clock3,
  LayoutDashboard,
} from "lucide-react";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

import toast from "react-hot-toast";

import {
  getDashboardStats,
} from "../../services/adminServies/adminApi";

// ==========================================
// HELPERS
// ==========================================
const numberFormat = (value) =>
  Number(value || 0).toLocaleString("en-IN");

const formatDate = (date) => {
  if (!date) return "—";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "—";
  }

  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getArray = (value) =>
  Array.isArray(value) ? value : [];

const normalizeDashboard = (response) => {
  const data = response?.data ?? response ?? {};
  const stats = data?.stats ?? data?.summary ?? data;

  return {
    totalUsers: Number(
      stats.total_users ?? stats.totalUsers ?? 0
    ),
    totalPdfs: Number(
      stats.total_pdfs ?? stats.totalPdfs ?? 0
    ),
    totalCategories: Number(
      stats.total_categories ?? stats.totalCategories ?? 0
    ),
    totalDownloads: Number(
      stats.total_downloads ?? stats.totalDownloads ?? 0
    ),
    monthlyUploads: getArray(
      data.monthly_uploads ?? data.monthlyUploads
    ).map((item) => ({
      month: item.month ?? item.label ?? "",
      uploads: Number(
        item.uploads ?? item.total ?? item.count ?? 0
      ),
    })),
    recentPdfs: getArray(
      data.recent_pdfs ?? data.recentPdfs
    ),
    recentUsers: getArray(
      data.recent_users ?? data.recentUsers
    ),
  };
};

// ==========================================
// STAT CARD
// ==========================================
function StatCard({
  title,
  value,
  icon: Icon,
  color,
  bgColor,
  loading,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-slate-500">
            {title}
          </p>

          {loading ? (
            <div className="mt-4 h-9 w-24 animate-pulse rounded-lg bg-slate-100" />
          ) : (
            <h3 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900">
              {numberFormat(value)}
            </h3>
          )}

          <p className="mt-3 flex items-center gap-1 text-xs text-slate-400">
            <ArrowUpRight size={14} />
            Platform overview
          </p>
        </div>

        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${bgColor} ${color}`}
        >
          <Icon size={23} strokeWidth={1.8} />
        </div>
      </div>
    </div>
  );
}

// ==========================================
// LOADING ROW
// ==========================================
function SkeletonRow() {
  return (
    <div className="flex animate-pulse items-center gap-3 border-b border-slate-100 py-4">
      <div className="h-10 w-10 rounded-xl bg-slate-100" />
      <div className="flex-1 space-y-2">
        <div className="h-3 w-2/3 rounded bg-slate-100" />
        <div className="h-3 w-1/3 rounded bg-slate-100" />
      </div>
    </div>
  );
}

// ==========================================
// MAIN DASHBOARD
// ==========================================
export default function Dashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  // ========================================
  // FETCH DASHBOARD
  // ========================================
  const fetchDashboard = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      try {
        const response = await getDashboardStats();

        if (response?.success === false) {
          throw new Error(
            response.message || "Failed to load dashboard"
          );
        }

        setDashboard(normalizeDashboard(response));

        if (isRefresh) {
          toast.success("Dashboard updated");
        }
      } catch (err) {
        console.error("Dashboard API Error:", err);

        const message =
          err.response?.data?.message ||
          err.message ||
          "Unable to load dashboard data";

        setError(message);
        toast.error(message);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const stats = [
    {
      title: "Total Users",
      value: dashboard?.totalUsers,
      icon: Users,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
    },
    {
      title: "Total PDFs",
      value: dashboard?.totalPdfs,
      icon: FileText,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Categories",
      value: dashboard?.totalCategories,
      icon: FolderOpen,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
    },
    {
      title: "Total Downloads",
      value: dashboard?.totalDownloads,
      icon: Download,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
    },
  ];

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-medium text-indigo-600">
            <LayoutDashboard size={15} />
            Admin Overview
          </div>

          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
            Dashboard Overview
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Monitor your users, PDFs and platform activity.
          </p>
        </div>

        <button
          type="button"
          onClick={() => fetchDashboard(true)}
          disabled={loading || refreshing}
          className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
        >
          <RefreshCw
            size={17}
            className={refreshing ? "animate-spin" : ""}
          />
          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* ERROR MESSAGE */}
      {error && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          <AlertCircle size={19} className="shrink-0" />
          <div className="flex-1">
            <p className="font-semibold">
              Failed to load dashboard
            </p>
            <p className="mt-1">{error}</p>
          </div>
          <button
            type="button"
            onClick={() => fetchDashboard()}
            className="font-semibold underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => (
          <StatCard
            key={item.title}
            {...item}
            loading={loading}
          />
        ))}
      </div>

      {/* CHART AND QUICK ACTIONS */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">

        {/* UPLOAD CHART */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 xl:col-span-2">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                PDF Upload Analytics
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Monthly PDF upload activity
              </p>
            </div>

            <div className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600">
              <CalendarDays size={19} />
            </div>
          </div>

          {loading ? (
            <div className="h-[280px] animate-pulse rounded-xl bg-slate-100" />
          ) : dashboard?.monthlyUploads?.length ? (
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={dashboard.monthlyUploads}
                  margin={{
                    top: 10,
                    right: 10,
                    left: -20,
                    bottom: 0,
                  }}
                >
                  <defs>
                    <linearGradient
                      id="uploadGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="#6366f1"
                        stopOpacity={0.25}
                      />
                      <stop
                        offset="95%"
                        stopColor="#6366f1"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>

                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#e2e8f0"
                  />

                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11, fill: "#94a3b8" }}
                  />

                  <YAxis
                    allowDecimals={false}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11, fill: "#94a3b8" }}
                  />

                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: "1px solid #e2e8f0",
                    }}
                  />

                  <Area
                    type="monotone"
                    dataKey="uploads"
                    stroke="#6366f1"
                    strokeWidth={3}
                    fill="url(#uploadGradient)"
                    activeDot={{ r: 5 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex h-[280px] items-center justify-center rounded-xl bg-slate-50 text-sm text-slate-400">
              No upload analytics available
            </div>
          )}
        </div>

        {/* QUICK ACTIONS */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-lg font-bold text-slate-900">
            Quick Actions
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Manage your platform
          </p>

          <div className="mt-6 space-y-3">
            {[
              {
                title: "Manage Users",
                subtitle: "View registered users",
                icon: Users,
                path: "/admin/users",
                bg: "bg-indigo-50",
                color: "text-indigo-600",
              },
              {
                title: "Manage PDFs",
                subtitle: "Upload and manage PDFs",
                icon: FileText,
                path: "/admin/pdfs",
                bg: "bg-blue-50",
                color: "text-blue-600",
              },
              {
                title: "Manage Categories",
                subtitle: "Organize your content",
                icon: FolderOpen,
                path: "/admin/categories",
                bg: "bg-amber-50",
                color: "text-amber-600",
              },
            ].map((action) => {
              const Icon = action.icon;

              return (
                <Link
                  key={action.path}
                  to={action.path}
                  className="flex items-center gap-3 rounded-xl border border-slate-100 p-3 transition hover:border-indigo-100 hover:bg-slate-50"
                >
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-xl ${action.bg} ${action.color}`}
                  >
                    <Icon size={20} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-800">
                      {action.title}
                    </p>
                    <p className="text-xs text-slate-400">
                      {action.subtitle}
                    </p>
                  </div>

                  <ArrowUpRight
                    size={17}
                    className="text-slate-400"
                  />
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* RECENT ACTIVITY */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">

        {/* RECENT PDF UPLOADS */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 p-5">
            <div>
              <h2 className="font-bold text-slate-900">
                Recent PDF Uploads
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Latest uploaded documents
              </p>
            </div>

            <Link
              to="/admin/pdfs"
              className="text-xs font-semibold text-indigo-600 hover:underline"
            >
              View All
            </Link>
          </div>

          <div className="px-5">
            {loading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <SkeletonRow key={index} />
              ))
            ) : dashboard?.recentPdfs?.length ? (
              dashboard.recentPdfs.map((pdf, index) => (
                <div
                  key={pdf.id ?? index}
                  className="flex items-center gap-3 border-b border-slate-100 py-4 last:border-0"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-500">
                    <FileText size={21} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-800">
                      {pdf.title ?? pdf.name ?? "Untitled PDF"}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      {pdf.category?.name ??
                        pdf.category_name ??
                        "Uncategorized"}
                    </p>
                  </div>

                  <span className="shrink-0 text-xs text-slate-400">
                    {formatDate(pdf.created_at)}
                  </span>
                </div>
              ))
            ) : (
              <div className="py-12 text-center">
                <FileText
                  size={32}
                  className="mx-auto text-slate-300"
                />
                <p className="mt-3 text-sm text-slate-400">
                  No recent PDFs found
                </p>
              </div>
            )}
          </div>
        </div>

        {/* RECENT USERS */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 p-5">
            <div>
              <h2 className="font-bold text-slate-900">
                Recent Users
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Recently registered accounts
              </p>
            </div>

            <Link
              to="/admin/users"
              className="text-xs font-semibold text-indigo-600 hover:underline"
            >
              View All
            </Link>
          </div>

          <div className="px-5">
            {loading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <SkeletonRow key={index} />
              ))
            ) : dashboard?.recentUsers?.length ? (
              dashboard.recentUsers.map((user, index) => (
                <div
                  key={user.id ?? index}
                  className="flex items-center gap-3 border-b border-slate-100 py-4 last:border-0"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-indigo-100 font-bold text-indigo-600">
                    {user.name?.charAt(0)?.toUpperCase() ?? "U"}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-800">
                      {user.name ?? "Unknown User"}
                    </p>

                    <p className="truncate text-xs text-slate-400">
                      {user.email ?? "No email"}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-1 text-xs text-slate-400">
                    <Clock3 size={13} />
                    {formatDate(user.created_at)}
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 text-center">
                <Users
                  size={32}
                  className="mx-auto text-slate-300"
                />
                <p className="mt-3 text-sm text-slate-400">
                  No recent users found
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
