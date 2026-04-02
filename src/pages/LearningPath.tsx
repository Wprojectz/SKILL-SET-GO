import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { ErrorState, LoadingState } from "@/components/PageState";
import { BookOpen, GraduationCap, Zap, Rocket, Target, Brain, CheckCircle2 } from "lucide-react";
import type { AIAnalysisResult } from "@/lib/aiAnalysisTypes";
import { parseAIAnalysisResult } from "@/lib/analysisResultSchema";

const difficultyConfig = {
  Beginner: { color: "text-emerald-700 dark:text-emerald-300", bg: "bg-emerald-100 dark:bg-emerald-950/40", border: "border-emerald-200 dark:border-emerald-900/60", icon: Zap },
  Intermediate: { color: "text-sky-700 dark:text-sky-300", bg: "bg-sky-100 dark:bg-sky-950/40", border: "border-sky-200 dark:border-sky-900/60", icon: GraduationCap },
  Advanced: { color: "text-amber-700 dark:text-amber-300", bg: "bg-amber-100 dark:bg-amber-950/40", border: "border-amber-200 dark:border-amber-900/60", icon: Rocket },
};

interface LearningStep {
  step: number;
  skill: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  description: string;
}

const getDifficultyFromSeverity = (severity: string): LearningStep["difficulty"] => {
  switch (severity) {
    case "Critical":
      return "Advanced";
    case "Moderate":
      return "Intermediate";
    case "Minor":
      return "Beginner";
    default:
      return "Intermediate";
  }
};

const LearningPath = () => {
  const { user } = useAuth();
  const [data, setData] = useState<AIAnalysisResult | null>(null);
  const [steps, setSteps] = useState<LearningStep[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadLearningPath = useCallback(async () => {
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
      setSteps([]);
      setLoading(false);
      return;
    }

    if (rows && rows.length > 0) {
      const result = parseAIAnalysisResult(rows[0].results);
      if (!result) {
        setData(null);
        setSteps([]);
        setLoading(false);
        return;
      }
      setData(result);

      const builtSteps: LearningStep[] = [];
      if (result.gaps && result.gaps.length > 0) {
        result.gaps.forEach((gap, index) => {
          builtSteps.push({
            step: index + 1,
            skill: gap.skill,
            difficulty: getDifficultyFromSeverity(gap.severity),
            description: `${gap.learnable}. Severity: ${gap.severity}`,
          });
        });
      } else if (result.matching?.missing?.length > 0) {
        result.matching.missing.forEach((skill, index) => {
          builtSteps.push({
            step: index + 1,
            skill,
            difficulty: "Intermediate",
            description: "This skill was identified as missing from your resume for the target role.",
          });
        });
      }
      setSteps(builtSteps);
    } else {
      setData(null);
      setSteps([]);
    }

    setLoading(false);
  }, [user]);

  useEffect(() => {
    void loadLearningPath();
  }, [loadLearningPath]);

  if (loading) {
    return (
      <DashboardLayout>
        <LoadingState message="Building your learning roadmap..." />
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <ErrorState
          title="Could not load your learning path"
          description={error}
          onRetry={() => {
            void loadLearningPath();
          }}
        />
      </DashboardLayout>
    );
  }

  if (steps.length === 0) {
    return (
      <DashboardLayout>
        <section className="rounded-[28px] border border-border bg-card p-16 text-center shadow-[0_24px_80px_rgba(15,23,42,0.06)]">
          <BookOpen className="mx-auto mb-4 h-12 w-12 text-sky-600" />
          <h3 className="font-heading text-2xl font-bold text-foreground">No Learning Path Yet</h3>
          <p className="mx-auto mt-3 max-w-lg font-body text-base leading-7 text-muted-foreground">
            Analyze your resume against a target role to generate a cleaner roadmap of what to learn next.
          </p>
        </section>
      </DashboardLayout>
    );
  }

  const grouped = {
    Beginner: steps.filter((step) => step.difficulty === "Beginner"),
    Intermediate: steps.filter((step) => step.difficulty === "Intermediate"),
    Advanced: steps.filter((step) => step.difficulty === "Advanced"),
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[28px] border border-border bg-card p-8 shadow-[0_24px_80px_rgba(15,23,42,0.06)]">
            <p className="font-body text-xs font-semibold uppercase tracking-[0.18em] text-sky-700 dark:text-sky-300">Learning path</p>
            <h2 className="mt-2 font-heading text-3xl font-bold text-foreground">Turn skill gaps into a focused growth roadmap</h2>
            <p className="mt-3 max-w-3xl font-body text-base leading-7 text-muted-foreground">
              This page organizes the next learning priorities by difficulty so the user knows what to tackle first and what can come later.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {[
                { label: "Total steps", value: steps.length, tone: "bg-sky-100 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300" },
                { label: "Beginner items", value: grouped.Beginner.length, tone: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300" },
                { label: "Advanced items", value: grouped.Advanced.length, tone: "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300" },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl border border-border bg-secondary/40 p-4">
                  <div className={`inline-flex rounded-2xl px-3 py-1 text-xs font-semibold ${item.tone}`}>{item.label}</div>
                  <p className="mt-4 font-heading text-3xl font-bold text-foreground">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[28px] border border-border bg-card p-8 shadow-[0_24px_80px_rgba(15,23,42,0.06)]">
            <p className="font-body text-xs font-semibold uppercase tracking-[0.18em] text-sky-700 dark:text-sky-300">Context</p>
            {data?.scores && (
              <div className="mt-5 space-y-4">
                {[
                  { label: "Learning Curve", value: data.scores.learning_curve, icon: Brain },
                  { label: "ATS Score", value: data.scores.ats, icon: Target },
                  { label: "Practical Fit", value: data.scores.practical_fit, icon: Rocket },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-4 rounded-2xl border border-border bg-secondary/40 p-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-100 text-sky-600 dark:bg-sky-950/40 dark:text-sky-300">
                      <item.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-body text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">{item.label}</p>
                      <p className="mt-1 font-heading text-2xl font-bold text-foreground">{item.value}%</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {(["Beginner", "Intermediate", "Advanced"] as const).map((level) => {
          const items = grouped[level];
          if (items.length === 0) return null;

          const config = difficultyConfig[level];
          const Icon = config.icon;

          return (
            <section key={level} className="rounded-[28px] border border-border bg-card p-8 shadow-[0_24px_80px_rgba(15,23,42,0.06)]">
              <div className="flex items-center gap-3">
                <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${config.bg} ${config.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-body text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{level}</p>
                  <h3 className="font-heading text-2xl font-bold text-foreground">{items.length} learning priorities</h3>
                </div>
              </div>

              <div className="mt-6 grid gap-4">
                {items.map((step) => (
                  <div
                    key={`${step.skill}-${step.step}`}
                    className={`rounded-2xl border ${config.border} bg-secondary/40 p-5 transition-all hover:-translate-y-0.5 hover:shadow-md`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${config.bg} font-heading text-sm font-bold ${config.color}`}>
                        {step.step}
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="font-heading text-lg font-semibold capitalize text-foreground">{step.skill}</h4>
                          <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${config.bg} ${config.color}`}>
                            <CheckCircle2 className="h-3.5 w-3.5" /> {level}
                          </span>
                        </div>
                        <p className="mt-3 font-body text-sm leading-6 text-muted-foreground">{step.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </DashboardLayout>
  );
};

export default LearningPath;
