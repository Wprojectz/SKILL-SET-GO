import { describe, expect, it } from "vitest";
import { coerceAIAnalysisResult, parseAIAnalysisResult } from "@/lib/analysisResultSchema";

describe("analysisResultSchema", () => {
  it("fills missing nested fields with safe defaults", () => {
    const result = coerceAIAnalysisResult({
      matching: { strong: ["react"], missing: ["testing"] },
      scores: { ats: 82 },
    });

    expect(result.matching.strong).toEqual(["react"]);
    expect(result.matching.weak).toEqual([]);
    expect(result.skills.explicit).toEqual([]);
    expect(result.scores.practical_fit).toBe(0);
    expect(result.final_decision.recommendation).toBe("Consider");
  });

  it("clamps numeric scores into the valid range", () => {
    const result = coerceAIAnalysisResult({
      matching: { strong: [], weak: [], missing: [], transferable: [] },
      scores: {
        ats: 140,
        practical_fit: -4,
        learning_curve: 49.6,
      },
    });

    expect(result.scores.ats).toBe(100);
    expect(result.scores.practical_fit).toBe(0);
    expect(result.scores.learning_curve).toBe(50);
  });

  it("returns null for invalid non-object payloads", () => {
    expect(parseAIAnalysisResult("bad payload")).toBeNull();
  });
});
