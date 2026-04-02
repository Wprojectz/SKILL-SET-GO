export interface AIAnalysisResult {
  candidate_profile: {
    name: string;
    level: string;
    domains: string[];
    specialization: string;
  };
  skills: {
    explicit: string[];
    implicit: { skill: string; evidence: string }[];
    categorized: Record<string, string[]>;
    proficiency: Record<string, string>;
  };
  platform_mastery: { platform: string; level: string; evidence: string }[];
  soft_skills: { skill: string; confidence: number; evidence: string }[];
  leadership_analysis: { type: string; evidence: string };
  experience_score: { depth: string; breadth: string; impact: string; consistency: string };
  job_analysis: { must_have: string[]; nice_to_have: string[]; seniority?: string };
  matching: { strong: string[]; weak: string[]; missing: string[]; transferable: string[] };
  scores: { ats: number; practical_fit: number; learning_curve: number };
  gaps: { skill: string; severity: string; learnable: string }[];
  resume_brand: { strength: string; clarity: string; improvements: string[] };
  optimized_sections: { skills_section: string; experience_bullets: string[] };
  interview_questions: { technical: string[]; behavioral: string[]; scenario: string[] };
  final_decision: { probability: number; recommendation: string; reason: string };
  matching_evidence?: {
    skill: string;
    status: "strong" | "weak" | "missing" | "transferable";
    requirement_type: "must_have" | "nice_to_have" | "unclear";
    resume_evidence: string[];
    job_evidence: string[];
  }[];
  score_breakdown?: {
    ats: string[];
    practical_fit: string[];
    learning_curve: string[];
    improvement_priority: string[];
  };
}
