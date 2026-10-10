
import { useState } from "react";
import {
  Outlet,
  NavLink,
  useNavigate,
} from "react-router-dom";

import {
  LayoutDashboard,
  Users,
  FileText,
  FolderOpen,
  Settings,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import {
  getCurrentUser,
  logoutUser,
} from "../../services/authService";

import toast from "react-hot-toast";

const menuItems = [
  {
    name: "Dashboard",
    path: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Users",
    path: "/admin/users",
    icon: Users,
  },
  {
    name: "PDF Management",
    path: "/admin/pdfs",
    icon: FileText,
  },
  {
    name: "Categories",
    path: "/admin/categories",
    icon: FolderOpen,
  },
  {
    name: "Settings",
    path: "/admin/settings",
    icon: Settings,
  },
];

export default function AdminLayout() {
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const admin = getCurrentUser("admin");

  // =====================================
  // PERFORM LOGOUT
  // =====================================
  const performLogout = async () => {
    if (loggingOut) return;

    toast.dismiss("admin-logout-confirm");
    setLoggingOut(true);

    try {
      const result = await logoutUser("admin");

      if (result.serverLogoutSuccess) {
        toast.success("Logged out successfully");
      } else {
        toast.error(
          result.error
            ? `Server logout failed: ${result.error}`
            : "Server logout could not be confirmed"
        );
      }

      setSidebarOpen(false);
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Logout Error:", error);

      toast.error("Unable to complete logout");
    } finally {
      setLoggingOut(false);
    }
  };

  // =====================================
  // CONFIRMATION TOAST
  // =====================================
  const handleLogout = () => {
    if (loggingOut) return;

    toast.custom(
      (t) => (
        <div
          className={`w-[340px] max-w-[calc(100vw-32px)] rounded-2xl border border-slate-200 bg-white p-5 shadow-xl transition-all ${
            t.visible ? "opacity-100" : "opacity-0"
          }`}
        >
          <h3 className="text-base font-bold text-slate-900">
            Confirm Logout
          </h3>

          <p className="mt-2 text-sm text-slate-500">
            Are you sure you want to logout from your admin account?
          </p>

          <div className="mt-5 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => toast.dismiss(t.id)}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={performLogout}
              className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
            >
              Yes, Logout
            </button>
          </div>
        </div>
      ),
      {
        id: "admin-logout-confirm",
        duration: Infinity,
        position: "top-center",
      }
    );
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* MOBILE OVERLAY */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`
          fixed left-0 top-0 z-50
          flex h-screen flex-col
          border-r border-slate-200
          bg-white shadow-sm
          transition-all duration-300
          ${
            sidebarOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }
          lg:translate-x-0
          ${collapsed ? "lg:w-20" : "lg:w-64"}
          w-64
        `}
      >
        {/* LOGO */}
        <div className="flex min-h-[72px] items-center justify-between border-b border-slate-100 px-5">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white">
              <ShieldCheck size={23} />
            </div>

            {!collapsed && (
              <div className="hidden lg:block">
                <h1 className="text-xl font-bold text-slate-900">
                  Firans
                </h1>
                <p className="text-[11px] text-slate-500">
                  Admin Panel
                </p>
              </div>
            )}

            <div className="lg:hidden">
              <h1 className="text-xl font-bold text-slate-900">
                Firans
              </h1>
              <p className="text-[11px] text-slate-500">
                Admin Panel
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="text-slate-500 lg:hidden"
            aria-label="Close sidebar"
          >
            <X size={22} />
          </button>
        </div>

        {/* MENU */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-6">
          {!collapsed && (
            <p className="mb-4 hidden px-3 text-[11px] font-bold uppercase tracking-widest text-slate-400 lg:block">
              Main Menu
            </p>
          )}

          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                title={item.name}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) => `
                  flex items-center gap-3
                  rounded-xl px-3 py-3
                  text-sm font-medium
                  transition-all duration-200
                  ${
                    isActive
                      ? "bg-indigo-50 text-indigo-700"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }
                  ${collapsed ? "lg:justify-center" : ""}
                `}
              >
                <Icon size={20} className="shrink-0" />

                <span className={collapsed ? "lg:hidden" : ""}>
                  {item.name}
                </span>
              </NavLink>
            );
          })}
        </nav>

        {/* SIDEBAR LOGOUT */}
        <div className="border-t border-slate-100 p-3">
          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50"
          >
            <LogOut size={20} />

            <span className={collapsed ? "lg:hidden" : ""}>
              {loggingOut ? "Logging out..." : "Logout"}
            </span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div
        className={`
          min-h-screen transition-all duration-300
          ${collapsed ? "lg:ml-20" : "lg:ml-64"}
        `}
      >
        {/* NAVBAR */}
        <header className="sticky top-0 z-30 flex h-[72px] items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6">
          <div className="flex items-center gap-4">
            {/* MOBILE MENU */}
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
              aria-label="Open sidebar"
            >
              <Menu size={23} />
            </button>

            {/* DESKTOP COLLAPSE */}
            <button
              type="button"
              onClick={() => setCollapsed((prev) => !prev)}
              className="hidden rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:flex"
              aria-label={
                collapsed
                  ? "Expand sidebar"
                  : "Collapse sidebar"
              }
            >
              {collapsed ? (
                <ChevronRight size={22} />
              ) : (
                <ChevronLeft size={22} />
              )}
            </button>

            <div>
              <h2 className="text-base font-bold text-slate-900 sm:text-lg">
                Admin Dashboard
              </h2>
              <p className="hidden text-xs text-slate-500 sm:block">
                Manage your Firans platform
              </p>
            </div>
          </div>

          {/* ADMIN PROFILE */}
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-slate-800">
                {admin?.name || "Administrator"}
              </p>

              <p className="text-xs text-slate-500">
                Admin
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 font-bold text-indigo-700">
              {admin?.name?.charAt(0)?.toUpperCase() || "A"}
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="min-h-[calc(100vh-72px)] p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
