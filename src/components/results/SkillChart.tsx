import { useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";
import type { AnalysisResult } from "@/lib/skillEngine";

interface SkillChartProps {
  results: AnalysisResult;
}

const COLORS = {
  matched: "#06D6A0",
  missing: "#EF476F",
};

const SkillChart = ({ results }: SkillChartProps) => {
  const pieData = useMemo(() => [
    { name: "Matched", value: results.matchedSkills.length },
    { name: "Missing", value: results.missingSkills.length },
  ], [results]);

  const categoryData = useMemo(() => {
    const cats = new Map<string, { matched: number; missing: number }>();

    for (const [cat, skills] of Object.entries(results.jobSkills.categories)) {
      const matched = skills.filter(s => results.matchedSkills.includes(s)).length;
      const missing = skills.filter(s => results.missingSkills.includes(s)).length;
      if (matched + missing > 0) {
        cats.set(cat, { matched, missing });
      }
    }

    return Array.from(cats.entries()).map(([name, data]) => ({
      name: name.length > 12 ? name.slice(0, 12) + "…" : name,
      matched: data.matched,
      missing: data.missing,
    }));
  }, [results]);

  return (
    <div className="grid gap-6 sm:grid-cols-2">
      {/* Pie Chart */}
      <div className="rounded-lg border border-border bg-card p-6">
        <h3 className="font-heading text-sm font-semibold text-foreground">Skill Distribution</h3>
        <div className="mt-4 h-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                dataKey="value"
                strokeWidth={0}
              >
                <Cell fill={COLORS.matched} />
                <Cell fill={COLORS.missing} />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-2 flex justify-center gap-6">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-aqua" />
            <span className="font-body text-xs text-muted-foreground">Matched ({results.matchedSkills.length})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-muted-red" />
            <span className="font-body text-xs text-muted-foreground">Missing ({results.missingSkills.length})</span>
          </div>
        </div>
      </div>

      {/* Bar Chart */}
      {categoryData.length > 0 && (
        <div className="rounded-lg border border-border bg-card p-6">
          <h3 className="font-heading text-sm font-semibold text-foreground">By Category</h3>
          <div className="mt-4 h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} layout="vertical" margin={{ left: 0, right: 10 }}>
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={90}
                  tick={{ fontSize: 10, fill: "hsl(215 15% 55%)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "hsl(215 35% 17%)",
                    border: "1px solid hsl(215 25% 25%)",
                    borderRadius: "6px",
                    fontSize: "12px",
                    color: "hsl(210 20% 90%)",
                  }}
                />
                <Bar dataKey="matched" fill={COLORS.matched} stackId="a" radius={[0, 0, 0, 0]} />
                <Bar dataKey="missing" fill={COLORS.missing} stackId="a" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default SkillChart;
