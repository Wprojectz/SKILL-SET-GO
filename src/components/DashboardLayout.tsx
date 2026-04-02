import { type ReactNode, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import {
  LayoutDashboard,
  FileSearch,
  Target,
  BookOpen,
  User,
  Settings,
  LogOut,
  Sun,
  Moon,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  History,
} from "lucide-react";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: FileSearch, label: "Resume Analyzer", path: "/analyze" },
  { icon: Target, label: "Skill Gap", path: "/dashboard/skills" },
  { icon: BookOpen, label: "Learning Path", path: "/dashboard/learning" },
  { icon: History, label: "History", path: "/dashboard/history" },
  { icon: User, label: "Profile", path: "/dashboard/profile" },
  { icon: Settings, label: "Settings", path: "/dashboard/settings" },
];

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const currentPage = useMemo(
    () => navItems.find((item) => item.path === location.pathname)?.label || "Skill Set Go",
    [location.pathname]
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-[-8%] top-0 h-72 w-72 rounded-full bg-sky-200/30 blur-3xl dark:bg-sky-900/20" />
        <div className="absolute right-[-10%] top-20 h-80 w-80 rounded-full bg-blue-200/25 blur-3xl dark:bg-blue-900/20" />
      </div>

      <div className="relative flex min-h-screen">
        <aside
          className={`hidden border-r border-border/80 bg-card/85 backdrop-blur-xl transition-all duration-300 lg:flex lg:flex-col ${
            collapsed ? "lg:w-24" : "lg:w-72"
          }`}
        >
          <div className="flex items-center justify-between border-b border-border/80 px-5 py-5">
            {!collapsed && (
              <button onClick={() => navigate("/")} className="flex items-center gap-3 text-left">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-600 text-white shadow-sm shadow-sky-500/20">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-heading text-base font-bold text-foreground">Skill Set Go</p>
                  <p className="font-body text-xs text-muted-foreground">Career analysis platform</p>
                </div>
              </button>
            )}
            <button
              onClick={() => setCollapsed((current) => !current)}
              className="rounded-xl border border-border bg-card p-2 text-muted-foreground transition-colors hover:text-foreground"
              aria-label="Toggle sidebar"
            >
              {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </button>
          </div>

          <div className="flex-1 px-4 py-5">
            {!collapsed && (
              <div className="mb-5 rounded-2xl border border-border bg-secondary/40 px-4 py-4">
                <p className="font-body text-xs font-semibold uppercase tracking-[0.18em] text-sky-700 dark:text-sky-300">Workspace</p>
                <p className="mt-2 font-heading text-lg font-semibold text-foreground">{currentPage}</p>
                <p className="mt-1 font-body text-sm text-muted-foreground">
                  Navigate between analysis, history, profile, and growth tools.
                </p>
              </div>
            )}

            <nav className="space-y-2">
              {navItems.map((item) => {
                const active = location.pathname === item.path;
                return (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition-all ${
                      active
                        ? "bg-sky-600 text-white shadow-sm shadow-sky-500/20"
                        : "border border-transparent text-muted-foreground hover:border-border hover:bg-secondary/50 hover:text-foreground"
                    }`}
                  >
                    <item.icon className={`h-5 w-5 shrink-0 ${active ? "text-white" : "text-muted-foreground"}`} />
                    {!collapsed && <span className="font-body text-sm font-medium">{item.label}</span>}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="border-t border-border/80 px-4 py-4">
            <div className="space-y-2">
              <button
                onClick={toggleTheme}
                className="flex w-full items-center gap-3 rounded-2xl border border-transparent px-4 py-3 text-left text-muted-foreground transition-all hover:border-border hover:bg-secondary/50 hover:text-foreground"
              >
                {theme === "dark" ? <Sun className="h-5 w-5 shrink-0" /> : <Moon className="h-5 w-5 shrink-0" />}
                {!collapsed && <span className="font-body text-sm font-medium">{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>}
              </button>
              <button
                onClick={() => {
                  signOut();
                  navigate("/");
                }}
                className="flex w-full items-center gap-3 rounded-2xl border border-transparent px-4 py-3 text-left text-muted-foreground transition-all hover:border-rose-300/50 hover:bg-rose-100/60 hover:text-rose-700 dark:hover:bg-rose-950/40"
              >
                <LogOut className="h-5 w-5 shrink-0" />
                {!collapsed && <span className="font-body text-sm font-medium">Logout</span>}
              </button>
            </div>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-10 border-b border-border/80 bg-background/85 backdrop-blur-xl">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
              <div>
                <p className="font-body text-xs font-semibold uppercase tracking-[0.18em] text-sky-700 dark:text-sky-300">Dashboard</p>
                <h1 className="mt-1 font-heading text-2xl font-bold text-foreground">{currentPage}</h1>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={toggleTheme}
                  className="rounded-xl border border-border bg-card p-2 text-muted-foreground transition-colors hover:text-foreground lg:hidden"
                  aria-label="Toggle theme"
                >
                  {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </button>
                <div className="hidden text-right sm:block">
                  <p className="font-body text-sm font-medium text-foreground">{user?.email?.split("@")[0] || "User"}</p>
                  <p className="font-body text-xs text-muted-foreground">{user?.email}</p>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-600 font-heading text-sm font-bold text-white shadow-sm shadow-sky-500/20">
                  {user?.email?.[0]?.toUpperCase() || "U"}
                </div>
              </div>
            </div>
          </header>

          <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-8">{children}</main>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
