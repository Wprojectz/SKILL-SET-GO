import { useState, type ReactNode } from "react";
import type { AIAnalysisResult } from "@/lib/aiAnalysisTypes";
import type { LucideIcon } from "lucide-react";
import {
  Shield,
  Brain,
  Target,
  TrendingUp,
  Users,
  Award,
  BookOpen,
  MessageSquare,
  FileText,
  Zap,
  BarChart3,
  Lightbulb,
  ListChecks,
  ScanSearch,
  Clipboard,
  Check,
  Star,
  TriangleAlert,
  WandSparkles,
} from "lucide-react";

interface AIResultsSectionProps {
  results: AIAnalysisResult;
}

const ScoreRing = ({ score, label, color }: { score: number; label: string; color: string }) => {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width="100" height="100" className="-rotate-90">
        <circle cx="50" cy="50" r={radius} fill="none" stroke="hsl(var(--secondary))" strokeWidth="8" />
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000"
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center" style={{ width: 100, height: 100 }}>
        <span className="font-heading text-2xl font-bold text-foreground">{score}</span>
      </div>
      <span className="font-body text-xs text-muted-foreground">{label}</span>
    </div>
  );
};

const Badge = ({ text, variant = "default" }: { text: string; variant?: "green" | "red" | "yellow" | "blue" | "default" }) => {
  const styles = {
    green: "bg-aqua/15 text-aqua border-aqua/30",
    red: "bg-muted-red/15 text-muted-red border-muted-red/30",
    yellow: "bg-primary/15 text-primary border-primary/30",
    blue: "bg-accent/15 text-accent border-accent/30",
    default: "bg-secondary text-secondary-foreground border-border",
  };

  return (
    <span className={`inline-block rounded-md border px-2.5 py-1 font-body text-xs font-medium ${styles[variant]}`}>
      {text}
    </span>
  );
};

const SectionCard = ({
  icon: Icon,
  title,
  subtitle,
  children,
  accent,
}: {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  children: ReactNode;
  accent?: string;
}) => (
  <div className="rounded-2xl border border-border bg-card p-6 transition-shadow hover:shadow-lg">
    <div className="mb-4 flex items-center gap-3">
      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${accent || "bg-primary/10"}`}>
        <Icon className={`h-5 w-5 ${accent ? "text-card" : "text-primary"}`} />
      </div>
      <div>
        <h3 className="font-heading text-lg font-semibold text-foreground">{title}</h3>
        {subtitle && <p className="font-body text-xs text-muted-foreground">{subtitle}</p>}
      </div>
    </div>
    {children}
  </div>
);

const CopyButton = ({
  text,
  label,
  copiedKey,
  onCopy,
}: {
  text: string;
  label: string;
  copiedKey: string | null;
  onCopy: (key: string, value: string) => void;
}) => (
  <button
    type="button"
    onClick={() => onCopy(label, text)}
    className="inline-flex items-center gap-2 rounded-xl border border-border bg-secondary/30 px-3 py-2 font-body text-xs font-medium text-foreground transition-colors hover:bg-secondary/60"
  >
    {copiedKey === label ? <Check className="h-3.5 w-3.5 text-aqua" /> : <Clipboard className="h-3.5 w-3.5 text-primary" />}
    {copiedKey === label ? "Copied" : label}
  </button>
);

const AIResultsSection = ({ results }: AIResultsSectionProps) => {
  const r = results;
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const mustHaveCount = r.matching_evidence?.filter((item) => item.requirement_type === "must_have").length || 0;
  const mustHaveMissing = r.matching_evidence?.filter((item) => item.requirement_type === "must_have" && item.status === "missing").length || 0;
  const quickWins = r.score_breakdown?.improvement_priority.slice(0, 3) || [];

  const handleCopy = async (key: string, value: string) => {
    if (!value.trim() || !navigator.clipboard) return;
    await navigator.clipboard.writeText(value);
    setCopiedKey(key);
    window.setTimeout(() => setCopiedKey(null), 1800);
  };

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-[28px] border border-border bg-card">
        <div className="bg-[radial-gradient(circle_at_top_left,rgba(255,196,61,0.15),transparent_35%),radial-gradient(circle_at_top_right,rgba(72,215,187,0.12),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0))] p-8 text-center">
          <p className="font-body text-sm uppercase tracking-widest text-muted-foreground">Hiring Recommendation</p>
          <p
            className={`mt-2 font-heading text-5xl font-bold ${
              r.final_decision.recommendation === "Strong Hire"
                ? "text-aqua"
                : r.final_decision.recommendation === "Consider"
                  ? "text-primary"
                  : "text-muted-red"
            }`}
          >
            {r.final_decision.recommendation}
          </p>
          <p className="mt-1 font-heading text-2xl font-bold text-foreground">{r.final_decision.probability}% Match</p>
          <p className="mx-auto mt-3 max-w-2xl font-body text-sm text-muted-foreground">{r.final_decision.reason}</p>

          <div className="mt-6 grid gap-3 md:grid-cols-4">
            {[
              { label: "Must-have skills tracked", value: mustHaveCount, icon: Star, tone: "text-primary bg-primary/10 border-primary/20" },
              { label: "Must-have gaps", value: mustHaveMissing, icon: TriangleAlert, tone: "text-muted-red bg-muted-red/10 border-muted-red/20" },
              { label: "Strong skill matches", value: r.matching.strong.length, icon: Check, tone: "text-aqua bg-aqua/10 border-aqua/20" },
              { label: "Transferable skills", value: r.matching.transferable.length, icon: WandSparkles, tone: "text-accent bg-accent/10 border-accent/20" },
            ].map((metric) => (
              <div key={metric.label} className={`rounded-2xl border p-4 text-left ${metric.tone}`}>
                <div className="flex items-center justify-between">
                  <metric.icon className="h-4 w-4" />
                  <span className="font-heading text-2xl font-bold">{metric.value}</span>
                </div>
                <p className="mt-3 font-body text-xs leading-relaxed">{metric.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
        <div className="grid grid-cols-3 gap-4">
          <div className="relative flex flex-col items-center rounded-2xl border border-border bg-card p-6">
            <ScoreRing score={r.scores.ats} label="ATS Score" color="hsl(var(--aqua))" />
          </div>
          <div className="relative flex flex-col items-center rounded-2xl border border-border bg-card p-6">
            <ScoreRing score={r.scores.practical_fit} label="Practical Fit" color="hsl(var(--primary))" />
          </div>
          <div className="relative flex flex-col items-center rounded-2xl border border-border bg-card p-6">
            <ScoreRing score={r.scores.learning_curve} label="Learning Curve" color="hsl(var(--accent))" />
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <ListChecks className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-heading text-lg font-semibold text-foreground">Quick Action Plan</h3>
              <p className="font-body text-xs text-muted-foreground">Best next moves to improve this result</p>
            </div>
          </div>
          <ul className="space-y-3">
            {quickWins.map((item, index) => (
              <li key={`${item}-${index}`} className="flex items-start gap-3 rounded-xl border border-border/60 bg-secondary/20 px-3 py-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/15 font-heading text-xs font-bold text-primary">
                  {index + 1}
                </span>
                <span className="font-body text-sm text-foreground">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <SectionCard icon={Users} title="Candidate Profile" subtitle={r.candidate_profile.name || "Candidate"} accent="bg-accent">
        <div className="flex flex-wrap gap-2">
          <Badge text={r.candidate_profile.level} variant="blue" />
          <Badge text={r.candidate_profile.specialization || "General"} variant="yellow" />
          {r.candidate_profile.domains.map((domain) => (
            <Badge key={domain} text={domain} variant="default" />
          ))}
        </div>
      </SectionCard>

      <SectionCard icon={Target} title="Skill Matching" subtitle="How your skills align with the role">
        <div className="space-y-4">
          {r.matching.strong.length > 0 && (
            <div>
              <p className="mb-2 font-heading text-xs font-medium uppercase tracking-wider text-aqua">Strong Matches</p>
              <div className="flex flex-wrap gap-2">{r.matching.strong.map((skill) => <Badge key={skill} text={skill} variant="green" />)}</div>
            </div>
          )}
          {r.matching.weak.length > 0 && (
            <div>
              <p className="mb-2 font-heading text-xs font-medium uppercase tracking-wider text-primary">Weak Matches</p>
              <div className="flex flex-wrap gap-2">{r.matching.weak.map((skill) => <Badge key={skill} text={skill} variant="yellow" />)}</div>
            </div>
          )}
          {r.matching.missing.length > 0 && (
            <div>
              <p className="mb-2 font-heading text-xs font-medium uppercase tracking-wider text-muted-red">Missing Skills</p>
              <div className="flex flex-wrap gap-2">{r.matching.missing.map((skill) => <Badge key={skill} text={skill} variant="red" />)}</div>
            </div>
          )}
          {r.matching.transferable.length > 0 && (
            <div>
              <p className="mb-2 font-heading text-xs font-medium uppercase tracking-wider text-accent">Transferable Skills</p>
              <div className="flex flex-wrap gap-2">{r.matching.transferable.map((skill) => <Badge key={skill} text={skill} variant="blue" />)}</div>
            </div>
          )}
        </div>
      </SectionCard>

      {r.matching_evidence && r.matching_evidence.length > 0 && (
        <SectionCard icon={ScanSearch} title="Requirement Evidence" subtitle="Why skills were matched or flagged">
          <div className="grid gap-3 lg:grid-cols-2">
            {r.matching_evidence.slice(0, 8).map((item, index) => (
              <div key={`${item.skill}-${index}`} className="rounded-xl border border-border bg-secondary/20 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-heading text-sm font-semibold capitalize text-foreground">{item.skill}</span>
                  <Badge
                    text={item.status.replace("_", " ")}
                    variant={item.status === "strong" ? "green" : item.status === "weak" ? "yellow" : item.status === "missing" ? "red" : "blue"}
                  />
                  <Badge
                    text={item.requirement_type.replace("_", " ")}
                    variant={item.requirement_type === "must_have" ? "red" : item.requirement_type === "nice_to_have" ? "blue" : "default"}
                  />
                </div>
                {item.job_evidence.length > 0 && (
                  <div className="mt-3">
                    <p className="font-heading text-[11px] uppercase tracking-wide text-muted-foreground">Job evidence</p>
                    <ul className="mt-1 space-y-1">
                      {item.job_evidence.map((evidence, evidenceIndex) => (
                        <li key={`${item.skill}-job-${evidenceIndex}`} className="font-body text-xs text-foreground">
                          {evidence}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {item.resume_evidence.length > 0 ? (
                  <div className="mt-3">
                    <p className="font-heading text-[11px] uppercase tracking-wide text-muted-foreground">Resume evidence</p>
                    <ul className="mt-1 space-y-1">
                      {item.resume_evidence.map((evidence, evidenceIndex) => (
                        <li key={`${item.skill}-resume-${evidenceIndex}`} className="font-body text-xs text-foreground">
                          {evidence}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : item.status === "missing" ? (
                  <p className="mt-3 font-body text-xs text-muted-foreground">No direct resume evidence was found for this requirement.</p>
                ) : null}
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <SectionCard icon={Zap} title="Explicit Skills" subtitle={`${r.skills.explicit.length} detected`}>
          <div className="flex flex-wrap gap-2">
            {r.skills.explicit.map((skill) => <Badge key={skill} text={skill} variant="green" />)}
          </div>
        </SectionCard>
        <SectionCard icon={Brain} title="Implicit Skills" subtitle="Inferred from context">
          <div className="space-y-2">
            {r.skills.implicit.slice(0, 8).map((skill, index) => (
              <div key={`${skill.skill}-${index}`} className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                <div>
                  <span className="font-body text-sm font-medium text-foreground">{skill.skill}</span>
                  <span className="ml-2 font-body text-xs text-muted-foreground">- {skill.evidence}</span>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <SectionCard icon={BarChart3} title="Skill Proficiency" subtitle="Estimated mastery levels">
        <div className="grid gap-3 sm:grid-cols-2">
          {Object.entries(r.skills.proficiency).slice(0, 12).map(([skill, level]) => {
            const percentage = level === "Expert" ? 95 : level === "Advanced" ? 75 : level === "Intermediate" ? 50 : 25;
            const color = level === "Expert" ? "bg-aqua" : level === "Advanced" ? "bg-accent" : level === "Intermediate" ? "bg-primary" : "bg-muted-foreground";

            return (
              <div key={skill}>
                <div className="mb-1 flex justify-between">
                  <span className="font-body text-xs capitalize text-foreground">{skill}</span>
                  <span className="font-body text-[10px] text-muted-foreground">{level}</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-secondary">
                  <div className={`h-full rounded-full ${color} transition-all duration-700`} style={{ width: `${percentage}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </SectionCard>

      <SectionCard icon={Users} title="Soft Skills & Behavioral Traits" subtitle="Inferred from resume evidence">
        <div className="grid gap-3 sm:grid-cols-2">
          {r.soft_skills.map((skill, index) => (
            <div key={`${skill.skill}-${index}`} className="rounded-lg border border-border bg-secondary/30 p-3">
              <div className="mb-1 flex justify-between">
                <span className="font-body text-sm font-medium text-foreground">{skill.skill}</span>
                <span className={`font-heading text-sm font-bold ${skill.confidence >= 70 ? "text-aqua" : skill.confidence >= 40 ? "text-primary" : "text-muted-foreground"}`}>
                  {skill.confidence}%
                </span>
              </div>
              <p className="font-body text-xs text-muted-foreground">{skill.evidence}</p>
            </div>
          ))}
        </div>
      </SectionCard>

      <div className="grid gap-6 md:grid-cols-2">
        <SectionCard icon={Award} title="Leadership Analysis">
          <Badge text={r.leadership_analysis.type} variant="blue" />
          <p className="mt-2 font-body text-sm text-muted-foreground">{r.leadership_analysis.evidence}</p>
        </SectionCard>
        <SectionCard icon={TrendingUp} title="Experience Quality">
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(r.experience_score).map(([key, value]) => (
              <div key={key} className="rounded-lg bg-secondary/30 p-3 text-center">
                <p className="font-body text-xs capitalize text-muted-foreground">{key}</p>
                <p className={`font-heading text-lg font-bold ${value === "High" ? "text-aqua" : value === "Medium" ? "text-primary" : "text-muted-foreground"}`}>
                  {value}
                </p>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      {r.gaps.length > 0 && (
        <SectionCard icon={Shield} title="Gap Intelligence" subtitle="What's missing and how learnable">
          <div className="space-y-2">
            {r.gaps.map((gap, index) => (
              <div key={`${gap.skill}-${index}`} className="flex items-center justify-between rounded-lg border border-border bg-secondary/20 px-4 py-2.5">
                <span className="font-body text-sm text-foreground">{gap.skill}</span>
                <div className="flex gap-2">
                  <Badge text={gap.severity} variant={gap.severity === "Critical" ? "red" : gap.severity === "Moderate" ? "yellow" : "default"} />
                  <Badge text={gap.learnable} variant={gap.learnable === "Quick" ? "green" : gap.learnable === "Medium" ? "yellow" : "red"} />
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      <SectionCard icon={FileText} title="Resume Brand Analysis" subtitle={`Strength: ${r.resume_brand.strength}`}>
        <p className="mb-3 font-body text-sm text-muted-foreground">{r.resume_brand.clarity}</p>
        <ul className="space-y-2">
          {r.resume_brand.improvements.map((improvement, index) => (
            <li key={`${improvement}-${index}`} className="flex items-start gap-2">
              <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span className="font-body text-sm text-foreground">{improvement}</span>
            </li>
          ))}
        </ul>
      </SectionCard>

      {r.score_breakdown && (
        <SectionCard icon={ListChecks} title="Score Breakdown" subtitle="How the current recommendation was derived">
          <div className="grid gap-6 md:grid-cols-2">
            {[
              { title: "ATS Score", items: r.score_breakdown.ats },
              { title: "Practical Fit", items: r.score_breakdown.practical_fit },
              { title: "Learning Curve", items: r.score_breakdown.learning_curve },
              { title: "Top Priorities", items: r.score_breakdown.improvement_priority },
            ].map((section) => (
              <div key={section.title} className="rounded-xl border border-border bg-secondary/20 p-4">
                <h4 className="font-heading text-sm font-semibold text-foreground">{section.title}</h4>
                <ul className="mt-3 space-y-2">
                  {section.items.map((item, index) => (
                    <li key={`${section.title}-${index}`} className="flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                      <span className="font-body text-sm text-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      <SectionCard icon={MessageSquare} title="Interview Intelligence" subtitle="Predicted interview questions">
        <div className="space-y-4">
          {r.interview_questions.technical.length > 0 && (
            <div>
              <p className="mb-2 font-heading text-xs font-medium uppercase tracking-wider text-aqua">Technical</p>
              <ol className="space-y-1.5">
                {r.interview_questions.technical.map((question, index) => (
                  <li key={`${question}-${index}`} className="flex gap-2 font-body text-sm text-foreground">
                    <span className="shrink-0 text-muted-foreground">{index + 1}.</span>
                    {question}
                  </li>
                ))}
              </ol>
            </div>
          )}
          {r.interview_questions.behavioral.length > 0 && (
            <div>
              <p className="mb-2 font-heading text-xs font-medium uppercase tracking-wider text-primary">Behavioral</p>
              <ol className="space-y-1.5">
                {r.interview_questions.behavioral.map((question, index) => (
                  <li key={`${question}-${index}`} className="flex gap-2 font-body text-sm text-foreground">
                    <span className="shrink-0 text-muted-foreground">{index + 1}.</span>
                    {question}
                  </li>
                ))}
              </ol>
            </div>
          )}
          {r.interview_questions.scenario.length > 0 && (
            <div>
              <p className="mb-2 font-heading text-xs font-medium uppercase tracking-wider text-accent">Scenario-based</p>
              <ol className="space-y-1.5">
                {r.interview_questions.scenario.map((question, index) => (
                  <li key={`${question}-${index}`} className="flex gap-2 font-body text-sm text-foreground">
                    <span className="shrink-0 text-muted-foreground">{index + 1}.</span>
                    {question}
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      </SectionCard>

      <SectionCard icon={BookOpen} title="Optimized Resume Suggestions" subtitle="Reusable content you can adapt fast">
        <div className="mb-4 flex flex-wrap gap-2">
          {r.optimized_sections.skills_section && (
            <CopyButton text={r.optimized_sections.skills_section} label="Copy skills section" copiedKey={copiedKey} onCopy={handleCopy} />
          )}
          {r.optimized_sections.experience_bullets.length > 0 && (
            <CopyButton
              text={r.optimized_sections.experience_bullets.join("\n")}
              label="Copy bullet points"
              copiedKey={copiedKey}
              onCopy={handleCopy}
            />
          )}
        </div>
        {r.optimized_sections.skills_section && (
          <div className="mb-4 rounded-xl border border-border bg-secondary/20 p-4">
            <p className="mb-2 font-heading text-xs font-medium uppercase tracking-wider text-primary">Optimized Skills Section</p>
            <p className="font-body text-sm text-foreground">{r.optimized_sections.skills_section}</p>
          </div>
        )}
        {r.optimized_sections.experience_bullets.length > 0 && (
          <div className="rounded-xl border border-border bg-secondary/20 p-4">
            <p className="mb-2 font-heading text-xs font-medium uppercase tracking-wider text-aqua">Impact-Driven Bullets</p>
            <ul className="space-y-1.5">
              {r.optimized_sections.experience_bullets.map((bullet, index) => (
                <li key={`${bullet}-${index}`} className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aqua" />
                  <span className="font-body text-sm text-foreground">{bullet}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </SectionCard>
    </div>
  );
};

export default AIResultsSection;
