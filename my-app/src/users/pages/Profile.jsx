import { getCurrentUser } from "../../services/authService";

export default function Profile() {
  const user = getCurrentUser("user");

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-bold text-slate-900">
        My Profile
      </h1>

      <p className="mt-4 text-slate-700">
        Name: {user?.name || "N/A"}
      </p>

      <p className="mt-2 text-slate-700">
        Email: {user?.email || "N/A"}
      </p>
    </div>
  );
}