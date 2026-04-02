import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { ErrorState, LoadingState } from "@/components/PageState";
import { Target, TrendingUp, AlertTriangle, CheckCircle2, Zap, ArrowUpRight } from "lucide-react";
import type { AIAnalysisResult } from "@/lib/aiAnalysisTypes";
import { parseAIAnalysisResult } from "@/lib/analysisResultSchema";

const summaryConfig = [
  { label: "Strong Match", icon: CheckCircle2, getValue: (result: AIAnalysisResult) => result.matching.strong.length, tone: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300" },
  { label: "Weak Match", icon: TrendingUp, getValue: (result: AIAnalysisResult) => result.matching.weak.length, tone: "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300" },
  { label: "Missing", icon: AlertTriangle, getValue: (result: AIAnalysisResult) => result.matching.missing.length, tone: "bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300" },
  { label: "Transferable", icon: Zap, getValue: (result: AIAnalysisResult) => result.matching.transferable.length, tone: "bg-sky-100 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300" },
];

const getSeverityTone = (severity: string) => {
  switch (severity) {
    case "Critical":
      return "bg-rose-100 text-rose-700";
    case "Moderate":
      return "bg-amber-100 text-amber-700";
    case "Minor":
      return "bg-emerald-100 text-emerald-700";
    default:
      return "bg-secondary text-muted-foreground";
  }
};

const SkillGap = () => {
  const { user } = useAuth();
  const [data, setData] = useState<AIAnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSkillGap = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    const { data: rows, error } = await supabase
      .from("analysis_history")
      .select("results")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1);

    if (error) {
      setError(error.message);
      setData(null);
    } else if (rows && rows.length > 0) {
      setData(parseAIAnalysisResult(rows[0].results));
    } else {
      setData(null);
    }

    setLoading(false);
  }, [user]);

  useEffect(() => {
    void loadSkillGap();
  }, [loadSkillGap]);

  if (loading) {
    return (
      <DashboardLayout>
        <LoadingState message="Loading your skill gap analysis..." />
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <ErrorState
          title="Could not load your skill gap report"
          description={error}
          onRetry={() => {
            void loadSkillGap();
          }}
        />
      </DashboardLayout>
    );
  }

  if (!data?.matching) {
    return (
      <DashboardLayout>
        <section className="rounded-[28px] border border-border bg-card p-16 text-center shadow-[0_24px_80px_rgba(15,23,42,0.06)]">
          <Target className="mx-auto mb-4 h-12 w-12 text-sky-600" />
          <h3 className="font-heading text-2xl font-bold text-foreground">No Skill Data Yet</h3>
          <p className="mx-auto mt-3 max-w-lg font-body text-base leading-7 text-muted-foreground">
            Run your first resume analysis to see a clean skill-gap breakdown with strengths, missing skills, and learning priorities.
          </p>
        </section>
      </DashboardLayout>
    );
  }

  const { matching, scores = { ats: 0, practical_fit: 0, learning_curve: 0 }, gaps, skills } = data;
  const totalSkills = matching.strong.length + matching.missing.length;
  const matchRate = totalSkills > 0 ? Math.round((matching.strong.length / totalSkills) * 100) : 0;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <section className="rounded-[28px] border border-border bg-card p-8 shadow-[0_24px_80px_rgba(15,23,42,0.06)]">
          <p className="font-body text-xs font-semibold uppercase tracking-[0.18em] text-sky-700 dark:text-sky-300">Skill gap</p>
          <h2 className="mt-2 font-heading text-3xl font-bold text-foreground">See where your profile is already strong and where it still needs work</h2>
          <p className="mt-3 max-w-3xl font-body text-base leading-7 text-muted-foreground">
            This view turns the latest analysis into a sharper overview of core matches, resume gaps, and transferable skills you can lean on.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {summaryConfig.map((item) => (
              <div key={item.label} className="rounded-2xl border border-border bg-secondary/40 p-5">
                <div className={`inline-flex rounded-2xl p-3 ${item.tone}`}>
                  <item.icon className="h-5 w-5" />
                </div>
                <p className="mt-4 font-body text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">{item.label}</p>
                <p className="mt-2 font-heading text-3xl font-bold text-foreground">{item.getValue(data)}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-[28px] border border-border bg-card p-8 shadow-[0_24px_80px_rgba(15,23,42,0.06)]">
            <p className="font-body text-xs font-semibold uppercase tracking-[0.18em] text-sky-700 dark:text-sky-300">Scores</p>
            <div className="mt-5 space-y-4">
              {[
                { label: "ATS Score", value: scores.ats },
                { label: "Practical Fit", value: scores.practical_fit },
                { label: "Match Rate", value: matchRate },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl border border-border bg-secondary/40 p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-body text-sm text-muted-foreground">{item.label}</span>
                    <span className="font-heading text-lg font-semibold text-foreground">{item.value}%</span>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-secondary">
                    <div className="h-full rounded-full bg-sky-600" style={{ width: `${item.value}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[28px] border border-border bg-card p-8 shadow-[0_24px_80px_rgba(15,23,42,0.06)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-body text-xs font-semibold uppercase tracking-[0.18em] text-sky-700 dark:text-sky-300">Interpretation</p>
                <h3 className="mt-2 font-heading text-2xl font-bold text-foreground">What this means for the role</h3>
              </div>
              <ArrowUpRight className="h-5 w-5 text-sky-600" />
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-border bg-emerald-100/70 p-5 dark:bg-emerald-950/30">
                <p className="font-heading text-base font-semibold text-foreground">Strong matches</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {matching.strong.map((skill) => (
                    <span key={skill} className="rounded-full bg-card px-3 py-1.5 font-body text-xs font-medium text-emerald-700 shadow-sm dark:text-emerald-300">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-rose-100/70 p-5 dark:bg-rose-950/30">
                <p className="font-heading text-base font-semibold text-foreground">Missing skills</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {matching.missing.map((skill) => (
                    <span key={skill} className="rounded-full bg-card px-3 py-1.5 font-body text-xs font-medium text-rose-700 shadow-sm dark:text-rose-300">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {gaps && gaps.length > 0 && (
          <section className="rounded-[28px] border border-border bg-card p-8 shadow-[0_24px_80px_rgba(15,23,42,0.06)]">
            <p className="font-body text-xs font-semibold uppercase tracking-[0.18em] text-sky-700 dark:text-sky-300">Gap intelligence</p>
            <div className="mt-6 grid gap-3">
              {gaps.map((gap) => (
                <div key={gap.skill} className="flex flex-col gap-3 rounded-2xl border border-border bg-secondary/40 px-5 py-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="font-heading text-base font-semibold capitalize text-foreground">{gap.skill}</p>
                    <p className="mt-1 font-body text-sm text-muted-foreground">Learnable: {gap.learnable}</p>
                  </div>
                  <span
                    className={`inline-flex rounded-full px-3 py-1.5 font-body text-xs font-medium ${getSeverityTone(gap.severity)}`}
                  >
                    {gap.severity}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {skills?.proficiency && Object.keys(skills.proficiency).length > 0 && (
          <section className="rounded-[28px] border border-border bg-card p-8 shadow-[0_24px_80px_rgba(15,23,42,0.06)]">
            <p className="font-body text-xs font-semibold uppercase tracking-[0.18em] text-sky-700 dark:text-sky-300">Skill proficiency</p>
            <div className="mt-6 grid gap-3 md:grid-cols-2">
              {Object.entries(skills.proficiency).map(([skill, level]) => (
                <div key={skill} className="flex items-center justify-between rounded-2xl border border-border bg-secondary/40 px-4 py-3">
                  <span className="font-body text-sm font-medium capitalize text-foreground">{skill}</span>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      level === "Expert"
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                        : level === "Advanced"
                          ? "bg-sky-100 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300"
                          : level === "Intermediate"
                            ? "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
                            : "bg-secondary text-muted-foreground"
                    }`}
                  >
                    {level}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </DashboardLayout>
  );
};

export default SkillGap;
