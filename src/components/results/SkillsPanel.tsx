import type { ExtractedSkills } from "@/lib/skillEngine";

interface SkillsPanelProps {
  title: string;
  skills: ExtractedSkills;
  matchedSkills: string[];
  variant: "resume" | "job";
}

const SkillsPanel = ({ title, skills, matchedSkills, variant }: SkillsPanelProps) => {
  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <h3 className="font-heading text-lg font-semibold text-foreground">{title}</h3>
      <p className="mt-1 font-body text-sm text-muted-foreground">
        {skills.skills.length} skills detected
      </p>
      <div className="mt-4 space-y-4">
        {Object.entries(skills.categories).map(([category, categorySkills]) => (
          <div key={category}>
            <p className="font-heading text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {category}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {categorySkills.map((skill) => {
                const isMatched = matchedSkills.includes(skill);
                return (
                  <span
                    key={skill}
                    className={`rounded-md px-2.5 py-1 font-body text-xs font-medium ${
                      isMatched
                        ? "bg-aqua/15 text-aqua border border-aqua/30"
                        : variant === "job"
                        ? "bg-muted-red/15 text-muted-red border border-muted-red/30"
                        : "bg-secondary text-secondary-foreground border border-border"
                    }`}
                  >
                    {skill}
                  </span>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SkillsPanel;
