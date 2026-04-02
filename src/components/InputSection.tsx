import { Button } from "@/components/ui/button";
import FileUpload from "@/components/FileUpload";
import { Sparkles, BriefcaseBusiness, ClipboardList, CheckCircle2, RotateCcw } from "lucide-react";

interface InputSectionProps {
  resumeText: string;
  jobText: string;
  onResumeChange: (text: string) => void;
  onJobChange: (text: string) => void;
  onAnalyze: () => void;
}

const jobTemplates = [
  {
    title: "Frontend Engineer",
    description:
      "We are hiring a Frontend Engineer with strong React, TypeScript, accessibility, testing, and API integration experience. Required: React, TypeScript, HTML, CSS, responsive design, REST APIs, Git, unit testing. Preferred: Next.js, Playwright, design systems, performance optimization, CI/CD.",
  },
  {
    title: "Backend Developer",
    description:
      "Seeking a Backend Developer to build scalable APIs and services. Required: Node.js, Express, PostgreSQL, authentication, REST APIs, Docker, Git, cloud deployment. Preferred: GraphQL, Redis, microservices, AWS, observability, CI/CD pipelines.",
  },
  {
    title: "Data Analyst",
    description:
      "Looking for a Data Analyst to turn complex datasets into business insights. Required: SQL, Excel, Python, dashboards, data visualization, statistics, communication. Preferred: Power BI, Tableau, ETL pipelines, experimentation, stakeholder reporting.",
  },
];

const getWordCount = (text: string) => text.trim().split(/\s+/).filter(Boolean).length;

const InputSection = ({
  resumeText,
  jobText,
  onResumeChange,
  onJobChange,
  onAnalyze,
}: InputSectionProps) => {
  const hasResume = resumeText.trim().length > 0;
  const hasJob = jobText.trim().length > 0;
  const canAnalyze = hasResume && hasJob;
  const completion = [hasResume, hasJob].filter(Boolean).length * 50;

  return (
    <div className="space-y-8">
      <div className="rounded-[28px] border border-border bg-card/80 p-8 shadow-[0_24px_80px_rgba(0,0,0,0.08)] backdrop-blur-sm">
        <div className="text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary/20 to-accent/20 px-4 py-1.5">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="font-body text-xs font-medium text-foreground">AI-Powered Analysis</span>
          </div>
          <h2 className="font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Analyze Your <span className="text-gradient-yellow">Career Fit</span>
          </h2>
          <p className="mt-3 font-body text-muted-foreground">
            Upload or paste your resume and a job description. Get sharper matching, evidence-backed insights, and an actionable improvement roadmap.
          </p>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ClipboardList className="h-4 w-4 text-primary" />
                <p className="font-heading text-sm font-semibold text-foreground">Analysis readiness</p>
              </div>
              <span className="font-body text-xs text-muted-foreground">{completion}% complete</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-secondary">
              <div className="h-full rounded-full bg-gradient-to-r from-primary via-accent to-aqua transition-all duration-500" style={{ width: `${completion}%` }} />
            </div>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {[
                { label: "Resume added", done: hasResume },
                { label: "Job description added", done: hasJob },
                { label: "Ready to analyze", done: canAnalyze },
                { label: "Evidence-rich input", done: getWordCount(resumeText) > 60 && getWordCount(jobText) > 60 },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2 rounded-xl border border-border/60 bg-card px-3 py-2">
                  <CheckCircle2 className={`h-4 w-4 ${item.done ? "text-aqua" : "text-muted-foreground"}`} />
                  <span className="font-body text-sm text-foreground">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
            <div className="mb-3 flex items-center gap-2">
              <BriefcaseBusiness className="h-4 w-4 text-accent" />
              <p className="font-heading text-sm font-semibold text-foreground">Quick-start job templates</p>
            </div>
            <div className="space-y-2">
              {jobTemplates.map((template) => (
                <button
                  key={template.title}
                  type="button"
                  onClick={() => onJobChange(template.description)}
                  className="w-full rounded-xl border border-border/60 bg-card px-3 py-3 text-left transition-colors hover:border-primary/40 hover:bg-secondary/50"
                >
                  <p className="font-heading text-sm font-semibold text-foreground">{template.title}</p>
                  <p className="mt-1 line-clamp-2 font-body text-xs text-muted-foreground">{template.description}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 font-heading text-sm font-medium text-foreground">
              <span className="inline-block h-2 w-2 rounded-full bg-aqua" />
              Your Resume
            </label>
            {hasResume && (
              <button
                type="button"
                onClick={() => onResumeChange("")}
                className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Clear
              </button>
            )}
          </div>
          <FileUpload onTextExtracted={onResumeChange} currentText={resumeText} />
          <textarea
            value={resumeText}
            onChange={(event) => onResumeChange(event.target.value)}
            placeholder="Paste your resume text here, including achievements, tools, and projects..."
            className="h-56 w-full resize-none rounded-xl border border-border bg-card p-4 font-body text-sm text-card-foreground transition-all placeholder:text-muted-foreground focus:border-accent/50 focus:outline-none focus:ring-2 focus:ring-accent/50"
          />
          <div className="flex items-center justify-between rounded-xl border border-border/60 bg-secondary/20 px-3 py-2">
            <span className="font-body text-xs text-muted-foreground">Word count</span>
            <span className="font-heading text-sm text-foreground">{getWordCount(resumeText)}</span>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 font-heading text-sm font-medium text-foreground">
              <span className="inline-block h-2 w-2 rounded-full bg-primary" />
              Job Description
            </label>
            {hasJob && (
              <button
                type="button"
                onClick={() => onJobChange("")}
                className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Clear
              </button>
            )}
          </div>
          <div className="rounded-xl border border-border/60 bg-secondary/20 p-4">
            <p className="font-heading text-xs uppercase tracking-wide text-foreground">Best results</p>
            <p className="mt-2 font-body text-xs leading-relaxed text-muted-foreground">
              Include must-have skills, responsibilities, tools, and preferred qualifications so the analysis can separate core gaps from bonus skills.
            </p>
          </div>
          <textarea
            value={jobText}
            onChange={(event) => onJobChange(event.target.value)}
            placeholder="Paste the full job description here..."
            className="h-56 w-full resize-none rounded-xl border border-border bg-card p-4 font-body text-sm text-card-foreground transition-all placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <div className="flex items-center justify-between rounded-xl border border-border/60 bg-secondary/20 px-3 py-2">
            <span className="font-body text-xs text-muted-foreground">Word count</span>
            <span className="font-heading text-sm text-foreground">{getWordCount(jobText)}</span>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-heading text-base font-semibold text-foreground">Ready for an evidence-backed review?</p>
            <p className="mt-1 font-body text-sm text-muted-foreground">
              The analyzer will score ATS fit, practical fit, learning curve, and explain the reasoning behind each.
            </p>
          </div>
          <Button
            variant="signal"
            size="lg"
            onClick={onAnalyze}
            disabled={!canAnalyze}
            className="group px-12 py-6 text-lg"
          >
            <Sparkles className="mr-2 h-5 w-5 group-hover:animate-pulse" />
            Analyze Now
          </Button>
        </div>
      </div>
    </div>
  );
};

export default InputSection;
