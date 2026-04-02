import { z } from "zod";
import type { AIAnalysisResult } from "@/lib/aiAnalysisTypes";

const clampScore = (value: number) => Math.max(0, Math.min(100, Math.round(value)));
const boundedNumber = z.coerce.number().catch(0).transform(clampScore);

export const analysisResultSchema = z.object({
  candidate_profile: z.object({
    name: z.string().catch(""),
    level: z.string().catch(""),
    domains: z.array(z.string()).catch([]),
    specialization: z.string().catch(""),
  }).catch({ name: "", level: "", domains: [], specialization: "" }),
  skills: z.object({
    explicit: z.array(z.string()).catch([]),
    implicit: z.array(z.object({
      skill: z.string().catch(""),
      evidence: z.string().catch(""),
    })).catch([]),
    categorized: z.record(z.array(z.string())).catch({}),
    proficiency: z.record(z.string()).catch({}),
  }).catch({ explicit: [], implicit: [], categorized: {}, proficiency: {} }),
  platform_mastery: z.array(z.object({
    platform: z.string().catch(""),
    level: z.string().catch(""),
    evidence: z.string().catch(""),
  })).catch([]),
  soft_skills: z.array(z.object({
    skill: z.string().catch(""),
    confidence: boundedNumber,
    evidence: z.string().catch(""),
  })).catch([]),
  leadership_analysis: z.object({
    type: z.string().catch(""),
    evidence: z.string().catch(""),
  }).catch({ type: "", evidence: "" }),
  experience_score: z.object({
    depth: z.string().catch(""),
    breadth: z.string().catch(""),
    impact: z.string().catch(""),
    consistency: z.string().catch(""),
  }).catch({ depth: "", breadth: "", impact: "", consistency: "" }),
  job_analysis: z.object({
    must_have: z.array(z.string()).catch([]),
    nice_to_have: z.array(z.string()).catch([]),
    seniority: z.string().optional().catch(""),
  }).catch({ must_have: [], nice_to_have: [], seniority: "" }),
  matching: z.object({
    strong: z.array(z.string()).catch([]),
    weak: z.array(z.string()).catch([]),
    missing: z.array(z.string()).catch([]),
    transferable: z.array(z.string()).catch([]),
  }).catch({ strong: [], weak: [], missing: [], transferable: [] }),
  scores: z.object({
    ats: boundedNumber,
    practical_fit: boundedNumber,
    learning_curve: boundedNumber,
  }).catch({ ats: 0, practical_fit: 0, learning_curve: 0 }),
  gaps: z.array(z.object({
    skill: z.string().catch(""),
    severity: z.string().catch("Moderate"),
    learnable: z.string().catch("Medium"),
  })).catch([]),
  resume_brand: z.object({
    strength: z.string().catch("Average"),
    clarity: z.string().catch(""),
    improvements: z.array(z.string()).catch([]),
  }).catch({ strength: "Average", clarity: "", improvements: [] }),
  optimized_sections: z.object({
    skills_section: z.string().catch(""),
    experience_bullets: z.array(z.string()).catch([]),
  }).catch({ skills_section: "", experience_bullets: [] }),
  interview_questions: z.object({
    technical: z.array(z.string()).catch([]),
    behavioral: z.array(z.string()).catch([]),
    scenario: z.array(z.string()).catch([]),
  }).catch({ technical: [], behavioral: [], scenario: [] }),
  final_decision: z.object({
    probability: boundedNumber,
    recommendation: z.string().catch("Consider"),
    reason: z.string().catch(""),
  }).catch({ probability: 0, recommendation: "Consider", reason: "" }),
  matching_evidence: z.array(z.object({
    skill: z.string().catch(""),
    status: z.enum(["strong", "weak", "missing", "transferable"]).catch("missing"),
    requirement_type: z.enum(["must_have", "nice_to_have", "unclear"]).catch("unclear"),
    resume_evidence: z.array(z.string()).catch([]),
    job_evidence: z.array(z.string()).catch([]),
  })).optional(),
  score_breakdown: z.object({
    ats: z.array(z.string()).catch([]),
    practical_fit: z.array(z.string()).catch([]),
    learning_curve: z.array(z.string()).catch([]),
    improvement_priority: z.array(z.string()).catch([]),
  }).optional(),
});

export const parseAIAnalysisResult = (input: unknown): AIAnalysisResult | null => {
  const parsed = analysisResultSchema.safeParse(input);
  return parsed.success ? (parsed.data as AIAnalysisResult) : null;
};

export const coerceAIAnalysisResult = (input: unknown): AIAnalysisResult => {
  return analysisResultSchema.parse(input) as AIAnalysisResult;
};
