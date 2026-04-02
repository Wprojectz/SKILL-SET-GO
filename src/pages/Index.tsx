import { useState, useCallback } from "react";
import type { AIAnalysisResult } from "@/lib/aiAnalysisTypes";
import InputSection from "@/components/InputSection";
import AnalysisAnimation from "@/components/AnalysisAnimation";
import AIResultsSection from "@/components/AIResultsSection";
import { supabase } from "@/integrations/supabase/client";
import { parseAIAnalysisResult } from "@/lib/analysisResultSchema";

const Index = () => {
  const [stage, setStage] = useState<"input" | "analyzing" | "results">("input");
  const [resumeText, setResumeText] = useState("");
  const [jobText, setJobText] = useState("");
  const [results, setResults] = useState<AIAnalysisResult | null>(null);

  const handleAnalyze = useCallback(async () => {
    if (!resumeText.trim() || !jobText.trim()) return;
    setStage("analyzing");

    try {
      const { data, error } = await supabase.functions.invoke("analyze-resume", {
        body: { resume_text: resumeText, job_description: jobText },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      const parsed = parseAIAnalysisResult(data);
      if (!parsed) throw new Error("Received an invalid analysis response.");
      setResults(parsed);
      setStage("results");
    } catch (e) {
      console.error("Analysis failed:", e);
      setStage("input");
    }
  }, [resumeText, jobText]);

  const handleStartOver = useCallback(() => {
    setStage("input");
    setResumeText("");
    setJobText("");
    setResults(null);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50 px-6 py-4">
        <div className="mx-auto flex max-w-[800px] items-center justify-between">
          <h1 className="font-heading text-lg font-bold tracking-tight text-foreground">Skill Set Go</h1>
          {stage === "results" && (
            <button onClick={handleStartOver} className="font-body text-sm text-muted-foreground transition-colors hover:text-primary">
              Start Over
            </button>
          )}
        </div>
      </header>
      <main className="mx-auto max-w-[800px] px-6 py-12">
        {stage === "input" && (
          <InputSection resumeText={resumeText} jobText={jobText} onResumeChange={setResumeText} onJobChange={setJobText} onAnalyze={handleAnalyze} />
        )}
        {stage === "analyzing" && <AnalysisAnimation resumeText={resumeText} jobText={jobText} />}
        {stage === "results" && results && <AIResultsSection results={results} />}
      </main>
    </div>
  );
};

export default Index;
