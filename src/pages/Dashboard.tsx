import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { FileSearch, Target, TrendingUp, BookOpen, ArrowRight, Sparkles, CircleCheckBig } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { ErrorState, LoadingState } from "@/components/PageState";
import type { AIAnalysisResult } from "@/lib/aiAnalysisTypes";
import type { Tables } from "@/integrations/supabase/types";
import { parseAIAnalysisResult } from "@/lib/analysisResultSchema";
import { useProfileSummary } from "@/hooks/useProfileSummary";

type AnalysisHistoryRow = Tables<"analysis_history">;

interface HistoryRow extends Omit<AnalysisHistoryRow, "results"> {
  results: AIAnalysisResult | null;
}

const statConfigs = [
  { icon: FileSearch, label: "Analyses Done", iconWrap: "bg-sky-100/70 text-sky-600 dark:bg-sky-950/40" },
  { icon: Target, label: "Avg Match", iconWrap: "bg-emerald-100/70 text-emerald-600 dark:bg-emerald-950/40" },
  { icon: TrendingUp, label: "Avg ATS Score", iconWrap: "bg-amber-100/70 text-amber-600 dark:bg-amber-950/40" },
  { icon: BookOpen, label: "Skills Tracked", iconWrap: "bg-indigo-100/70 text-indigo-600 dark:bg-indigo-950/40" },
];

const parseHistoryRow = (row: AnalysisHistoryRow): HistoryRow => ({
  ...row,
  results: parseAIAnalysisResult(row.results),
});

const Dashboard = () => {
  const { user } = useAuth();
  const { displayName } = useProfileSummary();
  const navigate = useNavigate();
  const [history, setHistory] = useState<HistoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadHistory = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    const { data, error } = await supabase
      .from("analysis_history")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10);

    if (error) {
      setError(error.message);
      setHistory([]);
    } else {
      setHistory((data || []).map(parseHistoryRow));
    }

    setLoading(false);
  }, [user]);

  useEffect(() => {
    void loadHistory();
  }, [loadHistory]);

  if (loading) {
    return (
      <DashboardLayout>
        <LoadingState message="Loading your dashboard..." />
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <ErrorState
          title="Could not load your dashboard"
          description={error}
          onRetry={() => {
            void loadHistory();
          }}
        />
      </DashboardLayout>
    );
  }

  const latest = history[0];
  const avgMatch = history.length ? Math.round(history.reduce((sum, item) => sum + item.match_percentage, 0) / history.length) : 0;
  const avgAts = history.length ? Math.round(history.reduce((sum, item) => sum + item.ats_score, 0) / history.length) : 0;

  const statValues = [
    history.length,
    `${avgMatch}%`,
    `${avgAts}/100`,
    latest?.results?.skills?.explicit?.length || 0,
  ];

  const pieData = latest
    ? [
        { name: "Matched", value: latest.match_percentage },
        { name: "Gap", value: 100 - latest.match_percentage },
      ]
    : [];

  const barData = history.slice(0, 5).reverse().map((item, index) => ({
    name: `Analysis ${index + 1}`,
    match: item.match_percentage,
    ats: item.ats_score,
  }));

  const quickActions = latest?.score_breakdown?.improvement_priority.slice(0, 3) || [
    "Run a fresh resume analysis against your next target role.",
    "Review your strongest skills and turn them into sharper resume bullets.",
    "Use the learning path to focus your next improvement sprint.",
  ];

  const colors = ["#0284c7", "#dbeafe"];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[28px] border border-border bg-card p-8 shadow-[0_24px_80px_rgba(15,23,42,0.06)]">
            <p className="font-body text-xs font-semibold uppercase tracking-[0.18em] text-sky-700 dark:text-sky-300">Overview</p>
            <div className="mt-3 flex items-start justify-between gap-6">
              <div>
                <h2 className="font-heading text-3xl font-bold text-foreground">
                  Welcome back{displayName ? `, ${displayName}` : user?.email ? `, ${user.email.split("@")[0]}` : ""}.
                </h2>
                <p className="mt-3 max-w-xl font-body text-base leading-7 text-muted-foreground">
                  Track your progress, review your latest match insights, and decide what to improve next with a cleaner dashboard view.
                </p>
              </div>
              <div className="hidden rounded-2xl bg-sky-100/70 p-3 text-sky-600 dark:bg-sky-950/40 lg:flex">
                <Sparkles className="h-6 w-6" />
              </div>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {statConfigs.map((stat, index) => (
                <div key={stat.label} className="rounded-2xl border border-border bg-secondary/40 p-5">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${stat.iconWrap}`}>
                    <stat.icon className="h-5 w-5" />
                  </div>
                  <p className="mt-4 font-body text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">{stat.label}</p>
                  <p className="mt-2 font-heading text-3xl font-bold text-foreground">{statValues[index]}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[28px] border border-border bg-card p-8 shadow-[0_24px_80px_rgba(15,23,42,0.06)]">
            <p className="font-body text-xs font-semibold uppercase tracking-[0.18em] text-sky-700 dark:text-sky-300">Next Steps</p>
            <h3 className="mt-3 font-heading text-2xl font-bold text-foreground">Recommended action plan</h3>
            <div className="mt-6 space-y-3">
              {quickActions.map((item, index) => (
                <div key={`${item}-${index}`} className="flex items-start gap-3 rounded-2xl border border-border bg-secondary/40 px-4 py-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-600 font-heading text-sm font-bold text-white">
                    {index + 1}
                  </div>
                  <p className="font-body text-sm leading-6 text-foreground">{item}</p>
                </div>
              ))}
            </div>
            <button
              onClick={() => navigate("/analyze")}
              className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-sky-600 px-5 py-3 font-heading text-sm font-semibold text-white transition-colors hover:bg-sky-700"
            >
              Start New Analysis <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </section>

        {history.length > 0 ? (
          <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
            <div className="rounded-[28px] border border-border bg-card p-8 shadow-[0_24px_80px_rgba(15,23,42,0.06)]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-body text-xs font-semibold uppercase tracking-[0.18em] text-sky-700 dark:text-sky-300">Latest analysis</p>
                  <h3 className="mt-2 font-heading text-2xl font-bold text-foreground">Current match snapshot</h3>
                </div>
                <div className="rounded-2xl bg-sky-100/70 px-4 py-2 font-heading text-sm font-semibold text-sky-700 dark:bg-sky-950/40 dark:text-sky-300">
                  {latest?.match_percentage}% match
                </div>
              </div>

              <div className="mt-8">
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={62} outerRadius={92} dataKey="value" strokeWidth={0}>
                      {pieData.map((_, index) => (
                        <Cell key={index} fill={colors[index]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-border bg-secondary/40 p-4">
                  <p className="font-body text-xs uppercase tracking-[0.16em] text-muted-foreground">ATS score</p>
                  <p className="mt-2 font-heading text-3xl font-bold text-foreground">{latest?.ats_score ?? 0}</p>
                </div>
                <div className="rounded-2xl border border-border bg-secondary/40 p-4">
                  <p className="font-body text-xs uppercase tracking-[0.16em] text-muted-foreground">Latest strengths</p>
                  <p className="mt-2 font-heading text-lg font-semibold text-foreground">
                    {latest?.results?.matching?.strong?.slice(0, 3).join(", ") || "No data yet"}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-[28px] border border-border bg-card p-8 shadow-[0_24px_80px_rgba(15,23,42,0.06)]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-body text-xs font-semibold uppercase tracking-[0.18em] text-sky-700 dark:text-sky-300">Trend</p>
                  <h3 className="mt-2 font-heading text-2xl font-bold text-foreground">Analysis history</h3>
                </div>
                <CircleCheckBig className="h-5 w-5 text-emerald-600" />
              </div>

              <div className="mt-6">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={barData}>
                    <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                    <YAxis stroke="#64748b" fontSize={11} />
                    <Tooltip
                      contentStyle={{
                        background: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "16px",
                        color: "hsl(var(--foreground))",
                      }}
                      labelStyle={{ color: "hsl(var(--foreground))" }}
                    />
                    <Legend />
                    <Bar dataKey="match" fill="#0284c7" radius={[8, 8, 0, 0]} name="Match %" />
                    <Bar dataKey="ats" fill="#f59e0b" radius={[8, 8, 0, 0]} name="ATS Score" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </section>
        ) : (
          <section className="rounded-[28px] border border-border bg-card p-14 text-center shadow-[0_24px_80px_rgba(15,23,42,0.06)]">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-sky-100/70 text-sky-600 dark:bg-sky-950/40">
              <FileSearch className="h-8 w-8" />
            </div>
            <h3 className="mt-6 font-heading text-2xl font-bold text-foreground">No analyses yet</h3>
            <p className="mx-auto mt-3 max-w-xl font-body text-base leading-7 text-muted-foreground">
              Upload your resume and compare it against a job description to start building a cleaner, more informative career dashboard.
            </p>
            <button
              onClick={() => navigate("/analyze")}
              className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-sky-600 px-6 py-3 font-heading text-sm font-semibold text-white transition-colors hover:bg-sky-700"
            >
              Start Analysis <ArrowRight className="h-4 w-4" />
            </button>
          </section>
        )}

        {history.length > 0 && (
          <section className="rounded-[28px] border border-border bg-card p-8 shadow-[0_24px_80px_rgba(15,23,42,0.06)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-body text-xs font-semibold uppercase tracking-[0.18em] text-sky-700 dark:text-sky-300">Records</p>
                <h3 className="mt-2 font-heading text-2xl font-bold text-foreground">Recent analyses</h3>
              </div>
              <button
                onClick={() => navigate("/dashboard/history")}
                className="rounded-2xl border border-border bg-card px-4 py-2 font-body text-sm font-medium text-foreground transition-colors hover:bg-secondary"
              >
                Open full history
              </button>
            </div>

            <div className="mt-6 space-y-3">
              {history.slice(0, 5).map((item) => (
                <div key={item.id} className="flex flex-col gap-3 rounded-2xl border border-border bg-secondary/40 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-heading text-base font-semibold text-foreground">
                      {new Date(item.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                    </p>
                    <p className="mt-1 font-body text-sm text-muted-foreground">
                      {item.results?.final_decision?.recommendation || "Analysis summary available in history"}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100/70 px-3 py-1.5 font-heading text-xs font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                      <Target className="h-3 w-3" /> {item.match_percentage}%
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-100/70 px-3 py-1.5 font-heading text-xs font-semibold text-sky-700 dark:bg-sky-950/40 dark:text-sky-300">
                      ATS {item.ats_score}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
