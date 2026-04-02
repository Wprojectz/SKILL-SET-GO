import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { parseAIAnalysisResult } from "@/lib/analysisResultSchema";
import {
  ArrowRight,
  BarChart3,
  BriefcaseBusiness,
  CheckCircle2,
  Clock3,
  FileSearch,
  GraduationCap,
  Menu,
  Moon,
  ShieldCheck,
  Sparkles,
  Sun,
  Target,
  Users,
} from "lucide-react";

const navigation = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Services", href: "#services" },
  { label: "Contact", href: "#contact" },
];

const contentCards = [
  {
    icon: FileSearch,
    title: "Resume Review",
    description: "Upload or paste your resume and get a structured, professional analysis in a focused workflow.",
  },
  {
    icon: Target,
    title: "Job Match Insights",
    description: "Compare your profile against a role and understand where your strengths and gaps actually sit.",
  },
  {
    icon: GraduationCap,
    title: "Learning Direction",
    description: "Turn missing skills into a practical roadmap so users know what to improve next.",
  },
];

const features = [
  {
    icon: ShieldCheck,
    title: "Clear and Trustworthy",
    description: "Structured reports with visible reasoning, not just isolated scores.",
  },
  {
    icon: BarChart3,
    title: "Professional Visuals",
    description: "Readable cards, strong hierarchy, and polished data presentation across devices.",
  },
  {
    icon: Users,
    title: "User-Friendly Flow",
    description: "A calm, guided experience that feels approachable for students and professionals.",
  },
  {
    icon: BriefcaseBusiness,
    title: "Career-Focused",
    description: "Built around real hiring use cases like ATS fit, practical fit, and improvement priorities.",
  },
];

const footerColumns = [
  {
    title: "Navigation",
    items: ["Home", "About", "Services", "Contact"],
  },
  {
    title: "Contact",
    items: ["hello@skillsetgo.com", "+91 98765 43210", "Chennai, India"],
  },
];

const heroHighlights = [
  "ATS-friendly review",
  "Skill gap detection",
  "Clear next-step guidance",
];

const guestFlowSteps = [
  {
    title: "1. Add Your Resume",
    description: "Paste or upload your experience, projects, and tools in a clean input flow.",
  },
  {
    title: "2. Compare With A Role",
    description: "Match your profile against job requirements and identify missing expectations.",
  },
  {
    title: "3. Improve With Clarity",
    description: "Get structured scores, skill gaps, and a focused direction for what to do next.",
  },
];

type AnalysisHistoryRow = Tables<"analysis_history">;

interface LatestAnalysisPreview {
  matchPercentage: number;
  atsScore: number;
  practicalFit: number;
  learningCurve: number;
  strongMatches: string[];
  missingSkills: string[];
  createdAt: string;
}

const parsePreview = (row: AnalysisHistoryRow): LatestAnalysisPreview => {
  const results = parseAIAnalysisResult(row.results);

  return {
    matchPercentage: row.match_percentage,
    atsScore: row.ats_score,
    practicalFit: results?.scores?.practical_fit ?? 0,
    learningCurve: results?.scores?.learning_curve ?? 0,
    strongMatches: results?.matching?.strong?.slice(0, 3) ?? [],
    missingSkills: results?.matching?.missing?.slice(0, 3) ?? [],
    createdAt: row.created_at,
  };
};

const Landing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [latestAnalysis, setLatestAnalysis] = useState<LatestAnalysisPreview | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      setLatestAnalysis(null);
      setPreviewLoading(false);
      return;
    }

    setPreviewLoading(true);

    void supabase
      .from("analysis_history")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .then(({ data }) => {
        if (data && data.length > 0) {
          setLatestAnalysis(parsePreview(data[0]));
        } else {
          setLatestAnalysis(null);
        }
      })
      .finally(() => {
        setPreviewLoading(false);
      });
  }, [user]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-[-10%] top-0 h-72 w-72 rounded-full bg-sky-200/35 blur-3xl dark:bg-sky-900/20" />
        <div className="absolute right-[-8%] top-24 h-80 w-80 rounded-full bg-blue-200/30 blur-3xl dark:bg-blue-900/20" />
        <div className="absolute bottom-0 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-cyan-200/25 blur-3xl dark:bg-cyan-900/20" />
      </div>

      <header className="sticky top-0 z-20 border-b border-border/80 bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <button onClick={() => navigate("/")} className="flex items-center gap-3 text-left">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-600 text-white shadow-sm shadow-sky-500/20">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="font-heading text-base font-bold text-foreground">Skill Set Go</p>
              <p className="font-body text-xs text-muted-foreground">Career analysis platform</p>
            </div>
          </button>

          <div className="hidden items-center gap-8 lg:flex">
            <nav className="flex items-center gap-6">
              {navigation.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="font-body text-sm font-medium text-muted-foreground transition-colors hover:text-sky-600"
                >
                  {item.label}
                </a>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              <button
                onClick={toggleTheme}
                className="rounded-xl border border-border bg-card p-2 text-muted-foreground transition-colors hover:text-foreground"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>
              <Button
                variant="signal"
                className="rounded-xl bg-sky-600 px-5 text-white hover:bg-sky-700"
                onClick={() => navigate(user ? "/dashboard" : "/auth?mode=signup")}
              >
                {user ? "Open Dashboard" : "Get Started"}
              </Button>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setMenuOpen((current) => !current)}
            className="rounded-xl border border-border bg-card p-2 text-muted-foreground lg:hidden"
            aria-label="Toggle navigation"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>

        {menuOpen && (
          <div className="border-t border-border bg-background lg:hidden">
            <div className="mx-auto max-w-6xl space-y-4 px-6 py-4">
              <nav className="flex flex-col gap-3">
                {navigation.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    className="font-body text-sm font-medium text-muted-foreground"
                    onClick={() => setMenuOpen(false)}
                  >
                    {item.label}
                  </a>
                ))}
              </nav>
              <div className="flex items-center gap-3">
                <button
                  onClick={toggleTheme}
                  className="rounded-xl border border-border bg-card p-2 text-muted-foreground"
                  aria-label="Toggle theme"
                >
                  {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </button>
                <Button
                  variant="signal"
                  className="flex-1 rounded-xl bg-sky-600 text-white hover:bg-sky-700"
                  onClick={() => navigate(user ? "/dashboard" : "/auth?mode=signup")}
                >
                  {user ? "Open Dashboard" : "Get Started"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </header>

      <main>
        <section id="home" className="relative">
          <div
            className={`mx-auto max-w-6xl px-6 py-20 ${
              user ? "grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center" : "flex justify-center"
            }`}
          >
            <div className={user ? "max-w-2xl" : "mx-auto max-w-3xl text-center"}>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-sky-200/70 bg-sky-100/70 px-4 py-1.5 dark:border-sky-800/60 dark:bg-sky-950/40">
                <CheckCircle2 className="h-4 w-4 text-sky-600" />
                <span className="font-body text-xs font-semibold uppercase tracking-[0.16em] text-sky-700 dark:text-sky-300">
                  Clean career intelligence
                </span>
              </div>

              <h1 className="font-heading text-4xl font-bold leading-tight text-foreground sm:text-5xl lg:text-6xl">
                Present your skills with a cleaner, smarter, more professional edge.
              </h1>

              <p className={`mt-6 font-body text-lg leading-8 text-muted-foreground ${user ? "max-w-xl" : "mx-auto max-w-2xl"}`}>
                Skill Set Go helps users review resumes, compare against job roles, and understand what to improve next through a calm, modern interface.
              </p>

              <div className={`mt-10 flex flex-col gap-3 sm:flex-row ${user ? "" : "justify-center"}`}>
                <Button
                  variant="signal"
                  size="lg"
                  className="rounded-2xl bg-sky-600 px-7 py-6 text-base text-white hover:bg-sky-700"
                  onClick={() => navigate("/analyze")}
                >
                  Start Analysis <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="rounded-2xl border-border bg-card px-7 py-6 text-base text-foreground hover:bg-secondary"
                  onClick={() => navigate(user ? "/dashboard/history" : "/auth")}
                >
                  View Dashboard
                </Button>
              </div>

              {!user && (
                <>
                  <div className="mt-8 flex flex-wrap items-center gap-3 text-left sm:justify-center">
                    {heroHighlights.map((item) => (
                      <div
                        key={item}
                        className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm text-muted-foreground shadow-sm"
                      >
                        <span className="h-2 w-2 rounded-full bg-sky-600" />
                        {item}
                      </div>
                    ))}
                  </div>

                  <div className="mt-10 grid gap-4 text-left sm:grid-cols-3">
                    {guestFlowSteps.map((item) => (
                      <div key={item.title} className="rounded-[24px] border border-border bg-card p-5 shadow-sm">
                        <p className="font-heading text-base font-semibold text-foreground">{item.title}</p>
                        <p className="mt-3 font-body text-sm leading-7 text-muted-foreground">{item.description}</p>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {user && (
              <div className="rounded-[32px] border border-border bg-card p-5 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
                <div className="rounded-[28px] border border-border/60 bg-secondary/40 p-5">
                  {previewLoading ? (
                    <div className="flex min-h-[320px] items-center justify-center">
                      <div className="h-10 w-10 animate-spin rounded-full border-2 border-sky-600 border-t-transparent" />
                    </div>
                  ) : latestAnalysis ? (
                    <>
                      <div className="flex items-center justify-between border-b border-border pb-4">
                        <div>
                          <p className="font-heading text-lg font-semibold text-foreground">Latest Analysis</p>
                          <p className="font-body text-sm text-muted-foreground">
                            Saved {new Date(latestAnalysis.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="rounded-xl bg-sky-600 px-3 py-1.5 font-heading text-sm font-semibold text-white">
                          {latestAnalysis.matchPercentage}% Fit
                        </div>
                      </div>

                      <div className="mt-5 space-y-4">
                        {[
                          { label: "ATS Score", value: `${latestAnalysis.atsScore}/100` },
                          { label: "Practical Fit", value: `${latestAnalysis.practicalFit}/100` },
                          { label: "Learning Curve", value: `${latestAnalysis.learningCurve}/100` },
                        ].map((item) => (
                          <div key={item.label} className="rounded-2xl border border-border bg-card px-4 py-3">
                            <div className="flex items-center justify-between">
                              <span className="font-body text-sm text-muted-foreground">{item.label}</span>
                              <span className="font-heading text-sm font-semibold text-foreground">{item.value}</span>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="mt-5 grid gap-3 sm:grid-cols-2">
                        <div className="rounded-2xl bg-emerald-100/70 p-4 dark:bg-emerald-950/40">
                          <p className="font-body text-xs uppercase tracking-wide text-emerald-700 dark:text-emerald-300">Strong matches</p>
                          <p className="mt-2 font-heading text-base font-semibold text-foreground">
                            {latestAnalysis.strongMatches.length > 0 ? latestAnalysis.strongMatches.join(", ") : "No strong matches saved yet"}
                          </p>
                        </div>
                        <div className="rounded-2xl bg-amber-100/70 p-4 dark:bg-amber-950/40">
                          <p className="font-body text-xs uppercase tracking-wide text-amber-700 dark:text-amber-300">Improvement focus</p>
                          <p className="mt-2 font-heading text-base font-semibold text-foreground">
                            {latestAnalysis.missingSkills.length > 0 ? latestAnalysis.missingSkills.join(", ") : "No major missing skills saved"}
                          </p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex min-h-[320px] flex-col items-center justify-center rounded-[24px] border border-dashed border-border bg-card px-6 text-center">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-100/70 text-sky-600 dark:bg-sky-950/40">
                        <Clock3 className="h-6 w-6" />
                      </div>
                      <p className="mt-5 font-heading text-xl font-semibold text-foreground">No saved analysis yet</p>
                      <p className="mt-2 max-w-sm font-body text-sm leading-6 text-muted-foreground">
                        Once you complete an analysis while logged in, your latest result will appear here.
                      </p>
                      <Button
                        variant="signal"
                        className="mt-6 rounded-2xl bg-sky-600 text-white hover:bg-sky-700"
                        onClick={() => navigate("/analyze")}
                      >
                        Run Your First Analysis
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>

        <section id="about" className="mx-auto max-w-6xl px-6 py-6">
          <div className="grid gap-5 md:grid-cols-3">
            {contentCards.map((card) => (
              <div
                key={card.title}
                className="rounded-[24px] border border-border bg-card p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100/70 text-sky-600 dark:bg-sky-950/40">
                  <card.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-5 font-heading text-xl font-semibold text-foreground">{card.title}</h3>
                <p className="mt-3 font-body text-sm leading-7 text-muted-foreground">{card.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="services" className="mx-auto max-w-6xl px-6 py-16">
          <div className="mb-10 max-w-2xl">
            <p className="font-body text-xs font-semibold uppercase tracking-[0.2em] text-sky-700 dark:text-sky-300">Highlights</p>
            <h2 className="mt-3 font-heading text-3xl font-bold text-foreground">
              A minimal interface built around clarity, structure, and ease of use.
            </h2>
            <p className="mt-4 font-body text-base leading-7 text-muted-foreground">
              The design stays professional and scalable while still giving users enough guidance to move confidently through the product.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-[24px] border border-border bg-card p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-sky-200/70 hover:shadow-lg dark:hover:border-sky-800/70"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary text-sky-600">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-5 font-heading text-lg font-semibold text-foreground">{feature.title}</h3>
                <p className="mt-3 font-body text-sm leading-7 text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer id="contact" className="border-t border-border bg-card/70">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-12 md:grid-cols-[1.1fr_0.9fr]">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-600 text-white">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <p className="font-heading text-base font-bold text-foreground">Skill Set Go</p>
                <p className="font-body text-sm text-muted-foreground">Modern career-fit analysis UI</p>
              </div>
            </div>
            <p className="mt-5 max-w-md font-body text-sm leading-7 text-muted-foreground">
              A clean frontend experience for resume analysis, skill-gap review, and career growth guidance across desktop and mobile.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2">
            {footerColumns.map((column) => (
              <div key={column.title}>
                <h3 className="font-heading text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  {column.title}
                </h3>
                <ul className="mt-4 space-y-3">
                  {column.items.map((item) => (
                    <li key={item} className="font-body text-sm text-foreground">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-border px-6 py-5 text-center">
          <p className="font-body text-sm text-muted-foreground">
            Copyright {new Date().getFullYear()} Skill Set Go. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
