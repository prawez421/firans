import { BookOpen, FileText, UserRound } from "lucide-react";
import { Link } from "react-router-dom";
import { getCurrentUser } from "../../services/authService";

export default function Dashboard() {
  const user = getCurrentUser("user");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Welcome, {user?.name || "User"}!
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Access your PDFs and manage your account.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {[
          {
            title: "Browse PDFs",
            description: "Explore available PDF documents.",
            icon: FileText,
            path: "/user/pdfs",
          },
          {
            title: "My Profile",
            description: "View your account information.",
            icon: UserRound,
            path: "/user/profile",
          },
          {
            title: "Learning Resources",
            description: "Discover documents and resources.",
            icon: BookOpen,
            path: "/user/pdfs",
          },
        ].map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.title}
              to={item.path}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-indigo-200 hover:shadow-md"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <Icon size={24} />
              </div>

              <h3 className="text-lg font-bold text-slate-900">
                {item.title}
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                {item.description}
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}