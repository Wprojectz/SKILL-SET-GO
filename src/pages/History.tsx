import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Target,
  Trash2,
  GitCompareArrows,
  Clock3,
  FileSearch,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  X,
  Check,
  Layers3,
} from "lucide-react";
import type { AIAnalysisResult } from "@/lib/aiAnalysisTypes";
import { ErrorState, LoadingState } from "@/components/PageState";
import { parseAIAnalysisResult } from "@/lib/analysisResultSchema";

type AnalysisHistoryRow = Tables<"analysis_history">;

interface HistoryRow extends Omit<AnalysisHistoryRow, "results"> {
  results: AIAnalysisResult | null;
}

const parseHistoryRow = (row: AnalysisHistoryRow): HistoryRow => ({
  ...row,
  results: parseAIAnalysisResult(row.results),
});

const History = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [history, setHistory] = useState<HistoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [showCompare, setShowCompare] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    setLoading(true);
    setError(null);

    supabase
      .from("analysis_history")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) {
          setError(error.message);
          setHistory([]);
        } else if (data) {
          setHistory(data.map(parseHistoryRow));
        }
        setLoading(false);
      });
  }, [user]);

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("analysis_history").delete().eq("id", id);

    if (error) {
      toast({ title: "Delete failed", description: error.message, variant: "destructive" });
      return;
    }

    setHistory((rows) => rows.filter((row) => row.id !== id));
    setCompareIds((ids) => ids.filter((currentId) => currentId !== id));
    toast({ title: "Analysis deleted" });
  };

  const toggleCompare = (id: string) => {
    setCompareIds((previous) =>
      previous.includes(id) ? previous.filter((currentId) => currentId !== id) : previous.length < 2 ? [...previous, id] : previous
    );
  };

  const compareItems = history.filter((row) => compareIds.includes(row.id));

  if (loading) {
    return (
      <DashboardLayout>
        <LoadingState message="Loading your saved analyses..." />
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <ErrorState
          title="Could not load your analysis history"
          description={error}
          onRetry={() => window.location.reload()}
        />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[28px] border border-border bg-card p-8 shadow-[0_24px_80px_rgba(15,23,42,0.06)]">
            <p className="font-body text-xs font-semibold uppercase tracking-[0.18em] text-sky-700 dark:text-sky-300">History</p>
            <h2 className="mt-2 font-heading text-3xl font-bold text-foreground">Track every analysis in one clean place</h2>
            <p className="mt-3 max-w-2xl font-body text-base leading-7 text-muted-foreground">
              Review previous runs, compare outcomes side by side, and spot how your resume is improving over time.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {[
                { label: "Saved analyses", value: history.length, tone: "bg-sky-100 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300" },
                { label: "Selected for compare", value: compareIds.length, tone: "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300" },
                { label: "Latest match", value: history[0] ? `${history[0].match_percentage}%` : "0%", tone: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300" },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl border border-border bg-secondary/40 p-4">
                  <div className={`inline-flex rounded-2xl px-3 py-1 text-xs font-semibold ${item.tone}`}>{item.label}</div>
                  <p className="mt-4 font-heading text-3xl font-bold text-foreground">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[28px] border border-border bg-card p-8 shadow-[0_24px_80px_rgba(15,23,42,0.06)]">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-100 text-sky-600 dark:bg-sky-950/40 dark:text-sky-300">
                <Layers3 className="h-5 w-5" />
              </div>
              <div>
                <p className="font-heading text-lg font-semibold text-foreground">Comparison mode</p>
                <p className="font-body text-sm text-muted-foreground">Select two analyses to compare score changes and matched skills.</p>
              </div>
            </div>

            {compareIds.length === 2 ? (
              <Button variant="signal" onClick={() => setShowCompare(true)} className="mt-6 rounded-2xl bg-sky-600 text-white hover:bg-sky-700">
                <GitCompareArrows className="mr-2 h-4 w-4" /> Compare Selected
              </Button>
            ) : (
              <div className="mt-6 rounded-2xl border border-border bg-secondary/40 px-4 py-4">
                <p className="font-body text-sm text-muted-foreground">
                  Choose <span className="font-semibold text-foreground">exactly 2 analyses</span> from the list below to unlock side-by-side comparison.
                </p>
              </div>
            )}
          </div>
        </section>

        {showCompare && compareItems.length === 2 && <CompareView items={compareItems} onClose={() => setShowCompare(false)} />}

        {history.length === 0 ? (
          <section className="rounded-[28px] border border-border bg-card p-16 text-center shadow-[0_24px_80px_rgba(15,23,42,0.06)]">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-sky-100 text-sky-600 dark:bg-sky-950/40 dark:text-sky-300">
              <FileSearch className="h-8 w-8" />
            </div>
            <h3 className="mt-6 font-heading text-2xl font-bold text-foreground">No analyses yet</h3>
            <p className="mx-auto mt-3 max-w-lg font-body text-base leading-7 text-muted-foreground">
              Run your first resume analysis to start building a clean timeline of your progress and role-fit changes.
            </p>
            <button
              onClick={() => navigate("/analyze")}
              className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-sky-600 px-6 py-3 font-heading text-sm font-semibold text-white transition-colors hover:bg-sky-700"
            >
              Start Analysis <ArrowRight className="h-4 w-4" />
            </button>
          </section>
        ) : (
          <section className="space-y-4">
            {history.map((row) => {
              const isExpanded = expandedId === row.id;
              const isSelected = compareIds.includes(row.id);
              const result = row.results;

              return (
                <div
                  key={row.id}
                  className={`rounded-[28px] border bg-card p-5 shadow-[0_18px_60px_rgba(15,23,42,0.04)] transition-all ${
                    isSelected ? "border-sky-300 ring-2 ring-sky-100 dark:border-sky-700 dark:ring-sky-950/60" : "border-border"
                  }`}
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                    <button
                      onClick={() => toggleCompare(row.id)}
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-colors ${
                        isSelected ? "border-sky-600 bg-sky-600 text-white" : "border-border bg-card text-muted-foreground"
                      }`}
                      aria-label="Select for comparison"
                    >
                      {isSelected && <Check className="h-4 w-4" />}
                    </button>

                    <div className="min-w-[170px]">
                      <p className="font-heading text-lg font-semibold text-foreground">
                        {new Date(row.created_at).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                      <p className="mt-1 flex items-center gap-2 font-body text-sm text-muted-foreground">
                        <Clock3 className="h-4 w-4" />
                        Saved analysis record
                      </p>
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="font-heading text-base font-semibold text-foreground">
                        {result?.final_decision?.recommendation || "Analysis summary"}
                      </p>
                      <p className="mt-1 truncate font-body text-sm text-muted-foreground">
                        {result?.final_decision?.reason || "Open details to review insights, scores, and detected gaps."}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1.5 font-heading text-xs font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                        <Target className="h-3 w-3" /> {row.match_percentage}%
                      </span>
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-100 px-3 py-1.5 font-heading text-xs font-semibold text-sky-700 dark:bg-sky-950/40 dark:text-sky-300">
                        ATS {row.ats_score}
                      </span>
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : row.id)}
                        className="rounded-2xl border border-border bg-card p-2 text-muted-foreground transition-colors hover:border-border hover:text-foreground"
                        aria-label="Toggle details"
                      >
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </button>
                      <button
                        onClick={() => handleDelete(row.id)}
                        className="rounded-2xl border border-transparent p-2 text-muted-foreground transition-colors hover:bg-rose-100 hover:text-rose-700 dark:hover:bg-rose-950/40 dark:hover:text-rose-300"
                        aria-label="Delete analysis"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {isExpanded && result && (
                    <div className="mt-5 space-y-5 border-t border-border pt-5">
                      <div className="grid gap-4 md:grid-cols-3">
                        <ScoreCard label="ATS Score" value={result.scores?.ats} max={100} color="text-sky-700 dark:text-sky-300" background="bg-sky-100 dark:bg-sky-950/40" />
                        <ScoreCard label="Practical Fit" value={result.scores?.practical_fit} max={100} color="text-emerald-700 dark:text-emerald-300" background="bg-emerald-100 dark:bg-emerald-950/40" />
                        <ScoreCard label="Learning Curve" value={result.scores?.learning_curve} max={100} color="text-amber-700 dark:text-amber-300" background="bg-amber-100 dark:bg-amber-950/40" />
                      </div>

                      {result.matching && (
                        <div className="grid gap-4 md:grid-cols-2">
                          <SkillList title="Strong Matches" items={result.matching.strong} tone="bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300" />
                          <SkillList title="Missing Skills" items={result.matching.missing} tone="bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300" />
                        </div>
                      )}

                      {result.final_decision && (
                        <div className="rounded-2xl border border-border bg-secondary/40 p-5">
                          <p className="font-heading text-base font-semibold text-foreground">
                            {result.final_decision.recommendation} - {result.final_decision.probability}% hire probability
                          </p>
                          <p className="mt-2 font-body text-sm leading-6 text-muted-foreground">{result.final_decision.reason}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </section>
        )}
      </div>
    </DashboardLayout>
  );
};

function ScoreCard({
  label,
  value,
  max,
  color,
  background,
}: {
  label: string;
  value?: number;
  max: number;
  color: string;
  background: string;
}) {
  const safeValue = value ?? 0;

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className={`inline-flex rounded-2xl px-3 py-1 text-xs font-semibold ${background} ${color}`}>{label}</div>
      <p className={`mt-4 font-heading text-3xl font-bold ${color}`}>
        {safeValue}
        <span className="text-base text-muted-foreground">/{max}</span>
      </p>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-secondary">
        <div className={`h-full rounded-full bg-current ${color}`} style={{ width: `${(safeValue / max) * 100}%` }} />
      </div>
    </div>
  );
}

function SkillList({ title, items, tone }: { title: string; items?: string[]; tone: string }) {
  if (!items?.length) return null;

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <p className="font-heading text-base font-semibold text-foreground">{title}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {items.map((item) => (
          <span key={item} className={`rounded-full px-3 py-1.5 font-body text-xs font-medium ${tone}`}>
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

function CompareView({ items, onClose }: { items: HistoryRow[]; onClose: () => void }) {
  const [first, second] = items;

  return (
    <section className="rounded-[28px] border border-border bg-card p-8 shadow-[0_24px_80px_rgba(15,23,42,0.06)]">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-body text-xs font-semibold uppercase tracking-[0.18em] text-sky-700 dark:text-sky-300">Comparison</p>
          <h3 className="mt-2 flex items-center gap-2 font-heading text-2xl font-bold text-foreground">
            <GitCompareArrows className="h-5 w-5 text-sky-600" /> Side-by-side review
          </h3>
        </div>
        <button onClick={onClose} className="rounded-2xl border border-border bg-card p-2 text-muted-foreground transition-colors hover:border-border hover:text-foreground">
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {[first, second].map((item) => (
          <div key={item.id} className="rounded-2xl border border-border bg-secondary/40 p-5">
            <p className="font-heading text-lg font-semibold text-foreground">
              {new Date(item.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
            </p>
            <p className="mt-1 font-body text-sm text-muted-foreground">
              {item.results?.final_decision?.recommendation || "Analysis result"}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-6 space-y-3">
        {(["ats", "practical_fit", "learning_curve"] as const).map((key) => {
          const labels: Record<string, string> = {
            ats: "ATS Score",
            practical_fit: "Practical Fit",
            learning_curve: "Learning Curve",
          };
          const firstValue = first.results?.scores?.[key] ?? 0;
          const secondValue = second.results?.scores?.[key] ?? 0;
          const diff = secondValue - firstValue;

          return (
            <div key={key} className="grid items-center gap-4 rounded-2xl border border-border bg-secondary/40 px-5 py-4 md:grid-cols-[1fr_auto_1fr]">
              <div className="text-center">
                <p className="font-heading text-3xl font-bold text-foreground">{firstValue}</p>
              </div>
              <div className="text-center">
                <p className="font-body text-xs uppercase tracking-[0.16em] text-muted-foreground">{labels[key]}</p>
                <p className={`mt-1 font-heading text-sm font-semibold ${diff > 0 ? "text-emerald-700 dark:text-emerald-300" : diff < 0 ? "text-rose-700 dark:text-rose-300" : "text-muted-foreground"}`}>
                  {diff > 0 ? `+${diff}` : diff === 0 ? "No change" : diff}
                </p>
              </div>
              <div className="text-center">
                <p className="font-heading text-3xl font-bold text-foreground">{secondValue}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default History;
