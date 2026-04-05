import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are an Elite AI Talent Intelligence Engine. Perform deep multi-dimensional analysis.

INPUT: Resume text and Job description.

Analyze across these dimensions and return STRICT JSON (no markdown, no code fences):

{
  "candidate_profile": {
    "name": "",
    "level": "Fresher|Mid|Senior",
    "domains": [],
    "specialization": ""
  },
  "skills": {
    "explicit": [],
    "implicit": [{"skill":"","evidence":""}],
    "categorized": {
      "programming": [],
      "frameworks": [],
      "tools": [],
      "databases": [],
      "cloud": [],
      "other": []
    },
    "proficiency": {}
  },
  "platform_mastery": [{"platform":"","level":"Basic|Working|Production-level","evidence":""}],
  "soft_skills": [{"skill":"","confidence":0,"evidence":""}],
  "leadership_analysis": {"type":"Individual Contributor|Team Player|Team Lead|Manager Potential","evidence":""},
  "experience_score": {"depth":"Low|Medium|High","breadth":"Low|Medium|High","impact":"Low|Medium|High","consistency":"Low|Medium|High"},
  "job_analysis": {"must_have":[],"nice_to_have":[],"seniority":""},
  "matching": {"strong":[],"weak":[],"missing":[],"transferable":[]},
  "scores": {"ats":0,"practical_fit":0,"learning_curve":0},
  "gaps": [{"skill":"","severity":"Critical|Moderate|Minor","learnable":"Quick|Medium|Long"}],
  "resume_brand": {"strength":"Weak|Average|Strong","clarity":"","improvements":[]},
  "optimized_sections": {"skills_section":"","experience_bullets":[]},
  "interview_questions": {"technical":[],"behavioral":[],"scenario":[]},
  "final_decision": {"probability":0,"recommendation":"Reject|Consider|Strong Hire","reason":""}
}

RULES:
- Infer implicit skills from project descriptions, tools used, responsibilities
- Classify proficiency using duration, complexity, ownership signals
- Be critical like a real hiring manager
- All scores 0-100
- Return ONLY valid JSON, no extra text`;

const SKILL_ALIASES: Record<string, string> = {
  js: "javascript",
  javascript: "javascript",
  ecmascript: "javascript",
  ts: "typescript",
  typescript: "typescript",
  py: "python",
  python3: "python",
  node: "node.js",
  nodejs: "node.js",
  "node js": "node.js",
  reactjs: "react",
  "react.js": "react",
  next: "next.js",
  nextjs: "next.js",
  "next js": "next.js",
  vuejs: "vue",
  "vue.js": "vue",
  angularjs: "angular",
  postgres: "postgresql",
  postgresql: "postgresql",
  mongo: "mongodb",
  mongodb: "mongodb",
  gcp: "google cloud",
  googlecloud: "google cloud",
  "google cloud platform": "google cloud",
  aws: "aws",
  azure: "azure",
  k8s: "kubernetes",
  kubernetes: "kubernetes",
  ci: "ci/cd",
  cd: "ci/cd",
  cicd: "ci/cd",
  "ci cd": "ci/cd",
  restful: "rest api",
  rest: "rest api",
  graphql: "graphql",
  oop: "object-oriented programming",
  "object oriented programming": "object-oriented programming",
};

const MUST_HAVE_MARKERS = [
  "must have",
  "required",
  "requirement",
  "requirements",
  "you have",
  "need to have",
  "mandatory",
  "essential",
  "minimum qualifications",
];

const NICE_TO_HAVE_MARKERS = [
  "nice to have",
  "preferred",
  "good to have",
  "bonus",
  "plus",
  "preferred qualifications",
];

const SENTENCE_SPLIT_REGEX = /(?<=[.!?])\s+|\n+/g;

type AnalysisResult = {
  candidate_profile?: {
    name?: string;
    level?: string;
    domains?: string[];
    specialization?: string;
  };
  skills?: {
    explicit?: string[];
    implicit?: { skill: string; evidence: string }[];
    categorized?: Record<string, string[]>;
    proficiency?: Record<string, string>;
  };
  platform_mastery?: { platform: string; level: string; evidence: string }[];
  soft_skills?: { skill: string; confidence: number; evidence: string }[];
  leadership_analysis?: { type: string; evidence: string };
  experience_score?: { depth: string; breadth: string; impact: string; consistency: string };
  job_analysis?: { must_have?: string[]; nice_to_have?: string[]; seniority?: string };
  matching?: { strong?: string[]; weak?: string[]; missing?: string[]; transferable?: string[] };
  scores?: { ats?: number; practical_fit?: number; learning_curve?: number };
  gaps?: { skill: string; severity: string; learnable: string }[];
  resume_brand?: { strength: string; clarity: string; improvements: string[] };
  optimized_sections?: { skills_section: string; experience_bullets: string[] };
  interview_questions?: { technical: string[]; behavioral: string[]; scenario: string[] };
  final_decision?: { probability: number; recommendation: string; reason: string };
  matching_evidence?: MatchingEvidence[];
  score_breakdown?: ScoreBreakdown;
};

type MatchingEvidence = {
  skill: string;
  status: "strong" | "weak" | "missing" | "transferable";
  requirement_type: "must_have" | "nice_to_have" | "unclear";
  resume_evidence: string[];
  job_evidence: string[];
};

type ScoreBreakdown = {
  ats: string[];
  practical_fit: string[];
  learning_curve: string[];
  improvement_priority: string[];
};

const toSentencePool = (text: string) =>
  text
    .split(SENTENCE_SPLIT_REGEX)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length > 0);

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const normalizeSkill = (skill: string) => {
  const compact = skill.trim().toLowerCase().replace(/[^\w\s./+-]/g, " ").replace(/\s+/g, " ").trim();
  return SKILL_ALIASES[compact] || compact;
};

const dedupeSkills = (skills: string[] = []) => Array.from(new Set(skills.map(normalizeSkill).filter(Boolean)));

const clampScore = (value: unknown) => {
  if (typeof value !== "number" || Number.isNaN(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
};

const findEvidence = (sentences: string[], skill: string, fallback: string[] = []) => {
  const normalizedSkill = normalizeSkill(skill);
  const aliases = Object.entries(SKILL_ALIASES)
    .filter(([, canonical]) => canonical === normalizedSkill)
    .map(([alias]) => alias);
  const terms = Array.from(new Set([normalizedSkill, ...aliases])).filter(Boolean);

  const matches = sentences.filter((sentence) =>
    terms.some((term) => new RegExp(`\\b${escapeRegExp(term)}\\b`, "i").test(sentence))
  );

  return (matches.length > 0 ? matches : fallback).slice(0, 2);
};

const inferRequirementType = (jobEvidence: string[]) => {
  const evidenceText = jobEvidence.join(" ").toLowerCase();
  if (MUST_HAVE_MARKERS.some((marker) => evidenceText.includes(marker))) return "must_have";
  if (NICE_TO_HAVE_MARKERS.some((marker) => evidenceText.includes(marker))) return "nice_to_have";
  return "unclear";
};

const buildMatchingEvidence = (result: AnalysisResult, resumeText: string, jobText: string): MatchingEvidence[] => {
  const resumeSentences = toSentencePool(resumeText);
  const jobSentences = toSentencePool(jobText);

  const groupedSkills = [
    ...(result.matching?.strong || []).map((skill) => ({ skill, status: "strong" as const })),
    ...(result.matching?.weak || []).map((skill) => ({ skill, status: "weak" as const })),
    ...(result.matching?.missing || []).map((skill) => ({ skill, status: "missing" as const })),
    ...(result.matching?.transferable || []).map((skill) => ({ skill, status: "transferable" as const })),
  ];

  return groupedSkills.map(({ skill, status }) => {
    const resumeEvidence =
      status === "missing"
        ? []
        : findEvidence(
            resumeSentences,
            skill,
            status === "transferable"
              ? (result.skills?.implicit || [])
                  .filter((item) => normalizeSkill(item.skill) === normalizeSkill(skill))
                  .map((item) => item.evidence)
              : []
          );
    const jobEvidence = findEvidence(jobSentences, skill);

    return {
      skill: normalizeSkill(skill),
      status,
      requirement_type: inferRequirementType(jobEvidence),
      resume_evidence: resumeEvidence,
      job_evidence: jobEvidence,
    };
  });
};

const buildScoreBreakdown = (result: AnalysisResult) => {
  const matchingEvidence = result.matching_evidence || [];
  const mustHaveMissing = matchingEvidence.filter(
    (item) => item.status === "missing" && item.requirement_type === "must_have"
  );
  const niceToHaveMissing = matchingEvidence.filter(
    (item) => item.status === "missing" && item.requirement_type === "nice_to_have"
  );
  const strongMatches = matchingEvidence.filter((item) => item.status === "strong");
  const weakMatches = matchingEvidence.filter((item) => item.status === "weak");
  const transferable = matchingEvidence.filter((item) => item.status === "transferable");

  const ats = [
    strongMatches.length > 0
      ? `${strongMatches.length} direct skill matches were found in your resume.`
      : "Very few direct keyword matches were found in your resume.",
    mustHaveMissing.length > 0
      ? `${mustHaveMissing.length} must-have requirements are still missing, which lowers ATS alignment.`
      : "No must-have requirements were clearly missing from the extracted analysis.",
    result.resume_brand?.improvements?.length
      ? "Resume wording and structure still have room for ATS optimization."
      : "Resume wording appears relatively ATS-friendly based on the generated analysis.",
  ];

  const practicalFit = [
    strongMatches.length > 0
      ? `Strong alignment exists across ${strongMatches.length} core job skills.`
      : "The role does not show many strong direct matches yet.",
    weakMatches.length > 0
      ? `${weakMatches.length} skills were treated as partial matches and may need stronger proof in the resume.`
      : "There were no notable partial-match skills in this analysis.",
    transferable.length > 0
      ? `${transferable.length} transferable skills may help bridge role gaps.`
      : "There are limited transferable skills supporting this transition right now.",
  ];

  const learningCurve = [
    mustHaveMissing.length > 0
      ? `The learning curve is higher because ${mustHaveMissing.length} must-have skills are missing.`
      : "The learning curve is lower because no must-have gaps were clearly identified.",
    niceToHaveMissing.length > 0
      ? `${niceToHaveMissing.length} missing nice-to-have skills affect competitiveness more than eligibility.`
      : "Few optional gaps were identified beyond the core requirements.",
    result.gaps && result.gaps.length > 0
      ? `Gap severity ranges from ${result.gaps[0].severity.toLowerCase()} to longer-term learning needs.`
      : "The analysis did not identify major learnability concerns.",
  ];

  const improvementPriority = [
    ...mustHaveMissing.slice(0, 3).map((item) => `Add evidence or experience for must-have skill: ${item.skill}.`),
    ...weakMatches.slice(0, 2).map((item) => `Strengthen resume proof for partially matched skill: ${item.skill}.`),
    ...niceToHaveMissing.slice(0, 2).map((item) => `Develop bonus skill to improve competitiveness: ${item.skill}.`),
  ];

  if (improvementPriority.length === 0) {
    improvementPriority.push("Improve resume bullet specificity with stronger metrics and clearer ownership.");
  }

  return {
    ats,
    practical_fit: practicalFit,
    learning_curve: learningCurve,
    improvement_priority: improvementPriority,
  };
};

const normalizeAnalysis = (result: AnalysisResult, resumeText: string, jobText: string): AnalysisResult => {
  const normalizedMustHave = dedupeSkills(result.job_analysis?.must_have || []);
  const normalizedNiceToHave = dedupeSkills(result.job_analysis?.nice_to_have || []);

  const normalizedExplicit = dedupeSkills(result.skills?.explicit || []);
  const normalizedStrong = dedupeSkills(result.matching?.strong || []);
  const normalizedWeak = dedupeSkills(result.matching?.weak || []);
  const normalizedMissing = dedupeSkills(result.matching?.missing || []);
  const normalizedTransferable = dedupeSkills(result.matching?.transferable || []);

  const proficiency = Object.fromEntries(
    Object.entries(result.skills?.proficiency || {}).map(([skill, level]) => [normalizeSkill(skill), level])
  );

  const categorized = Object.fromEntries(
    Object.entries(result.skills?.categorized || {}).map(([category, skills]) => [category, dedupeSkills(skills)])
  );

  const matching = {
    strong: normalizedStrong,
    weak: normalizedWeak.filter((skill) => !normalizedStrong.includes(skill)),
    missing: normalizedMissing.filter((skill) => !normalizedStrong.includes(skill)),
    transferable: normalizedTransferable.filter((skill) => !normalizedStrong.includes(skill)),
  };

  const gaps = (result.gaps || []).map((gap) => ({
    skill: normalizeSkill(gap.skill),
    severity: gap.severity || "Moderate",
    learnable: gap.learnable || "Medium",
  }));

  const normalized: AnalysisResult = {
    ...result,
    candidate_profile: {
      name: result.candidate_profile?.name || "",
      level: result.candidate_profile?.level || "",
      domains: result.candidate_profile?.domains || [],
      specialization: result.candidate_profile?.specialization || "",
    },
    job_analysis: {
      must_have: normalizedMustHave,
      nice_to_have: normalizedNiceToHave.filter((skill) => !normalizedMustHave.includes(skill)),
      seniority: result.job_analysis?.seniority || "",
    },
    skills: {
      explicit: normalizedExplicit,
      implicit: (result.skills?.implicit || []).map((item) => ({
        skill: normalizeSkill(item.skill),
        evidence: item.evidence,
      })),
      categorized,
      proficiency,
    },
    matching,
    scores: {
      ats: clampScore(result.scores?.ats),
      practical_fit: clampScore(result.scores?.practical_fit),
      learning_curve: clampScore(result.scores?.learning_curve),
    },
    gaps,
    resume_brand: {
      strength: result.resume_brand?.strength || "Average",
      clarity: result.resume_brand?.clarity || "",
      improvements: result.resume_brand?.improvements || [],
    },
    optimized_sections: {
      skills_section: result.optimized_sections?.skills_section || "",
      experience_bullets: result.optimized_sections?.experience_bullets || [],
    },
    interview_questions: {
      technical: result.interview_questions?.technical || [],
      behavioral: result.interview_questions?.behavioral || [],
      scenario: result.interview_questions?.scenario || [],
    },
    final_decision: {
      probability: clampScore(result.final_decision?.probability),
      recommendation: result.final_decision?.recommendation || "Consider",
      reason: result.final_decision?.reason || "",
    },
  };

  normalized.matching_evidence = buildMatchingEvidence(normalized, resumeText, jobText);
  normalized.score_breakdown = buildScoreBreakdown(normalized);

  return normalized;
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { resume_text, job_description } = await req.json();
    if (!resume_text || !job_description) {
      return new Response(JSON.stringify({ error: "resume_text and job_description required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");
    if (!GROQ_API_KEY) throw new Error("GROQ_API_KEY not configured");

    const userPrompt = `RESUME TEXT:\n${resume_text}\n\nJOB DESCRIPTION:\n${job_description}`;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.2,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const status = response.status;
      if (status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Please try again shortly." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const text = await response.text();
      console.error("Groq API error:", status, text);
      throw new Error(`Groq API error: ${status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    let parsed: AnalysisResult;
    try {
      const jsonStr = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      parsed = JSON.parse(jsonStr);
    } catch {
      console.error("Failed to parse AI response:", content.slice(0, 500));
      return new Response(JSON.stringify({ error: "Failed to parse AI analysis. Please try again." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const normalized = normalizeAnalysis(parsed, resume_text, job_description);

    return new Response(JSON.stringify(normalized), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("analyze-resume error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
