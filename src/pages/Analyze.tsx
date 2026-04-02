import { useState, useCallback } from "react";
import { ArrowLeft, RefreshCw, ScanSearch, Sparkles } from "lucide-react";
import type { AIAnalysisResult } from "@/lib/aiAnalysisTypes";
import InputSection from "@/components/InputSection";
import AnalysisAnimation from "@/components/AnalysisAnimation";
import AIResultsSection from "@/components/AIResultsSection";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";
import { useToast } from "@/hooks/use-toast";
import { parseAIAnalysisResult } from "@/lib/analysisResultSchema";

const Analyze = () => {
  const [stage, setStage] = useState<"input" | "analyzing" | "results">("input");
  const [resumeText, setResumeText] = useState("");
  const [jobText, setJobText] = useState("");
  const [results, setResults] = useState<AIAnalysisResult | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const getErrorMessage = (error: unknown) => {
    if (error instanceof Error) return error.message;
    return "Please try again.";
  };

  const handleAnalyze = useCallback(async () => {
    if (!resumeText.trim() || !jobText.trim()) return;
    setStage("analyzing");

    try {
      const { data, error } = await supabase.functions.invoke("analyze-resume", {
        body: { resume_text: resumeText, job_description: jobText },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      const aiResults = parseAIAnalysisResult(data);
      if (!aiResults) {
        throw new Error("Received an invalid analysis response.");
      }
      setResults(aiResults);
      setStage("results");

      if (user) {
        await supabase.from("analysis_history").insert({
          user_id: user.id,
          resume_text: resumeText,
          job_text: jobText,
          match_percentage: aiResults.final_decision?.probability || 0,
          ats_score: aiResults.scores?.ats || 0,
          results: aiResults as Json,
        });
      }
    } catch (error: unknown) {
      console.error("Analysis failed:", error);
      toast({
        title: "Analysis failed",
        description: getErrorMessage(error),
        variant: "destructive",
      });
      setStage("input");
    }
  }, [resumeText, jobText, user, toast]);

  const handleStartOver = useCallback(() => {
    setStage("input");
    setResumeText("");
    setJobText("");
    setResults(null);
  }, []);

  const content = (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-border bg-card p-8 shadow-[0_24px_80px_rgba(15,23,42,0.06)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="font-body text-xs font-semibold uppercase tracking-[0.18em] text-sky-700 dark:text-sky-300">Analysis workspace</p>
            <h2 className="mt-2 font-heading text-3xl font-bold text-foreground">
              {stage === "results" ? "Your analysis report is ready" : "Run a clean, evidence-backed career analysis"}
            </h2>
            <p className="mt-3 max-w-2xl font-body text-base leading-7 text-muted-foreground">
              Compare resume content against a target role, review skill gaps, and generate a polished report with practical next steps.
            </p>
          </div>

          {stage === "results" ? (
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleStartOver}
                className="inline-flex items-center gap-2 rounded-2xl border border-border bg-card px-4 py-2.5 font-body text-sm font-medium text-foreground transition-colors hover:bg-secondary"
              >
                <RefreshCw className="h-4 w-4" /> Start Over
              </button>
            </div>
          ) : (
            <div className="flex flex-wrap gap-3">
              <div className="inline-flex items-center gap-2 rounded-2xl bg-sky-100/70 px-4 py-2.5 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300">
                <ScanSearch className="h-4 w-4" />
                <span className="font-body text-sm font-medium">Resume + role evaluation</span>
              </div>
              <div className="inline-flex items-center gap-2 rounded-2xl bg-secondary px-4 py-2.5 text-foreground">
                <Sparkles className="h-4 w-4" />
                <span className="font-body text-sm font-medium">Actionable score breakdown</span>
              </div>
            </div>
          )}
        </div>
      </section>

      {stage === "input" && <InputSection resumeText={resumeText} jobText={jobText} onResumeChange={setResumeText} onJobChange={setJobText} onAnalyze={handleAnalyze} />}
      {stage === "analyzing" && (
        <div className="rounded-[28px] border border-border bg-card p-8 shadow-[0_24px_80px_rgba(15,23,42,0.06)]">
          <AnalysisAnimation resumeText={resumeText} jobText={jobText} />
        </div>
      )}
      {stage === "results" && results && <AIResultsSection results={results} />}
    </div>
  );

  if (user) {
    return <DashboardLayout>{content}</DashboardLayout>;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/80 bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <p className="font-body text-xs font-semibold uppercase tracking-[0.18em] text-sky-700 dark:text-sky-300">Public analysis</p>
            <h1 className="mt-1 font-heading text-2xl font-bold text-foreground">Analyze Resume</h1>
          </div>
          {stage === "results" ? (
            <button
              type="button"
              onClick={handleStartOver}
              className="inline-flex items-center gap-2 rounded-2xl border border-border bg-card px-4 py-2.5 font-body text-sm font-medium text-foreground transition-colors hover:bg-secondary"
            >
              <RefreshCw className="h-4 w-4" /> Start Over
            </button>
          ) : (
            <button
              type="button"
              onClick={() => history.back()}
              className="inline-flex items-center gap-2 rounded-2xl border border-border bg-card px-4 py-2.5 font-body text-sm font-medium text-foreground transition-colors hover:bg-secondary"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">{content}</main>
    </div>
  );
};

export default Analyze;
