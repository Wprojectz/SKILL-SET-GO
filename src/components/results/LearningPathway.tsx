import type { LearningStep as LearningStepType } from "@/lib/skillEngine";

interface LearningPathwayProps {
  steps: LearningStepType[];
}

const difficultyColor = {
  Beginner: "text-aqua bg-aqua/10 border-aqua/30",
  Intermediate: "text-primary bg-primary/10 border-primary/30",
  Advanced: "text-muted-red bg-muted-red/10 border-muted-red/30",
};

const LearningPathway = ({ steps }: LearningPathwayProps) => {
  if (steps.length === 0) return null;

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <h3 className="font-heading text-lg font-semibold text-foreground">Learning Pathway</h3>
      <p className="mt-1 font-body text-sm text-muted-foreground">
        A structured roadmap to close your skill gaps.
      </p>
      <div className="mt-6 space-y-4">
        {steps.map((step) => (
          <div key={step.step} className="flex items-start gap-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary font-heading text-sm font-bold text-secondary-foreground">
              {step.step}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-heading text-sm font-semibold text-foreground capitalize">
                  {step.skill}
                </p>
                <span className={`rounded border px-1.5 py-0.5 font-body text-[10px] font-medium ${difficultyColor[step.difficulty]}`}>
                  {step.difficulty}
                </span>
              </div>
              <p className="mt-0.5 font-body text-xs text-muted-foreground">
                {step.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LearningPathway;
