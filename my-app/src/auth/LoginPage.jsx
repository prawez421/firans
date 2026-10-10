
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
  UserRound,
  ArrowRight,
  Loader2,
  BookOpen,
} from "lucide-react";

import {
  loginUser,
  getRedirectPath,
  isAuthenticated,
  isAdmin,
} from "../services/authService";

export default function LoginPage() {
  const navigate = useNavigate();

  const [loginType, setLoginType] = useState("user");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!form.email.trim()) {
      toast.error("Please enter your email");
      return;
    }

    if (!form.password) {
      toast.error("Please enter your password");
      return;
    }

    setLoading(true);

    try {
      const result = await loginUser(
        {
          email: form.email.trim(),
          password: form.password,
        },
        loginType
      );

      toast.success(
        `Welcome, ${result.user?.name || "User"}!`
      );

      navigate(result.redirectTo, {
        replace: true,
      });
    } catch (error) {
      console.error("Login error:", error);

      const message =
        error.response?.data?.message ||
        error.response?.data?.errors?.email?.[0] ||
        error.message ||
        "Login failed. Please try again.";

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleAccountType = (type) => {
    setLoginType(type);
    setShowPassword(false);
  };

  const handleContinue = () => {
    if (loginType === "admin" && isAdmin()) {
      navigate(getRedirectPath("admin"));
    } else if (
      loginType === "user" &&
      isAuthenticated("user")
    ) {
      navigate(getRedirectPath("user"));
    }
  };

  const hasSession =
    loginType === "admin"
      ? isAdmin()
      : isAuthenticated("user");

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-2xl shadow-slate-200/70 grid grid-cols-1 lg:grid-cols-2">

        {/* LEFT SIDE */}
        <div className="hidden lg:flex relative flex-col justify-between overflow-hidden bg-gradient-to-br from-indigo-700 via-indigo-600 to-violet-700 p-12 text-white">

          <div className="absolute -top-20 -right-20 h-72 w-72 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-violet-300/20 blur-2xl" />

          <div className="relative z-10 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20">
              <BookOpen size={26} />
            </div>

            <div>
              <h1 className="text-2xl font-bold">
                Firans
              </h1>
              <p className="text-xs text-indigo-100">
                Digital Learning Platform
              </p>
            </div>
          </div>

          <div className="relative z-10 my-16">
            <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-3xl bg-white/15 backdrop-blur">
              <ShieldCheck size={40} />
            </div>

            <h2 className="text-4xl font-extrabold leading-tight">
              Welcome Back
              <br />
              To Firans
            </h2>

            <p className="mt-5 max-w-sm text-base leading-7 text-indigo-100">
              Access your account, manage your resources,
              and explore a better digital learning experience.
            </p>
          </div>

          <div className="relative z-10 text-sm text-indigo-100">
            © {new Date().getFullYear()} Firans.
            All rights reserved.
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="flex flex-col justify-center px-6 py-10 sm:px-12 lg:px-14 lg:py-16">

          {/* MOBILE LOGO */}
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 text-white">
              <BookOpen size={23} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">
              Firans
            </h2>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">
              Sign in
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Enter your credentials to access your account.
            </p>
          </div>

          {/* ACCOUNT TYPE */}
          <div className="mb-8 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleAccountType("user")}
              className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3.5 text-sm font-semibold transition-all ${
                loginType === "user"
                  ? "border-indigo-600 bg-indigo-50 text-indigo-700 shadow-sm"
                  : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
              }`}
            >
              <UserRound size={19} />
              User Login
            </button>

            <button
              type="button"
              onClick={() => handleAccountType("admin")}
              className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3.5 text-sm font-semibold transition-all ${
                loginType === "admin"
                  ? "border-indigo-600 bg-indigo-50 text-indigo-700 shadow-sm"
                  : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
              }`}
            >
              <ShieldCheck size={19} />
              Admin Login
            </button>
          </div>

          {/* LOGIN FORM */}
          <form onSubmit={handleLogin} className="space-y-5">

            {/* EMAIL */}
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Email Address
              </label>

              <div className="relative">
                <Mail
                  size={19}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  id="email"
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  autoComplete="email"
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-12 pr-4 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                />
              </div>
            </div>

            {/* PASSWORD */}
            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Password
              </label>

              <div className="relative">
                <LockKeyhole
                  size={19}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-12 pr-12 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600"
                >
                  {showPassword ? (
                    <EyeOff size={19} />
                  ) : (
                    <Eye size={19} />
                  )}
                </button>
              </div>
            </div>

            {/* LOGIN BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-4 text-sm font-bold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2
                    size={19}
                    className="animate-spin"
                  />
                  Signing in...
                </>
              ) : (
                <>
                  Sign in as {loginType === "admin" ? "Admin" : "User"}
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* EXISTING SESSION */}
          {hasSession && (
            <button
              type="button"
              onClick={handleContinue}
              className="mt-4 w-full rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm font-semibold text-indigo-700 hover:bg-indigo-100"
            >
              Continue to {loginType === "admin" ? "Admin Panel" : "User Panel"}
            </button>
          )}

          <p className="mt-8 text-center text-xs text-slate-400">
            Secure access powered by Firans
          </p>
        </div>
      </div>
    </div>
  );
}
